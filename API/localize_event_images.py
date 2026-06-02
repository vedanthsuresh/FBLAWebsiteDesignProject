import os
import requests
import sqlite3

# Define mapping
image_mapping = {
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800": "toddler_thursday.jpg",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800": "high_frequency_friday.jpg",
    "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800": "martin_puryear.jpg",
    "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800": "los_porfiados.jpg",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800": "photography_workshop.jpg",
    "https://images.unsplash.com/photo-1545601445-4d6a0a0565f0?q=80&w=800": "second_sunday.jpg",
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800": "friday_jazz.jpg",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800": "exhibition_tour.jpg",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800": "amy_sherald.jpg",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800": "paper_trees.jpg",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800": "oasis_yoga.jpg"
}

public_dir = "../UserApplication/public/events"
db_path = "museum.db"

# Create output folder
os.makedirs(public_dir, exist_ok=True)

print("=========================================================================")
print("Downloading and localizing event images for offline mode...")
print("=========================================================================")

# Download each image
for url, filename in image_mapping.items():
    local_path = os.path.join(public_dir, filename)
    if os.path.exists(local_path):
        print(f"[-] Skipped (already exists): {filename}")
        continue
        
    try:
        print(f"[+] Downloading {filename}...")
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            with open(local_path, "wb") as f:
                f.write(response.content)
            print(f"    Saved to: {local_path}")
        else:
            print(f"    [!] Failed to download: HTTP {response.status_code}")
    except Exception as e:
        print(f"    [!] Error: {e}")

print("\n=========================================================================")
print("Updating SQLite database event records to use local paths...")
print("=========================================================================")

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Update each matching row in the database
updated = 0
for url, filename in image_mapping.items():
    db_url = f"/events/{filename}"
    cur.execute("UPDATE events SET image_url = ? WHERE image_url = ?", (db_url, url))
    updated += cur.rowcount
    print(f"    Mapped: {url} -> {db_url} ({cur.rowcount} rows updated)")

conn.commit()
print("=========================================================================")
print(f"Complete! Updated {updated} events in SQLite database.")
print("=========================================================================")
conn.close()
