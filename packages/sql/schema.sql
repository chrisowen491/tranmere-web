DROP TABLE IF EXISTS Ratings;

CREATE TABLE Ratings (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  page_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created TEXT NOT NULL,
  account_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER int NOT NULL,
  comment TEXT NULL,
  FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS Ratings_page_url_created_idx
  ON Ratings (page_url, created DESC, id DESC);

CREATE TABLE IF NOT EXISTS MatchAttendanceCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  current_attendance INTEGER,
  proposed_attendance INTEGER NOT NULL,
  source TEXT NOT NULL,
  explanation TEXT,
  submitted_by_account_id TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_email TEXT,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  FOREIGN KEY (submitted_by_account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS MatchAttendanceCorrections_status_idx
  ON MatchAttendanceCorrections (status, submitted_at);

CREATE INDEX IF NOT EXISTS MatchAttendanceCorrections_match_idx
  ON MatchAttendanceCorrections (season, match_date, status, reviewed_at);

CREATE TABLE IF NOT EXISTS PlayerProfileCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  player_name TEXT NOT NULL,
  current_json TEXT NOT NULL,
  changes_json TEXT NOT NULL,
  source TEXT NOT NULL,
  explanation TEXT,
  submitted_by_account_id TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_email TEXT,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  FOREIGN KEY (submitted_by_account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS PlayerProfileCorrections_status_idx
  ON PlayerProfileCorrections (status, submitted_at);

CREATE INDEX IF NOT EXISTS PlayerProfileCorrections_player_idx
  ON PlayerProfileCorrections (player_name, status, reviewed_at);

CREATE TABLE IF NOT EXISTS GoalCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  goal_id TEXT NOT NULL,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  opposition TEXT NOT NULL,
  current_json TEXT NOT NULL,
  changes_json TEXT NOT NULL,
  source TEXT,
  explanation TEXT,
  submitted_by_account_id TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  FOREIGN KEY (submitted_by_account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS GoalCorrections_status_idx
  ON GoalCorrections (status, submitted_at);

CREATE INDEX IF NOT EXISTS GoalCorrections_goal_idx
  ON GoalCorrections (goal_id, status);

CREATE TABLE IF NOT EXISTS GoalSubmissions (
  id TEXT NOT NULL PRIMARY KEY,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  opposition TEXT NOT NULL,
  competition TEXT,
  goal_json TEXT NOT NULL,
  source TEXT,
  explanation TEXT,
  submitted_by_account_id TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  FOREIGN KEY (submitted_by_account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS GoalSubmissions_status_idx
  ON GoalSubmissions (status, submitted_at);

CREATE INDEX IF NOT EXISTS GoalSubmissions_submitter_idx
  ON GoalSubmissions (submitted_by_account_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS AppearanceCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  appearance_id TEXT NOT NULL,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  opposition TEXT NOT NULL,
  current_json TEXT NOT NULL,
  changes_json TEXT NOT NULL,
  source TEXT,
  explanation TEXT,
  submitted_by_account_id TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  FOREIGN KEY (submitted_by_account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS AppearanceCorrections_status_idx
  ON AppearanceCorrections (status, submitted_at);

CREATE INDEX IF NOT EXISTS AppearanceCorrections_appearance_idx
  ON AppearanceCorrections (appearance_id, status);

CREATE TABLE IF NOT EXISTS MatchFormationCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  current_formation TEXT,
  proposed_formation TEXT NOT NULL,
  explanation TEXT,
  submitted_by_account_id TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  FOREIGN KEY (submitted_by_account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS MatchFormationCorrections_status_idx
  ON MatchFormationCorrections (status, submitted_at);

CREATE TABLE IF NOT EXISTS MatchKitCorrections (
  id TEXT NOT NULL PRIMARY KEY,
  season TEXT NOT NULL,
  match_date TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  current_kit TEXT,
  proposed_kit TEXT NOT NULL,
  explanation TEXT,
  submitted_by_account_id TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  FOREIGN KEY (submitted_by_account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS MatchKitCorrections_status_idx
  ON MatchKitCorrections (status, submitted_at);

CREATE INDEX IF NOT EXISTS MatchAttendanceCorrections_submitter_idx
  ON MatchAttendanceCorrections (submitted_by_account_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS PlayerProfileCorrections_submitter_idx
  ON PlayerProfileCorrections (submitted_by_account_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS GoalCorrections_submitter_idx
  ON GoalCorrections (submitted_by_account_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS AppearanceCorrections_submitter_idx
  ON AppearanceCorrections (submitted_by_account_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS MatchFormationCorrections_submitter_idx
  ON MatchFormationCorrections (submitted_by_account_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS MatchKitCorrections_submitter_idx
  ON MatchKitCorrections (submitted_by_account_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS Transfers (
  id TEXT NOT NULL PRIMARY KEY,
  player_name TEXT NOT NULL,
  season INTEGER NOT NULL,
  from_club TEXT NOT NULL,
  to_club TEXT NOT NULL,
  fee_description TEXT NOT NULL,
  cost INTEGER NOT NULL DEFAULT 0,
  transfer_date TEXT,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (cost >= 0),
  CHECK (
    transfer_date IS NULL
    OR transfer_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  )
);

CREATE INDEX IF NOT EXISTS Transfers_player_idx
  ON Transfers (player_name, season);

CREATE INDEX IF NOT EXISTS Transfers_season_idx
  ON Transfers (season);

CREATE INDEX IF NOT EXISTS Transfers_from_club_idx
  ON Transfers (from_club, season);

CREATE INDEX IF NOT EXISTS Transfers_to_club_idx
  ON Transfers (to_club, season);

CREATE INDEX IF NOT EXISTS Transfers_date_idx
  ON Transfers (transfer_date);

CREATE INDEX IF NOT EXISTS Transfers_player_sort_idx
  ON Transfers (
    player_name,
    season DESC,
    transfer_date DESC,
    cost DESC
  );

CREATE TABLE IF NOT EXISTS Managers (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  date_joined TEXT NOT NULL,
  date_left TEXT NOT NULL,
  image_path TEXT,
  favourite_formation TEXT
);

CREATE INDEX IF NOT EXISTS Managers_date_joined_idx
  ON Managers (date_joined);

CREATE INDEX IF NOT EXISTS Managers_name_idx
  ON Managers (name);

CREATE TABLE IF NOT EXISTS Clubs (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  three_letter_name TEXT,
  nicknames TEXT,
  primary_colour TEXT,
  secondary_colour TEXT,
  highest_division INTEGER,
  latitude REAL,
  longitude REAL,
  CHECK (highest_division IS NULL OR highest_division BETWEEN 1 AND 20)
);

CREATE UNIQUE INDEX IF NOT EXISTS Clubs_name_idx
  ON Clubs (name);

CREATE INDEX IF NOT EXISTS Clubs_short_name_idx
  ON Clubs (short_name);

CREATE TABLE IF NOT EXISTS ClubVenues (
  club_name TEXT NOT NULL,
  venue TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  PRIMARY KEY (club_name, start_date),
  CHECK (start_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  CHECK (
    end_date IS NULL
    OR end_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS ClubVenues_club_dates_idx
  ON ClubVenues (club_name, start_date, end_date);

CREATE TABLE IF NOT EXISTS Players (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  date_of_birth TEXT,
  biography_markdown TEXT,
  pic_link TEXT,
  foot TEXT,
  height TEXT,
  place_of_birth TEXT,
  position TEXT,
  secondary_position TEXT,
  links_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT,
  CHECK (
    date_of_birth IS NULL
    OR date_of_birth GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (foot IS NULL OR foot IN ('Left', 'Right')),
  CHECK (json_valid(links_json))
);

CREATE INDEX IF NOT EXISTS Players_name_idx
  ON Players (name);

CREATE INDEX IF NOT EXISTS Players_position_idx
  ON Players (position, name);

CREATE TABLE IF NOT EXISTS Programmes (
  url TEXT NOT NULL PRIMARY KEY,
  match_name TEXT NOT NULL,
  match_date TEXT NOT NULL,
  pages INTEGER NOT NULL,
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (pages > 0)
);

CREATE INDEX IF NOT EXISTS Programmes_match_date_idx
  ON Programmes (match_date DESC);

CREATE TABLE IF NOT EXISTS Games (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  competition TEXT NOT NULL,
  round TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  opposition TEXT NOT NULL,
  venue TEXT NOT NULL,
  attendance INTEGER,
  full_time_score TEXT NOT NULL,
  home_goals TEXT,
  away_goals TEXT,
  division TEXT,
  tier TEXT,
  leg TEXT,
  tie TEXT,
  neutral TEXT,
  after_extra_time TEXT,
  penalties TEXT,
  programme_path TEXT,
  no_programme_issued INTEGER NOT NULL DEFAULT 0,
  formation TEXT,
  kit TEXT,
  referee TEXT,
  ticket TEXT,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (no_programme_issued IN (0, 1))
);

CREATE INDEX IF NOT EXISTS Games_season_date_idx
  ON Games (season, match_date);

CREATE TABLE IF NOT EXISTS LeagueSeasonSummaries (
  season INTEGER NOT NULL PRIMARY KEY,
  division TEXT NOT NULL,
  final_league_position INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  draws INTEGER NOT NULL,
  losses INTEGER NOT NULL,
  goals_for INTEGER NOT NULL,
  goals_against INTEGER NOT NULL,
  points INTEGER NOT NULL,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (final_league_position > 0),
  CHECK (wins >= 0),
  CHECK (draws >= 0),
  CHECK (losses >= 0),
  CHECK (goals_for >= 0),
  CHECK (goals_against >= 0),
  CHECK (points >= 0)
);

CREATE INDEX IF NOT EXISTS Games_opposition_date_idx
  ON Games (opposition, match_date);

CREATE INDEX IF NOT EXISTS Games_competition_date_idx
  ON Games (competition, match_date);

CREATE INDEX IF NOT EXISTS Games_home_team_date_idx
  ON Games (home_team, match_date);

CREATE INDEX IF NOT EXISTS Games_match_date_id_idx
  ON Games (match_date ASC, id ASC);

CREATE TABLE IF NOT EXISTS HatTricks (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  opposition TEXT NOT NULL,
  player_name TEXT NOT NULL,
  goals INTEGER NOT NULL,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (goals >= 3)
);

CREATE INDEX IF NOT EXISTS HatTricks_date_idx
  ON HatTricks (match_date DESC);

CREATE INDEX IF NOT EXISTS HatTricks_player_idx
  ON HatTricks (player_name, match_date DESC);

CREATE INDEX IF NOT EXISTS HatTricks_season_idx
  ON HatTricks (season, match_date DESC);

CREATE TABLE IF NOT EXISTS PlayerSeasonSummaries (
  season TEXT NOT NULL,
  player_name TEXT NOT NULL,
  appearances INTEGER NOT NULL,
  starts INTEGER NOT NULL,
  substitute_appearances INTEGER NOT NULL,
  goals INTEGER NOT NULL,
  assists INTEGER NOT NULL,
  yellow_cards INTEGER NOT NULL,
  red_cards INTEGER NOT NULL,
  free_kicks INTEGER NOT NULL,
  penalties INTEGER NOT NULL,
  headers INTEGER NOT NULL,
  PRIMARY KEY (season, player_name),
  CHECK (season = 'TOTAL' OR season GLOB '[0-9][0-9][0-9][0-9]'),
  CHECK (appearances >= 0),
  CHECK (starts >= 0),
  CHECK (substitute_appearances >= 0),
  CHECK (goals >= 0),
  CHECK (assists >= 0),
  CHECK (yellow_cards >= 0),
  CHECK (red_cards >= 0),
  CHECK (free_kicks >= 0),
  CHECK (penalties >= 0),
  CHECK (headers >= 0)
);

CREATE INDEX IF NOT EXISTS PlayerSeasonSummaries_player_idx
  ON PlayerSeasonSummaries (player_name, season DESC);

CREATE INDEX IF NOT EXISTS PlayerSeasonSummaries_season_apps_idx
  ON PlayerSeasonSummaries (season, appearances DESC, player_name ASC);

CREATE TABLE IF NOT EXISTS PlayerMilestones (
  id TEXT NOT NULL PRIMARY KEY,
  player_name TEXT NOT NULL,
  milestone_type TEXT NOT NULL,
  match_date TEXT NOT NULL,
  season INTEGER NOT NULL,
  opposition TEXT NOT NULL,
  milestone_value INTEGER,
  CHECK (
    milestone_type IN (
      'debut',
      'latest-appearance',
      'first-goal',
      'appearance-landmark',
      'longest-absence'
    )
  ),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (milestone_value IS NULL OR milestone_value > 0)
);

CREATE INDEX IF NOT EXISTS PlayerMilestones_match_date_idx
  ON PlayerMilestones (match_date, player_name, milestone_type);

CREATE INDEX IF NOT EXISTS PlayerMilestones_player_idx
  ON PlayerMilestones (player_name, match_date);

CREATE INDEX IF NOT EXISTS PlayerMilestones_type_value_idx
  ON PlayerMilestones (milestone_type, milestone_value DESC, player_name ASC);

CREATE TABLE IF NOT EXISTS ArchiveCompleteness (
  season INTEGER NOT NULL,
  category TEXT NOT NULL,
  complete_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (season, category),
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (
    category IN (
      'lineups',
      'goals',
      'goal-details',
      'attendances',
      'formations',
      'programmes',
      'player-profiles',
      'kits',
      'match-reports'
    )
  ),
  CHECK (complete_count >= 0),
  CHECK (total_count >= 0),
  CHECK (complete_count <= total_count)
);

CREATE INDEX IF NOT EXISTS ArchiveCompleteness_category_season_idx
  ON ArchiveCompleteness (category, season DESC);

CREATE TABLE IF NOT EXISTS Apps (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  player_name TEXT NOT NULL,
  competition TEXT,
  opposition TEXT NOT NULL,
  shirt_number INTEGER,
  yellow_card INTEGER NOT NULL DEFAULT 0,
  red_card INTEGER NOT NULL DEFAULT 0,
  substitute_yellow_card INTEGER NOT NULL DEFAULT 0,
  substitute_red_card INTEGER NOT NULL DEFAULT 0,
  substitute_time TEXT,
  substituted_by TEXT,
  substitute_substituted_by TEXT,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (shirt_number IS NULL OR shirt_number >= 0),
  CHECK (yellow_card IN (0, 1)),
  CHECK (red_card IN (0, 1)),
  CHECK (substitute_yellow_card IN (0, 1)),
  CHECK (substitute_red_card IN (0, 1))
);

CREATE INDEX IF NOT EXISTS Apps_player_date_idx
  ON Apps (player_name, match_date DESC);

CREATE INDEX IF NOT EXISTS Apps_season_player_idx
  ON Apps (season, player_name, match_date);

CREATE INDEX IF NOT EXISTS Apps_match_idx
  ON Apps (season, match_date, player_name);

CREATE INDEX IF NOT EXISTS Apps_match_date_player_id_idx
  ON Apps (match_date DESC, player_name ASC, id ASC);

CREATE INDEX IF NOT EXISTS Apps_player_date_id_idx
  ON Apps (player_name, match_date DESC, id ASC);

CREATE INDEX IF NOT EXISTS Apps_substituted_by_idx
  ON Apps (substituted_by, match_date DESC);

CREATE TABLE IF NOT EXISTS Goals (
  id TEXT NOT NULL PRIMARY KEY,
  season INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  scorer TEXT NOT NULL,
  opposition TEXT NOT NULL,
  competition TEXT,
  minute TEXT,
  goal_type TEXT,
  assist TEXT,
  assist_type TEXT,
  foot TEXT,
  six_yard_box INTEGER NOT NULL DEFAULT 0,
  eighteen_yard_box INTEGER NOT NULL DEFAULT 0,
  cross_side TEXT,
  long_range INTEGER NOT NULL DEFAULT 0,
  CHECK (season BETWEEN 1800 AND 2200),
  CHECK (
    match_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  CHECK (six_yard_box IN (0, 1)),
  CHECK (eighteen_yard_box IN (0, 1)),
  CHECK (long_range IN (0, 1))
);

CREATE INDEX IF NOT EXISTS Goals_scorer_date_idx
  ON Goals (scorer, match_date DESC);

CREATE INDEX IF NOT EXISTS Goals_season_scorer_idx
  ON Goals (season, scorer, match_date);

CREATE INDEX IF NOT EXISTS Goals_match_idx
  ON Goals (season, match_date, scorer);

CREATE INDEX IF NOT EXISTS Goals_opposition_date_scorer_id_idx
  ON Goals (opposition, match_date DESC, scorer ASC, id ASC);

CREATE TABLE IF NOT EXISTS ClubAliases (
  alias TEXT NOT NULL PRIMARY KEY,
  canonical_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS MatchReports (
  match_date TEXT NOT NULL PRIMARY KEY,
  report TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS SearchDocuments (
  row_id INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  aliases TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  href TEXT NOT NULL,
  image_url TEXT,
  ranking_weight INTEGER NOT NULL DEFAULT 0,
  sync_token TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (entity_type IN ('player', 'club', 'season', 'blog', 'page'))
);

CREATE INDEX IF NOT EXISTS SearchDocuments_type_idx
  ON SearchDocuments (entity_type, title);

CREATE INDEX IF NOT EXISTS SearchDocuments_normalized_title_idx
  ON SearchDocuments (normalized_title, ranking_weight DESC);

CREATE INDEX IF NOT EXISTS SearchDocuments_sync_token_idx
  ON SearchDocuments (sync_token);

CREATE VIRTUAL TABLE IF NOT EXISTS SearchDocumentsFts USING fts5(
  object_id UNINDEXED,
  title,
  aliases,
  description,
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS SearchDocuments_ai
AFTER INSERT ON SearchDocuments BEGIN
  INSERT INTO SearchDocumentsFts (object_id, title, aliases, description)
  VALUES (new.object_id, new.title, new.aliases, new.description);
END;

CREATE TRIGGER IF NOT EXISTS SearchDocuments_ad
AFTER DELETE ON SearchDocuments BEGIN
  DELETE FROM SearchDocumentsFts WHERE object_id = old.object_id;
END;

CREATE TRIGGER IF NOT EXISTS SearchDocuments_au
AFTER UPDATE ON SearchDocuments BEGIN
  DELETE FROM SearchDocumentsFts WHERE object_id = old.object_id;
  INSERT INTO SearchDocumentsFts (object_id, title, aliases, description)
  VALUES (new.object_id, new.title, new.aliases, new.description);
END;

CREATE TABLE IF NOT EXISTS Accounts (
  id TEXT NOT NULL PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS AccountIdentities (
  provider_sub TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  created_at TEXT NOT NULL,
  last_authenticated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_account_identities_account
  ON AccountIdentities(account_id);

CREATE TABLE IF NOT EXISTS UserProfiles (
  account_id TEXT NOT NULL PRIMARY KEY,
  public_collection_id TEXT,
  public_collection_visible INTEGER NOT NULL DEFAULT 0,
  contact_opt_in INTEGER NOT NULL DEFAULT 0,
  correction_recognition_visible INTEGER NOT NULL DEFAULT 0
    CHECK (correction_recognition_visible IN (0, 1)),
  correction_username TEXT,
  avatar_url TEXT,
  FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_public_collection_id
  ON UserProfiles(public_collection_id)
  WHERE public_collection_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS ProgrammeCollections (
  account_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('owned', 'wanted', 'trade')),
  condition_notes TEXT,
  purchase_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (account_id, game_id),
  FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_programme_collections_game_status
  ON ProgrammeCollections(game_id, status);

CREATE INDEX IF NOT EXISTS idx_programme_collections_account_status
  ON ProgrammeCollections(account_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS MatchAttendances (
  account_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (account_id, game_id),
  FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_match_attendances_game
  ON MatchAttendances(game_id);

CREATE INDEX IF NOT EXISTS idx_match_attendances_account_created
  ON MatchAttendances(account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS FantasyTeams (
  id TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  rationale TEXT,
  formation TEXT NOT NULL CHECK (formation IN ('442', '433')),
  kit TEXT NOT NULL,
  captain_player_id TEXT,
  assignments_json TEXT NOT NULL,
  share_id TEXT UNIQUE,
  is_shared INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fantasy_teams_owner_updated
  ON FantasyTeams(account_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fantasy_teams_public_share
  ON FantasyTeams(share_id)
  WHERE share_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS ProgrammeContactRequests (
  id TEXT NOT NULL PRIMARY KEY,
  sender_account_id TEXT NOT NULL,
  recipient_account_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (sender_account_id) REFERENCES Accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_programme_contact_requests_rate_limit
  ON ProgrammeContactRequests(sender_account_id, recipient_account_id, created_at DESC);
