CREATE TABLE Accounts (
  id TEXT NOT NULL PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE AccountIdentities (
  provider_sub TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  created_at TEXT NOT NULL,
  last_authenticated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_account_identities_account
  ON AccountIdentities(account_id);

-- Preserve any existing profile owners while replacing Auth0 subjects with
-- application-owned account identifiers.
CREATE TABLE MigrationAccountMap (
  provider_sub TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL
);

INSERT INTO MigrationAccountMap (provider_sub, account_id)
SELECT auth_sub, 'acct_' || lower(hex(randomblob(16)))
FROM UserProfiles;

INSERT INTO Accounts (id, created_at, updated_at)
SELECT account_id, datetime('now'), datetime('now')
FROM MigrationAccountMap;

INSERT INTO AccountIdentities (
  provider_sub, account_id, provider, is_primary, created_at, last_authenticated_at
)
SELECT mapping.provider_sub, mapping.account_id,
       CASE
         WHEN instr(mapping.provider_sub, '|') > 0
           THEN substr(mapping.provider_sub, 1, instr(mapping.provider_sub, '|') - 1)
         ELSE 'unknown'
       END, 1,
       datetime('now'), datetime('now')
FROM MigrationAccountMap mapping;

DROP TABLE MigrationAccountMap;

ALTER TABLE UserProfiles RENAME TO UserProfiles_legacy;
DROP INDEX idx_user_profiles_public_collection_id;

CREATE TABLE UserProfiles (
  account_id TEXT NOT NULL PRIMARY KEY,
  public_collection_id TEXT,
  public_collection_visible INTEGER NOT NULL DEFAULT 0,
  contact_opt_in INTEGER NOT NULL DEFAULT 0,
  correction_recognition_visible INTEGER NOT NULL DEFAULT 0
    CHECK (correction_recognition_visible IN (0, 1)),
  correction_username TEXT,
  FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE
);

INSERT INTO UserProfiles
SELECT ai.account_id, up.public_collection_id, up.public_collection_visible,
       up.contact_opt_in, up.correction_recognition_visible,
       up.correction_username
FROM UserProfiles_legacy up
JOIN AccountIdentities ai ON ai.provider_sub = up.auth_sub;

CREATE UNIQUE INDEX idx_user_profiles_public_collection_id
  ON UserProfiles(public_collection_id)
  WHERE public_collection_id IS NOT NULL;

ALTER TABLE ProgrammeCollections RENAME TO ProgrammeCollections_legacy;
DROP INDEX idx_programme_collections_game_status;
DROP INDEX idx_programme_collections_user_status;

CREATE TABLE ProgrammeCollections (
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

INSERT INTO ProgrammeCollections
SELECT ai.account_id, pc.game_id, pc.status, pc.condition_notes,
       pc.purchase_notes, pc.created_at, pc.updated_at
FROM ProgrammeCollections_legacy pc
JOIN AccountIdentities ai ON ai.provider_sub = pc.auth_sub;

CREATE INDEX idx_programme_collections_game_status
  ON ProgrammeCollections(game_id, status);
CREATE INDEX idx_programme_collections_account_status
  ON ProgrammeCollections(account_id, status, updated_at DESC);

ALTER TABLE MatchAttendances RENAME TO MatchAttendances_legacy;
DROP INDEX idx_match_attendances_game;
DROP INDEX idx_match_attendances_user_created;

CREATE TABLE MatchAttendances (
  account_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (account_id, game_id),
  FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
);

INSERT INTO MatchAttendances
SELECT ai.account_id, ma.game_id, ma.created_at
FROM MatchAttendances_legacy ma
JOIN AccountIdentities ai ON ai.provider_sub = ma.auth_sub;

CREATE INDEX idx_match_attendances_game ON MatchAttendances(game_id);
CREATE INDEX idx_match_attendances_account_created
  ON MatchAttendances(account_id, created_at DESC);

ALTER TABLE FantasyTeams RENAME TO FantasyTeams_legacy;
DROP INDEX idx_fantasy_teams_owner_updated;
DROP INDEX idx_fantasy_teams_public_share;

CREATE TABLE FantasyTeams (
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

INSERT INTO FantasyTeams
SELECT ft.id, ai.account_id, ft.name, ft.rationale, ft.formation, ft.kit,
       ft.captain_player_id, ft.assignments_json, ft.share_id, ft.is_shared,
       ft.created_at, ft.updated_at
FROM FantasyTeams_legacy ft
JOIN AccountIdentities ai ON ai.provider_sub = ft.auth_sub;

CREATE INDEX idx_fantasy_teams_owner_updated
  ON FantasyTeams(account_id, updated_at DESC);
CREATE UNIQUE INDEX idx_fantasy_teams_public_share
  ON FantasyTeams(share_id) WHERE share_id IS NOT NULL;

DROP TABLE ProgrammeCollections_legacy;
DROP TABLE MatchAttendances_legacy;
DROP TABLE FantasyTeams_legacy;
DROP TABLE UserProfiles_legacy;
