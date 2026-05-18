export interface Deck {
  id: string;
  anki_id?: string | null;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  ranking?: number | null;
  total_cards?: number | null;
  mastery?: number;
  tags?: string[] | null;
  anki_link?: string | null;
  download_url?: string | null;
  category_id?: string | null;
  last_sync_at?: string | null;
  created_at?: string | null;
  source?: "local" | "global";
  categories?: {
    id?: string;
    name?: string;
    slug?: string;
  } | null;
}

export interface Profile {
  id: string;
  username?: string | null;
  streak?: number | null;
  neural_score?: number | null;
  avatar_url?: string | null;
}

export interface SearchResultDeck {
  id: string;
  anki_id?: string | null;
  title: string;
  thumbnail_url?: string | null;
  source: "local" | "global";
}
