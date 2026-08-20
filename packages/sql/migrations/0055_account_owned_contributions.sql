CREATE TABLE MigrationIdentityMap (
  provider_sub TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL
);

INSERT OR IGNORE INTO MigrationIdentityMap
SELECT provider_sub, account_id FROM AccountIdentities;

INSERT OR IGNORE INTO MigrationIdentityMap
SELECT DISTINCT submitted_by_sub, 'acct_' || lower(hex(randomblob(16)))
FROM MatchAttendanceCorrections;
INSERT OR IGNORE INTO MigrationIdentityMap
SELECT DISTINCT submitted_by_sub, 'acct_' || lower(hex(randomblob(16)))
FROM PlayerProfileCorrections;
INSERT OR IGNORE INTO MigrationIdentityMap
SELECT DISTINCT submitted_by_sub, 'acct_' || lower(hex(randomblob(16)))
FROM GoalCorrections;
INSERT OR IGNORE INTO MigrationIdentityMap
SELECT DISTINCT submitted_by_sub, 'acct_' || lower(hex(randomblob(16)))
FROM GoalSubmissions;
INSERT OR IGNORE INTO MigrationIdentityMap
SELECT DISTINCT submitted_by_sub, 'acct_' || lower(hex(randomblob(16)))
FROM AppearanceCorrections;
INSERT OR IGNORE INTO MigrationIdentityMap
SELECT DISTINCT submitted_by_sub, 'acct_' || lower(hex(randomblob(16)))
FROM MatchFormationCorrections;
INSERT OR IGNORE INTO MigrationIdentityMap
SELECT DISTINCT submitted_by_sub, 'acct_' || lower(hex(randomblob(16)))
FROM MatchKitCorrections;
INSERT OR IGNORE INTO MigrationIdentityMap
SELECT DISTINCT sender_sub, 'acct_' || lower(hex(randomblob(16)))
FROM ProgrammeContactRequests;
INSERT OR IGNORE INTO MigrationIdentityMap
SELECT DISTINCT recipient_sub, 'acct_' || lower(hex(randomblob(16)))
FROM ProgrammeContactRequests;

INSERT OR IGNORE INTO Accounts (id, created_at, updated_at)
SELECT account_id, datetime('now'), datetime('now')
FROM MigrationIdentityMap;

INSERT OR IGNORE INTO AccountIdentities (
  provider_sub, account_id, provider, is_primary, created_at, last_authenticated_at
)
SELECT provider_sub, account_id,
       CASE
         WHEN instr(provider_sub, '|') > 0
           THEN substr(provider_sub, 1, instr(provider_sub, '|') - 1)
         ELSE 'unknown'
       END, 1,
       datetime('now'), datetime('now')
FROM MigrationIdentityMap;

ALTER TABLE MatchAttendanceCorrections
  RENAME COLUMN submitted_by_sub TO submitted_by_account_id;
ALTER TABLE PlayerProfileCorrections
  RENAME COLUMN submitted_by_sub TO submitted_by_account_id;
ALTER TABLE GoalCorrections
  RENAME COLUMN submitted_by_sub TO submitted_by_account_id;
ALTER TABLE GoalSubmissions
  RENAME COLUMN submitted_by_sub TO submitted_by_account_id;
ALTER TABLE AppearanceCorrections
  RENAME COLUMN submitted_by_sub TO submitted_by_account_id;
ALTER TABLE MatchFormationCorrections
  RENAME COLUMN submitted_by_sub TO submitted_by_account_id;
ALTER TABLE MatchKitCorrections
  RENAME COLUMN submitted_by_sub TO submitted_by_account_id;
ALTER TABLE ProgrammeContactRequests RENAME COLUMN sender_sub TO sender_account_id;
ALTER TABLE ProgrammeContactRequests RENAME COLUMN recipient_sub TO recipient_account_id;

UPDATE MatchAttendanceCorrections
SET submitted_by_account_id = (
  SELECT account_id FROM MigrationIdentityMap
  WHERE provider_sub = MatchAttendanceCorrections.submitted_by_account_id
);
UPDATE PlayerProfileCorrections
SET submitted_by_account_id = (
  SELECT account_id FROM MigrationIdentityMap
  WHERE provider_sub = PlayerProfileCorrections.submitted_by_account_id
);
UPDATE GoalCorrections
SET submitted_by_account_id = (
  SELECT account_id FROM MigrationIdentityMap
  WHERE provider_sub = GoalCorrections.submitted_by_account_id
);
UPDATE GoalSubmissions
SET submitted_by_account_id = (
  SELECT account_id FROM MigrationIdentityMap
  WHERE provider_sub = GoalSubmissions.submitted_by_account_id
);
UPDATE AppearanceCorrections
SET submitted_by_account_id = (
  SELECT account_id FROM MigrationIdentityMap
  WHERE provider_sub = AppearanceCorrections.submitted_by_account_id
);
UPDATE MatchFormationCorrections
SET submitted_by_account_id = (
  SELECT account_id FROM MigrationIdentityMap
  WHERE provider_sub = MatchFormationCorrections.submitted_by_account_id
);
UPDATE MatchKitCorrections
SET submitted_by_account_id = (
  SELECT account_id FROM MigrationIdentityMap
  WHERE provider_sub = MatchKitCorrections.submitted_by_account_id
);
UPDATE ProgrammeContactRequests
SET sender_account_id = (
      SELECT account_id FROM MigrationIdentityMap
      WHERE provider_sub = ProgrammeContactRequests.sender_account_id
    ),
    recipient_account_id = (
      SELECT account_id FROM MigrationIdentityMap
      WHERE provider_sub = ProgrammeContactRequests.recipient_account_id
    );
DROP TABLE MigrationIdentityMap;
