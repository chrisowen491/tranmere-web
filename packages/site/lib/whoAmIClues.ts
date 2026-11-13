export type WhoAmIClue = {
  label: string;
  text: string;
};

type CluePlayer = {
  name: string;
  position: string;
  firstSeason?: string;
  lastSeason?: string;
  appearances: number;
  goals: number;
  debutDate?: string;
  debutOpposition?: string;
  biographyMarkdown?: string | null;
};

function hash(value: string) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function shuffle<T>(items: T[], seed: number) {
  const shuffled = [...items];
  let state = seed;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

function careerLabel(player: CluePlayer) {
  if (!player.firstSeason) return "Career dates are not recorded";
  if (!player.lastSeason || player.firstSeason === player.lastSeason) {
    return `Appeared during the ${player.firstSeason}–${String(Number(player.firstSeason) + 1).slice(-2)} season`;
  }
  return `Rovers career spans ${player.firstSeason}–${String(Number(player.lastSeason) + 1).slice(-2)}`;
}

function namePattern(name: string) {
  const words = name.split(/\s+/);
  return `${words.length} word${words.length === 1 ? "" : "s"}, ${name.replace(/\s/g, "").length} letters · initials ${words.map((word) => word[0]).join("")}`;
}

function formatDebutDate(date?: string) {
  if (!date) return "";
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function biographyClues(
  markdown: string | null | undefined,
  name: string,
) {
  if (!markdown) return [];
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_`~>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const nameParts = name.toLocaleLowerCase("en-GB").split(/[\s-]+/);
  return plainText
    .split(/(?<=[.!?])\s+(?=[A-Z“])/)
    .map((sentence) => sentence.trim())
    .filter(
      (sentence) =>
        sentence.length >= 45 &&
        sentence.length <= 230 &&
        !nameParts.some((part) =>
          sentence.toLocaleLowerCase("en-GB").includes(part),
        ) &&
        !/\b(currently|current club|now plays|contract expires|as of|upcoming)\b/i.test(
          sentence,
        ),
    )
    .slice(0, 12);
}

export function buildWhoAmIClues(player: CluePlayer, date: string) {
  const seed = hash(`${date}:${player.name}`);
  const archive: WhoAmIClue[] = [
    { label: "Position", text: `Primary position: ${player.position}` },
    { label: "Career", text: careerLabel(player) },
    {
      label: "Record",
      text:
        player.appearances > 0
          ? `${player.appearances} recorded appearances and ${player.goals} goals`
          : "This player is represented in the avatar archive",
    },
    {
      label: "Debut",
      text: player.debutOpposition
        ? `Debut: ${formatDebutDate(player.debutDate)} against ${player.debutOpposition}`
        : `The name begins with “${player.name.charAt(0)}”`,
    },
  ];
  const biography = shuffle(
    biographyClues(player.biographyMarkdown, player.name).map((text) => ({
      label: "From the biography",
      text,
    })),
    seed,
  );
  const candidates = biography.length
    ? [
        biography[0],
        ...shuffle([...archive, ...biography.slice(1, 2)], seed ^ 0x9e3779b9),
      ]
    : shuffle(archive, seed);
  return [
    ...shuffle(candidates.slice(0, 4), seed ^ 0x85ebca6b),
    { label: "Name pattern", text: namePattern(player.name) },
  ];
}
