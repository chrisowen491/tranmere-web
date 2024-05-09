/* eslint-disable @typescript-eslint/no-explicit-any */

import { IPageMetaDataFields } from './contentful';

interface CloudflareEnv {
  API_DOMAIN: string;
  API_PROTOCOL: string;
  API_PORT: string;
  API_KEY: string;
}

export interface BreadCrumbItem {
  link?: BreadCrumbLink[];
  active?: BreadCrumb[];
}

export interface BreadCrumb {
  position: number;
  title: string;
}

export interface BreadCrumbLink extends BreadCrumb {
  link: string;
}

export interface TavilyResponse {
  answer: string;
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
}

export interface Manager {
  name: string;
  dateJoined: number;
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

export interface Page extends IPageMetaDataFields {
  name: string;
  description: string;

  content?: string;
  blogs: any;
  sectionHTML?: string;
  blockHTML?: string;
  cardBlocksHTML?: string;

  dd_app?: string;
  dd_version?: string;
  image?: string;
  topScorers: Player[];
  hatTricks: HatTrick[];
  managers: Manager[];
  players: Player[];
  teams: Team[];
  competitions: Competition[];
  seasons: number[];
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

export interface MatchView extends Match {
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
  random?: number;
  url?: string;
  title?: string;
  pageType?: string;
  description?: string;
  report?: Report | null;
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

export interface HomeView extends BasePageView {
  blogs?: Entry<IBlogPost>[];
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
  blogs?: Entry<IBlogPost>[];
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

// ToDo
export interface BlogView extends BasePageView {
  title?: string;
  pageType?: string;
  description?: string;
  blogs?: Entry<IBlogPost>[];
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
