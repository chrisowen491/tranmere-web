export const MATCH_LINK_TYPES = [
  "report",
  "highlights",
  "interview",
  "gallery",
  "programme",
  "stats",
  "other",
] as const;
export type MatchLinkType = (typeof MATCH_LINK_TYPES)[number];
export type MatchLinkStatus = "pending" | "approved" | "rejected";

export interface MatchLink {
  id: string;
  season: string;
  matchDate: string;
  label: string;
  url: string;
  linkType: MatchLinkType;
  publisher: string | null;
  publishedAt: string | null;
  sortOrder: number;
}
export interface MatchLinkSuggestion extends MatchLink {
  notes: string | null;
  submittedByName: string;
  submittedByEmail: string | null;
  submittedAt: string;
  status: MatchLinkStatus;
}

export function youtubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let id: string | null = null;
    if (hostname === "youtu.be") id = url.pathname.split("/")[1] ?? null;
    if (hostname === "youtube.com" || hostname.endsWith(".youtube.com")) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else if (/^\/(embed|shorts|live)\//.test(url.pathname))
        id = url.pathname.split("/")[2] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function youtubeTimeInSeconds(value: string | null) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const parts = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!parts) return 0;
  return (
    Number(parts[1] ?? 0) * 3600 +
    Number(parts[2] ?? 0) * 60 +
    Number(parts[3] ?? 0)
  );
}

export function youtubeVideoStart(value: string) {
  try {
    const url = new URL(value);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    return youtubeTimeInSeconds(
      url.searchParams.get("t") ??
        url.searchParams.get("start") ??
        hash.get("t") ??
        hash.get("start"),
    );
  } catch {
    return 0;
  }
}
type Row = Record<string, unknown>;
function type(value: unknown): MatchLinkType {
  return MATCH_LINK_TYPES.includes(value as MatchLinkType)
    ? (value as MatchLinkType)
    : "other";
}
function link(row: Row): MatchLink {
  return {
    id: String(row.id),
    season: String(row.season),
    matchDate: String(row.match_date),
    label: String(row.label),
    url: String(row.url),
    linkType: type(row.link_type),
    publisher: row.publisher as string | null,
    publishedAt: row.published_at as string | null,
    sortOrder: Number(row.sort_order ?? 0),
  };
}
export async function getMatchLinks(
  db: D1Database,
  season: string,
  matchDate: string,
) {
  const result = await db
    .prepare(
      "SELECT * FROM MatchLinks WHERE season = ? AND match_date = ? ORDER BY sort_order, label, id",
    )
    .bind(season, matchDate)
    .all<Row>();
  return result.results.map(link);
}
export async function getMatchLinkSuggestions(
  db: D1Database,
  status: MatchLinkStatus = "pending",
) {
  const result = await db
    .prepare(
      "SELECT * FROM MatchLinkSuggestions WHERE status = ? ORDER BY submitted_at",
    )
    .bind(status)
    .all<Row>();
  return result.results.map((row): MatchLinkSuggestion => ({
    ...link(row),
    notes: row.notes as string | null,
    submittedByName: String(row.submitted_by_name),
    submittedByEmail: row.submitted_by_email as string | null,
    submittedAt: String(row.submitted_at),
    status: row.status as MatchLinkStatus,
  }));
}
