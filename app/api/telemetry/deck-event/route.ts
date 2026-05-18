import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type EventType = "open_ankiweb" | "download_ankiweb" | "search_open_ankiweb";

interface DeckEventPayload {
  deckId: string;
  eventType: EventType;
  query?: string;
  ankiId?: string | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DeckEventPayload;

    if (!body?.deckId || !body?.eventType) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ error: "Server telemetry not configured" }, { status: 503 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await admin.from("deck_events").insert({
      deck_id: body.deckId,
      event_type: body.eventType,
      query: body.query ?? null,
      anki_id: body.ankiId ?? null,
    });

    if (error) {
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
