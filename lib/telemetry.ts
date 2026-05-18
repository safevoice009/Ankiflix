interface DeckEventInput {
  deckId: string;
  eventType: "open_ankiweb" | "download_ankiweb" | "search_open_ankiweb";
  query?: string;
  ankiId?: string | null;
}

export async function trackDeckEvent(input: DeckEventInput): Promise<void> {
  try {
    await fetch("/api/telemetry/deck-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Non-blocking telemetry
  }
}
