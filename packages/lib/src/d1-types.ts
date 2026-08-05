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
  programme_path: string | null;
  image_path: string | null;
}
