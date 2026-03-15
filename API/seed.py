from database import Base, engine, SessionLocal, Event, Holiday, OperatingHour, Newsletter, User
from datetime import date, datetime
import bcrypt

# 1. Create Tables
Base.metadata.create_all(bind=engine)

# 2. Get a Database Session
db = SessionLocal()

# 3. Clear data (REMOVED: Now non-destructive)
# db.query(Event).delete()
# db.query(Holiday).delete()
# db.query(OperatingHour).delete()
# db.query(Artwork).delete()
# db.query(Newsletter).delete()
# db.query(User).delete()

# 3.5 Password hashing helper for seeding
def get_password_hash(password: str):
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


holidays_data = [
    {"name": "New Year's Day", "date": date(2026, 1, 1)},
    {"name": "Memorial Day", "date": date(2026, 5, 25)},
    {"name": "Independence Day", "date": date(2026, 7, 4)},
    {"name": "Labor Day", "date": date(2026, 9, 7)},
    {"name": "Thanksgiving Day", "date": date(2026, 11, 26)},
    {"name": "Christmas Day", "date": date(2026, 12, 25)},
]

hours_data = [
    {"day": "Mon", "hours": "Closed"},
    {"day": "Tues", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Wed", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Thurs", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Fri", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Sat", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Sun", "hours": "12:00 PM - 5:00 PM"},
]


for h in holidays_data:
    if not db.query(Holiday).filter_by(name=h["name"], date=h["date"]).first():
        db.add(Holiday(**h))

for o in hours_data:
    if not db.query(OperatingHour).filter_by(day=o["day"]).first():
        db.add(OperatingHour(**o))

# 6. Commit
db.commit()
db.close()
print("Database seeded successfully with Artworks and Newsletters!")