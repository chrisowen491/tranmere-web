import { describe, expect, it } from "vitest";
import { managerArticleTag } from "@/lib/managers";

describe("managerArticleTag", () => {
  it.each([
    ["John King (2nd)", "John King"],
    ["Ray Mathias (Joint)", "Ray Mathias"],
    ["  John King  (2nd)  (Caretaker) ", "John King"],
    ["Micky Mellon", "Micky Mellon"],
  ])("uses the base manager name from %s", (name, expected) => {
    expect(managerArticleTag(name)).toBe(expected);
  });
});
