const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('CRITICAL: Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

const categories = [
  { name: 'Medical', slug: 'medical', description: 'Advanced flashcards for USMLE, MBBS, and Clinical Practice.' },
  { name: 'Law', slug: 'law', description: 'Bar Exam mastery, Constitutional Law, and Case Studies.' },
  { name: 'Languages', slug: 'languages', description: 'Immersive decks for Spanish, Japanese, and French mastery.' },
  { name: 'Coding', slug: 'coding', description: 'Data Structures, Algorithms, and Modern Web Frameworks.' },
  { name: 'History', slug: 'history', description: 'Chronological world history and pivotal historical events.' },
  { name: 'Science', slug: 'science', description: 'Deep dives into Physics, Organic Chemistry, and Biology.' }
];

const sampleDecks = [
  { title: 'USMLE Step 1: Ultimate Review', category_slug: 'medical', ranking: 4.9, total_cards: 12500, description: 'The most comprehensive Step 1 deck with high-yield images and mnemonic tags.' },
  { title: 'Constitutional Law Mastery', category_slug: 'law', ranking: 4.7, total_cards: 3200, description: 'Detailed case law analysis and constitutional principles for Bar exam candidates.' },
  { title: 'Core JavaScript Patterns', category_slug: 'coding', ranking: 4.8, total_cards: 850, description: 'Master design patterns, closures, and async/await with these high-quality cards.' },
  { title: 'Japanese Core 6k', category_slug: 'languages', ranking: 4.9, total_cards: 6000, description: 'The gold standard for Japanese vocabulary. Audio and sentences included.' },
  { title: 'Anatomy: Head & Neck', category_slug: 'medical', ranking: 4.6, total_cards: 2100, description: 'High-detail anatomical diagrams and localized clinical notes.' },
  { title: 'React Performance Guide', category_slug: 'coding', ranking: 4.5, total_cards: 420, description: 'Deep dive into rendering, reconciliation, and hooks optimization.' }
];

async function bootstrap() {
  console.log('--- ANKIFLIX DATABASE BOOTSTRAP ---');
  
  // 1. Seed Categories
  console.log('Seeding categories...');
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert(categories, { on_conflict: 'slug' })
    .select();

  if (catError) {
    console.error('Error seeding categories:', catError.message);
    if (catError.code === 'PGRST116') console.log('Tip: Table "categories" might be missing.');
  } else {
    console.log(`Successfully synced ${catData.length} categories.`);
  }

  // 2. Map category IDs for decks
  const catMap = {};
  catData?.forEach(c => catMap[c.slug] = c.id);

  // 3. Seed Decks
  console.log('Seeding initial decks...');
  const decksToInsert = sampleDecks.map(d => ({
    ...d,
    category_id: catMap[d.category_slug],
    thumbnail_url: `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600`, // Placeholder
    anki_link: 'https://ankiweb.net/shared/decks'
  }));

  const { error: deckError } = await supabase
    .from('decks')
    .upsert(decksToInsert, { on_conflict: 'title' });

  if (deckError) {
    console.error('Error seeding decks:', deckError.message);
  } else {
    console.log('Successfully synced premium decks.');
  }

  console.log('--- BOOTSTRAP COMPLETE ---');
}

bootstrap();
