export const MATCH_EVENT_TYPES = [
  'PenaltySave',
  'PenaltyMiss',
  'OwnGoal'
] as const;

export type MatchEventType = (typeof MATCH_EVENT_TYPES)[number];

export const MATCH_EVENT_TYPE_LABELS: Record<MatchEventType, string> = {
  PenaltySave: 'Penalty save',
  PenaltyMiss: 'Penalty miss',
  OwnGoal: 'Own goal'
};

export const MATCH_EVENT_FANTASY_POINTS: Record<MatchEventType, number> = {
  PenaltySave: 5,
  PenaltyMiss: -2,
  OwnGoal: -2
};

export function matchEventTypeLabel(eventType: string) {
  if (MATCH_EVENT_TYPES.includes(eventType as MatchEventType)) {
    return MATCH_EVENT_TYPE_LABELS[eventType as MatchEventType];
  }
  return eventType.replace(/([a-z])([A-Z])/g, '$1 $2');
}
