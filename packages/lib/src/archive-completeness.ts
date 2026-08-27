import type { ArchiveCompletenessCategory } from './d1-types';

export interface ArchiveCompletenessCategoryDefinition {
  key: ArchiveCompletenessCategory;
  label: string;
  shortLabel: string;
  description: string;
  entity: 'match' | 'goal' | 'player';
}

export const ARCHIVE_COMPLETENESS_CATEGORIES = [
  {
    key: 'lineups',
    label: 'Line-ups and substitutes',
    shortLabel: 'Teams',
    description: 'Matches with at least eleven recorded Rovers starters.',
    entity: 'match'
  },
  {
    key: 'goals',
    label: 'Goals recorded',
    shortLabel: 'Goals',
    description: 'Matches where every Rovers goal has a scorer record.',
    entity: 'match'
  },
  {
    key: 'goal-details',
    label: 'Detailed goal data',
    shortLabel: 'Goal detail',
    description: 'Goals with a recorded goal type.',
    entity: 'goal'
  },
  {
    key: 'attendances',
    label: 'Attendances',
    shortLabel: 'Gates',
    description: 'Matches with a recorded crowd figure.',
    entity: 'match'
  },
  {
    key: 'formations',
    label: 'Formations',
    shortLabel: 'Shapes',
    description: 'Matches with a recorded Rovers formation.',
    entity: 'match'
  },
  {
    key: 'programmes',
    label: 'Programme records',
    shortLabel: 'Programmes',
    description:
      'Matches with programme artwork or confirmed as having no issue.',
    entity: 'match'
  },
  {
    key: 'player-profiles',
    label: 'Player biographies',
    shortLabel: 'Profiles',
    description:
      'Season players with a biography in the Tranmere-Web database.',
    entity: 'player'
  },
  {
    key: 'kits',
    label: 'Kit assignments',
    shortLabel: 'Kits',
    description: 'Matches linked to the kit worn by Rovers.',
    entity: 'match'
  },
  {
    key: 'match-reports',
    label: 'Match reports',
    shortLabel: 'Reports',
    description: 'Matches with a written report in the archive.',
    entity: 'match'
  },
  {
    key: 'highlights',
    label: 'Match highlights',
    shortLabel: 'Highlights',
    description: 'Matches with at least one highlights video or external link.',
    entity: 'match'
  }
] as const satisfies readonly ArchiveCompletenessCategoryDefinition[];

export function isArchiveCompletenessCategory(
  value: string | undefined
): value is ArchiveCompletenessCategory {
  return ARCHIVE_COMPLETENESS_CATEGORIES.some(
    (category) => category.key === value
  );
}
