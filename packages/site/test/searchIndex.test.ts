import {
  blogSearchDocument,
  clubSearchDocument,
  normalizeSearchTitle,
  playerSearchDocument,
  seasonSearchDocument,
  staticPageSearchDocument,
} from "@tranmere-web/lib/src/search-index";
import { querySearchDocuments } from "@tranmere-web/lib/src/d1-queries";
import { describe, expect, it, vi } from "vitest";

describe("D1 search index", () => {
  it("normalizes punctuation, spacing and accents for deterministic ranking", () => {
    expect(normalizeSearchTitle("  Tranmère—Rovers  ")).toBe("tranmere rovers");
  });

  it("maps all indexed entities to local archive links", () => {
    expect(
      playerSearchDocument({
        id: "player-1",
        name: "Steve Mungall",
        pic_link: "/builder/avatar",
      }),
    ).toMatchObject({
      objectId: "player:player-1",
      href: "/page/player/Steve%20Mungall",
      description: "Player Profile",
    });
    expect(
      clubSearchDocument({
        id: "club-1",
        name: "AFC Bournemouth",
        short_name: "Bournemouth",
        three_letter_name: "BOU",
        nicknames: "The Cherries",
      }),
    ).toMatchObject({
      objectId: "club:club-1",
      aliases: "Bournemouth BOU The Cherries",
      href: "/opponents/AFC%20Bournemouth",
    });
    expect(seasonSearchDocument({ season: 1996 })).toMatchObject({
      objectId: "season:1996",
      title: "1996-97 Season",
      href: "/season/1996",
    });
    expect(
      blogSearchDocument({
        id: "article-1",
        title: "A night at Wembley",
        slug: "a-night-at-wembley",
        description: "Remembering a famous Rovers final",
      }),
    ).toMatchObject({
      objectId: "blog:article-1",
      href: "/page/blog/a-night-at-wembley",
      description: "Archive Article",
    });
    expect(
      staticPageSearchDocument({
        id: "managers",
        title: "Managers",
        description: "Explore every Tranmere Rovers manager",
        href: "/managers",
      }),
    ).toMatchObject({
      objectId: "page:managers",
      href: "/managers",
    });
  });

  it("uses a bounded FTS prefix query with exact-title ranking", async () => {
    const statement = {
      bind: vi.fn().mockReturnThis(),
      all: vi.fn().mockResolvedValue({ results: [] }),
      first: vi.fn(),
    };
    const db = {
      prepare: vi.fn().mockReturnValue(statement),
    } as unknown as D1Database;

    await querySearchDocuments(db, "Pat Nev", { limit: 50 });

    expect(statement.bind).toHaveBeenCalledWith(
      '"pat"* AND "nev"*',
      "pat nev",
      "pat nev%",
      10,
    );
    expect(db.prepare).toHaveBeenCalledWith(
      expect.stringContaining("SearchDocumentsFts MATCH ?"),
    );
  });
});
