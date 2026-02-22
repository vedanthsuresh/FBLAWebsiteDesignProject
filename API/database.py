from sqlalchemy import create_engine, Column, Integer, String, Date, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Create the Database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./museum.db"

# 2. Create the SQLAlchemy Engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class
Base = declarative_base()

# --- Maintain Models ---

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    title = Column(String)
    description = Column(String, nullable=True)

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