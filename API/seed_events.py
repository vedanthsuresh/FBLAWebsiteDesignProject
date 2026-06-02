import sqlite3

db_path = "museum.db"

events_data = [
    # ==================== WEEKLY RECURRING EVENTS ====================
    # 1. Toddler Thursday (Weekly on Thursdays)
    {
        "date": "2026-06-04",
        "title": "Toddler Thursday",
        "description": "Toddler Thursday at the High Museum of Art is a weekly program designed for children ages 15 months to 3 years and their caregivers. Little ones explore art through storytelling, music, movement, and hands-on activities inspired by works in the galleries. The program encourages curiosity, creativity, and early learning in a welcoming, kid-friendly environment.",
        "image_url": "/events/toddler_thursday.jpg",
        "category": "family",
        "recurrence": "weekly",
        "price": 20,
        "time": "10:00 AM"
    },
    # 2. Meet Your Museum Tour (Weekly on Tuesdays)
    {
        "date": "2026-06-02",
        "title": "Meet Your Museum Tour",
        "description": "Join a docent-led tour for a wonderful introduction to the High Museum of Art. Explore highlight masterworks across our curatorial departments and learn about the award-winning architecture of Richard Meier and Renzo Piano. Included with standard admission.",
        "image_url": "/events/martin_puryear.jpg",
        "category": "talk",
        "recurrence": "weekly",
        "price": 0,
        "time": "1:00 PM"
    },
    # 3. Meet Your Museum Tour (Weekly on Wednesdays)
    {
        "date": "2026-06-03",
        "title": "Meet Your Museum Tour",
        "description": "Join a docent-led tour for a wonderful introduction to the High Museum of Art. Explore highlight masterworks across our curatorial departments and learn about the award-winning architecture of Richard Meier and Renzo Piano. Included with standard admission.",
        "image_url": "/events/martin_puryear.jpg",
        "category": "talk",
        "recurrence": "weekly",
        "price": 0,
        "time": "1:00 PM"
    },
    # 4. Meet Your Museum Tour (Weekly on Thursdays)
    {
        "date": "2026-06-04",
        "title": "Meet Your Museum Tour",
        "description": "Join a docent-led tour for a wonderful introduction to the High Museum of Art. Explore highlight masterworks across our curatorial departments and learn about the award-winning architecture of Richard Meier and Renzo Piano. Included with standard admission.",
        "image_url": "/events/martin_puryear.jpg",
        "category": "talk",
        "recurrence": "weekly",
        "price": 0,
        "time": "1:00 PM"
    },
    # 5. Meet Your Museum Tour (Weekly on Fridays)
    {
        "date": "2026-06-05",
        "title": "Meet Your Museum Tour",
        "description": "Join a docent-led tour for a wonderful introduction to the High Museum of Art. Explore highlight masterworks across our curatorial departments and learn about the award-winning architecture of Richard Meier and Renzo Piano. Included with standard admission.",
        "image_url": "/events/martin_puryear.jpg",
        "category": "talk",
        "recurrence": "weekly",
        "price": 0,
        "time": "1:00 PM"
    },
    # 6. Meet Your Museum Tour (Weekly on Saturdays)
    {
        "date": "2026-06-06",
        "title": "Meet Your Museum Tour",
        "description": "Join a docent-led tour for a wonderful introduction to the High Museum of Art. Explore highlight masterworks across our curatorial departments and learn about the award-winning architecture of Richard Meier and Renzo Piano. Included with standard admission.",
        "image_url": "/events/martin_puryear.jpg",
        "category": "talk",
        "recurrence": "weekly",
        "price": 0,
        "time": "1:00 PM"
    },
    # 7. Meet Your Museum Tour (Weekly on Sundays)
    {
        "date": "2026-06-07",
        "title": "Meet Your Museum Tour",
        "description": "Join a docent-led tour for a wonderful introduction to the High Museum of Art. Explore highlight masterworks across our curatorial departments and learn about the award-winning architecture of Richard Meier and Renzo Piano. Included with standard admission.",
        "image_url": "/events/martin_puryear.jpg",
        "category": "talk",
        "recurrence": "weekly",
        "price": 0,
        "time": "2:00 PM"
    },
    # 8. Weekend Family Tour (Weekly on Saturdays)
    {
        "date": "2026-06-06",
        "title": "Weekend Family Tour",
        "description": "Hey kids, bring your grown-ups! This interactive, 45-minute docent-led tour is custom-designed for families with children ages 5 to 12. Together, we'll discover amazing stories behind the art and participate in fun, gallery-based activities.",
        "image_url": "/events/second_sunday.jpg",
        "category": "family",
        "recurrence": "weekly",
        "price": 0,
        "time": "11:00 AM"
    },
    # 9. Weekend Family Tour (Weekly on Sundays)
    {
        "date": "2026-06-07",
        "title": "Weekend Family Tour",
        "description": "Hey kids, bring your grown-ups! This interactive, 45-minute docent-led tour is custom-designed for families with children ages 5 to 12. Together, we'll discover amazing stories behind the art and participate in fun, gallery-based activities.",
        "image_url": "/events/second_sunday.jpg",
        "category": "family",
        "recurrence": "weekly",
        "price": 0,
        "time": "11:00 AM"
    },
    # 10. Special Exhibitions Tour (Weekly on Wednesdays)
    {
        "date": "2026-06-03",
        "title": "Special Exhibitions Highlights Tour",
        "description": "Join us for a specialized, in-depth docent-led tour focused entirely on our special exhibitions. Learn about the inspiration, design, and cultural context of Isamu Noguchi's spatial modernism and Amy Sherald's powerful American portraits.",
        "image_url": "/events/exhibition_tour.jpg",
        "category": "talk",
        "recurrence": "weekly",
        "price": 0,
        "time": "11:30 AM"
    },
    # 11. Special Exhibitions Tour (Weekly on Saturdays)
    {
        "date": "2026-06-06",
        "title": "Special Exhibitions Highlights Tour",
        "description": "Join us for a specialized, in-depth docent-led tour focused entirely on our special exhibitions. Learn about the inspiration, design, and cultural context of Isamu Noguchi's spatial modernism and Amy Sherald's powerful American portraits.",
        "image_url": "/events/exhibition_tour.jpg",
        "category": "talk",
        "recurrence": "weekly",
        "price": 0,
        "time": "11:30 AM"
    },
    # 12. Gallery Art Cart (Weekly on Saturdays)
    {
        "date": "2026-06-06",
        "title": "Gallery Art Cart",
        "description": "Look for our creative Art Cart in the galleries! Our museum educators will provide children and families with fun, self-guided activity sheets, sketchbooks, and drawing materials inspired by surrounding masterpieces.",
        "image_url": "/events/toddler_thursday.jpg",
        "category": "family",
        "recurrence": "weekly",
        "price": 0,
        "time": "10:00 AM"
    },

    # ==================== JUNE 2026 ====================
    {
        "date": "2026-06-05",
        "title": "HIGH Frequency Friday",
        "description": "Kick off your summer at the High! Enjoy the city's favorite DJs, curated cocktails, and late-night gallery access, featuring live musical sets and pop-up activations in our modern central piazza.",
        "image_url": "/events/high_frequency_friday.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 30,
        "time": "6:00 PM"
    },
    {
        "date": "2026-06-05",
        "title": "Exhibition Opening: Martin Puryear (Nexus)",
        "description": "Opening today! This major touring survey showcases the sculptor Martin Puryear's legendary career. Walk through our soaring gallery spaces to experience monumental wood, bronze, and stone works that merge organic form and exceptional craftsmanship.",
        "image_url": "/events/martin_puryear.jpg",
        "category": "exhibition",
        "recurrence": "none",
        "price": 16.50,
        "time": "10:00 AM"
    },
    {
        "date": "2026-06-12",
        "title": "Opening Day: Los Porfiados (The Stubborns)",
        "description": "Join us for the grand opening of our summer outdoor installation in the Carroll Slater Sifly Piazza! Created by the Chilean design studio gt2P, this interactive exhibition features 14 monumental, colorful, inflatable sculptures inspired by classic roly-poly wobbling toys, promoting joy and community play.",
        "image_url": "/events/los_porfiados.jpg",
        "category": "exhibition",
        "recurrence": "none",
        "price": 16.50,
        "time": "10:00 AM"
    },
    {
        "date": "2026-06-12",
        "title": "Exhibition Launch: New Acquisitions in Photography",
        "description": "Opening today, this special exhibition highlights the exceptional breadth of the High's photography collection, debuting many newly acquired modern and contemporary works on public view for the very first time.",
        "image_url": "/events/photography_workshop.jpg",
        "category": "exhibition",
        "recurrence": "none",
        "price": 16.50,
        "time": "10:00 AM"
    },
    {
        "date": "2026-06-14",
        "title": "UPS Second Sunday (Free Admission)",
        "description": "Enjoy free admission to the High Museum of Art! Bring the whole family to participate in special art-making workshops, interactive gallery tours, and live musical performances throughout our iconic buildings.",
        "image_url": "/events/second_sunday.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 0,
        "time": "12:00 PM"
    },
    {
        "date": "2026-06-19",
        "title": "Friday Jazz",
        "description": "Experience our light-filled galleries in a new way! Friday Jazz features live musical sets from top Southern jazz ensembles in our glass-walled atrium, accompanied by docent-led tours and special drink pairings.",
        "image_url": "/events/friday_jazz.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 30,
        "time": "6:00 PM"
    },
    {
        "date": "2026-06-20",
        "title": "Oasis: Atrium Yoga & Sound Bath",
        "description": "Join us in our light-filled Renzo Piano atrium for a peaceful morning of wellness. Enjoy a slow-flow yoga session guided by leading local instructors, followed by a deeply restorative sound bath and guided meditation.",
        "image_url": "/events/oasis_yoga.jpg",
        "category": "workshop",
        "recurrence": "none",
        "price": 25,
        "time": "8:30 AM"
    },

    # ==================== JULY 2026 ====================
    {
        "date": "2026-07-03",
        "title": "HIGH Frequency Friday",
        "description": "Celebrate mid-summer under the stars! High Frequency Friday returns with Atlanta's premier DJs, signature cocktails, and late-night gallery access to all temporary and permanent exhibitions.",
        "image_url": "/events/high_frequency_friday.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 30,
        "time": "6:00 PM"
    },
    {
        "date": "2026-07-11",
        "title": "Creative Writing in the Galleries",
        "description": "Led by local poets and creative writers, this workshop invites participants to draw inspiration from the strong storytelling roots of our permanent collections. Engage in guided writing exercises directly in the galleries.",
        "image_url": "/events/photography_workshop.jpg",
        "category": "workshop",
        "recurrence": "none",
        "price": 15,
        "time": "1:00 PM"
    },
    {
        "date": "2026-07-12",
        "title": "UPS Second Sunday (Free Admission)",
        "description": "Join us for our free admission Sunday! Participate in interactive art workshops, enjoy youth musical performances, and experience our special summer exhibitions at no charge.",
        "image_url": "/events/second_sunday.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 0,
        "time": "12:00 PM"
    },
    {
        "date": "2026-07-17",
        "title": "Friday Jazz",
        "description": "Cool off with an elegant evening of live acoustic jazz and museum exploration. Stroll through the galleries with your favorite drink while listening to leading regional quartets under the soaring atrium ceilings.",
        "image_url": "/events/friday_jazz.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 30,
        "time": "6:00 PM"
    },
    {
        "date": "2026-07-18",
        "title": "Teen Summer Art Workshop",
        "description": "A hands-on workshop led by local visual artists. Teenagers will learn professional techniques in sketching, canvas painting, and collaging, drawing inspiration from our contemporary collections.",
        "image_url": "/events/photography_workshop.jpg",
        "category": "workshop",
        "recurrence": "none",
        "price": 25,
        "time": "1:00 PM"
    },
    {
        "date": "2026-07-25",
        "title": "Midsummer Spotlight: Amy Sherald's Portraits",
        "description": "An exclusive, high-fidelity gallery tour exploring Amy Sherald's spectacular portraits. Learn about her signature use of grisaille (gray monochrome) for skin tones and vibrant clothing to highlight Black American life.",
        "image_url": "/events/amy_sherald.jpg",
        "category": "talk",
        "recurrence": "none",
        "price": 20,
        "time": "2:00 PM"
    },
    {
        "date": "2026-07-31",
        "title": "Exhibition Opening: Paper Trees",
        "description": "Opening today, this exhibition explores the rich presence of tree life in American art from the 19th century to the present, featuring gorgeous prints, drawings, and paper sculptures from the museum's permanent collection.",
        "image_url": "/events/paper_trees.jpg",
        "category": "exhibition",
        "recurrence": "none",
        "price": 16.50,
        "time": "10:00 AM"
    },

    # ==================== AUGUST 2026 ====================
    {
        "date": "2026-08-01",
        "title": "Closing Weekend Tour: Amy Sherald's American Sublime",
        "description": "Don't miss the closing weekend of Amy Sherald's landmark retrospective! Join our curators for a comprehensive final walkthrough of this historic exhibition before it officially closes on August 2.",
        "image_url": "/events/amy_sherald.jpg",
        "category": "talk",
        "recurrence": "none",
        "price": 20,
        "time": "2:00 PM"
    },
    {
        "date": "2026-08-07",
        "title": "HIGH Frequency Friday",
        "description": "Late summer nights at the High! Join us for a lively social evening featuring custom outdoor lounge spaces, live DJ sets, and after-hours gallery access to all major collections.",
        "image_url": "/events/high_frequency_friday.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 30,
        "time": "6:00 PM"
    },
    {
        "date": "2026-08-09",
        "title": "UPS Second Sunday (Free Admission)",
        "description": "Enjoy free admission to the High. Participate in hands-on printmaking workshops, listen to local storytellers, and explore the museum's galleries at no cost.",
        "image_url": "/events/second_sunday.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 0,
        "time": "12:00 PM"
    },
    {
        "date": "2026-08-15",
        "title": "Oasis: Atrium Yoga & Sound Bath",
        "description": "Join us in our light-filled Renzo Piano atrium for a peaceful morning of wellness. Enjoy a slow-flow yoga session guided by leading local instructors, followed by a deeply restorative sound bath and guided meditation.",
        "image_url": "/events/oasis_yoga.jpg",
        "category": "workshop",
        "recurrence": "none",
        "price": 25,
        "time": "8:30 AM"
    },
    {
        "date": "2026-08-21",
        "title": "Friday Jazz",
        "description": "Our monthly evening of live jazz returns! Discover exceptional instrumental sets throughout our Renzo Piano atrium, paired with specialty drinks and guided curatorial tours.",
        "image_url": "/events/friday_jazz.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 30,
        "time": "6:00 PM"
    },
    {
        "date": "2026-08-22",
        "title": "Sculpture Workshop: Noguchi's Influence",
        "description": "Create your own abstract organic sculpture! Inspired by Isamu Noguchi's legendary career, participants will learn basic clay modeling and wire framing techniques under professional guidance.",
        "image_url": "/events/exhibition_tour.jpg",
        "category": "workshop",
        "recurrence": "none",
        "price": 25,
        "time": "11:00 AM"
    },
    {
        "date": "2026-08-28",
        "title": "Exhibition Opening: I SPY! Walter Wick's Hidden Wonders",
        "description": "Opening today! Walk into a world of hidden details. This special exhibition features Walter Wick's monumental, stunning photographs and model constructions from the world-famous children's book series 'I SPY' and 'Can You See What I See?'. Excellent for families and visual thinkers of all ages.",
        "image_url": "/events/second_sunday.jpg",
        "category": "exhibition",
        "recurrence": "none",
        "price": 16.50,
        "time": "10:00 AM"
    },

    # ==================== SEPTEMBER 2026 ====================
    {
        "date": "2026-09-04",
        "title": "HIGH Frequency Friday",
        "description": "Kick off Autumn at the High! High Frequency Friday returns with outstanding musical selections from Atlanta's top DJs, signature cocktails, and late-night gallery viewings.",
        "image_url": "/events/high_frequency_friday.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 30,
        "time": "6:00 PM"
    },
    {
        "date": "2026-09-12",
        "title": "Creative Writing in the Galleries",
        "description": "Led by local poets and creative writers, this workshop invites participants to draw inspiration from the strong storytelling roots of our permanent collections. Engage in guided writing exercises directly in the galleries.",
        "image_url": "/events/photography_workshop.jpg",
        "category": "workshop",
        "recurrence": "none",
        "price": 15,
        "time": "1:00 PM"
    },
    {
        "date": "2026-09-13",
        "title": "UPS Second Sunday (Free Admission)",
        "description": "Join us for our free admission Sunday. Explore the world-class collections of the High Museum, participate in fun art-making workshops, and enjoy live community performances.",
        "image_url": "/events/second_sunday.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 0,
        "time": "12:00 PM"
    },
    {
        "date": "2026-09-18",
        "title": "Friday Jazz",
        "description": "Welcome back to Friday Jazz! Enjoy a magical autumn night of live local and regional jazz music, docent-led tours of our collections, and signature cocktails.",
        "image_url": "/events/friday_jazz.jpg",
        "category": "family",
        "recurrence": "none",
        "price": 30,
        "time": "6:00 PM"
    },
    {
        "date": "2026-09-26",
        "title": "Closing Weekend Tour: Isamu Noguchi: 'I am not a designer'",
        "description": "Don't miss the closing weekend of Isamu Noguchi's spectacular spatial design retrospective! Join our curators for a final walkthrough of this historic exhibition before it officially closes on September 27.",
        "image_url": "/events/exhibition_tour.jpg",
        "category": "talk",
        "recurrence": "none",
        "price": 20,
        "time": "2:00 PM"
    }
]

print("=========================================================================")
print(f"Connecting to database {db_path} to seed fully active calendar events...")
print("=========================================================================")

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Clean existing records for June, July, August, September to prevent duplicates on rerun
# Also fix any typo dates (like year '0026' or dates in these months)
cur.execute(
    """
    DELETE FROM events 
    WHERE date LIKE '2026-06-%' 
       OR date LIKE '2026-07-%' 
       OR date LIKE '2026-08-%' 
       OR date LIKE '2026-09-%'
       OR date LIKE '0026-%'
    """
)
print(f"Cleaned up {cur.rowcount} stale/typo events in database.")

inserted = 0
for item in events_data:
    cur.execute(
        """
        INSERT INTO events (date, title, description, image_url, category, recurrence, price, time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            item["date"],
            item["title"],
            item["description"],
            item["image_url"],
            item["category"],
            item["recurrence"],
            item["price"],
            item["time"]
        )
    )
    inserted += 1
    print(f"[+] Seeded Active Event: {item['date']} - '{item['title']}' ({item['category'].upper()})")

conn.commit()
print("=========================================================================")
print(f"Successfully seeded {inserted} fully populated, high-fidelity FBLA calendar events.")
print("=========================================================================")
conn.close()
