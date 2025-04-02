import logging
import os
from app import app

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        logger.info("Starting Flask server...")
        # Use PORT environment variable if available, otherwise use 5000
        port = int(os.environ.get("PORT", 5000))
        logger.info(f"Starting server on port {port}")
        app.run(host="0.0.0.0", port=port, debug=True)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        exit(1)