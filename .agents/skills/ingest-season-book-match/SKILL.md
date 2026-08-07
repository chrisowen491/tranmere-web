---
name: ingest-season-book-match
description: Parse a photographed or scanned Tranmere Rovers season-book fixture row or complete season sheet and add its confirmed attendance to the Tranmere-Web D1 Games table, plus starting XI, substitutions and Rovers scorers to DynamoDB. Use when supplied a season-book/team-sheet image that lists player surnames and shirt numbers, especially to fill historic line-ups for already-recorded matches.
---

# Season-book match ingestion

Use this only for a match that already exists in the Tranmere-Web D1 `Games`
table. Never create or replace a game/result record from a season-book image.
The image only supplies an attendance update to D1. Apps and goals remain in
the DynamoDB `TranmereWebAppsTable` and `TranmereWebGoalsTable`.

The source is an image of a season table where the row contains the fixture,
result, attendance and scorer summary, and columns contain each player name.
Numbers in the cells are shirt numbers. An asterisk against a shirt number means
that starter was substituted by the player marked `12` on the same row. Names
after the score are Tranmere scorers; a following number is that player's goal
count, not a shirt number.

## Scope

Use the single-fixture flow for one row. For a full season sheet, resolve each
distinct printed player name once, transcribe every row, present one final
season-level review, and then apply the validated records as one import.

## 1. Extract and identify the fixture

Read the season heading, the fixture row and every player-column heading.
Capture:

- season, date, competition, venue flag, opponent, result and attendance;
- every non-blank player cell as `{ printedName, shirtNumber, substituted }`;
- the single player wearing `12`, when present;
- each scorer and their goal count.

Convert the fixture date to `YYYY-MM-DD`: August–December belongs to the
season-heading's first year; January–July belongs to its second year. For
example, `1967-68`, `A 19` is `1967-08-19`.

Do not guess an unreadable value. Ask the user to provide it or attach a clearer
crop. Treat blank cells as no appearance. Do not interpret a number in the
scorer summary as a shirt number.

Choose the intended D1 target before any read or write. For the production
database use `--remote`; for local review use
`--local --persist-to=packages/site/.wrangler/state`. Substitute that value as
`<d1-target>` below. Run D1 commands from the repository root and use
`packages/sql/wrangler.toml`.

For one fixture, preflight the D1 game record:

```bash
npx wrangler d1 execute tranmere-web --config packages/sql/wrangler.toml <d1-target> \
  --command "SELECT id, season, match_date, competition, home_team, away_team, opposition, venue, full_time_score, home_goals, away_goals, attendance
             FROM Games
             WHERE season = 1967 AND match_date = '1967-08-19';"
```

Require exactly one result and check its `opposition`, home/away arrangement and
score agree with the image. If absent or inconsistent, stop; do not write.
Use the existing D1 record's `season`, `match_date`, `opposition` and `competition` in
all later records.

For a season sheet, query all game records once and map them by `match_date`:

```bash
npx wrangler d1 execute tranmere-web --config packages/sql/wrangler.toml <d1-target> \
  --command "SELECT id, season, match_date, competition, home_team, away_team, opposition, venue, full_time_score, home_goals, away_goals, attendance
             FROM Games
             WHERE season = 1967
             ORDER BY match_date, id;"
```

Require every scanned date to exist exactly once and validate its opponent,
home/away arrangement, competition and score. Use the D1 game's canonical
`opposition` and `competition` fields in later records.

## 2. Resolve every printed player name with the user

Never silently expand a surname or initial. For every distinct player printed
in the row—starters, the number-12 replacement, and scorers—show the printed
form and its context, then ask the user to confirm the canonical full name.

Look for possible candidates in the D1 `Players` table, for example:

```bash
npx wrangler d1 execute tranmere-web --config packages/sql/wrangler.toml <d1-target> \
  --command "SELECT id, name FROM Players WHERE name LIKE '%King%' ORDER BY name;"
```

Present candidates as suggestions only. Ask separately for `King A` and
`King J`; never collapse them into one player. If no candidate exists, ask the
user for the canonical full name, but do not create a player profile as part of
this skill.

Do not proceed until the user has explicitly confirmed every discovered player
name. Reuse a confirmed full name where the same printed player appears as a
starter and scorer.

For a season sheet, build one confirmed source-name map before transcribing the
rows. Prompt only for new or unclear labels, and keep similarly named players
separate, such as `King A`/`King J` or `Storton S`/`Storton T`.

## 3. Validate the proposed match data

Before a live write, present a compact review containing the existing match,
attendance, 11 starters, any number-12 substitution and scorer totals.

- The player marked `12` is the `SubbedBy` value for each asterisked starter.
  Do not create a separate starter record for number 12.
- The book does not provide substitution minutes, cards, assists or goal
  minutes. Leave those unknown; do not invent them.
- Sum scorer counts and compare it with Tranmere's score from the existing D1
  game (`home_goals` if `home_team` is Tranmere Rovers, otherwise
  `away_goals`; fall back to `full_time_score` only when the individual score
  columns are blank). Stop on a mismatch.
