export type ComparisonMetric = "appearances" | "goals";
export type Direction = "higher" | "lower";

export type ComparisonPlayer = {
  name: string;
  image: string;
  appearances: number;
  goals: number;
};

export type ComparisonRound = {
  metric: ComparisonMetric;
  baseline: ComparisonPlayer;
  challenger: ComparisonPlayer;
};

export const dailyRoundCount = 10;

function hash(value: string) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function shuffle<T>(items: T[], seed: number) {
  const copy = [...items];
  let state = seed;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const other = state % (index + 1);
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

export function answerForRound(round: ComparisonRound): Direction {
  return round.challenger[round.metric] > round.baseline[round.metric]
    ? "higher"
    : "lower";
}

export function buildDailyComparisons(
  players: ComparisonPlayer[],
  date: string,
): ComparisonRound[] {
  const unique = [
    ...new Map(players.map((player) => [player.name, player])).values(),
  ];
  const metrics = shuffle(
    Array.from({ length: dailyRoundCount }, (_, index) =>
      index % 2 === 0 ? "appearances" : "goals",
    ) as ComparisonMetric[],
    hash(`${date}:metrics`),
  );
  const directions = shuffle(
    Array.from({ length: dailyRoundCount }, (_, index) =>
      index % 2 === 0 ? "higher" : "lower",
    ) as Direction[],
    hash(`${date}:directions`),
  );
  const used = new Set<string>();
  const rounds: ComparisonRound[] = [];

  for (const [index, metric] of metrics.entries()) {
    const pool = unique.filter(
      (player) =>
        player.image &&
        player.appearances >= 10 &&
        (metric === "appearances" || player.goals >= 2) &&
        !used.has(player.name),
    );
    const desired = directions[index];
    const candidates = shuffle(pool, hash(`${date}:${index}:baseline`));
    let pair: [ComparisonPlayer, ComparisonPlayer] | undefined;

    for (const baseline of candidates) {
      const challengers = shuffle(
        pool.filter((player) => {
          if (player.name === baseline.name) return false;
          const value = player[metric];
          const reference = baseline[metric];
          return desired === "higher" ? value > reference : value < reference;
        }),
        hash(`${date}:${index}:${baseline.name}`),
      );
      const challenger =
        challengers.find(
          (player) =>
            Math.max(player[metric], baseline[metric]) /
              Math.min(player[metric], baseline[metric]) <=
            3,
        ) ?? challengers[0];
      if (challenger) {
        pair = [baseline, challenger];
        break;
      }
    }

    if (!pair) break;
    const [baseline, challenger] = pair;
    rounds.push({ metric, baseline, challenger });
    used.add(baseline.name);
    used.add(challenger.name);
  }

  return rounds;
}

export function scoreAnswers(rounds: ComparisonRound[], answers: Direction[]) {
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  for (const [index, answer] of answers.entries()) {
    if (!rounds[index]) break;
    if (answer === answerForRound(rounds[index])) {
      score += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }
  return { score, streak, bestStreak };
}
