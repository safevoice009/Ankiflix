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
        decks.push({
          title,
          anki_link: `https://ankiweb.net${href}`,
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

    // Upsert decks
    const { data, error } = await supabase
      .from("decks")
      .upsert(decks, { onConflict: "title" })

    if (error) throw error

    return new Response(JSON.stringify({ message: `Successfully scraped ${decks.length} decks`, count: decks.length }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