- Query `TranmereWebAppsTable` and `TranmereWebGoalsTable` for the same season
  and date. If either has existing data, stop and ask whether the user wants a
  separate, explicitly authorised replacement operation. Do not create
  duplicates.

Use these read patterns:

```bash
aws dynamodb query --table-name TranmereWebAppsTable --profile <profile> --region <region> \
  --key-condition-expression 'Season = :season' \
  --filter-expression '#date = :date' \
  --expression-attribute-names '{"#date":"Date"}' \
  --expression-attribute-values '{":season":{"S":"1967"},":date":{"S":"1967-08-19"}}'

aws dynamodb query --table-name TranmereWebGoalsTable --profile <profile> --region <region> \
  --key-condition-expression 'Season = :season' \
  --filter-expression '#date = :date' \
  --expression-attribute-names '{"#date":"Date"}' \
  --expression-attribute-values '{":season":{"S":"1967"},":date":{"S":"1967-08-19"}}'
```

For a season sheet, query each table once with `Season = :season` and compare
the returned `Date` values to every proposed row. Stop if a proposed date
already has appearances or goals. Before the final confirmation, require for
every row:

- exactly 11 non-`12` entries and no more than one number-12 player;
- a number-12 player for every asterisked starter, recorded as `SubbedBy`;
- a confirmed full name for every printed label; and
- the expanded scorer count to equal Tranmere's home or away score from the
  existing D1 game's score.

Ask for one final confirmation immediately before modifying D1 or DynamoDB. In
dry-run mode, print the number of fixtures, D1 attendance updates, starter
appearances, goal records and substitutions. Do not write in dry-run mode.

## 4. Write the confirmed records

Update attendance on the existing D1 game only. Keep every other result field
unchanged. The preflight must already have established that the key is unique;
after the update, require `changes()` to be exactly `1` or stop and report the
problem. Never insert into `Games` from this skill.

```bash
npx wrangler d1 execute tranmere-web --config packages/sql/wrangler.toml <d1-target> \
  --command "UPDATE Games
             SET attendance = 9726
             WHERE season = 1967 AND match_date = '1967-08-19';
             SELECT changes() AS affected_rows;"
```

For each confirmed starter, generate a UUID. Use this AttributeValue shape,
replacing placeholders:

```json
{
  "id": { "S": "new-uuid" },
  "Date": { "S": "1967-08-19" },
  "Season": { "S": "1967" },
  "Opposition": { "S": "Torquay United" },
  "Competition": { "S": "League" },
  "Name": { "S": "Confirmed player name" },
  "Number": { "S": "8" },
  "SubTime": { "NULL": true },
  "YellowCard": { "NULL": true },
  "RedCard": { "NULL": true },
  "SubYellow": { "NULL": true },
  "SubRed": { "NULL": true }
}
```

Add `"SubbedBy": { "S": "Confirmed substitute name" }` only for an
asterisked starter. For a single fixture, store each payload temporarily, then
run:

```bash
aws dynamodb put-item --table-name TranmereWebAppsTable --profile <profile> --region <region> \
  --item file://<appearance-payload>.json
```

For each scorer count, insert one `TranmereWebGoalsTable` record. If the book
says `Yardley 3`, create three records with different UUIDs. Omit `Minute`,
`GoalType`, `Assist` and `AssistType`, because the source does not establish
them:

```json
{
  "id": { "S": "new-uuid" },
  "Date": { "S": "1967-08-19" },
  "Season": { "S": "1967" },
  "Opposition": { "S": "Torquay United" },
  "Scorer": { "S": "Confirmed scorer name" }
}
```

Write it with:

```bash
aws dynamodb put-item --table-name TranmereWebGoalsTable --profile <profile> --region <region> \
  --item file://<goal-payload>.json
```

For a confirmed season import, use a small temporary orchestrator that invokes
the Wrangler D1 and AWS CLIs and supports dry-run and apply modes. It must:

1. Run the season-level validations above before either mode reports a result.
2. Run one D1 `UPDATE Games ... WHERE season = ? AND match_date = ?` per
   attendance and verify that each update affects exactly one row; never insert
   or bulk-replace game records.
3. Send appearance items to `TranmereWebAppsTable` through
   `aws dynamodb batch-write-item` in chunks of at most 25 `PutRequest`s.
4. Send goal items to `TranmereWebGoalsTable` the same way, one item per goal.
5. Require `UnprocessedItems` to be empty after every batch; stop and report
   the affected chunk otherwise.

## 5. Verify and report

For one fixture, re-run the D1 game query and the two DynamoDB date-specific
reads. For a season sheet, query D1 `Games` once by `season` and query each
DynamoDB table once by `Season`; verify every imported date: attendance matches
the scan, exactly 11 appearances exist, each `SubbedBy` matches an asterisk,
and the goal count matches the scorer summary. Report totals, the canonical
player-name map and any source limitations.

Do not modify `TranmereWebPlayerSeasonSummaryTable`; it is derived from apps
and goals by the existing update job.
