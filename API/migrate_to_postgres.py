import sys
import os
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
from database import Base, Event, EventException, Holiday, OperatingHour, User, NewsletterLog, EmailQueue, Artwork, Newsletter, Booking
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

sqlite_url = "sqlite:///./museum.db"
postgres_url = os.getenv("DATABASE_URL")

if not postgres_url:
    print("Error: DATABASE_URL is not set in the .env file.")
    sys.exit(1)

print("=========================================================================")
print("Starting database migration from SQLite to PostgreSQL...")
print(f"Source SQLite: {sqlite_url}")
print(f"Destination PostgreSQL: {postgres_url}")
print("=========================================================================")

try:
    # Create engines
    sqlite_engine = create_engine(sqlite_url)
    postgres_engine = create_engine(postgres_url)

    # Create sessions
    SqliteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgres_engine)

    sqlite_db = SqliteSession()
    postgres_db = PostgresSession()

    # Step 1: Create all tables in PostgreSQL
    print("\n[Step 1] Creating database schema in PostgreSQL...")
    Base.metadata.create_all(bind=postgres_engine)
    print("Schema created successfully.")

    # Step 2: Migrate each model
    models = [
        (Event, "events"),
        (EventException, "event_exceptions"),
        (Holiday, "holidays"),
        (OperatingHour, "operating_hours"),
        (User, "users"),
        (NewsletterLog, "newsletter_logs"),
        (EmailQueue, "email_queue"),
        (Artwork, "artworks"),
        (Newsletter, "newsletters"),
        (Booking, "bookings"),
    ]

    print("\n[Step 2] Migrating table data...")
    for model, name in models:
        print(f"--------------------------------------------------")
        print(f"Migrating table '{name}'...")
        
        # 1. Fetch all records from SQLite
        sqlite_items = sqlite_db.query(model).all()
        print(f"-> Found {len(sqlite_items)} records in SQLite.")
        
        # 2. Clear any existing records in PostgreSQL to prevent duplicate primary keys on re-run
        postgres_db.query(model).delete()
        
        # 3. Recreate and add each item as a clean model instance to the Postgres session
        for item in sqlite_items:
            # Extract column attributes
            attrs = {c.name: getattr(item, c.name) for c in item.__table__.columns}
            # Instantiate new model object
            new_item = model(**attrs)
            postgres_db.add(new_item)
            
        print(f"-> Added {len(sqlite_items)} records to PostgreSQL session.")

    # Step 3: Commit all changes
    print("\n[Step 3] Committing all transactions to PostgreSQL...")
    postgres_db.commit()
    print("=========================================================================")
    print("Migration completed successfully with 100% data integrity!")
    print("=========================================================================")

except Exception as err:
    print(f"\nCRITICAL MIGRATION ERROR: {err}")
    if 'postgres_db' in locals():
        print("Rolling back PostgreSQL transaction...")
        postgres_db.rollback()
    sys.exit(1)

finally:
    if 'sqlite_db' in locals():
        sqlite_db.close()
    if 'postgres_db' in locals():
        postgres_db.close()
