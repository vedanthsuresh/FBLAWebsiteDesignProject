from sqlalchemy import create_engine, Column, Integer, String, Date, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Create the Database URL (using SQLite for simplicity)
SQLALCHEMY_DATABASE_URL = "sqlite:///./museum.db"

# 2. Create the SQLAlchemy Engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a SessionLocal class (each request will use a separate session)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class for our models
Base = declarative_base()

# --- Define Models (Tables) ---

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True) # "2026-01-14"
    title = Column(String)          # "Conversation Pieces"

class Holiday(Base):
    __tablename__ = "holidays"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)   # "New Year's Day"
    date = Column(Date)     # "2026-01-01"

class OperatingHour(Base):
    __tablename__ = "operating_hours"
    id = Column(Integer, primary_key=True, index=True)
    day = Column(String, unique=True) # "Mon", "Tues"
    hours = Column(String)            # "10:00 AM - 5:00 PM"
