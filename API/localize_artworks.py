import sqlite3
import os
import requests

# Paths
db_path = "museum.db"
public_dir = "../UserApplication/public/artworks"

# Create public/artworks folder if it doesn't exist
os.makedirs(public_dir, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Query all artworks
cur.execute("SELECT id, image_url, title FROM artworks")
artworks = cur.fetchall()

print("=========================================================================")
print(f"Starting automatic artwork localization (Found {len(artworks)} artworks)...")
print("=========================================================================")

updated = 0
for art_id, url, title in artworks:
    # Check if already localized
    if url.startswith("/artworks/"):
        print(f"[-] Skipped: '{title}' (already localized)")
        continue
    
    # Determine correct extension
    ext = ".jpg"
    if ".png" in url.lower():
        ext = ".png"
    elif ".svg" in url.lower():
        ext = ".svg"
    elif ".gif" in url.lower():
        ext = ".gif"
        
    filename = f"artwork_{art_id}{ext}"
    local_path = os.path.join(public_dir, filename)
    
    try:
        print(f"[+] Downloading '{title}' image...")
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            with open(local_path, "wb") as f:
                f.write(response.content)
            
            # Update SQLite database to point to the local asset path
            db_url = f"/artworks/{filename}"
            cur.execute("UPDATE artworks SET image_url = ? WHERE id = ?", (db_url, art_id))
            updated += 1
            print(f"    -> Localized successfully: {db_url}")
        else:
            print(f"    [!] Failed download: HTTP {response.status_code}")
    except Exception as e:
        print(f"    [!] Error downloading '{title}': {e}")

conn.commit()
print("=========================================================================")
print(f"Localization complete! Successfully localized {updated} new artworks.")
print(f"Images are saved in: {os.path.abspath(public_dir)}")
print("=========================================================================")
conn.close()
