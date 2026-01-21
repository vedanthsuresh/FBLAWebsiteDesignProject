from database import Base, engine, SessionLocal, Event, Holiday, OperatingHour
from datetime import date

# 1. Create Tables
Base.metadata.create_all(bind=engine)

# 2. Get a Database Session
db = SessionLocal()

# 3. Clear data
db.query(Event).delete()
db.query(Holiday).delete()
db.query(OperatingHour).delete()

# 4. Define Data
events_data = [
    {
        "date": date(2026, 1, 14),
        "title": "Conversation Pieces",
        "description": "Join us for an engaging discussion about contemporary art pieces in our collection. This interactive event brings together art enthusiasts and experts to explore the stories behind the artworks."
    },
    {
        "date": date(2026, 1, 14),
        "title": "Musing Together",
        "description": "A collaborative art experience where visitors can share their thoughts and interpretations of featured exhibitions. Perfect for families and groups looking to connect through art."
    },
    {
        "date": date(2026, 1, 15),
        "title": "Toddler Thursday",
        "description": "A special program designed for toddlers and their caregivers. Explore art through play, storytelling, and hands-on activities in our family-friendly gallery spaces."
    },
    {
        "date": date(2026, 1, 16),
        "title": "Friday Night Jazz",
        "description": "Experience the perfect blend of art and music. Enjoy live jazz performances while exploring our galleries after hours. Food and beverages available for purchase."
    },
]

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

# 5. Insert
for e in events_data:
    db.add(Event(**e))

for h in holidays_data:
    db.add(Holiday(**h))

for o in hours_data:
    db.add(OperatingHour(**o))

# 6. Commit
db.commit()
db.close()
print("Database seeded successfully!")