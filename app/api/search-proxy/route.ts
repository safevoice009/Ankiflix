import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

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
    const results: any[] = [];

    $('table tr').slice(1, 13).each((_, element) => {
      const cols = $(element).find('td');
      if (cols.length >= 3) {
        const linkTag = cols.eq(0).find('a');
        const title = linkTag.text().trim();
        const href = linkTag.attr('href');
        const ranking = parseFloat(cols.eq(1).text().trim()) || 0;
        const total_cards = parseInt(cols.eq(2).text().trim().replace(',', '')) || 0;

        if (title && href) {
          results.push({
            id: `ankiweb-${href.split('/').pop()}`,
            title,
            anki_link: `https://ankiweb.net${href}`,
            ranking,
            total_cards,
            description: `Global asset identified in the shared vault for: ${query}.`,
            is_external: true
          });
        }
      }
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
