import { hash, shuffle } from "./dailyShuffle";

export type ArchiveEvent = {
  kind: string;
  title: string;
  date: string;
  base: string;
  target: string;
  image: string | null;
};

const kinds = [
  "Manager appointment",
  "Match shirt",
  "Player debut",
  "Programme cover",
  "Cup tie",
];

export function dailyTimeline(events: ArchiveEvent[], day: string) {
  const cards: ArchiveEvent[] = [];
  for (const kind of kinds) {
    const candidates = events.filter(
      (e) =>
        e.kind === kind &&
        /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
        e.date <= day &&
        !cards.some((c) => c.date === e.date) &&
        (kind !== "Match shirt" || Boolean(e.image)),
    );
    const card = candidates[hash(day + kind) % candidates.length];
    if (!card) return [];
    cards.push(card);
  }
  const puzzle = shuffle(cards, hash(day));
  if (timelineScore(puzzle) === 10) puzzle.reverse();
  return puzzle;
}

export function timelineScore(cards: ArchiveEvent[]) {
  return cards.reduce(
    (sum, card, index) =>
      sum +
      cards.slice(index + 1).filter((later) => later.date > card.date).length,
    0,
  );
}
