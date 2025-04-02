import logging
import os
from app import app

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        # Use port 8080 for Replit deployment
        port = int(os.environ.get("PORT", 8080))
        logger.info(f"Starting server on port {port}")
        app.run(host="0.0.0.0", port=port, debug=True)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        exit(1)