import { describe, expect, it } from "vitest";
import {
  createSearchPage,
  readSearchPagination,
  SEARCH_MAX_PAGE_SIZE,
  SEARCH_PAGE_SIZE,
} from "@/lib/searchPagination";

describe("search pagination", () => {
  it("uses a safe default page size and cursor", () => {
    expect(readSearchPagination(new URLSearchParams())).toEqual({
      cursor: 0,
      limit: SEARCH_PAGE_SIZE,
    });
  });

  it("clamps malformed and excessive values", () => {
    expect(
      readSearchPagination(
        new URLSearchParams({ cursor: "-4", limit: "9999" }),
      ),
    ).toEqual({ cursor: 0, limit: SEARCH_MAX_PAGE_SIZE });
    expect(
      readSearchPagination(
        new URLSearchParams({ cursor: "invalid", limit: "0" }),
      ),
    ).toEqual({ cursor: 0, limit: 1 });
  });

  it("returns one extra row as the next cursor without exposing it", () => {
    expect(createSearchPage(["A", "B", "C"], { cursor: 50, limit: 2 })).toEqual(
      {
        rows: ["A", "B"],
        pagination: { cursor: 50, limit: 2, nextCursor: 52 },
      },
    );
  });
});
