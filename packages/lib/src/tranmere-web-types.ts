/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TavilyResponse {
  answer: string;
  results: TavilyResult[];
}

export interface TavilyResult {
  title: string;
  url: string;
}

export interface BaseView {
  name: string;
  objectID?: string;
  link?: string;
  picLink?: string;
  description?: string;
  meta?: string;
}

export interface BaseEntity {
  name: string;
  objectID?: string;
  link?: string;
  picLink?: string;
  description?: string;
  meta?: string;
}

export interface Player extends BaseEntity {
  id?: string;
  biography?: string;
  foot?: string;
  links?: string;
  pic?: string;
  position?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
}

export interface Manager {
  name: string;
  dateJoined: string;
  dateLeft: string;
  dateLeftText?: string;
}

export type Team = BaseEntity;

export type Competition = BaseEntity;

export interface Season {
  verbose?: boolean;
}

export interface ImageEdits {
  resize?: ImageResize;
}

export interface ImageResize {
  width: number;
  height?: number;
  fit: string;
}

export interface SiteMapEntry {
  url: string;
  date: string;
  priority: number;
  changes: string;
}

export interface Image {
  bucket: string;
  key: string;
  edits?: ImageEdits;
}

export interface HatTrick {
  Date: string;
  Player: string;
  Opposition: string;
  Goals: number;
  Season: number;
}

export interface Link {
  id: string;
  link: string;
  name: string;
  description: string;
}

export interface Report {
  day: string;
  report: string;
}

export interface MatchEvent {
  time: string;
  eventType?: string;
  description: string;
}

export interface Match {
  scrape_id?: string;
  id?: string;
  date: string;
  competition?: string;
  programme?: string;
  youtube?: string;
  pens?: string;
  home?: string;
  visitor?: string;
  opposition?: string;
  venue?: string;
  static?: string;
  season?: string;
  hgoal?: string;
  vgoal?: string;
  ft?: string;
  day?: string;
  attendance?: number;
  referee?: string;
  formation?: string;
  largeProgramme?: string;
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
  Minute?: string;
  Opposition: string;
  Scorer: string;
  Assist?: string;
  AssistType?: string;
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
  SubbedBy: string | null | undefined;
  SubTime: string | null | undefined;
  YellowCard: string | null | undefined;
  RedCard: string | null | undefined;
  SubYellow: string | null | undefined;
  SubRed: string | null | undefined;
  bio?: Player;
  Type?: string;
  Goals?: number;
}

export interface Transfer {
  id: string;
  name: string;
  season: number;
  from: string;
  to: string;
  value: string;
  cost: number;
  type?: string;
  club?: string;
}

export interface BasePageView {
  random?: number;
  title?: string;
  pageType?: string;
  description?: string;
}

export interface TagView extends BasePageView {
  items?: any;
  url?: string;
}

// ToDo
export interface PlayerView extends BasePageView {
  title?: string;
  pageType?: string;
  description?: string;
  name?: string;
  debut?: any;
  seasons?: any;
  transfers?: any;
  links?: any;
  teams?: Team[];
  player?: any;
  url?: string;
  image?: string;
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
  bio?: Player;
  picLink?: any;
}
