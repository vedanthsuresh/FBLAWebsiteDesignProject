from fastapi import FastAPI, Depends, HTTPException, status, Header # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm # type: ignore
from sqlalchemy.orm import Session # type: ignore
from database import SessionLocal, Event, Holiday, OperatingHour, User, Newsletter, NewsletterLog, EmailQueue, Artwork, EventException, engine, Base
from datetime import date, datetime, timedelta
from collections import defaultdict
from pydantic import BaseModel
from typing import Optional, List
from jose import JWTError, jwt # type: ignore
import bcrypt # type: ignore
from apscheduler.schedulers.background import BackgroundScheduler # type: ignore

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Security config
SECRET_KEY = "h1gh-mu5eum-s3cr3t-k3y" # In a real app, use environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Scheduler Setup ---
def send_monthly_newsletter_task():
    """Background task to 'dispatch' newsletter links to all members."""
    print(f"[{datetime.now()}] Monthly Newsletter Task Started...")
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            print(f"Dispatched January 2026 Newsletter link to: {user.email}")
            # In a real app, logic to send email via SMTP/SendGrid would go here
            
            # Log the dispatch
            log_entry = NewsletterLog(
                user_email=user.email,
                sent_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                status="sent"
            )
            db.add(log_entry)
        
        db.commit()
        print(f"[{datetime.now()}] Monthly Newsletter Task Completed. {len(users)} users notified.")
    except Exception as e:
        print(f"Error in newsletter task: {e}")
    finally:
        db.close()

scheduler = BackgroundScheduler()
# Schedule for the 1st day of every month at 9:00 AM
scheduler.add_job(send_monthly_newsletter_task, 'cron', day=1, hour=9, minute=0)

def process_email_queue_task():
    """Background task to send queued emails with retry logic for slow connections."""
    print(f"[{datetime.now()}] Email Queue Processing Started...")
    db = SessionLocal()
    try:
        # Get pending or failed emails that haven't reached max retries
        queued_emails = db.query(EmailQueue).filter(
            EmailQueue.status.in_(["pending", "failed"]),
            EmailQueue.retry_count < 5
        ).all()

        if not queued_emails:
            print("No emails in queue.")
            return

        for email in queued_emails:
            try:
                print(f"Attempting to send email to: {email.recipient} (Subject: {email.subject})")
                
                # SIMULATION: In a real app, use smtplib or an API here.
                # If network is slow/unstable, this would raise an exception.
                # For this project, we simulate success unless the logic is changed.
                
                email.status = "sent"
                email.sent_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"Successfully sent email to {email.recipient}")
                
            except Exception as send_error:
                print(f"Failed to send email to {email.recipient}: {send_error}")
                email.status = "failed"
                email.retry_count += 1
            
        db.commit()
    except Exception as e:
        print(f"Error in email queue task: {e}")
    finally:
        db.close()

# Check the email queue every minute for resilience
scheduler.add_job(process_email_queue_task, 'interval', minutes=1)

@app.on_event("startup")
def startup_event():
    scheduler.start()
    print("Background Scheduler Started.")

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()
    print("Background Scheduler Shutdown.")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas ---
class EventCreate(BaseModel):
    title: str
    date: date
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    recurrence: Optional[str] = "none"

class EventExceptionCreate(BaseModel):
    exception_date: date



class HolidayCreate(BaseModel):
    name: str
    date: date

