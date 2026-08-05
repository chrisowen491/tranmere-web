export const PLAYER_POSITIONS = [
  'Goalkeeper',
  'Striker',
  'Winger',
  'Central Defender',
  'Central Midfielder',
  'Full Back'
] as const;

export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];
