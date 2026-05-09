import requests
from bs4 import BeautifulSoup
import os
import time
from supabase import create_client, Client

# Supabase configuration
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not url or not key:
    print("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    exit(1)

supabase: Client = create_client(url, key)

FALLBACK_IMAGES = {
    "medical": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
    "default": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
}

def scrape_deck_info(anki_link):
    """Scrapes detailed info for a single deck from AnkiWeb."""
    try:
        response = requests.get(anki_link, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title = soup.find('h1').text.strip() if soup.find('h1') else "Untitled Deck"
        
        # Extract metadata
        description = "Premium intelligence asset verified for high-retention performance."
        desc_div = soup.find('div', class_='mt-4')
        if desc_div:
            description = desc_div.text.strip()[:500]
            
        # Try to find stats
        # Cards count is often in a div with text "Notes" or similar
        total_cards = 100 # Default
        for div in soup.find_all('div'):
            if "Notes" in div.text and ":" in div.text:
                try:
                    total_cards = int(div.text.split(':')[-1].strip().replace(',', ''))
                    break
                except:
                    pass
        
        # Rating
        rating = 5.0 # Default for submissions
        
        return {
            "title": title,
            "anki_link": anki_link,
            "description": description,
            "total_cards": total_cards,
            "ranking": rating,
            "thumbnail_url": FALLBACK_IMAGES["default"]
        }
    except Exception as e:
        print(f"Error scraping {anki_link}: {e}")
        return None

def process_submissions():
    print("--- ANKIFLIX SUBMISSION INGESTOR START ---")
    
    try:
        # 1. Get pending submissions
        res = supabase.table("deck_submissions").select("*").eq("status", "pending").execute()
        submissions = res.data
        
        if not submissions:
            print("[INFO] No pending intelligence assets found.")
            return
            
        print(f"[INFO] Found {len(submissions)} pending assets for indexing.")
        
        for sub in submissions:
            link = sub["anki_link"]
            print(f"[PROCESS] Indexing: {link}")
            
            deck_data = scrape_deck_info(link)
            if deck_data:
                # Add category (default to medical for now as requested)
                # In a real app, we might ask the user or guess
                cat_res = supabase.table("categories").select("id").eq("slug", "medical").single().execute()
                if cat_res.data:
                    deck_data["category_id"] = cat_res.data["id"]
                
                # Insert into decks
                print(f"[INSERT] Adding to Global Vault: {deck_data['title']}")
                supabase.table("decks").upsert(deck_data, on_conflict="title").execute()
                
                # Mark as approved
                supabase.table("deck_submissions").update({"status": "approved"}).eq("id", sub["id"]).execute()
                print(f"[SUCCESS] Asset authorized.")
            else:
                # Mark as rejected or error
                supabase.table("deck_submissions").update({"status": "rejected"}).eq("id", sub["id"]).execute()
                print(f"[FAILED] Asset rejected due to indexing error.")
            
            time.sleep(1) # Rate limit protection
            
    except Exception as e:
        print(f"[ERROR] Fatal exception during submission ingestion: {e}")

if __name__ == "__main__":
    process_submissions()
