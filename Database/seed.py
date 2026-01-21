from database import Base, engine, SessionLocal, Event, Holiday, OperatingHour
from datetime import date

# 1. Create Tables
Base.metadata.create_all(bind=engine)

# 2. Get a Database Session
db = SessionLocal()

# 3. Clear existing data (optional, prevents duplicates if run twice)
db.query(Event).delete()
db.query(Holiday).delete()
db.query(OperatingHour).delete()

# 4. Define Initial Data

# --- Events ---
events_data = [
    # 2026-01-14
    # {"date": date(2026, 1, 14), "title": "Conversation Pieces"},
    # {"date": date(2026, 1, 14), "title": "Musing Together"},
    # # 2026-01-15
    # {"date": date(2026, 1, 15), "title": "Toddler Thursday"},
    # # 2026-01-16
    # {"date": date(2026, 1, 16), "title": "Friday Night Jazz"},
    # 2026-01-18 (Empty in your example, but usually implies open/something)
    # {"date": date(2026, 1, 18), "title": "Press Shop + High Workshop"},
    # {"date": date(2026, 1, 18), "title": "Introduction to Fabric Dyeing"},
    # {"date": date(2026, 1, 18), "title": "Introduction to Figure Drawing"},
    # {"date": date(2026, 1, 22), "title": "Toddler Thursday"},
    # {"date": date(2026, 1, 22), "title": "Introduction to Mixed Media Painting"},
    # {"date": date(2026, 1, 22), "title": "Painting: Master copy"},
    # {"date": date(2026, 1, 22), "title": "The Art of Mending"},
    # {"date": date(2026, 1, 24), "title": "Viktor & Rolf Wine Tasting"},
    # {"date": date(2026, 1, 29), "title": "Toddler Thursday"},
    # {"date": date(2026, 1, 30), "title": "Vine & Dine Luncheon"},
]

# --- Holidays ---
holidays_data = [
    {"name": "New Year's Day", "date": date(2026, 1, 1)},
    {"name": "Memorial Day", "date": date(2026, 5, 25)},
    {"name": "Independence Day", "date": date(2026, 7, 4)},
    {"name": "Labor Day", "date": date(2026, 9, 7)},
    {"name": "Thanksgiving Day", "date": date(2026, 11, 26)},
    {"name": "Christmas Day", "date": date(2026, 12, 25)},
]

# --- Hours ---
hours_data = [
    {"day": "Mon", "hours": "Closed"},
    {"day": "Tues", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Wed", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Thurs", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Fri", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Sat", "hours": "10:00 AM - 5:00 PM"},
    {"day": "Sun", "hours": "12:00 PM - 5:00 PM"},
]

# 5. Insert Data
for e in events_data:
    db.add(Event(**e))

for h in holidays_data:
    db.add(Holiday(**h))

for o in hours_data:
    db.add(OperatingHour(**o))

# 6. Commit Changes
db.commit()
db.close()

print("Database seeded successfully! Created museum.db")
