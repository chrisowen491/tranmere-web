import { expect, it } from "vitest";
import { dailyTimeline, timelineScore } from "../lib/timeMachine";

const events = [
  "Manager appointment",
  "Match shirt",
  "Player debut",
  "Programme cover",
  "Cup tie",
].map((kind, i) => ({
  kind,
  title: kind,
  date: `199${i}-02-01`,
  base: "/",
  target: kind,
  image: kind === "Match shirt" ? "/archive/home-shirt.jpg" : null,
}));

it("builds a repeatable unsolved puzzle with five distinct dates", () => {
  const day = "2026-11-19";
  const deck = dailyTimeline(
    [...events, { ...events[2], date: events[0].date }],
    day,
  );
  expect(new Set(deck.map((e) => e.date)).size).toBe(5);
  expect(timelineScore(deck)).toBeLessThan(10);
  expect(
    dailyTimeline([...events, { ...events[2], date: events[0].date }], day),
  ).toEqual(deck);
  expect(dailyTimeline(events.slice(1), day)).toEqual([]);
});

it("awards one point per correctly ordered pair", () => {
  expect(timelineScore(events)).toBe(10);
  expect(timelineScore([events[1], events[0], ...events.slice(2)])).toBe(9);
  expect(timelineScore([...events].reverse())).toBe(0);
});