class UserRegister(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserAdminResponse(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "admin"

class EmailCreate(BaseModel):
    recipient: str
    subject: str
    body: str

class ArtworkCreate(BaseModel):
    title: str
    creator: str
    image_url: str
    metadata_info: str
    department: str
    curators_insight: str

class NewsletterSection(BaseModel):
    title: str
    content: str
    type: str
    image_url: Optional[str] = None

class NewsletterUpdate(BaseModel):
    lang: str
    month: str
    title: str
    subtitle: str
    introduction: str
    sections: List[NewsletterSection]
    citation: str
    verification_hash: str
    publish_at: str # ISO string


# --- Security Utils ---
def get_password_hash(password: str):
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"Validating token: {token[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        print(f"Token payload email: {email}")
        if email is None:
            print("Email is None in payload")
            raise credentials_exception
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        print(f"User not found for email: {email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_current_super_admin(user: User = Depends(get_current_user)):
    if user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted"
        )
    return user

async def get_current_any_admin(user: User = Depends(get_current_user)):
    if user.role not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted"
        )
    return user

# --- Endpoints ---

@app.get("/api")
def read_root():
    return {"message": "Welcome to the High Museum of Art API"}

@app.get("/api/hours")
def get_hours(db: Session = Depends(get_db)):
    hours = db.query(OperatingHour).all()
    return {h.day: h.hours for h in hours}

@app.get("/api/holidays")
def get_holidays(db: Session = Depends(get_db)):
    holidays = db.query(Holiday).all()
    return {h.name: str(h.date) for h in holidays}

@app.get("/api/admin/holidays")
def get_all_holidays(db: Session = Depends(get_db)):
    # Admin endpoint: flat list with IDs
    holidays = db.query(Holiday).order_by(Holiday.date).all()
    return holidays

@app.post("/api/holidays")
def create_holiday(
    holiday: HolidayCreate,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    db_holiday = Holiday(name=holiday.name, date=holiday.date)
    db.add(db_holiday)
    db.commit()
    db.refresh(db_holiday)
    return db_holiday

@app.delete("/api/holidays/{holiday_id}")
def delete_holiday(
    holiday_id: int,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    db_holiday = db.query(Holiday).filter(Holiday.id == holiday_id).first()
    if not db_holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")
    db.delete(db_holiday)
    db.commit()
    return {"status": "deleted"}

@app.put("/api/holidays/{holiday_id}")
def update_holiday(
    holiday_id: int,
    holiday: HolidayCreate,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    db_holiday = db.query(Holiday).filter(Holiday.id == holiday_id).first()
    if not db_holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")
    db_holiday.name = holiday.name
    db_holiday.date = holiday.date
    db.commit()
    db.refresh(db_holiday)
    return db_holiday

@app.get("/api/events")
def get_events(db: Session = Depends(get_db)):
    # Public endpoint: grouped by date, including descriptions
    events = db.query(Event).all()
    
    # fetch all exceptions
    exceptions = db.query(EventException).all()
    exceptions_by_event = defaultdict(list)
    for ext in exceptions:
        exceptions_by_event[ext.event_id].append(str(ext.exception_date))
        
    grouped_events = defaultdict(list)
    for event in events:
        event_data = {
            "title": event.title,
            "description": event.description,
            "image_url": event.image_url,
            "category": event.category,
            "recurrence": event.recurrence,
            "exception_dates": exceptions_by_event.get(event.id, [])
        }
        grouped_events[str(event.date)].append(event_data)
    return {"monthly_events": [grouped_events]}


@app.get("/api/admin/events")
def get_all_events(db: Session = Depends(get_db)):
    # Admin endpoint: flat list with IDs
    events = db.query(Event).order_by(Event.date).all()
    
    exceptions = db.query(EventException).all()
    exceptions_by_event = defaultdict(list)
    for ext in exceptions:
        exceptions_by_event[ext.event_id].append(str(ext.exception_date))
        
    return [{
        "id": e.id, 
        "date": e.date, 
        "title": e.title, 
        "category": e.category, 
        "description": e.description, 
        "image_url": e.image_url, 
        "recurrence": e.recurrence,
        "exception_dates": exceptions_by_event.get(e.id, [])
    } for e in events]


@app.post("/api/events")
def create_event(
    event: EventCreate,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    db_event = Event(
        title=event.title, 
        date=event.date, 
        description=event.description,
        image_url=event.image_url,
        category=event.category,
        recurrence=event.recurrence
    )
    db.add(db_event)

    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/api/events/{event_id}")
def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return {"status": "deleted"}

@app.put("/api/events/{event_id}")
def update_event(
    event_id: int,
    event: EventCreate,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db_event.title = event.title
    db_event.date = event.date
    db_event.description = event.description
    db_event.image_url = event.image_url
    db_event.category = event.category
    db_event.recurrence = event.recurrence
    db.commit()
    db.refresh(db_event)
    return db_event

@app.post("/api/events/{event_id}/exceptions")
def add_event_exception(event_id: int, exception: EventExceptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_any_admin)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if exists
    existing = db.query(EventException).filter(EventException.event_id == event_id, EventException.exception_date == exception.exception_date).first()
    if existing:
        raise HTTPException(status_code=400, detail="Exception date already exists")
        
    new_exception = EventException(event_id=event_id, exception_date=exception.exception_date)
    db.add(new_exception)
    db.commit()
    return {"message": "Exception added"}
    
@app.delete("/api/events/{event_id}/exceptions/{date_str}")
def delete_event_exception(event_id: int, date_str: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_any_admin)):
    try:
        dt = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
        
    ext = db.query(EventException).filter(EventException.event_id == event_id, EventException.exception_date == dt).first()
    if not ext:
        raise HTTPException(status_code=404, detail="Exception not found")
        
    db.delete(ext)
    db.commit()
    return {"message": "Exception deleted"}



@app.get("/api/artworks")
def get_artworks(db: Session = Depends(get_db)):
    return db.query(Artwork).all()

@app.get("/api/admin/artworks")
def get_admin_artworks(db: Session = Depends(get_db)):
    return db.query(Artwork).all()

@app.post("/api/artworks")
def create_artwork(
    artwork: ArtworkCreate,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    db_artwork = Artwork(
        title=artwork.title,
        creator=artwork.creator,
        image_url=artwork.image_url,
        metadata_info=artwork.metadata_info,
        department=artwork.department,
        curators_insight=artwork.curators_insight
    )
    db.add(db_artwork)
    db.commit()
    db.refresh(db_artwork)
    return db_artwork

@app.delete("/api/artworks/{artwork_id}")
def delete_artwork(
    artwork_id: int,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    db_artwork = db.query(Artwork).filter(Artwork.id == artwork_id).first()
    if not db_artwork:
        raise HTTPException(status_code=404, detail="Artwork not found")
    db.delete(db_artwork)
    db.commit()
    return {"status": "deleted"}

@app.put("/api/artworks/{artwork_id}")
def update_artwork(
    artwork_id: int,
    artwork: ArtworkCreate,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    db_artwork = db.query(Artwork).filter(Artwork.id == artwork_id).first()
    if not db_artwork:
        raise HTTPException(status_code=404, detail="Artwork not found")
    db_artwork.title = artwork.title
    db_artwork.creator = artwork.creator
    db_artwork.image_url = artwork.image_url
    db_artwork.metadata_info = artwork.metadata_info
    db_artwork.department = artwork.department
    db_artwork.curators_insight = artwork.curators_insight
    db.commit()
    db.refresh(db_artwork)
    return db_artwork

@app.get("/api/status")
def get_status():
    return {"status": "operational", "version": "1.0.0", "source": "database"}

# --- Auth Endpoints ---

@app.post("/api/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    clean_email = user.email.strip().lower()
    db_user = db.query(User).filter(User.email == clean_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=clean_email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    clean_username = form_data.username.strip().lower()
    print(f"Login attempt for: {clean_username}")
    
    user = db.query(User).filter(User.email == clean_username).first()
    if not user:
        print(f"Login failed: User {clean_username} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(form_data.password, user.hashed_password):
        print(f"Login failed: Incorrect password for {clean_username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    print(f"Login successful: {clean_username}")
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

# --- Admin Management Endpoints (Super Admin Only) ---

@app.get("/api/admin/users", response_model=List[UserAdminResponse])
def get_admin_users(
    current_user: User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """List all administrators (Super Admin only)."""
    return db.query(User).filter(User.role.in_(["super_admin", "admin"])).all()

@app.post("/api/admin/users")
def create_admin_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Create a new administrator (Super Admin only)."""
    clean_email = user_data.email.strip().lower()
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(email=clean_email, hashed_password=hashed_pwd, role=user_data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Admin user created successfully", "id": new_user.id}

@app.delete("/api/admin/users/{user_id}")
def delete_admin_user(
    user_id: int,
    current_user: User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Delete an administrator (Super Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    db.delete(user)
    db.commit()
    return {"message": "Admin user deleted successfully"}

# --- Protected Newsletter Endpoint ---

@app.get("/api/newsletter")
def get_newsletter(
    current_user: User = Depends(get_current_user),
    accept_language: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    lang = "en"
    if accept_language:
        if "es" in accept_language.lower():
            lang = "es"
        elif "fr" in accept_language.lower():
            lang = "fr"

    now_str = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    
    # Get the latest published newsletter for this language
    newsletter = db.query(Newsletter).filter(
        Newsletter.lang == lang,
        Newsletter.publish_at <= now_str
    ).order_by(Newsletter.publish_at.desc()).first()

    if not newsletter:
        # Fallback to English if no newsletter for specific language
        newsletter = db.query(Newsletter).filter(
            Newsletter.lang == "en",
            Newsletter.publish_at <= now_str
        ).order_by(Newsletter.publish_at.desc()).first()

    if not newsletter:
        raise HTTPException(status_code=404, detail="No published newsletter found")

    return {
        "month": newsletter.month,
        "title": newsletter.title,
        "subtitle": newsletter.subtitle,
        "introduction": newsletter.introduction,
        "sections": newsletter.sections,
        "citation": newsletter.citation,
        "verification_hash": newsletter.verification_hash,
        "publish_at": newsletter.publish_at
    }

# --- Admin Newsletter Endpoints ---

@app.get("/api/admin/newsletters")
def get_all_newsletters(
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    """List all newsletters (including future drafts) for admin management."""
    return db.query(Newsletter).order_by(Newsletter.publish_at.desc()).all()

@app.post("/api/admin/newsletter")
def create_or_update_newsletter(
    news_data: NewsletterUpdate,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    """Create or update a newsletter for a specific language and publish date."""
    # Check if a newsletter already exists for this language and publish time (to update it)
    existing = db.query(Newsletter).filter(
        Newsletter.lang == news_data.lang,
        Newsletter.publish_at == news_data.publish_at
    ).first()

    sections_data = [s.dict() for s in news_data.sections]

    if existing:
        existing.month = news_data.month
        existing.title = news_data.title
        existing.subtitle = news_data.subtitle
        existing.introduction = news_data.introduction
        existing.sections = sections_data
        existing.citation = news_data.citation
        existing.verification_hash = news_data.verification_hash
    else:
        new_news = Newsletter(
            lang=news_data.lang,
            month=news_data.month,
            title=news_data.title,
            subtitle=news_data.subtitle,
            introduction=news_data.introduction,
            sections=sections_data,
            citation=news_data.citation,
            verification_hash=news_data.verification_hash,
            publish_at=news_data.publish_at
        )
        db.add(new_news)
    
    db.commit()
    return {"message": "Newsletter saved successfully"}
@app.delete("/api/admin/newsletter/{news_id}")
def delete_newsletter(
    news_id: int,
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    """Delete a newsletter by ID."""
    newsletter = db.query(Newsletter).filter(Newsletter.id == news_id).first()
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    db.delete(newsletter)
    db.commit()
    return {"message": "Newsletter deleted successfully"}

# --- Internal / Admin Endpoints for Verification ---

@app.post("/api/admin/newsletter/test-trigger")
def trigger_newsletter_test(current_user: User = Depends(get_current_any_admin)):
    """Manually trigger the monthly newsletter task for testing/verification."""
    send_monthly_newsletter_task()
    return {"message": "Newsletter task triggered manually. Check server logs and newsletter_logs table."}

@app.get("/api/admin/newsletter/logs")
def get_newsletter_logs(
    current_user: User = Depends(get_current_any_admin),
    db: Session = Depends(get_db)
):
    return db.query(NewsletterLog).order_by(NewsletterLog.id.desc()).limit(50).all()

@app.delete("/api/membership/unsubscribe")
def unsubscribe(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete user account and associated logs."""
    # Delete associated newsletter logs first
    db.query(NewsletterLog).filter(NewsletterLog.user_email == current_user.email).delete()
    
    # Delete the user
    db.delete(current_user)
    db.commit()
    
    return {"message": "Successfully unsubscribed and account deleted"}

class CancelMembershipRequest(BaseModel):
    email: str
    password: str
    confirm_password: str

@app.post("/api/membership/cancel")
def cancel_membership_with_credentials(
    req: CancelMembershipRequest,
    db: Session = Depends(get_db)
):
    """Cancel membership by providing credentials in a form."""
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    clean_email = req.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
        
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    # Delete associated newsletter logs
    db.query(NewsletterLog).filter(NewsletterLog.user_email == user.email).delete()
    
    # Delete the user
    db.delete(user)
    db.commit()
    
    return {"message": "Membership successfully cancelled"}

@app.post("/api/email/queue")
def queue_email(email: EmailCreate, db: Session = Depends(get_db)):
    """Queue a confirmation email for background delivery."""
    new_email = EmailQueue(
        recipient=email.recipient,
        subject=email.subject,
        body=email.body,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        status="pending"
    )
    db.add(new_email)
    db.commit()
    db.refresh(new_email)
    return {"message": "Email queued for delivery", "queue_id": new_email.id}
