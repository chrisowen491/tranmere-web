export const MATCH_COMPETITIONS = [
  'League',
  'Conference',
  'Anglo Italian Cup',
  'Associate Members Cup',
  'FA Cup',
  'FA Trophy',
  'FL Trophy',
  'Freight Rover Trophy',
  'Friendly',
  'Johnstones Paint Trophy',
  'LDV Trophy',
  'League Cup',
  'Leyland Daf Trophy',
  'Play Offs',
  'Sherpa Van Trophy',
  'Zenith Data Systems Trophy'
] as const;

export type MatchCompetition = (typeof MATCH_COMPETITIONS)[number];
