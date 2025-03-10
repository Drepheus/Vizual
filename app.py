import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase

# Set up logging configuration
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

def create_app():
    try:
        logger.info("Starting Flask application initialization...")
        app = Flask(__name__, 
                    template_folder=os.path.abspath('templates'),
                    static_folder=os.path.abspath('static'))

        # Load configuration
        logger.info("Loading configuration...")
        app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY") or "dev_key_change_in_production"

        # Set database URL with SQLite fallback
        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            logger.warning("DATABASE_URL not set, falling back to SQLite")
            db_url = 'sqlite:///bidbot.db'
        app.config['SQLALCHEMY_DATABASE_URI'] = db_url

        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            "pool_recycle": 300,
            "pool_pre_ping": True,
        }
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

        # Initialize extensions
        logger.info("Initializing Flask extensions...")
        db.init_app(app)
        login_manager.init_app(app)
        login_manager.login_view = 'auth.login'

        # Register routes and initialize database
        with app.app_context():
            logger.info("Setting up routes and database...")
            try:
                # Import models first to ensure they're registered with SQLAlchemy
                from models import User, Query, Payment, Document  # noqa: F401

                # Then import and register routes
                from routes import register_routes
                register_routes(app)

                # Set up user loader
                @login_manager.user_loader
                def load_user(id):
                    try:
                        return User.query.get(int(id))
                    except Exception as e:
                        logger.error(f"Error loading user: {e}")
                        return None

                # Initialize database tables
                db.create_all()
                logger.info("Database tables created successfully")

            except Exception as e:
                logger.error(f"Failed during app context initialization: {e}")
                logger.exception("Full traceback:")
                db.session.rollback()
                raise

        logger.info("Flask application initialization completed successfully")
        return app

    except Exception as e:
        logger.error(f"Critical error during app creation: {e}")
        logger.exception("Full traceback:")
        raise

# Create the Flask application instance
app = create_app()

if __name__ == '__main__':
    try:
        logger.info("Starting Flask development server...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start Flask server: {e}")
        logger.exception("Full traceback:")
        exit(1)