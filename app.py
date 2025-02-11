import os
import logging
from datetime import datetime
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy.orm import DeclarativeBase
from config import Config

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

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

    with app.app_context():
        try:
            from models import User, Query, Payment
            db.create_all()
            logger.debug("Database tables created successfully")
        except Exception as e:
            logger.error(f"Failed to create database tables: {e}")
            raise

    return app

app = create_app()

# Import routes after app creation to avoid circular imports
from models import User, Query, Payment
from services import ai_service, sam_service, stripe_service

@login_manager.user_loader
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
def admin_upgrade(user_id):
    user = User.query.get(user_id)
    if user:
        user.is_premium = True
        db.session.commit()
        logger.debug(f"User {user.id} upgraded to premium")
        return f"User {user.username} upgraded to premium!"
    logger.warning(f"Attempt to upgrade non-existent user: {user_id}")
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
    sam_data = sam_service.get_relevant_data(query_text)

    query = Query(
        user_id=current_user.id,
        query_text=query_text,
        response=ai_response
    )
    db.session.add(query)
    db.session.commit()
    logger.debug(f"Query saved for user {current_user.id}")

    return jsonify({
        'ai_response': ai_response,
        'sam_data': sam_data
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

if __name__ == '__main__':
    logger.info("Starting server...")
    app.run(host='0.0.0.0', port=5000, debug=True)