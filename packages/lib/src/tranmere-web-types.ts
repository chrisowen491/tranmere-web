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
  biography?: any;
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
  programmePath?: string;
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
  picLink?: string;
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

export interface DBMatch
  extends Omit<
    Match,
    'season' | 'hgoal' | 'vgoal' | 'attendance' | 'round' | 'tier'
  > {
  season?: number | string;
  hgoal?: number | string;
  vgoal?: number | string;
  attendance?: number | string | null;
  round?: number | string;
  tier: number | string;
}

export interface Match {
  id?: string;
  date: string;
  division?: string;
  competition?: string;
  programme?: string;
  ticket?: string;
  youtube?: string;
  pens?: string;
  home?: string;
  visitor?: string;
  opposition?: string;
  venue?: string;
  static?: string;
  season: number;
  hgoal: number;
  vgoal: number;
  ft?: string;
  day?: string;
  attendance?: number | null;
  referee?: string;
  formation?: string;
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
  SubbedBy?: string | null | undefined;
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
  bio?: Player;
  picLink?: any;
  goalsPerGame?: number;
}

export interface FixtureSet {
  eventGroups: EventGroup[];
  sport: string;
  useCatalogue: boolean;
  selectedStartDate: string;
  selectedEndDate: string;
  shouldShowScorersButton: boolean;
  urn: string;
  maximumScoreDigits: number;
}

export interface EventGroup {
  displayLabel?: string;
  secondaryGroups: SecondaryGroup[];
}

export interface SecondaryGroup {
  displayLabel: string;
  events: Event[];
}

export interface Event {
  home: EventTeam;
  away: EventTeam;
  id: string;
  urn: string;
  eventGroupingLabel: string;
  startDateTime: string;
  tournamentId: string;
  date: Date;
  periodLabel: Label;
  time: Time;
  status: string;
  statusComment: Label;
  participants: Participant[];
  headToHeadDetailLabel: string;
  tournament: Tournament;
  stage: Round;
  round: Round;
  winner: string;
  tipoTopicId: string;
  onwardJourneyLink: string;
  accessibleEventSummary: string;
}

export interface EventTeam {
  id: string;
  fullName: string;
  shortName: string;
  urn: string;
  runningScores: RunningScores;
  scoreUnconfirmed: string;
  actions: Action[];
  score: string;
}

export interface RunningScores {
  halftime: string;
  fulltime: string;
}

export interface Action {
  playerUrn: string;
  playerName: string;
  actionType: string;
  actions: ActionType[];
}

export interface ActionType {
  type: string;
  typeLabel: Label;
  timeLabel: Label;
}

export interface Label {
  value: string;
  accessible: string;
}

export interface Date {
  iso: string;
  time: string;
  shortDate: string;
  longDate: string;
  dayOfWeek: string;
  day: string;
  month: string;
  shortMonth: string;
  year: string;
  isoDate: string;
}

export interface Time {
  accessibleTime: string;
  displayTimeUK: string;
  timeCertainty: boolean;
}

export interface Participant {
  id: string;
  urn?: string;
  name: Name;
  score: string;
  halftimeScore: string;
  fulltimeScore: string;
  alignment: string;
}

export interface Name {
  fullName: string;
  shortName: string;
}

export interface Tournament {
  id: string;
  name: string;
  disambiguatedName: string;
  urn: string;
  thingsGuid: string;
}

export interface Round {
  id: string;
  name: string;
  urn: string;
}

export interface TeamLineups {
  homeTeam: LineupTeam;
  awayTeam: LineupTeam;
  useCatalogue: boolean;
  officials: Official[];
}

export interface LineupTeam {
  id: string;
  urn: string;
  name: Name;
  alignment: string;
  formation: Formation;
  manager: Manager;
  players: Players;
}

export interface FullPlayerName {
  short: string;
  first: string;
  last: string;
}

export interface FullName {
  fullName: string;
  shortName: string;
  code: string;
  full: string;
}

export interface Formation {
  layout: string;
  value: string;
  accessible: string;
}

export interface LineupManager {
  id: string;
  name: FullName;
}

export interface Players {
  starters: Starter[];
  substitutes: SubstituteDetails[];
}

export interface Starter {
  urn: string;
  name: FullPlayerName;
  position: string;
  shirtNumber: number;
  formationPlace: string;
  isCaptain: boolean;
  cards: Card[];
  displayName: string;
  substitutes: Substitute[];
  substitutedOff?: SubstitutedOff;
  card?: Card;
}

export interface Card {
  type: 'Yellow Card' | 'Red Card';
  timeLabel: TimeLabel;
}

export interface TimeLabel {
  value: string;
  accessible: string;
}

export interface Substitute {
  playerSubbedOutId: string;
  playerSubbedInId: string;
  playerSubbedInName: string;
  timeLabel: TimeLabel;
}

export interface SubstitutedOff {
  periodId: number;
  timeMin: number;
  timeMinSec: string;
  timestamp: string;
  playerOnUrn: string;
  playerOnName: string;
  reason: string;
}

export interface SubstituteDetails {
  urn: string;
  name: FullPlayerName;
  position: string;
  shirtNumber: number;
  isCaptain: boolean;
  cards: any[];
  displayName: string;
  substitutedOn?: SubstitutedOn;
}

export interface SubstitutedOn {
  periodId: number;
  timeMin: number;
  timeMinSec: string;
  timestamp: string;
  playerOffUrn: string;
  playerOffName: string;
  reason: string;
}

export interface Official {
  id: string;
  opId: string;
  type: string;
  lastName: string;
  firstName: string;
  shortLastName: string;
  shortFirstName: string;
}

export interface MatchEvents {
  results: Result[];
  page: Page;
  uasActivityData: UasActivityData;
}

export interface Result {
  header: Block;
  content: Block;
  urn: string;
  type: string;
  dates: Dates;
  headline?: Block;
  timestamp: string;
}

export interface Model {
  text?: string;
  blocks?: Block[];
  attributes?: any[];
}

export interface Block {
  type?: string;
  model: Model;
}

export interface Dates {
  firstPublished: string;
  lastPublished: string;
  time: string;
  accessibleTime: string;
  curated: string;
}

export interface Page {
  index: number;
  total: number;
}

export interface UasActivityData {
  resourceDomain: string;
  resourceType: string;
  environment: string;
  apiKey: string;
}

export interface MatchPageData extends Match {
  report?: Report | null;
  formattedGoals?: string;
  substitutes?: string[];
  score?: string;
  homeTeam?: string;
  awayTeam?: string;
}

export interface PlayerView {
  image: string;
  player: Player;
  links: Link[];
  debut: Appearance;
  transfers: Transfer[];
  appearances: Appearance[];
  seasons: PlayerSeasonSummary[];
}
