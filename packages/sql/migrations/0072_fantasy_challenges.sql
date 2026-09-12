CREATE TABLE IF NOT EXISTS FantasyChallenges (
  id TEXT NOT NULL PRIMARY KEY,
  created_by_account_id TEXT NOT NULL,
  challenger_team_id TEXT NOT NULL,
  opponent_team_id TEXT NOT NULL,
  challenger_snapshot_json TEXT NOT NULL,
  opponent_snapshot_json TEXT NOT NULL,
  matches_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (created_by_account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fantasy_challenges_creator_created
  ON FantasyChallenges(created_by_account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fantasy_challenges_teams
  ON FantasyChallenges(challenger_team_id, opponent_team_id, created_at DESC);
