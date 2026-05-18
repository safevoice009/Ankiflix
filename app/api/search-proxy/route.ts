import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { buildAnkiDownloadUrl, buildAnkiInfoUrl, extractAnkiId } from '@/lib/anki';

interface ScrapedDeck {
  id: string;
  anki_id: string | null;
  title: string;
  anki_link: string;
  download_url: string;
  ranking: number;
  total_cards: number;
  description: string;
  tags: string[];
  author: string;
  last_sync_at: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const searchUrl = `https://ankiweb.net/shared/decks?search=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from AnkiWeb');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: Array<ScrapedDeck & { is_external: true }> = [];
    const dbUpserts: ScrapedDeck[] = [];

    $('table tr').slice(1, 15).each((_, element) => {
      const cols = $(element).find('td');
      if (cols.length >= 3) {
        const linkTag = cols.eq(0).find('a');
        const title = linkTag.text().trim();
        const href = linkTag.attr('href');
        const ranking = parseFloat(cols.eq(1).text().trim()) || 0;
        const total_cards = parseInt(cols.eq(2).text().trim().replace(',', '')) || 0;

        if (title && href) {
          const ankiId = extractAnkiId(href);
          const canonicalLink = ankiId
            ? buildAnkiInfoUrl(ankiId)
            : `https://ankiweb.net${href}`;
          const downloadLink = ankiId
            ? buildAnkiDownloadUrl(ankiId)
            : canonicalLink;
          const deckId = ankiId ? `ext-${ankiId}` : `ext-${href.split('/').pop()}`;
          const deckData = {
            id: deckId,
            anki_id: ankiId,
            title,
            anki_link: canonicalLink,
            download_url: downloadLink,
            ranking,
            total_cards,
            description: `Intelligence discovery for ${query}. This asset has been indexed live from the global AnkiWeb vault.`,
            tags: [query, 'global-vault'],
            author: 'AnkiWeb Contributor',
            last_sync_at: new Date().toISOString(),
          };

          results.push({ ...deckData, is_external: true });
          dbUpserts.push(deckData);
        }
      }
    });

    // Organic Intelligence Ingestion: Persist results to DB for future local discovery
    if (dbUpserts.length > 0) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const client = serviceRoleKey
        ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
        : supabase;

      for (const deck of dbUpserts) {
        try {
          let existingId: string | null = null;
          if (deck.anki_id) {
            const { data: existingById } = await client
              .from('decks')
              .select('id')
              .eq('anki_id', deck.anki_id)
              .maybeSingle();
            if (existingById) {
              existingId = existingById.id;
            }
          }

          const updateData = {
            title: deck.title,
            anki_link: deck.anki_link,
            download_url: deck.download_url,
            ranking: deck.ranking,
            total_cards: deck.total_cards,
            description: deck.description,
            tags: deck.tags,
            author: deck.author,
            last_sync_at: new Date().toISOString()
          };

          if (existingId) {
            // Update by id
            await client.from('decks').update(updateData).eq('id', existingId);
          } else {
            // Fallback check by title
            const { data: existingByTitle } = await client
              .from('decks')
              .select('id')
              .eq('title', deck.title)
              .maybeSingle();

            if (existingByTitle) {
              // Update by title (linking the newly found anki_id)
              await client
                .from('decks')
                .update({
                  anki_id: deck.anki_id,
                  ...updateData
                })
                .eq('id', existingByTitle.id);
            } else {
              // Insert new discovery
              const deckInsertData = { ...deck };
              delete (deckInsertData as Record<string, unknown>).id;
              await client.from('decks').insert({
                ...deckInsertData,
                last_sync_at: new Date().toISOString()
              });
            }
          }
        } catch (err) {
          console.error(`Error processing deck ingestion in proxy: ${deck.title}`, err);
        }
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
