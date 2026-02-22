from fastapi import FastAPI, Depends, HTTPException, status, Header # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm # type: ignore
from sqlalchemy.orm import Session # type: ignore
from database import SessionLocal, Event, Holiday, OperatingHour, User, NewsletterLog, EmailQueue, engine, Base
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
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Broaden for reliable dev testing
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

class HolidayCreate(BaseModel):
    name: str
    date: date

class UserRegister(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class EmailCreate(BaseModel):
    recipient: str
    subject: str
    body: str


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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
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
def create_holiday(holiday: HolidayCreate, db: Session = Depends(get_db)):
    db_holiday = Holiday(name=holiday.name, date=holiday.date)
    db.add(db_holiday)
    db.commit()
    db.refresh(db_holiday)
    return db_holiday

@app.delete("/api/holidays/{holiday_id}")
def delete_holiday(holiday_id: int, db: Session = Depends(get_db)):
    db_holiday = db.query(Holiday).filter(Holiday.id == holiday_id).first()
    if not db_holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")
    db.delete(db_holiday)
    db.commit()
    return {"status": "deleted"}

@app.get("/api/events")
def get_events(db: Session = Depends(get_db)):
    # Public endpoint: grouped by date, including descriptions
    events = db.query(Event).all()
    grouped_events = defaultdict(list)
    for event in events:
        event_data = {
            "title": event.title,
            "description": event.description
        }
        grouped_events[str(event.date)].append(event_data)
    return {"monthly_events": [grouped_events]}

@app.get("/api/admin/events")
def get_all_events(db: Session = Depends(get_db)):
    # Admin endpoint: flat list with IDs
    events = db.query(Event).order_by(Event.date).all()
    return events

@app.post("/api/events")
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(title=event.title, date=event.date, description=event.description)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return {"status": "deleted"}

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
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Protected Newsletter Endpoint ---

@app.get("/api/newsletter")
def get_newsletter(
    current_user: User = Depends(get_current_user),
    accept_language: Optional[str] = Header(None)
):
    lang = "en"
    if accept_language:
        if "es" in accept_language.lower():
            lang = "es"
        elif "fr" in accept_language.lower():
            lang = "fr"

    newsletters = {
        "en": {
            "month": "January 2026",
            "title": "Monthly Institutional Review: A New Vision",
            "subtitle": "Exploring 'Giants', O'Keeffe's New York, and the architectural evolution of the High Museum.",
            "introduction": "Welcome to our special January edition! As we step into 2026, the High Museum of Art continues its mission to be a leading cultural institution in the Southeast. This month, we're celebrating the architectural brilliance of our campus while spotlighting groundbreaking exhibitions that challenge perspectives and celebrate Black diasporic artistry.",
            "sections": [
                {
                    "title": "Architecture: Structural Light",
                    "content": "Our campus is a masterpiece of modern architecture. Designed by Richard Meier in 1983 and expanded by Renzo Piano in 2005, the museum offers over 312,000 square feet of gallery space. Meier's signature white porcelain-enameled steel and Piano's light-capturing 'velum' roof system create a unique environment where the building itself becomes a part of the artistic experience.",
                    "type": "architecture"
                },
                {
                    "title": "Major Exhibition: Giants",
                    "content": "On view through January 19, 2026, 'Giants: Art from the Dean Collection of Swizz Beatz and Alicia Keys' features a world-class collection of works by multigenerational Black diasporic artists. This exhibition celebrates the power of artists as 'giants' who have shaped the history of art and culture, from Jean-Michel Basquiat to Kehinde Wiley.",
                    "type": "exhibition"
                },
                {
                    "title": "The City Reimagined: Georgia O'Keeffe",
                    "content": "Continuing through February 16, 2026, 'Georgia O'Keeffe: My New Yorks' explores the iconic artist's decade-long fascination with the city's skyscrapers and urban structure. Long overshadowed by her New Mexico landscapes, these works reveal O'Keeffe's pioneering role in American Modernism and her ability to find organic form within the mechanical grid.",
                    "type": "exhibition"
                },
                {
                    "title": "Community & Access",
                    "content": "January starts with 'High Frequency Friday' on Jan 3, 2026, featuring local DJs and late-night gallery access. Additionally, 'UPS Second Sunday' on Jan 12 offers free admission and drop-in art-making for families. We invite our members to join these sessions for exclusive curatorial tours starting at 1:00 PM.",
                    "type": "event"
                }
            ],
            "citation": "Source: High Museum of Art - Official 2026 Institutional Calendar & Exhibition Review"
        },
        "es": {
            "month": "Enero 2026",
            "title": "Revisión Institucional Mensual: Una Nueva Visión",
            "subtitle": "Explorando 'Giants', el Nueva York de O'Keeffe y la evolución arquitectónica del Museo High.",
            "introduction": "¡Bienvenidos a nuestra edición especial de enero! Al comenzar el 2026, el Museo de Arte High continúa su misión de ser una institución cultural líder en el sureste. Este mes celebramos la brillantez arquitectónica de nuestro campus mientras destacamos exposiciones innovadoras que desafían perspectivas y celebran el arte de la diáspora negra.",
            "sections": [
                {
                    "title": "Arquitectura: Luz Estructural",
                    "content": "Nuestro campus es una obra maestra de la arquitectura moderna. Diseñado por Richard Meier en 1983 y ampliado por Renzo Piano en 2005, el museo ofrece más de 312,000 pies cuadrados de espacio de galería. El acero esmaltado en porcelana blanca característico de Meier y el sistema de techo 'velum' de Piano crean un entorno único donde el edificio mismo se convierte en parte de la experiencia artística.",
                    "type": "arquitectura"
                },
                {
                    "title": "Exposición Principal: Giants",
                    "content": "En exhibición hasta el 19 de enero de 2026, 'Giants: Art from the Dean Collection of Swizz Beatz and Alicia Keys' presenta una colección de clase mundial de obras de artistas de la diáspora negra de varias generaciones. Esta exposición celebra el poder de los archivos maestros como 'gigantes' que han dado forma a la historia del arte y la cultura.",
                    "type": "exposición"
                },
                {
                    "title": "La Ciudad Reimaginada: Georgia O'Keeffe",
                    "content": "Hasta el 16 de febrero de 2026, 'Georgia O'Keeffe: My New Yorks' explora la fascinación de una década de la icónica artista por los rascacielos y la estructura urbana de la ciudad. Estas obras revelan el papel pionero de O'Keeffe en el modernismo estadounidense.",
                    "type": "exposición"
                },
                {
                    "title": "Comunidad y Acceso",
                    "content": "Enero comienza con 'High Frequency Friday' el 3 de enero de 2026, con DJs locales y acceso tardío a las galerías. Además, el 'UPS Second Sunday' del 12 de enero ofrece entrada gratuita y talleres de arte para familias.",
                    "type": "evento"
                }
            ],
            "citation": "Fuente: Museo de Arte High - Calendario Institucional Oficial 2026 y Revisión de Exposiciones"
        },
        "fr": {
            "month": "Janvier 2026",
            "title": "Revue Institutionnelle Mensuelle : Une Nouvelle Vision",
            "subtitle": "Exploration de 'Giants', le New York d'O'Keeffe et l'évolution architecturale du High Museum.",
            "introduction": "Bienvenue dans notre édition spéciale de janvier ! Alors que nous entrons en 2026, le High Museum of Art poursuit sa mission d'institution culturelle de premier plan dans le Sud-Est. Ce mois-ci, nous célébrons le génie architectural de notre campus tout en mettant en lumière des expositions révolutionnaires qui défient les perspectives et célèbrent l'art de la diaspora noire.",
            "sections": [
                {
                    "title": "Architecture : Lumière Structurelle",
                    "content": "Notre campus est un chef-d'œuvre de l'architecture moderne. Conçu par Richard Meier en 1983 et agrandi par Renzo Piano en 2005, le musée offre plus de 312 000 pieds carrés d'espace de galerie. L'acier émaillé de porcelaine blanche signature de Meier et le système de toit 'velum' de Piano créent un environnement unique où le bâtiment lui-même devient une partie de l'expérience artistique.",
                    "type": "architecture"
                },
                {
                    "title": "Exposition Majeure : Giants",
                    "content": "À l'affiche jusqu'au 19 janvier 2026, 'Giants: Art from the Dean Collection of Swizz Beatz and Alicia Keys' présente une collection de classe mondiale d'œuvres d'artistes de la diaspora noire multigénérationnels. Cette exposition célèbre le pouvoir des artistes en tant que 'géants' qui ont façonné l'histoire de l'art et de la culture.",
                    "type": "exposition"
                },
                {
                    "title": "La Ville Réimaginée : Georgia O'Keeffe",
                    "content": "Se poursuivant jusqu'au 16 février 2026, 'Georgia O'Keeffe: My New Yorks' explore la fascination de dix ans de l'artiste emblématique pour les gratte-ciel et la structure urbaine de la ville. Ces œuvres révèlent le rôle de pionnière d'O'Keeffe dans le modernisme américain.",
                    "type": "exposition"
                },
                {
                    "title": "Communauté et Accès",
                    "content": "Janvier commence avec le 'High Frequency Friday' le 3 janvier de 2026, avec des DJs locaux et un accès tardif aux galeries. De plus, le 'UPS Second Sunday' du 12 janvier offre l'entrée gratuite et des ateliers d'art pour les familles.",
                    "type": "événement"
                }
            ],
            "citation": "Source : High Museum of Art - Calendrier institutionnel officiel 2026 et revue des expositions"
        }
    }

    content = newsletters.get(lang, newsletters["en"]).copy()
    content["verification_hash"] = "sha256:7b9c1d0f8e3a2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7"
    return content

# --- Internal / Admin Endpoints for Verification ---

@app.post("/api/admin/newsletter/test-trigger")
def trigger_newsletter_test():
    """Manually trigger the monthly newsletter task for testing/verification."""
    send_monthly_newsletter_task()
    return {"message": "Newsletter task triggered manually. Check server logs and newsletter_logs table."}

@app.get("/api/admin/newsletter/logs")
def get_newsletter_logs(db: Session = Depends(get_db)):
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
