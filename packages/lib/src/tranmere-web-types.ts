import type { ManagerFormation } from './manager-constants';
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseEntity {
  name: string;
}

export interface Player extends BaseEntity {
  id?: string;
  picLink?: string;
  foot?: string;
  position?: string;
  secondaryPosition?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  height?: string;
}

export interface Manager {
  name: string;
  dateJoined: string;
  dateLeft: string;
  dateLeftText?: string;
  imagePath?: string;
  favouriteFormation?: ManagerFormation;
}

export type Competition = BaseEntity;

export type Team = BaseEntity;

export interface Report {
  day: string;
  report: string;
}

export interface Match {
  id?: string;
  date: string;
  division?: string;
  competition?: string;
  programme?: string;
  noProgrammeIssued?: boolean;
  ticket?: string;
  youtube?: string;
  pens?: string;
  afterExtraTime?: boolean;
  home?: string;
  visitor?: string;
  opposition?: string;
  venue?: string;
  season: string;
  hgoal: number;
  vgoal: number;
  ft?: string;
  day?: string;
  attendance?: number | null;
  referee?: string;
  formation?: string;
  kit?: string;
  largeProgramme?: string;
  largeTicket?: string;
  round?: number;
  tier: number;
  location?: 'H' | 'A' | 'N';
  goals?: Goal[];
  apps?: Appearance[];
}

export interface H2HResult {
  venue: string;
  pld: number;
  wins: number;
  draws: number;
  lost: number;
  for: number;
  against: number;
  diff: number;
}

export interface H2HTotal {
  venue: string;
  pld: number;
  wins: number;
  draws: number;
  lost: number;
  for: number;
  against: number;
  diff: number;
}

export interface Goal {
  id?: string;
  Date: string;
  GoalType?: string;
  Foot?: string;
  Minute?: string;
  Opposition: string;
  Scorer: string;
  Assist?: string;
  AssistType?: string;
  Distance?: import('./goal-constants').GoalDistance;
  Season?: string;
}

export interface Appearance {
  id: string;
  Date: string;
  Opposition: string;
  Competition: string;
  Season: string;
  Name: string;
  Number: string | null | undefined;
  SubbedBy?: string | null | undefined;
  SubSubbedBy?: string | null | undefined;
  SubTime?: string | null | undefined;
  YellowCard?: string | null | undefined;
  RedCard?: string | null | undefined;
  SubYellow?: string | null | undefined;
  SubRed?: string | null | undefined;
  bio?: Player;
  Type?: string;
  Goals?: number;
}

export interface Transfer {
  id: string;
  name: string;
  season: number;
  date?: string;
  from: string;
  to: string;
  value: string;
  cost: number;
  type?: string;
  club?: string;
}

export interface PlayerSeasonSummary {
  Season: string;
  Player: string;
  Apps: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
  penalties: number;
  headers: number;
  starts: number;
  subs: number;
  freekicks: number;
  goalsPerGame?: number;
}

export interface MatchPageData extends Match {
  report?: Report | null;
  formattedGoals?: string;
  substitutes?: string[];
  score?: string;
  homeTeam?: string;
  awayTeam?: string;
}
