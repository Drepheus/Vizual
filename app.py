import os
import logging
from datetime import datetime
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy.orm import DeclarativeBase
from config import Config
from werkzeug.utils import secure_filename

# Set up logging configuration
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

from sqlalchemy import event
from sqlalchemy.exc import OperationalError
from sqlalchemy.engine import Engine
import time

db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

@event.listens_for(Engine, "engine_connect")
def ping_connection(connection, branch):
    if branch:
        return

    try:
        connection.scalar(db.select(1))
    except Exception:
        connection.connection.close()
        raise

def retry_on_disconnect(func):
    max_retries = 3
    retry_delay = 1

    def wrapper(*args, **kwargs):
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except OperationalError as e:
                if attempt == max_retries - 1:
                    raise
                time.sleep(retry_delay)
        return None
    return wrapper

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    try:
        db.init_app(app)
        logger.debug("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

    try:
        login_manager.init_app(app)
        login_manager.login_view = 'login'
        logger.debug("Login manager initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize login manager: {e}")
        raise

    # Import models here to avoid circular imports
    from models import User, Query, Payment, Document

    with app.app_context():
        try:
            db.create_all()
            logger.debug("Database tables created successfully")
        except Exception as e:
            logger.error(f"Failed to create database tables: {e}")
            raise

    # Import routes after initializing the app
    from services import ai_service, sam_service, stripe_service, document_service

    return app

app = create_app()

@login_manager.user_loader
@retry_on_disconnect
def load_user(id):
    return User.query.get(int(id))

@app.route('/')
def index():
    logger.debug("Accessing index route")
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    logger.debug(f"Login route accessed with method: {request.method}")
    if request.method == 'POST':
        user = User.query.filter_by(email=request.form['email']).first()
        if user and user.check_password(request.form['password']):
            login_user(user)
            logger.debug(f"User {user.email} logged in successfully")
            return redirect(url_for('dashboard'))
        logger.warning("Invalid login attempt")
        flash('Invalid email or password')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    logger.debug(f"Register route accessed with method: {request.method}")
    if request.method == 'POST':
        user = User(
            username=request.form['username'],
            email=request.form['email']
        )
        user.set_password(request.form['password'])
        db.session.add(user)
        db.session.commit()
        logger.debug(f"New user registered: {user.email}")
        login_user(user)
        return redirect(url_for('dashboard'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logger.debug("User logged out")
    logout_user()
    return redirect(url_for('index'))

@app.route('/admin/upgrade/<int:user_id>')
@login_required
def admin_upgrade(user_id):
    if not current_user.is_premium:
        return "Unauthorized", 403
        
    user = User.query.get(user_id)
    if user:
        user.is_premium = True
        db.session.commit()
        logger.debug(f"User {user.id} upgraded to premium by {current_user.username}")
        return f"User {user.username} upgraded to premium!"
    logger.warning(f"Attempt to upgrade non-existent user: {user_id}")
    return "User not found", 404

@app.route('/admin/upgrade/email/<email>')
@login_required
def admin_upgrade_by_email(email):
    if not current_user.is_premium:
        return "Unauthorized", 403
        
    user = User.query.filter_by(email=email).first()
    if user:
        user.is_premium = True
        db.session.commit()
        logger.debug(f"User {user.id} upgraded to premium by {current_user.username}")
        return f"User {user.username} upgraded to premium!"
    logger.warning(f"Attempt to upgrade non-existent user email: {email}")
    return "User not found", 404

@app.route('/dashboard')
@login_required
def dashboard():
    logger.debug("Dashboard route accessed")
    queries = Query.query.filter_by(user_id=current_user.id).order_by(Query.created_at.desc()).limit(5)
    sam_last_update = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return render_template('dashboard.html', queries=queries, sam_last_update=sam_last_update)

@app.route('/api/sam/status')
@login_required
def sam_status():
    logger.debug("SAM.gov status API endpoint accessed")
    try:
        entities = sam_service.get_relevant_data("contractor status")
        return jsonify({
            'status': 'success',
            'entities': entities
        })
    except Exception as e:
        logger.error(f"Error fetching SAM.gov status: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': 'Could not fetch SAM.gov data. Please try again later.'
        }), 500

@app.route('/api/sam/awards')
@login_required
def sam_awards():
    logger.debug("SAM.gov awards API endpoint accessed")
    try:
        awards = sam_service.get_awarded_contracts()
        return jsonify({
            'status': 'success',
            'awards': awards
        })
    except Exception as e:
        logger.error(f"Error fetching SAM.gov awards: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': 'Could not fetch contract awards. Please try again later.'
        }), 500

@app.route('/api/query', methods=['POST'])
@login_required
def process_query():
    logger.debug("Processing new query")
    data = request.get_json()
    query_text = data.get('query')

    if not current_user.is_premium and Query.query.filter_by(user_id=current_user.id).count() >= 10:
        logger.warning(f"Free tier limit reached for user {current_user.id}")
        return jsonify({'error': 'Free tier limit reached. Please upgrade to premium.'}), 403

    ai_response = ai_service.get_ai_response(query_text)

    query = Query(
        user_id=current_user.id,
        query_text=query_text,
        response=ai_response
    )
    db.session.add(query)
    db.session.commit()
    logger.debug(f"Query saved for user {current_user.id}")

    return jsonify({
        'ai_response': ai_response
    })

@app.route('/payment')
@login_required
def payment():
    logger.debug("Payment route accessed")
    return render_template('payment.html')

@app.route('/api/create-payment-intent', methods=['POST'])
@login_required
def create_payment():
    logger.debug("Creating payment intent")
    try:
        intent = stripe_service.create_payment_intent()
        return jsonify({'clientSecret': intent.client_secret})
    except Exception as e:
        logger.error(f"Payment intent creation failed: {e}")
        return jsonify({'error': str(e)}), 403

@app.route('/api/document/upload', methods=['POST'])
@login_required
def upload_document():
    logger.debug("Document upload endpoint accessed")

    if 'document' not in request.files:
        logger.warning("No document files in request")
        return jsonify({'error': 'No document files uploaded'}), 400

    files = request.files.getlist('document')
    if not files:
        logger.warning("Empty file list submitted")
        return jsonify({'error': 'No selected files'}), 400

    uploaded_documents = []
    failed_documents = []

    for file in files:
        if file.filename == '':
            continue

        if not document_service.allowed_file(file.filename):
            failed_documents.append({
                'filename': file.filename,
                'error': 'Invalid file type. Allowed types are PDF, DOC, DOCX, and TXT'
            })
            continue

        try:
            # Ensure upload directory exists
            document_service.ensure_upload_directory()
            logger.debug("Upload directory verified")

            # Secure the filename and save the file
            filename = secure_filename(file.filename)
            file_path = os.path.join(document_service.UPLOAD_FOLDER, filename)
            logger.debug(f"Attempting to save file to: {file_path}")

            file.save(file_path)
            logger.debug("File saved successfully")

            # Extract text content from the document
            logger.debug(f"Starting document processing for {filename}")
            content = document_service.process_document(file_path)

            if not content:
                failed_documents.append({
                    'filename': file.filename,
                    'error': 'Failed to extract content from document'
                })
                continue

            logger.debug(f"Successfully extracted content from document: {filename}")

            # Create document record in database
            document = Document(
                user_id=current_user.id,
                filename=filename,
                original_filename=file.filename,
                file_type=file.filename.rsplit('.', 1)[1].lower(),
                content=content
            )
            db.session.add(document)

            uploaded_documents.append({
                'filename': file.filename,
                'content': content,
                'document_id': document.id
            })

        except Exception as e:
            logger.error(f"Error processing document {file.filename}: {str(e)}")
            failed_documents.append({
                'filename': file.filename,
                'error': str(e)
            })

    if uploaded_documents:
        db.session.commit()
        logger.debug(f"Successfully processed {len(uploaded_documents)} documents")

        # Get AI analysis if query was provided
        query = request.form.get('query', '')
        if query:
            logger.debug(f"Processing AI analysis for query: {query[:50]}...")
            # Combine the query with all document contents for context
            all_contents = "\n\n".join([doc['content'] for doc in uploaded_documents])
            full_query = f"{query}\n\nDocument Contents:\n{all_contents}"
            ai_response = ai_service.get_ai_response(full_query)
        else:
            ai_response = f"Successfully processed {len(uploaded_documents)} documents. What would you like to know about them?"

        return jsonify({
            'message': 'Documents processed successfully',
            'ai_response': ai_response,
            'uploaded_documents': [{'filename': doc['filename'], 'document_id': doc['document_id']} for doc in uploaded_documents],
            'failed_documents': failed_documents
        })

    return jsonify({
        'error': 'No documents were successfully processed',
        'failed_documents': failed_documents
    }), 500

if __name__ == '__main__':
    logger.info("Starting server...")
    app.run(host='0.0.0.0', port=5000, debug=True)