export interface PlayerRow {
  id: string;
  name: string;
  date_of_birth: string | null;
  biography_markdown: string | null;
  pic_link: string | null;
  foot: string | null;
  height: string | null;
  place_of_birth: string | null;
  position: string | null;
  secondary_position: string | null;
  links_json: string;
  updated_at: string | null;
}

export interface FantasyTeamRow {
  id: string;
  account_id: string;
  name: string;
  rationale: string | null;
  formation: '442' | '433';
  kit: string;
  captain_player_id: string | null;
  assignments_json: string;
  share_id: string | null;
  is_shared: number;
  created_at: string;
  updated_at: string;
}

export interface ClubRow {
  id: string;
  name: string;
  short_name: string | null;
  three_letter_name: string | null;
  nicknames: string | null;
  primary_colour: string | null;
  secondary_colour: string | null;
  highest_division: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface SearchIndexPlayerRow {
  id: string;
  name: string;
  pic_link: string | null;
}

export interface SearchIndexClubRow {
  id: string;
  name: string;
  short_name: string | null;
  three_letter_name: string | null;
  nicknames: string | null;
}

export interface SearchIndexSeasonRow {
  season: number;
}

export type SearchEntityType = 'player' | 'club' | 'season' | 'blog' | 'page';

export interface SearchIndexBlogRow {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
}

export interface SearchDocument {
  objectId: string;
  entityType: SearchEntityType;
  entityId: string;
  title: string;
  normalizedTitle: string;
  aliases: string;
  description: string;
  href: string;
  imageUrl: string | null;
  rankingWeight: number;
}

export interface SearchResultRow {
  object_id: string;
  entity_type: SearchEntityType;
  entity_id: string;
  title: string;
  description: string;
  href: string;
  image_url: string | null;
}

export interface TransferRow {
  id: string;
  player_name: string;
  season: number;
  from_club: string;
  to_club: string;
  fee_description: string;
  cost: number;
  transfer_date: string | null;
}

export interface ManagerRow {
  id: string;
  name: string;
  date_joined: string;
  date_left: string;
  image_path: string | null;
  favourite_formation: string | null;
}

export interface ProgrammeRow {
  url: string;
  match_name: string;
  match_date: string;
  pages: number;
}

export interface GameRow {
  id: string;
  season: number;
  match_date: string;
  competition: string;
  round: string | null;
  home_team: string;
  away_team: string;
  opposition: string;
  venue: string;
  attendance: number | null;
  full_time_score: string;
  home_goals: string | null;
  away_goals: string | null;
  division: string | null;
  tier: string | null;
  leg: string | null;
  tie: string | null;
  neutral: string | null;
  after_extra_time: string | null;
  penalties: string | null;
  programme_path: string | null;
  no_programme_issued: number;
  formation: string | null;
  kit?: string | null;
  referee: string | null;
  ticket: string | null;
}

export interface LeagueSeasonSummaryRow {
  season: number;
  division: string;
  final_league_position: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

export interface MatchReportRow {
  match_date: string;
  report: string;
}

export interface HatTrickRow {
  id: string;
  season: number;
  match_date: string;
  opposition: string;
  player_name: string;
  goals: number;
}

export type PlayerMilestoneType =
  'debut' | 'latest-appearance' | 'first-goal' | 'appearance-landmark';

export interface PlayerMilestoneRow {
  id: string;
  player_name: string;
  milestone_type: PlayerMilestoneType;
  match_date: string;
  season: number;
  opposition: string;
  milestone_value: number | null;
}

export type ArchiveCompletenessCategory =
  | 'lineups'
  | 'goals'
  | 'goal-details'
  | 'attendances'
  | 'formations'
  | 'programmes'
  | 'player-profiles'
  | 'kits'
  | 'match-reports';

export interface ArchiveCompletenessRow {
  season: number;
  category: ArchiveCompletenessCategory;
  complete_count: number;
  total_count: number;
  updated_at: string;
}

export interface ArchiveCompletenessGapRow {
  entity_id: string;
  entity_name: string;
  match_date: string | null;
  opposition: string | null;
}

export interface PlayerSeasonSummaryRow {
  season: string;
  player_name: string;
  appearances: number;
  starts: number;
  substitute_appearances: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  free_kicks: number;
  penalties: number;
  headers: number;
}

export interface AppRow {
  id: string;
  season: number;
  match_date: string;
  player_name: string;
  competition: string | null;
  opposition: string;
  shirt_number: number | null;
  yellow_card: number;
  red_card: number;
  substitute_yellow_card: number;
  substitute_red_card: number;
  substitute_time: string | null;
  substituted_by: string | null;
  substitute_substituted_by: string | null;
}

export interface PlayerAppearanceRow extends AppRow {
  appearance_type: 'Start' | 'Sub';
}

export interface GoalRow {
  id: string;
  season: number;
  match_date: string;
  scorer: string;
  opposition: string;
  competition: string | null;
  minute: string | null;
  goal_type: string | null;
  assist: string | null;
  assist_type: string | null;
  foot: string | null;
  six_yard_box: number;
  eighteen_yard_box: number;
  cross_side: string | null;
  long_range: number;
}

export interface UserProfileRow {
  account_id: string;
  public_collection_id: string | null;
  public_collection_visible: number;
  contact_opt_in: number;
  correction_recognition_visible: number;
  correction_username: string | null;
  avatar_url: string | null;
}

export type ProgrammeCollectionStatus = 'owned' | 'wanted' | 'trade';

export interface ProgrammeCollectionRow {
  account_id: string;
  game_id: string;
  status: ProgrammeCollectionStatus;
  condition_notes: string | null;
  purchase_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchAttendanceRow {
  account_id: string;
  game_id: string;
  created_at: string;
}

export interface AttendedMatchRow extends MatchAttendanceRow {
  season: number;
  match_date: string;
  competition: string;
  home_team: string;
  away_team: string;
  opposition: string;
  venue: string;
  full_time_score: string;
  neutral: string | null;
}
