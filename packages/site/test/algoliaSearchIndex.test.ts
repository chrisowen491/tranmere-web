import {
  clubSearchRecord,
  playerSearchRecord,
  seasonSearchRecord,
  uploadAlgoliaSearchRecords,
} from "@tranmere-web/lib/src/algolia-search-index";
import { describe, expect, it, vi } from "vitest";

describe("Algolia search records", () => {
  it("maps players and URL-encodes their profile name", () => {
    expect(
      playerSearchRecord({
        id: "player-1",
        name: "Steve Mungall",
        pic_link: "/builder/avatar",
      }),
    ).toEqual({
      link: "https://www.tranmere-web.com/page/player/Steve%20Mungall",
      name: "Steve Mungall",
      description: "Player Profile",
      picLink: "/builder/avatar",
      objectID: "player-1",
    });
  });

  it("maps clubs and seasons with the archive default image", () => {
    expect(clubSearchRecord({ id: "club/1", name: "AFC Bournemouth" })).toEqual(
      {
        link: "https://www.tranmere-web.com/opponents/AFC%20Bournemouth",
        name: "AFC Bournemouth",
        description: "Club Overview",
        picLink: "/assets/images/square_v1.png",
        objectID: "club/1",
      },
    );
    expect(seasonSearchRecord({ season: 1996 })).toEqual({
      link: "https://www.tranmere-web.com/season/1996",
      name: "1996-97 Season",
      description: "Season Overview",
      picLink: "/assets/images/square_v1.png",
      objectID: "1996",
    });
  });

  it("PUTs each record to its encoded object endpoint with Algolia headers", async () => {
    const fetcher = vi.fn(async () => new Response("{}", { status: 200 }));
    const record = clubSearchRecord({ id: "club/1", name: "Test Club" });

    await expect(
      uploadAlgoliaSearchRecords([record], {
        applicationId: "DZJXSVOWI3",
        apiKey: "secret",
        indexName: "TranmereWeb",
        fetcher,
      }),
    ).resolves.toEqual({ uploaded: 1, failed: 0 });

    expect(fetcher).toHaveBeenCalledWith(
      "https://DZJXSVOWI3.algolia.net/1/indexes/TranmereWeb/club%2F1",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Algolia-Application-Id": "DZJXSVOWI3",
          "X-Algolia-API-Key": "secret",
        },
        body: JSON.stringify(record),
      },
    );
  });

  it("fails the sync when Algolia rejects any record", async () => {
    const fetcher = vi.fn(
      async () => new Response("invalid key", { status: 403 }),
    );

    await expect(
      uploadAlgoliaSearchRecords([seasonSearchRecord({ season: 2026 })], {
        applicationId: "DZJXSVOWI3",
        apiKey: "bad-secret",
        indexName: "TranmereWeb",
        fetcher,
      }),
    ).rejects.toThrow("Failed to upload 1 of 1 Algolia search records.");
  });
});
