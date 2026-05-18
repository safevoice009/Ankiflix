import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12"

const ANKIWEB_URL = "https://ankiweb.net/shared/decks"

serve(async (req) => {
  const { category_id, search_term } = await req.json()

  if (!category_id || !search_term) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 })
  }

  try {
    const response = await fetch(`${ANKIWEB_URL}?search=${encodeURIComponent(search_term)}`)
    const html = await response.text()
    const $ = cheerio.load(html)

    const decks: any[] = []

    // Example selector based on AnkiWeb structure
    // Note: This might need adjustment as AnkiWeb changes
    $("table tr").each((i, el) => {
      if (i === 0) return // Skip header
      
      const titleEl = $(el).find("a")
      const title = titleEl.text().trim()
      const href = titleEl.attr("href")
      
      const rating = parseFloat($(el).find("td").eq(1).text()) || 0
      const cards = parseInt($(el).find("td").eq(2).text().replace(/,/g, "")) || 0

      if (title && href) {
        const hrefParts = href.trim().replace(/^\/|\/$/g, '').split('/')
        const ankiId = hrefParts.length > 0 ? hrefParts[hrefParts.length - 1] : null
        const isDigit = ankiId && /^\d+$/.test(ankiId)

        const canonicalLink = isDigit
          ? `https://ankiweb.net/shared/info/${ankiId}`
          : `https://ankiweb.net${href}`
        const downloadLink = isDigit
          ? `https://ankiweb.net/shared/download/${ankiId}`
          : canonicalLink

        decks.push({
          anki_id: ankiId,
          title,
          anki_link: canonicalLink,
          download_url: downloadLink,
          category_id,
          ranking: rating,
          total_cards: cards,
          description: `Popular deck found on AnkiWeb for ${search_term}.`,
          thumbnail_url: `https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1000` // Placeholder
        })
      }
    })

    // Initialize Supabase Client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Programmatic anki_id-first then title-second deduplication
    let count = 0
    for (const deck of decks) {
      try {
        let existingId: string | null = null
        if (deck.anki_id) {
          const { data: existingById } = await supabase
            .from("decks")
            .select("id")
            .eq("anki_id", deck.anki_id)
            .maybeSingle()
          if (existingById) {
            existingId = existingById.id
          }
        }

        if (existingId) {
          // Update by id
          await supabase
            .from("decks")
            .update({
              title: deck.title,
              anki_link: deck.anki_link,
              download_url: deck.download_url,
              category_id: deck.category_id,
              ranking: deck.ranking,
              total_cards: deck.total_cards,
              description: deck.description,
              thumbnail_url: deck.thumbnail_url,
              last_sync_at: new Date().toISOString()
            })
            .eq("id", existingId)
        } else {
          // Fallback check by title
          const { data: existingByTitle } = await supabase
            .from("decks")
            .select("id")
            .eq("title", deck.title)
            .maybeSingle()

          if (existingByTitle) {
            // Update by title (linking the newly found anki_id)
            await supabase
              .from("decks")
              .update({
                anki_id: deck.anki_id,
                anki_link: deck.anki_link,
                download_url: deck.download_url,
                category_id: deck.category_id,
                ranking: deck.ranking,
                total_cards: deck.total_cards,
                description: deck.description,
                thumbnail_url: deck.thumbnail_url,
                last_sync_at: new Date().toISOString()
              })
              .eq("id", existingByTitle.id)
          } else {
            // Insert new discovery
            await supabase
              .from("decks")
              .insert({
                anki_id: deck.anki_id,
                title: deck.title,
                anki_link: deck.anki_link,
                download_url: deck.download_url,
                category_id: deck.category_id,
                ranking: deck.ranking,
                total_cards: deck.total_cards,
                description: deck.description,
                thumbnail_url: deck.thumbnail_url,
                author: "AnkiWeb Global Community",
                tags: [search_term],
                last_sync_at: new Date().toISOString()
              })
          }
        }
        count++
      } catch (err) {
        console.error(`Error processing deck ${deck.title}:`, err)
      }
    }

    return new Response(JSON.stringify({ message: `Successfully scraped ${decks.length} decks`, count }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

