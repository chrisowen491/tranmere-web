CREATE TABLE IF NOT EXISTS MigrationRatingIdentityMap (
  provider_sub TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL
);

INSERT OR IGNORE INTO MigrationRatingIdentityMap (provider_sub, account_id)
SELECT provider_sub, account_id
FROM AccountIdentities;

INSERT OR IGNORE INTO MigrationRatingIdentityMap (provider_sub, account_id)
SELECT DISTINCT sub, 'acct_' || lower(hex(randomblob(16)))
FROM Ratings;

INSERT OR IGNORE INTO Accounts (id, created_at, updated_at)
SELECT account_id, datetime('now'), datetime('now')
FROM MigrationRatingIdentityMap;

INSERT OR IGNORE INTO AccountIdentities (
  provider_sub,
  account_id,
  provider,
  is_primary,
  created_at,
  last_authenticated_at
)
SELECT
  provider_sub,
  account_id,
  CASE
    WHEN instr(provider_sub, '|') > 0
      THEN substr(provider_sub, 1, instr(provider_sub, '|') - 1)
    ELSE 'unknown'
  END,
  1,
  datetime('now'),
  datetime('now')
FROM MigrationRatingIdentityMap;

INSERT OR IGNORE INTO UserProfiles (account_id)
SELECT account_id
FROM MigrationRatingIdentityMap;

ALTER TABLE Ratings RENAME COLUMN sub TO account_id;

UPDATE Ratings
SET account_id = (
  SELECT account_id
  FROM MigrationRatingIdentityMap
  WHERE provider_sub = Ratings.account_id
);

DROP TABLE MigrationRatingIdentityMap;
