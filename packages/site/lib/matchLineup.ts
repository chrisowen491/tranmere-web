import type { ManagerFormation } from "@tranmere-web/lib/src/manager-constants";
import type { MatchAppearanceView } from "@/lib/matchPlayers";

type Position =
  | "Goalkeeper"
  | "Full Back"
  | "Left Back"
  | "Right Back"
  | "Central Defender"
  | "Central Midfielder"
  | "Left Midfield"
  | "Right Midfield"
  | "Attacking Midfield"
  | "Defensive Midfield"
  | "Winger"
  | "Striker";

interface FormationSlot {
  id: string;
  position: Position;
}

const formations: Record<ManagerFormation, FormationSlot[][]> = {
  "442": [
    [
      { id: "st-left", position: "Striker" },
      { id: "st-right", position: "Striker" },
    ],
    [
      { id: "mid-left", position: "Left Midfield" },
      { id: "mid-centre-left", position: "Central Midfielder" },
      { id: "mid-centre-right", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Midfield" },
    ],
    [
      { id: "def-left", position: "Left Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Right Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-4-2": [
    [
      { id: "st-left", position: "Striker" },
      { id: "st-right", position: "Striker" },
    ],
    [
      { id: "mid-left", position: "Left Midfield" },
      { id: "mid-centre-left", position: "Central Midfielder" },
      { id: "mid-centre-right", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Midfield" },
    ],
    [
      { id: "def-left", position: "Left Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Right Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-3-3": [
    [
      { id: "forward-left", position: "Left Midfield" },
      { id: "forward-centre", position: "Striker" },
      { id: "forward-right", position: "Right Midfield" },
    ],
    [
      { id: "mid-left", position: "Left Midfield" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Midfield" },
    ],
    [
      { id: "def-left", position: "Left Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Right Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "5-3-2": [
    [
      { id: "st-left", position: "Striker" },
      { id: "st-right", position: "Striker" },
    ],
    [
      { id: "mid-left", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Central Midfielder" },
    ],
    [
      { id: "def-left", position: "Left Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Right Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "3-4-2-1": [
    [{ id: "st-centre", position: "Striker" }],
    [
      { id: "att-left", position: "Attacking Midfield" },
      { id: "att-right", position: "Attacking Midfield" },
    ],
    [
      { id: "mid-left", position: "Left Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Back" },
    ],
    [
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "3-4-1-2": [
    [
      { id: "st-left", position: "Striker" },
      { id: "st-right", position: "Striker" },
    ],
    [{ id: "att-centre", position: "Attacking Midfield" }],
    [
      { id: "mid-left", position: "Left Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Back" },
    ],
    [
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "3-4-3": [
    [
      { id: "forward-left", position: "Winger" },
      { id: "forward-centre", position: "Striker" },
      { id: "forward-right", position: "Winger" },
    ],
    [
      { id: "mid-left", position: "Left Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Back" },
    ],
    [
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "3-5-1-1": [
    [{ id: "st-centre", position: "Striker" }],
    [{ id: "second-striker", position: "Attacking Midfield" }],
    [
      { id: "mid-left", position: "Left Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Back" },
    ],
    [
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "3-5-2": [
    [
      { id: "st-left", position: "Striker" },
      { id: "st-right", position: "Striker" },
    ],
    [
      { id: "mid-left", position: "Left Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Back" },
    ],
    [
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-2-3-1": [
    [{ id: "forward-centre", position: "Striker" }],
    [
      { id: "forward-left", position: "Attacking Midfield" },
      { id: "forward-centre", position: "Attacking Midfield" },
      { id: "forward-right", position: "Attacking Midfield" },
    ],
    [
      { id: "mid-centre", position: "Defensive Midfield" },
      { id: "mid-centre", position: "Defensive Midfield" },
    ],
    [
      { id: "def-left", position: "Left Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Right Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-1-4-1": [
    [{ id: "forward-centre", position: "Striker" }],
    [
      { id: "mid-left", position: "Left Midfield" },
      { id: "mid-centre-left", position: "Central Midfielder" },
      { id: "mid-centre-right", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Midfield" },
    ],
    [{ id: "mid-centre", position: "Defensive Midfield" }],
    [
      { id: "def-left", position: "Left Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Right Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-4-1-1": [
    [{ id: "forward-centre", position: "Striker" }],
    [{ id: "att-midfield", position: "Attacking Midfield" }],
    [
      { id: "mid-left", position: "Left Midfield" },
      { id: "mid-centre-left", position: "Central Midfielder" },
      { id: "mid-centre-right", position: "Central Midfielder" },
      { id: "mid-right", position: "Right Midfield" },
    ],
    [
      { id: "def-left", position: "Left Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Right Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
};

const fallbackScores: Record<Position, Partial<Record<Position, number>>> = {
  Goalkeeper: {
    Goalkeeper: 100,
  },
  "Full Back": {
    "Full Back": 100,
    Winger: 80,
    "Central Defender": 70,
    "Central Midfielder": 60,
  },
  "Left Back": {
    "Left Back": 100,
    "Full Back": 80,
  },
  "Right Back": {
    "Right Back": 100,
    "Full Back": 80,
  },
  "Central Defender": {
    "Central Defender": 100,
    "Full Back": 80,
    "Central Midfielder": 55,
  },
  "Central Midfielder": {
    "Central Midfielder": 100,
    "Defensive Midfield": 80,
    "Attacking Midfield": 60,
    Winger: 45,
    "Full Back": 40,
    "Central Defender": 30,
    Striker: 30,
  },
  "Defensive Midfield": {
    "Defensive Midfield": 100,
    "Central Midfielder": 80,
    "Central Defender": 65,
    "Full Back": 40,
    Striker: 40,
    Winger: 40,
  },
  "Left Midfield": {
    "Left Midfield": 100,
    Winger: 80,
    Striker: 60,
    "Left Back": 20,
    "Full Back": 10,
  },
  "Right Midfield": {
    "Right Midfield": 100,
    Winger: 80,
    Striker: 60,
    "Right Back": 20,
    "Full Back": 10,
  },
  Winger: {
    Winger: 100,
    "Right Midfield": 80,
    "Left Midfield": 80,
    Striker: 70,
    "Central Midfielder": 65,
    "Full Back": 40,
  },
  "Attacking Midfield": {
    "Attacking Midfield": 100,
    Winger: 80,
    "Right Midfield": 70,
    "Left Midfield": 70,
    Striker: 60,
    "Central Midfielder": 60,
    "Full Back": 40,
  },
  Striker: {
    Striker: 100,
    Winger: 85,
    "Central Midfielder": 55,
  },
};

interface PlayerPositions {
  position?: string | null;
  secondaryPosition?: string | null;
}

const widePositions = new Set<Position>([
  "Left Midfield",
  "Right Midfield",
  "Winger",
]);
const defensivePositions = new Set<Position>([
  "Central Defender",
  "Left Back",
  "Right Back",
  "Full Back",
]);

function positionsMatch(positions: PlayerPositions, position: Position) {
  return (
    positions.position === position || positions.secondaryPosition === position
  );
}

function suitability(positions: PlayerPositions, slot: FormationSlot) {
  // Primary positions should lead the selection, but not at the expense of
  // putting a defender on the wing when a team has a credible secondary fit.
  // The optimiser scores the whole XI, so primary and secondary matches need
  // to be comparable to the sensible fallback scores below.
  if (positions.position === slot.position) return 100;
  if (positions.secondaryPosition === slot.position) return 90;

  // Only use a defender in a wide attacking or midfield slot as an absolute
  // last resort. This allows a left back with a left-wing secondary position
  // to move forward while the available centre-backs remain in defence.
  if (
    widePositions.has(slot.position) &&
    [positions.position, positions.secondaryPosition].some((position) =>
      defensivePositions.has(position as Position),
    )
  ) {
    return -1_000;
  }

  const knownPosition = positions.position ?? positions.secondaryPosition;
  if (!knownPosition) return slot.position === "Goalkeeper" ? 1 : 30;

  return (
    fallbackScores[slot.position][knownPosition as Position] ??
    (slot.position === "Goalkeeper" ? 1 : 10)
  );
}

interface Assignment<T> {
  score: number;
  playersBySlot: Array<T | undefined>;
}

function correctWideDefenderAssignments<T>(
  playersBySlot: Array<T | undefined>,
  slots: FormationSlot[],
  getPositions: (player: T) => PlayerPositions,
) {
  const corrected = [...playersBySlot];

  slots.forEach((wideSlot, wideSlotIndex) => {
    if (!widePositions.has(wideSlot.position)) return;

    const defender = corrected[wideSlotIndex];
    if (!defender) return;

    const defenderPositions = getPositions(defender);
    const defenderIsOnlyDefensive =
      [defenderPositions.position, defenderPositions.secondaryPosition].some(
        (position) => defensivePositions.has(position as Position),
      ) &&
      ![defenderPositions.position, defenderPositions.secondaryPosition].some(
        (position) => widePositions.has(position as Position),
      );
    if (!defenderIsOnlyDefensive) return;

    const replacementIndex = corrected.findIndex(
      (candidate, candidateIndex) => {
        if (!candidate || candidateIndex === wideSlotIndex) return false;

        const candidatePositions = getPositions(candidate);
        return (
          positionsMatch(candidatePositions, wideSlot.position) &&
          positionsMatch(defenderPositions, slots[candidateIndex].position)
        );
      },
    );

    if (replacementIndex !== -1) {
      [corrected[wideSlotIndex], corrected[replacementIndex]] = [
        corrected[replacementIndex],
        corrected[wideSlotIndex],
      ];
    }
  });

  return corrected;
}

function bestAssignment<T>(
  players: T[],
  slots: FormationSlot[],
  getPositions: (player: T) => PlayerPositions,
  getPriority: (player: T, index: number) => number,
) {
  let states = new Map<number, Assignment<T>>([
    [0, { score: 0, playersBySlot: Array(slots.length).fill(undefined) }],
  ]);

  players.forEach((player, playerIndex) => {
    const next = new Map(states);
    states.forEach((assignment, mask) => {
      slots.forEach((slot, slotIndex) => {
        const bit = 1 << slotIndex;
        if (mask & bit) return;

        const nextMask = mask | bit;
        const candidate: Assignment<T> = {
          score:
            assignment.score +
            suitability(getPositions(player), slot) +
            getPriority(player, playerIndex),
          playersBySlot: [...assignment.playersBySlot],
        };
        candidate.playersBySlot[slotIndex] = player;

        const current = next.get(nextMask);
        if (!current || candidate.score > current.score) {
          next.set(nextMask, candidate);
        }
      });
    });
    states = next;
  });

  return [...states.entries()].sort(
    ([maskA, assignmentA], [maskB, assignmentB]) =>
      assignmentB.playersBySlot.filter(Boolean).length -
        assignmentA.playersBySlot.filter(Boolean).length ||
      assignmentB.score - assignmentA.score ||
      maskB - maskA,
  )[0]?.[1].playersBySlot;
}

export function formationLabel(formation: ManagerFormation) {
  return formation;
}

export function arrangeLineup<T>(
  players: T[],
  requestedFormation?: ManagerFormation,
  getPositions: (player: T) => PlayerPositions = () => ({}),
  getPriority: (player: T, index: number) => number = () => 0,
) {
  const formation = requestedFormation ?? "442";
  const rows = formations[formation];
  const slots = rows.flat();
  const playersBySlot =
    bestAssignment(players, slots, getPositions, getPriority) ?? [];
  const correctedPlayersBySlot = correctWideDefenderAssignments(
    playersBySlot,
    slots,
    getPositions,
  );
  let slotIndex = 0;

  return {
    formation,
    rows: rows
      .map((row) =>
        row
          .map(() => correctedPlayersBySlot[slotIndex++])
          .filter((player): player is T => Boolean(player)),
      )
      .filter((row) => row.length > 0),
  };
}

export function arrangeMatchLineup(
  players: MatchAppearanceView[],
  requestedFormation?: ManagerFormation,
) {
  return arrangeLineup(players, requestedFormation, (player) => player.profile);
}
