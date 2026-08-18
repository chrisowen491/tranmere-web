CREATE TABLE IF NOT EXISTS MatchAttendances (
  auth_sub TEXT NOT NULL,
  game_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (auth_sub, game_id),
  FOREIGN KEY (auth_sub) REFERENCES UserProfiles(auth_sub) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_match_attendances_game
  ON MatchAttendances(game_id);

CREATE INDEX IF NOT EXISTS idx_match_attendances_user_created
  ON MatchAttendances(auth_sub, created_at DESC);
