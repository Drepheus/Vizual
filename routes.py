
import logging
from datetime import datetime, timedelta
from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from services import ai_service, sam_service
import os

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
                # Update login tracking data
                user.last_login = datetime.utcnow()
                user.last_active = datetime.utcnow()
                user.total_logins += 1
                db.session.commit()
                
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
            return redirect(url_for('simple_dashboard'))
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

            # Check subscription status and rate limits for free users
            if not current_user.is_premium:
                # Check if 8 hours have passed since last reset
                reset_time = 8 * 60 * 60  # 8 hours in seconds
                current_time = datetime.utcnow()
                time_diff = (current_time - current_user.last_query_reset).total_seconds()

                # Reset counter if 8 hours have passed
                if time_diff >= reset_time:
                    current_user.query_count = 0
                    current_user.last_query_reset = current_time

                # Check if user has reached the limit
                if current_user.query_count >= 5:
                    subscription_options = {
                        'pro': {'price': '$20/month', 'features': 'Unlimited queries, priority support'},
                        'premium': {'price': '$40/month', 'features': 'Unlimited queries, priority support, advanced features'}
                    }

                    next_reset_time = current_user.last_query_reset + timedelta(seconds=reset_time)
                    hours_until_reset = max(0, (next_reset_time - current_time).total_seconds() / 3600)

                    return jsonify({
                        'error': 'Free tier query limit reached',
                        'message': f'You have used all 5 queries. Limit will reset in {int(hours_until_reset)} hours.',
                        'subscription_options': subscription_options,
                        'upgrade_url': url_for('payment')
                    }), 429

            # Process the query
            ai_response = ai_service.get_ai_response(query_text)
            if not ai_response:
                return jsonify(error="Failed to get AI response"), 500

            # Increment the query count for free users
            if not current_user.is_premium:
                current_user.query_count += 1

            # Save the query
            query = Query(
                user_id=current_user.id,
                query_text=query_text,
                response=ai_response
            )
            db.session.add(query)
            
            # Update user's last active time
            current_user.last_active = datetime.utcnow()
            
            db.session.commit()

            # Add remaining queries info for free users
            response_data = {'ai_response': ai_response}
            if not current_user.is_premium:
                response_data['queries_remaining'] = 5 - current_user.query_count

            return jsonify(response_data)

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

    @app.route('/api/recent_conversations', methods=['GET'])
    @app.route('/api/recent-conversations', methods=['GET'])
    @login_required
    def recent_conversations():
        """API endpoint to get recent conversations for the current user"""
        try:
            # Get the 10 most recent queries for the current user
            queries = Query.query.filter_by(user_id=current_user.id)\
                .order_by(Query.created_at.desc())\
                .limit(10)
            
            conversations = []
            for query in queries:
                conversations.append({
                    'id': query.id,
                    'query_text': query.query_text,
                    'response': query.response,
                    'created_at': query.created_at.isoformat()
                })
            
            return jsonify({
                'status': 'success',
                'conversations': conversations
            })
            
        except Exception as e:
            logger.error(f"Error fetching recent conversations: {str(e)}")
            return jsonify({
                'status': 'error',
                'error': str(e)
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

    @app.route('/api/upload', methods=['POST'])
    @login_required
    def upload_file():
        """Endpoint for handling file uploads"""
        try:
            if 'file' not in request.files:
                return jsonify(error="No file part"), 400

            file = request.files['file']

            if file.filename == '':
                return jsonify(error="No selected file"), 400

            if file:
                filename = secure_filename(file.filename)
                file_path = os.path.join('uploads', filename)
                os.makedirs('uploads', exist_ok=True)
                file.save(file_path)

                # Here you would typically process the file with your AI service
                # For now, just return success
                return jsonify(success=True, filename=filename)

        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            return jsonify(error=str(e)), 500

    # Admin dashboard
    @app.route('/admin')
    @login_required
    def admin_dashboard():
        # Check if user is admin (for this example, we'll just check if user.id is 1)
        if current_user.id != 1:  # You should replace this with a proper admin check
            flash('Unauthorized access')
            return redirect(url_for('index'))
        return render_template('admin_dashboard.html')
    
    # Admin API endpoints
    @app.route('/api/admin/users')
    @login_required
    def admin_users():
        # Check if user is admin
        if current_user.id != 1:  # You should replace this with a proper admin check
            return jsonify(error="Unauthorized"), 403
        
        page = request.args.get('page', 1, type=int)
        search = request.args.get('search', '')
        per_page = 10
        
        query = User.query
        
        # Apply search filter if provided
        if search:
            query = query.filter(
                (User.username.ilike(f'%{search}%')) |
                (User.email.ilike(f'%{search}%'))
            )
        
        # Get paginated users
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        users = pagination.items
        
        # Format user data for response
        user_data = []
        for user in users:
            # Count queries made today
            today = datetime.utcnow().date()
            queries_today = Query.query.filter(
                Query.user_id == user.id,
                Query.created_at >= today
            ).count()
            
            # Get last activity time (most recent query)
            last_query = Query.query.filter_by(user_id=user.id).order_by(Query.created_at.desc()).first()
            last_active = last_query.created_at if last_query else user.created_at
            
            # Get total queries
            total_queries = Query.query.filter_by(user_id=user.id).count()
            
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_active': True,  # You might want to track this in your user model
                'subscription_type': user.subscription_type,
                'queries_today': queries_today,
                'total_queries': total_queries,
                'last_active': last_active.isoformat(),
                'created_at': user.created_at.isoformat()
            })
        
        return jsonify({
            'users': user_data,
            'pagination': {
                'current_page': pagination.page,
                'total_pages': pagination.pages,
                'total_items': pagination.total
            }
        })
    
    @app.route('/api/admin/recent-queries')
    @login_required
    def admin_recent_queries():
        # Check if user is admin
        if current_user.id != 1:  # You should replace this with a proper admin check
            return jsonify(error="Unauthorized"), 403
        
        # Get the 20 most recent queries across all users
        recent_queries = db.session.query(Query, User.username).\
            join(User, Query.user_id == User.id).\
            order_by(Query.created_at.desc()).\
            limit(20).all()
        
        queries_data = []
        for query, username in recent_queries:
            queries_data.append({
                'id': query.id,
                'username': username,
                'query_text': query.query_text,
                'created_at': query.created_at.isoformat()
            })
        
        return jsonify({
            'queries': queries_data
        })
    
    @app.route('/api/admin/user/<int:user_id>/details')
    @login_required
    def admin_user_details(user_id):
        # Check if user is admin
        if current_user.id != 1:  # You should replace this with a proper admin check
            return jsonify(error="Unauthorized"), 403
        
        # Get user
        user = User.query.get_or_404(user_id)
        
        # Get user's recent activity (last 10 queries)
        activity = Query.query.filter_by(user_id=user.id).\
            order_by(Query.created_at.desc()).\
            limit(10).all()
        
        # Format user data
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_active': True,  # You might want to track this in your user model
            'subscription_type': user.subscription_type,
            'total_queries': Query.query.filter_by(user_id=user.id).count(),
            'created_at': user.created_at.isoformat()
        }
        
        # Format activity data
        activity_data = []
        for item in activity:
            activity_data.append({
                'id': item.id,
                'query_text': item.query_text,
                'created_at': item.created_at.isoformat()
            })
        
        return jsonify({
            'user': user_data,
            'activity': activity_data
        })

    # Error handler for API routes
    @app.errorhandler(Exception)
    def handle_error(error):
        logger.error(f"Unhandled error: {str(error)}")
        if request.path.startswith('/api/'):
            return jsonify(error=str(error)), getattr(error, 'code', 500)
        return render_template('error.html', error=error), 500

    return app
