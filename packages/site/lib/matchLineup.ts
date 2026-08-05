import type { ManagerFormation } from "@tranmere-web/lib/src/manager-constants";
import type { MatchAppearanceView } from "@/lib/matchPlayers";

type Position =
  | "Goalkeeper"
  | "Full Back"
  | "Central Defender"
  | "Central Midfielder"
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
      { id: "mid-left", position: "Winger" },
      { id: "mid-centre-left", position: "Central Midfielder" },
      { id: "mid-centre-right", position: "Central Midfielder" },
      { id: "mid-right", position: "Winger" },
    ],
    [
      { id: "def-left", position: "Full Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Full Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "433": [
    [
      { id: "forward-left", position: "Winger" },
      { id: "forward-centre", position: "Striker" },
      { id: "forward-right", position: "Winger" },
    ],
    [
      { id: "mid-left", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Central Midfielder" },
    ],
    [
      { id: "def-left", position: "Full Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Full Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "532": [
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
      { id: "def-left", position: "Full Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Full Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-4-2": [
    [
      { id: "st-left", position: "Striker" },
      { id: "st-right", position: "Striker" },
    ],
    [
      { id: "mid-left", position: "Winger" },
      { id: "mid-centre-left", position: "Central Midfielder" },
      { id: "mid-centre-right", position: "Central Midfielder" },
      { id: "mid-right", position: "Winger" },
    ],
    [
      { id: "def-left", position: "Full Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Full Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-3-3": [
    [
      { id: "forward-left", position: "Winger" },
      { id: "forward-centre", position: "Striker" },
      { id: "forward-right", position: "Winger" },
    ],
    [
      { id: "mid-left", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Central Midfielder" },
    ],
    [
      { id: "def-left", position: "Full Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Full Back" },
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
      { id: "def-left", position: "Full Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Full Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "3-4-2-1": [
    [
      { id: "st-centre", position: "Striker" },
    ],
    [
      { id: "att-left", position: "Winger" },
      { id: "att-right", position: "Winger" },
    ],
    [
      { id: "mid-left", position: "Full Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Full Back" },
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
    [
      { id: "att-centre", position: "Winger" },
    ],
    [
      { id: "mid-left", position: "Full Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Full Back" },
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
      { id: "mid-left", position: "Full Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Full Back" },
    ],
    [
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "3-5-1-1": [
    [
      { id: "st-centre", position: "Striker" },
    ],
    [
      { id: "second-striker", position: "Winger" },
    ],    
    [
      { id: "mid-left", position: "Full Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Full Back" },
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
      { id: "mid-left", position: "Full Back" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-right", position: "Full Back" },
    ],
    [
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-2-3-1": [
    [
      { id: "forward-centre", position: "Striker" },
    ],
    [
      { id: "forward-left", position: "Winger" },
      { id: "forward-centre", position: "Winger" },
      { id: "forward-right", position: "Winger" },
    ],
    [
      { id: "mid-centre", position: "Central Midfielder" },
      { id: "mid-centre", position: "Central Midfielder" },
    ],
    [
      { id: "def-left", position: "Full Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Full Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-1-4-1": [
    [
      { id: "forward-centre", position: "Striker" },
    ],
    [
      { id: "mid-left", position: "Winger" },
      { id: "mid-centre-left", position: "Central Midfielder" },
      { id: "mid-centre-right", position: "Central Midfielder" },
      { id: "mid-right", position: "Winger" },
    ],
    [
      { id: "mid-centre", position: "Central Midfielder" },
    ],    
    [
      { id: "def-left", position: "Full Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Full Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],
  "4-4-1-1": [
    [
      { id: "forward-centre", position: "Striker" },
    ],
    [
      { id: "forward-centre", position: "Winger" },
    ],     
    [
      { id: "mid-left", position: "Winger" },
      { id: "mid-centre-left", position: "Central Midfielder" },
      { id: "mid-centre-right", position: "Central Midfielder" },
      { id: "mid-right", position: "Winger" },
    ],   
    [
      { id: "def-left", position: "Full Back" },
      { id: "def-centre-left", position: "Central Defender" },
      { id: "def-centre-right", position: "Central Defender" },
      { id: "def-right", position: "Full Back" },
    ],
    [{ id: "goalkeeper", position: "Goalkeeper" }],
  ],             
};

const fallbackScores: Record<Position, Partial<Record<Position, number>>> = {
  Goalkeeper: {
    Goalkeeper: 100,
    "Central Defender": 25,
    "Full Back": 20,
  },
  "Full Back": {
    "Full Back": 100,
    Winger: 80,
    "Central Defender": 70,
    "Central Midfielder": 60,
    Striker: 20,
  },
  "Central Defender": {
    "Central Defender": 100,
    "Full Back": 80,
    "Central Midfielder": 55,
    Goalkeeper: 45,
    Winger: 25,
    Striker: 20,
  },
  "Central Midfielder": {
    "Central Midfielder": 100,
    Winger: 75,
    "Full Back": 50,
    "Central Defender": 45,
    Striker: 40,
  },
  Winger: {
    Winger: 100,
    Striker: 80,
    "Central Midfielder": 75,
    "Full Back": 60,
    "Central Defender": 25,
  },
  Striker: {
    Striker: 100,
    Winger: 85,
    "Central Midfielder": 55,
    "Full Back": 25,
    "Central Defender": 20,
  },
};

interface PlayerPositions {
  position?: string | null;
  secondaryPosition?: string | null;
}

function suitability(positions: PlayerPositions, slot: FormationSlot) {
  if (positions.position === slot.position) return 1_000_000;
  if (positions.secondaryPosition === slot.position) return 10_000;

  const knownPosition = positions.position || positions.secondaryPosition;
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
  let slotIndex = 0;

  return {
    formation,
    rows: rows
      .map((row) =>
        row
          .map(() => playersBySlot[slotIndex++])
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
