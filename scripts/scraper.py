import requests
from bs4 import BeautifulSoup
import os
import json
import time
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
                anki_id = href.split('/')[-1]
                rating = float(cols[1].text.strip()) if cols[1].text.strip() else 0
                cards = int(cols[2].text.strip().replace(',', '')) if cols[2].text.strip() else 0
                
                # Use Unsplash fallback based on category
                thumbnail_url = FALLBACK_IMAGES.get(category_slug, FALLBACK_IMAGES["default"])
                
                deck_data = {
                    "title": title,
                    "anki_link": f"https://ankiweb.net{href}",
                    "category_id": category_id,
                    "ranking": rating,
                    "total_cards": cards,
                    "description": f"High-quality Anki deck discovered for {search_term}.",
                    "thumbnail_url": thumbnail_url,
                    "updated_at": "now()"
                }
                
                print(f"Syncing: {title}")
                supabase.table("decks").upsert(deck_data, on_conflict="title").execute()
                time.sleep(1) # Be nice to AnkiWeb
                
    except Exception as e:
        print(f"Error during search scraping for {search_term}: {e}")

if __name__ == "__main__":
    # 1. Fetch categories from Supabase
    try:
        res = supabase.table("categories").select("*").execute()
        categories = res.data
        if not categories:
            print("No categories found in Supabase. Please seed them first.")
            exit(0)
            
        for cat in categories:
            # We use name as search term and slug for image selection
            scrape_ankiweb_search(cat["name"], cat["id"], cat["slug"])
            
    except Exception as e:
        print(f"Error fetching categories: {e}")
