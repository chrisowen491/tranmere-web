import {
  Appearance,
  Goal,
  Match,
  Report,
  BreadCrumbItem,
  H2HResult,
  H2HTotal,
  Player,
  Team,
  Manager,
  Link,
  Transfer,
  PlayerSeasonSummary,
  Competition
} from './tranmere-web-types';

export interface View {
  random?: number;
  url?: string;
  title?: string;
  pageType?: string;
  description?: string;
  breadcrumbs?: BreadCrumbItem[];
}

export interface RandomPlayer {
  name: string;
  picLink: string;
  debut: Appearance;
  apps: number;
  goals: number;
}

export interface GalleryImage {
  imagePath?: string;
  linkPath?: string;
  name?: string;
  description?: string;
}

export interface SeasonResultsView extends View {
  opposition: string | null;
  sort: string | null;
  venue: string | null;
  pens: string | null;
  season: string | null;
  teams: Team[];
  competitions: Competition[];
  managers: Manager[];
  seasons: number[];
  results: Match[];
  h2hresults: H2HResult[];
  h2htotal: H2HTotal[];
}

export interface SeasonPlayerStatisticsView extends View {
  filter: string | null;
  sort: string | null;
  season: string | null;
  seasons: number[];
  players: Player[];
}

export interface PlayerView extends View {
  image: string;
  player: Player;
  links: Link[];
  debut: Appearance;
  transfers: Transfer[];
  appearances: Appearance[];
  seasons: PlayerSeasonSummary[];
}

export interface MatchView extends View, Match {
  report?: Report | null;
  goals?: Goal[];
  apps?: Appearance[];
  largeProgramme?: string;
  goalkeepers?: Appearance[];
  fullback1?: Appearance[];
  fullback2?: Appearance[];
  defenders?: Appearance[];
  midfielders?: Appearance[];
  wingers1?: Appearance[];
  wingers2?: Appearance[];
  strikers?: Appearance[];
  formattedGoals?: string;
  hasVenue?: boolean;
  hasAttendance?: boolean;
  defColspan?: number;
  midColspan?: number;
  strColspan?: number;
}
