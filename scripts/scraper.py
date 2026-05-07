import requests
from bs4 import BeautifulSoup
import os
import json
from supabase import create_client, Client

# Supabase configuration
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Need service role for upsert
supabase: Client = create_client(url, key)

def scrape_ankiweb(search_term, category_id):
    print(f"Scraping AnkiWeb for: {search_term}...")
    search_url = f"https://ankiweb.net/shared/decks?search={search_term}"
    
    try:
        response = requests.get(search_url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        decks = []
        # Basic parsing logic for AnkiWeb tables
        table = soup.find('table')
        if not table:
            print("No decks found.")
            return
            
        rows = table.find_all('tr')[1:] # Skip header
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 3:
                link_tag = cols[0].find('a')
                title = link_tag.text.strip()
                href = link_tag['href']
                rating = float(cols[1].text.strip()) if cols[1].text.strip() else 0
                cards = int(cols[2].text.strip().replace(',', '')) if cols[2].text.strip() else 0
                
                decks.append({
                    "title": title,
                    "anki_link": f"https://ankiweb.net{href}",
                    "category_id": category_id,
                    "ranking": rating,
                    "total_cards": cards,
                    "description": f"Shared deck found on AnkiWeb for {search_term}.",
                    "thumbnail_url": "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1000"
                })
        
        if decks:
            print(f"Found {len(decks)} decks. Syncing to Supabase...")
            # Upsert into decks table
            # We use title as a unique constraint or just insert
            for deck in decks:
                supabase.table("decks").upsert(deck, on_conflict="title").execute()
            print("Sync complete.")
            
    except Exception as e:
        print(f"Error during scraping: {e}")

if __name__ == "__main__":
    # Example categories to scrape
    # In a real scenario, you'd fetch these from the 'categories' table
    # For now, we'll hardcode some common ones
    categories = [
        {"term": "medical", "id": "med-001"},
        {"term": "law", "id": "law-001"},
        {"term": "spanish", "id": "lang-001"},
        {"term": "coding", "id": "code-001"}
    ]
    
    for cat in categories:
        scrape_ankiweb(cat["term"], cat["id"])
