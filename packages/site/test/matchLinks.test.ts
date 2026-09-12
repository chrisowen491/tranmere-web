import { describe, expect, it } from "vitest";
import { youtubeVideoId, youtubeVideoStart } from "@/lib/matchLinks";

describe("youtubeVideoId", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?t=42",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://youtube.com/shorts/dQw4w9WgXcQ",
    "https://m.youtube.com/live/dQw4w9WgXcQ",
  ])("extracts a video ID from %s", (url) => {
    expect(youtubeVideoId(url)).toBe("dQw4w9WgXcQ");
  });

  it.each([
    "https://www.youtube.com/@tranmererovers",
    "https://example.com/watch?v=dQw4w9WgXcQ",
    "not a url",
  ])("does not treat %s as an embeddable video", (url) => {
    expect(youtubeVideoId(url)).toBeNull();
  });
});

describe("youtubeVideoStart", () => {
  it.each([
    ["https://youtu.be/dQw4w9WgXcQ?t=90", 90],
    ["https://youtu.be/dQw4w9WgXcQ?t=90s", 90],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s", 90],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ?start=3661", 3661],
    ["https://youtu.be/dQw4w9WgXcQ#t=2m5s", 125],
  ])("preserves the start time in %s", (url, seconds) => {
    expect(youtubeVideoStart(url)).toBe(seconds);
  });

  it("defaults to the beginning when there is no valid time", () => {
    expect(youtubeVideoStart("https://youtu.be/dQw4w9WgXcQ?t=soon")).toBe(0);
  });
});
