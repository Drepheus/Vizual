"""WSGI Application for Production Deployment"""
from app import app

if __name__ == "__main__":
    # This is only used when running directly
    app.run(host="0.0.0.0", port=5000)