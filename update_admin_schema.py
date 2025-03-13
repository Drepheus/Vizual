
from app import app, db
from sqlalchemy.sql import text

def update_admin_schema():
    with app.app_context():
        try:
            # Add new columns to User table for activity tracking
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE"))
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS total_logins INTEGER DEFAULT 0"))
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            
            # Set the first user as admin (you can change this logic)
            db.session.execute(text("UPDATE \"user\" SET is_admin = TRUE WHERE id = 1"))
            
            db.session.commit()
            print("Admin schema updated successfully")
        except Exception as e:
            db.session.rollback()
            print(f"Error updating admin schema: {e}")

if __name__ == "__main__":
    update_admin_schema()
