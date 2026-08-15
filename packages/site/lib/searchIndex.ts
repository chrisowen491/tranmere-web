import type { ClubRecord } from "@/lib/clubs";
import type { PlayerRecord } from "@/lib/players";
import {
  clubSearchDocument,
  playerSearchDocument,
  searchDocumentValues,
  upsertSearchDocumentSql,
} from "@tranmere-web/lib/src/search-index";

export async function upsertPlayerSearchEntry(
  db: D1Database,
  player: PlayerRecord,
) {
  const document = playerSearchDocument({
    id: player.id,
    name: player.name,
    pic_link: player.picLink,
  });
  await db
    .prepare(upsertSearchDocumentSql)
    .bind(...searchDocumentValues(document, "admin"))
    .run();
}

export async function upsertClubSearchEntry(db: D1Database, club: ClubRecord) {
  const document = clubSearchDocument({
    id: club.id,
    name: club.name,
    short_name: club.shortName,
    three_letter_name: club.threeLetterName,
    nicknames: club.nicknames,
  });
  await db
    .prepare(upsertSearchDocumentSql)
    .bind(...searchDocumentValues(document, "admin"))
    .run();
}
