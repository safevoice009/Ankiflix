import requests
from bs4 import BeautifulSoup
import os
import time
from datetime import datetime, timezone
from supabase import create_client, Client

# Supabase configuration
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Need service role for upsert
if not url or not key:
    print("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    exit(1)

supabase: Client = create_client(url, key)

FALLBACK_IMAGES = {
    "medical": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
    "law": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400",
    "languages": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    "coding": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    "history": "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?w=400",
    "science": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400",
    "mathematics": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    "default": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
}

def scrape_deck_info(anki_id):
    """Scrapes detailed info for a single deck from AnkiWeb."""
    url = f"https://ankiweb.net/shared/info/{anki_id}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title = soup.find('h1').text.strip() if soup.find('h1') else "Untitled Deck"
        
        # AnkiWeb info structure is a bit messy, but cards are usually in a specific location
        # This is a simplified version
        description = "Premium Anki deck for effective learning."
        desc_div = soup.find('div', class_='mt-4') # Often where desc is
        if desc_div:
            description = desc_div.text.strip()[:500] # Cap it
            
        return {
            "title": title,
            "anki_link": url,
            "description": description,
        }
    except Exception as e:
        print(f"Error scraping deck {anki_id}: {e}")
        return None

def scrape_ankiweb_search(search_term, category_id, category_slug):
    print(f"Scraping AnkiWeb for: {search_term}...")
    search_url = f"https://ankiweb.net/shared/decks?search={search_term}"
    
    try:
        response = requests.get(search_url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        table = soup.find('table')
        if not table:
            print(f"No decks found for {search_term}.")
            return
            
        rows = table.find_all('tr')[1:11] # Get top 10 for quality
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 3:
                link_tag = cols[0].find('a')
                title = link_tag.text.strip()
                href = link_tag['href']
                href_parts = href.strip("/").split("/")
                anki_id = href_parts[-1] if href_parts else ""
                rating = float(cols[1].text.strip()) if cols[1].text.strip() else 0
                cards = int(cols[2].text.strip().replace(',', '')) if cols[2].text.strip() else 0
                
                # Use Unsplash fallback based on category
                thumbnail_url = FALLBACK_IMAGES.get(category_slug, FALLBACK_IMAGES["default"])
                
                canonical_link = f"https://ankiweb.net/shared/info/{anki_id}" if anki_id.isdigit() else f"https://ankiweb.net{href}"
                download_link = f"https://ankiweb.net/shared/download/{anki_id}" if anki_id.isdigit() else canonical_link

                # Fetch detailed info if possible (simplified for performance)
                deck_data = {
                    "anki_id": anki_id,
                    "title": title,
                    "anki_link": canonical_link,
                    "download_url": download_link,
                    "category_id": category_id,
                    "ranking": rating,
                    "total_cards": cards,
                    "description": f"High-authority Anki library discovered for {search_term}. Rated {rating}/5 by the community.",
                    "thumbnail_url": thumbnail_url,
                    "tags": [search_term, category_slug],
                    "author": "AnkiWeb Global Community",
                    "last_sync_at": datetime.now(timezone.utc).isoformat()
                }
                
                # Enforce anki_id-first then title-second programmatic deduplication
                existing_by_id = None
                if anki_id:
                    try:
                        res_id = supabase.table("decks").select("id").eq("anki_id", anki_id).execute()
                        if res_id.data:
                            existing_by_id = res_id.data[0]["id"]
                    except Exception as err:
                        print(f"Error querying by anki_id: {err}")
                
                if existing_by_id:
                    # Update by id
                    print(f"Syncing existing deck by ID: {title} (ID: {anki_id})")
                    try:
                        supabase.table("decks").update(deck_data).eq("id", existing_by_id).execute()
                    except Exception as err:
                        print(f"Failed to update deck by ID: {err}")
                else:
                    # Check fallback by title
                    existing_by_title = None
                    try:
                        res_title = supabase.table("decks").select("id").eq("title", title).execute()
                        if res_title.data:
                            existing_by_title = res_title.data[0]["id"]
                    except Exception as err:
                        print(f"Error querying by title: {err}")

                    if existing_by_title:
                        print(f"Syncing existing deck by Title: {title}")
                        try:
                            supabase.table("decks").update(deck_data).eq("id", existing_by_title).execute()
                        except Exception as err:
                            print(f"Failed to update deck by Title: {err}")
                    else:
                        # Insert as a new record
                        print(f"Ingesting new discovery: {title}")
                        try:
                            supabase.table("decks").insert(deck_data).execute()
                        except Exception as err:
                            print(f"Failed to insert new deck: {err}")
                
                time.sleep(0.5) # Efficiency upgrade
                
    except Exception as e:
        print(f"Error during search scraping for {search_term}: {e}")

if __name__ == "__main__":
    print("--- ANKIFLIX DEEP INDEXER START ---")
    start_time = time.time()
    
    # 1. Fetch categories from Supabase
    try:
        res = supabase.table("categories").select("*").execute()
        categories = res.data
        if not categories:
            print("[CRITICAL] No categories found. Aborting sequence.")
            exit(0)
            
        print(f"[INFO] Analyzing {len(categories)} intelligence fields...")
        
        # Comprehensive query expansion mapping
        expanded_keywords = {
            "medical": ["medical", "USMLE Step 1", "USMLE Step 2", "MCAT", "PLAB", "NCLEX", "First Aid Step 1"],
            "anatomy": ["anatomy", "Netter Anatomy", "Gray's Anatomy", "Anatomy Flashcards"],
            "physiology": ["physiology", "Costanzo Physiology", "Guyton Physiology"],
            "pharmacology": ["pharmacology", "Sketchy Pharm", "Katzung Pharmacology"],
            "pathology": ["pathology", "Pathoma", "Robbins Pathology"],
            "microbiology": ["microbiology", "Sketchy Micro", "Clinical Microbiology"],
            "biochemistry": ["biochemistry", "Lippincott Biochemistry", "Medical Biochemistry"],
            "law": ["law", "Bar Exam", "MBE Law", "Constitutional Law", "Contracts Law"],
            "languages": ["japanese", "spanish", "french", "german", "mandarin", "JLPT", "JLPT N5", "JLPT N4", "DELE Spanish"],
            "coding": ["coding", "programming", "javascript", "python", "leetcode", "data structures", "algorithms", "web development"],
            "history": ["history", "world history", "european history", "american history", "historical timeline"],
            "science": ["science", "physics", "chemistry", "biology", "astronomy"],
            "mathematics": ["mathematics", "calculus", "linear algebra", "statistics", "probability"]
        }
        
        for cat in categories:
            slug = cat["slug"]
            search_terms = expanded_keywords.get(slug, [cat["name"]])
            
            for term in search_terms:
                print(f"\n[SCAN] Deep Scanning: {term}...")
                scrape_ankiweb_search(term, cat["id"], slug)
            
        duration = time.time() - start_time
        print(f"\n--- DEEP INDEX COMPLETE ---")
        print(f"Total duration: {duration:.2f} seconds")
        print("Status: Global Intelligence Ingested.")
            
    except Exception as e:
        print(f"[ERROR] Fatal exception during category fetch: {e}")

