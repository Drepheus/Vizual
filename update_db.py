
from app import app, db
from datetime import datetime
from sqlalchemy import text

def update_database():
    with app.app_context():
        try:
            # Using text() for SQL expressions in newer SQLAlchemy
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS query_count INTEGER DEFAULT 0"))
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS last_query_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'free'"))
            db.session.commit()
            print("Database schema updated successfully")
        except Exception as e:
            db.session.rollback()
            print(f"Error updating schema: {e}")
            print("Attempting alternative approach...")
            
            try:
                # Try with raw connection as fallback
                connection = db.engine.raw_connection()
                cursor = connection.cursor()
                cursor.execute("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS query_count INTEGER DEFAULT 0")
                cursor.execute("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS last_query_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
                cursor.execute("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'free'")
                connection.commit()
                print("Database schema updated via direct SQL")
            except Exception as e2:
                print(f"Failed to update database: {e2}")

if __name__ == "__main__":
    update_database()
