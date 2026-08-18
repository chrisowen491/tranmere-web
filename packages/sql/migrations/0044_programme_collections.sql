ALTER TABLE UserProfiles ADD COLUMN public_collection_id TEXT;
ALTER TABLE UserProfiles ADD COLUMN public_collection_visible INTEGER NOT NULL DEFAULT 0;
ALTER TABLE UserProfiles ADD COLUMN contact_opt_in INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_public_collection_id
  ON UserProfiles(public_collection_id)
  WHERE public_collection_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS ProgrammeCollections (
  auth_sub TEXT NOT NULL,
  game_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('owned', 'wanted', 'trade')),
  condition_notes TEXT,
  purchase_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (auth_sub, game_id),
  FOREIGN KEY (auth_sub) REFERENCES UserProfiles(auth_sub) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_programme_collections_game_status
  ON ProgrammeCollections(game_id, status);

CREATE INDEX IF NOT EXISTS idx_programme_collections_user_status
  ON ProgrammeCollections(auth_sub, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS ProgrammeContactRequests (
  id TEXT NOT NULL PRIMARY KEY,
  sender_sub TEXT NOT NULL,
  recipient_sub TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_programme_contact_requests_rate_limit
  ON ProgrammeContactRequests(sender_sub, recipient_sub, created_at DESC);
