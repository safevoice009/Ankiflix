export function extractAnkiId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/shared\/(?:info|download)\/(\d+)/);
  return match?.[1] ?? null;
}

export function buildAnkiInfoUrl(ankiId: string): string {
  return `https://ankiweb.net/shared/info/${ankiId}`;
}

export function buildAnkiDownloadUrl(ankiId: string): string {
  return `https://ankiweb.net/shared/download/${ankiId}`;
}
