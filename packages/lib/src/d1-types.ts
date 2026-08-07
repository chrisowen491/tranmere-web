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
  formation: string | null;
  kit?: string | null;
  referee: string | null;
  ticket: string | null;
}

export interface MatchReportRow {
  match_date: string;
  report: string;
}
