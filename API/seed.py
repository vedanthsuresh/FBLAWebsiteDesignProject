from database import Base, engine, SessionLocal, Event, Holiday, OperatingHour, Artwork, Newsletter
from datetime import date, datetime

# 1. Create Tables
Base.metadata.create_all(bind=engine)

# 2. Get a Database Session
db = SessionLocal()

# 3. Clear data
db.query(Event).delete()
db.query(Holiday).delete()
db.query(OperatingHour).delete()
db.query(Artwork).delete()
db.query(Newsletter).delete()

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

artworks_data = [
    {
        "title": "Mask",
        "creator": "Ibibio Artist, Ekpo Society, Nigeria",
        "image_url": "https://high.org/wp-content/uploads/2020/03/mask.png", # Placeholder URL
        "metadata_info": "20th Century • Wood, Pigment",
        "department": "African Art",
        "curators_insight": "A 20th-century wood and pigment mask representing the Ekpo society's spiritual authority."
    },
    {
        "title": "Mami Wata",
        "creator": "Igbo Artist, Nigeria",
        "image_url": "https://high.org/wp-content/uploads/2020/03/mamiwata.png",
        "metadata_info": "20th Century • Mixed Media",
        "department": "African Art",
        "curators_insight": "A vibrant representation of the water spirit Mami Wata, blending indigenous beliefs with global influences."
    },
    {
        "title": "Study for the Quaker",
        "creator": "Andrew Wyeth",
        "image_url": "https://high.org/wp-content/uploads/2020/03/studyforthequaker.png",
        "metadata_info": "1975 • Watercolor on Paper",
        "department": "American Art",
        "curators_insight": "A powerful technical study of two antique coats hanging in Wyeth's studio."
    }
]

# Standard January 2026 Newsletter Sections
sections_en = [
    {"title": "Architecture: Structural Light", "type": "architecture", "content": "Our campus is a masterpiece of modern architecture. Designed by Richard Meier in 1983 and expanded by Renzo Piano in 2005, the museum offers over 312,000 square feet of gallery space."},
    {"title": "Major Exhibition: Giants", "type": "exhibition", "content": "On view through January 19, 2026, 'Giants: Art from the Dean Collection of Swizz Beatz and Alicia Keys' features a world-class collection of works by multigenerational Black diasporic artists."},
    {"title": "The City Reimagined: Georgia O'Keeffe", "type": "exhibition", "content": "Exploring the iconic artist's decade-long fascination with the city's skyscrapers and urban structure."},
    {"title": "Community & Access", "type": "event", "content": "January starts with 'High Frequency Friday' on Jan 3, 2026, featuring local DJs and late-night gallery access."}
]

sections_es = [
    {"title": "Arquitectura: Luz Estructural", "type": "arquitectura", "content": "Nuestro campus es una obra maestra de la arquitectura moderna. Diseñado por Richard Meier en 1983 y ampliado por Renzo Piano en 2005."},
    {"title": "Exposición Principal: Giants", "type": "exposición", "content": "En exhibición hasta el 19 de enero de 2026, 'Giants' presenta una colección de clase mundial de obras de artistas de la diáspora negra."},
    {"title": "La Ciudad Reimaginada: Georgia O'Keeffe", "type": "exposición", "content": "Explora la fascinación de una década de la icónica artista por los rascacielos y la estructura urbana de la ciudad."},
    {"title": "Comunidad y Acceso", "type": "evento", "content": "Enero comienza con 'High Frequency Friday' el 3 de enero de 2026, con DJs locales y acceso tardío."}
]

sections_fr = [
    {"title": "Architecture : Lumière Structurelle", "type": "architecture", "content": "Notre campus est un chef-d'œuvre de l'architecture moderne. Conçu par Richard Meier en 1983 et agrandi par Renzo Piano en 2005."},
    {"title": "Exposition Majeure : Giants", "type": "exposition", "content": "À l'affiche jusqu'au 19 janvier 2026, 'Giants' présente une collection de classe mondiale d'œuvres d'artistes de la diaspora noire."},
    {"title": "La Ville Réimaginée : Georgia O'Keeffe", "type": "exposition", "content": "Explore la fascination de dix ans de l'artiste emblématique pour les gratte-ciel et la structure urbaine de la ville."},
    {"title": "Communauté et Accès", "type": "événement", "content": "Janvier commence avec le 'High Frequency Friday' le 3 janvier de 2026, avec des DJs locaux."}
]

newsletters_data = [
    {
        "lang": "en",
        "month": "January 2026",
        "title": "Monthly Institutional Review: A New Vision",
        "subtitle": "Exploring 'Giants', O'Keeffe's New York, and the architectural evolution of the High Museum.",
        "introduction": "Welcome to our special January edition!",
        "sections": sections_en,
        "citation": "Source: High Museum of Art - Official 2026 Institutional Calendar",
        "verification_hash": "sha256:7b9c1d0f8e3a2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7",
        "publish_at": "2026-01-01T00:00:00"
    },
    {
        "lang": "es",
        "month": "Enero 2026",
        "title": "Revisión Institucional Mensual: Una Nueva Visión",
        "subtitle": "Explorando 'Giants', el Nueva York de O'Keeffe y la evolución arquitectónica del Museo High.",
        "introduction": "¡Bienvenidos a nuestra edición especial de enero!",
        "sections": sections_es,
        "citation": "Fuente: Museo de Arte High - Calendario Institucional Oficial 2026",
        "verification_hash": "sha256:7b9c1d0f8e3a2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7",
        "publish_at": "2026-01-01T00:00:00"
    },
    {
        "lang": "fr",
        "month": "Janvier 2026",
        "title": "Revue Institutionnelle Mensuelle : Une Nouvelle Vision",
        "subtitle": "Exploration de 'Giants', le New York d'O'Keeffe et l'évolution architecturale du High Museum.",
        "introduction": "Bienvenue dans notre édition spéciale de janvier !",
        "sections": sections_fr,
        "citation": "Source : High Museum of Art - Calendrier institutionnel officiel 2026",
        "verification_hash": "sha256:7b9c1d0f8e3a2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7",
        "publish_at": "2026-01-01T00:00:00"
    }
]

# 5. Insert
for e in events_data:
    db.add(Event(**e))

for h in holidays_data:
    db.add(Holiday(**h))

for o in hours_data:
    db.add(OperatingHour(**o))

for a in artworks_data:
    db.add(Artwork(**a))

for n in newsletters_data:
    db.add(Newsletter(**n))

# 6. Commit
db.commit()
db.close()
print("Database seeded successfully with Artworks and Newsletters!")