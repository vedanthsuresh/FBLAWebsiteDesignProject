import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, Column, Integer, String, Date, JSON, DateTime, Boolean, Float
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.declarative import declarative_base
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

# 1. Create the Database URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./museum.db")

# 2. Create the SQLAlchemy Engine
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL
    )

# Print connection type on server startup for verification
db_type = "POSTGRESQL" if "postgresql" in SQLALCHEMY_DATABASE_URL.lower() else "SQLITE"
print(f"=========================================================================")
print(f"DATABASE: Connection established successfully ({db_type} mode).")
print(f"=========================================================================")

# 3. Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class
Base = declarative_base()

# --- Maintain Models ---

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    time = Column(String, default="12:00 PM")
    title = Column(String)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    price = Column(Integer, nullable=True, default=0)
    recurrence = Column(String, nullable=True, default="none")

class EventException(Base):
    __tablename__ = "event_exceptions"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, index=True) # avoiding ForeignKey for strict sqlite compatibility if pragma foreign_keys is off
    exception_date = Column(Date, index=True)


class Holiday(Base):
    __tablename__ = "holidays"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    date = Column(Date)

class OperatingHour(Base):
    __tablename__ = "operating_hours"
    id = Column(Integer, primary_key=True, index=True)
    day = Column(String, unique=True)
    hours = Column(String)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="member") # super_admin, admin, member

class NewsletterLog(Base):
    __tablename__ = "newsletter_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String)
    sent_at = Column(String) 
    status = Column(String)

class EmailQueue(Base):
    __tablename__ = "email_queue"
    id = Column(Integer, primary_key=True, index=True)
    recipient = Column(String)
    subject = Column(String)
    body = Column(String)
    status = Column(String, default="pending") # pending, sent, failed
    created_at = Column(String)
    retry_count = Column(Integer, default=0)
class Artwork(Base):
    __tablename__ = "artworks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    creator = Column(String)
    image_url = Column(String)
    metadata_info = Column(String)
    department = Column(String)
    curators_insight = Column(String)
    alt_text = Column(String, nullable=True)

class Newsletter(Base):
    __tablename__ = "newsletters"
    id = Column(Integer, primary_key=True, index=True)
    lang = Column(String, index=True) # en, es, fr
    month = Column(String)
    title = Column(String)
    subtitle = Column(String)
    introduction = Column(String)
    sections = Column(JSON) # List of dicts: [{"title": "...", "content": "...", "type": "..."}]
    citation = Column(String)
    verification_hash = Column(String)
    publish_at = Column(String) # For simplicity in SQLite, using ISO string

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    event_title = Column(String)
    event_datetime = Column(DateTime, index=True)
    reminder_sent = Column(Boolean, default=False)

class TicketOption(Base):
    __tablename__ = "ticket_options"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    code = Column(String, unique=True, index=True)
    price = Column(Float, default=0.0)

class DiscountRate(Base):
    __tablename__ = "discount_rates"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    rate = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
