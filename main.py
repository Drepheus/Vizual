import logging
from app import app

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        logger.info("Starting Flask server...")
        # Remove debug=True from here as it's already set in app.py
        app.run(host="0.0.0.0", port=5000)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        exit(1)