export const GOAL_TYPES = [
  'Penalty',
  'FreeKick',
  'Shot',
  'Header',
  'Body'
] as const;

export type GoalType = (typeof GOAL_TYPES)[number];

export const ASSIST_TYPES = [
  'Pass',
  'Cross',
  'Set piece',
  'Rebound',
  'Corner',
  'Header',
  'Long Throw',
  'Free Kick'
] as const;

export const GOAL_FEET = ['Left', 'Right', 'Head', 'Body'] as const;

export const CROSS_SIDES = ['Left', 'Right'] as const;

export const GOAL_DISTANCES = ['6YardBox', '18YardBox', 'LongRange'] as const;

export type GoalDistance = (typeof GOAL_DISTANCES)[number];

export const GOAL_DISTANCE_LABELS: Record<GoalDistance, string> = {
  '6YardBox': 'Six-yard box',
  '18YardBox': '18-yard box',
  LongRange: 'Long range'
};
