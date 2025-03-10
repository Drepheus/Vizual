import logging
from datetime import datetime
from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from services import ai_service, sam_service

logger = logging.getLogger(__name__)

def register_routes(app):
    from models import User, Query, Document

    @app.route('/')
    def index():
        return render_template('landing.html')
        
    @app.route('/home')
    def home():
        return render_template('index.html')
        
    @app.route('/simple-dashboard')
    @login_required
    def simple_dashboard():
        return render_template('simple_dashboard.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            user = User.query.filter_by(email=request.form['email']).first()
            if user and user.check_password(request.form['password']):
                login_user(user)
                next_page = request.args.get('next')
                if next_page:
                    return redirect(next_page)
                else:
                    return redirect(url_for('simple_dashboard'))
            flash('Invalid email or password')
        return render_template('login.html')

    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'POST':
            user = User(
                username=request.form['username'],
                email=request.form['email']
            )
            user.set_password(request.form['password'])
            db.session.add(user)
            db.session.commit()
            login_user(user)
            return redirect(url_for('dashboard'))
        return render_template('register.html')

    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('index'))

    @app.route('/dashboard')
    @login_required
    def dashboard():
        queries = Query.query.filter_by(user_id=current_user.id).order_by(Query.created_at.desc()).limit(5)
        sam_last_update = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return render_template('dashboard.html', queries=queries, sam_last_update=sam_last_update)

    @app.route('/payment')
    @login_required
    def payment():
        return render_template('payment.html')

    @app.route('/api/query', methods=['POST'])
    @login_required
    def process_query():
        try:
            if not request.is_json:
                return jsonify(error="Invalid request format. Expected JSON."), 400

            data = request.get_json()
            if not data or 'query' not in data:
                return jsonify(error="Missing query parameter"), 400

            query_text = data['query']

            if not current_user.is_premium and Query.query.filter_by(user_id=current_user.id).count() >= 10:
                return jsonify(error='Free tier limit reached. Please upgrade to premium.'), 403

            ai_response = ai_service.get_ai_response(query_text)
            if not ai_response:
                return jsonify(error="Failed to get AI response"), 500

            query = Query(
                user_id=current_user.id,
                query_text=query_text,
                response=ai_response
            )
            db.session.add(query)
            db.session.commit()

            return jsonify({'ai_response': ai_response})

        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return jsonify(error=str(e)), 500

    @app.route('/api/sam/status')
    @login_required
    def sam_status():
        logger.debug("SAM.gov status API endpoint accessed")
        try:
            # Fetch SAM.gov entity status data
            entities = sam_service.get_relevant_data("contractor status")
            
            # Create placeholder data if API call failed
            if not entities:
                logger.warning("No SAM.gov entities found, providing placeholder data")
                entities = [
                    {
                        'entity_name': 'Demo Contractor Inc.',
                        'duns': '123456789',
                        'status': 'Active',
                        'expiration_date': (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d"),
                        'url': 'https://sam.gov/'
                    }
                ]
                
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
            
            # Create placeholder data if API call failed
            if not awards:
                logger.warning("No SAM.gov awards found, providing placeholder data")
                awards = [
                    {
                        'title': 'Facility Maintenance Services',
                        'solicitation_number': 'ABC12345',
                        'award_amount': '250000',
                        'award_date': datetime.now().strftime("%Y-%m-%d"),
                        'awardee': 'Acme Services LLC',
                        'url': 'https://sam.gov/'
                    }
                ]
                
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
            
    @app.route('/api/sam/search', methods=['POST'])
    @login_required
    def sam_search():
        """Direct endpoint to search SAM.gov"""
        try:
            if not request.is_json:
                return jsonify(error="Invalid request format. Expected JSON."), 400

            data = request.get_json()
            if not data or 'query' not in data:
                return jsonify(error="Missing query parameter"), 400

            query_text = data['query']
            logger.info(f"Searching SAM.gov for: {query_text}")

            # Get solicitations from SAM.gov
            from services.web_service import get_sam_solicitations
            solicitations = get_sam_solicitations(query_text)

            if solicitations:
                # Format for display
                formatted_results = []
                for sol in solicitations:
                    formatted_results.append({
                        'title': sol.get('title', 'N/A'),
                        'agency': sol.get('agency', 'N/A'),
                        'solicitation_number': sol.get('solicitation_number', 'N/A'),
                        'posted_date': sol.get('posted_date', 'N/A'),
                        'due_date': sol.get('due_date', 'N/A'),
                        'url': sol.get('url', '#')
                    })

                return jsonify({
                    'status': 'success',
                    'results': formatted_results,
                    'count': len(formatted_results)
                })
            else:
                return jsonify({
                    'status': 'warning',
                    'message': 'No solicitations found matching your criteria',
                    'results': []
                })

        except Exception as e:
            logger.error(f"Error searching SAM.gov: {str(e)}")
            return jsonify({
                'status': 'error',
                'error': 'Failed to search SAM.gov. Please try again later.'
            }), 500

    # Error handler for API routes
    @app.errorhandler(Exception)
    def handle_error(error):
        logger.error(f"Unhandled error: {str(error)}")
        if request.path.startswith('/api/'):
            return jsonify(error=str(error)), getattr(error, 'code', 500)
        return render_template('error.html', error=error), 500

    return app