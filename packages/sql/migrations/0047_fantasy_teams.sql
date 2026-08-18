CREATE TABLE IF NOT EXISTS FantasyTeams (
  id TEXT NOT NULL PRIMARY KEY,
  auth_sub TEXT NOT NULL,
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
  FOREIGN KEY (auth_sub) REFERENCES UserProfiles(auth_sub) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fantasy_teams_owner_updated
  ON FantasyTeams(auth_sub, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fantasy_teams_public_share
  ON FantasyTeams(share_id)
  WHERE share_id IS NOT NULL;
