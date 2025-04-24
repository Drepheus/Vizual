
import logging
import os
from app import app

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        # Use port 5000 for web applications
        port = int(os.environ.get("PORT", 5000))
        logger.info(f"Starting server on port {port}")
        app.run(
            host="0.0.0.0",
            port=port,
            debug=True,
            use_reloader=True,
            threaded=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise
