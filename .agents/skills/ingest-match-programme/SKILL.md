---
name: ingest-match-programme
description: Download, crop and ingest a Tranmere match programme image from a URL into Cloudflare R2, then update the existing D1 Games programme_path. Use when asked to add or replace a programme image for a known fixture. Do not use for PDF ingestion or metadata-only programme edits.
---

# Match programme ingestion

Use this skill for one image URL and one existing Tranmere-Web game. The result
is a cropped PNG in the `tranmere-web-images` R2 bucket and a relative
`Games.programme_path` such as `2026-27/2026-08-15.png`.

Run commands from the repository root. Use `npx wrangler` and
`packages/sql/wrangler.toml` for every D1 operation. Production writes use
`--remote`; local review uses
`--local --persist-to=packages/site/.wrangler/state`. Uploading to remote R2 and
updating remote D1 require explicit user authorisation.

## 1. Confirm the fixture

Require an image URL and an exact `YYYY-MM-DD` match date. Query the intended D1
target before downloading anything:

```bash
npx wrangler d1 execute tranmere-web \
  --config packages/sql/wrangler.toml <d1-target> --json \
  --command "SELECT id, season, match_date, home_team, away_team, opposition, programme_path FROM Games WHERE match_date = '2026-08-15' ORDER BY id;"
```

Require exactly one row and use its `season` and `match_date`; do not infer the
season from today's date. Stop if the fixture is absent or ambiguous. If
`programme_path` already contains a value other than blank or `#N/A`, report it
and stop unless the user explicitly authorised replacement.

The D1 `season` is the opening year. Convert it to a folder named
`YYYY-YY`: `2026` becomes `2026-27`, and `1999` becomes `1999-00`. The object
key and D1 value must be `<season-folder>/<match-date>.png`.

## 2. Download and crop

Create a temporary directory with `mktemp -d`, then run the bundled helper:

```bash
node .agents/skills/ingest-match-programme/scripts/prepare-programme-image.mjs \
  --url '<image-url>' \
  --output '<temporary-directory>/2026-08-15.png'
```

The helper follows HTTP redirects, limits downloads to 50 MB, honours image
orientation, removes near-white outer margins and always writes PNG. Its JSON
output reports original and cropped dimensions plus the SHA-256 hash. If white
space remains, rerun with a larger `--threshold` value; the default is `12` and
the accepted range is `0` to `255`.

Inspect the prepared image visually before uploading. Reject a blank result,
an image cropped into the programme artwork, an unrelated image, or a crop that
still has material white borders. Do not alter the programme content beyond
rotation, whitespace removal and PNG conversion.

## 3. Upload to R2

Upload the checked file under the exact object key. For production:

```bash
npx wrangler r2 object put \
  'tranmere-web-images/2026-27/2026-08-15.png' \
  --remote \
  --file '<temporary-directory>/2026-08-15.png' \
  --content-type 'image/png' \
  --cache-control 'public, max-age=31536000, immutable'
```

Do not include the bucket name in `programme_path`. If replacing an existing
programme, retain the same deterministic key unless the user requested a
different path.

Verify the remote object by downloading it to a second temporary filename and
comparing its SHA-256 hash with the helper output:

```bash
npx wrangler r2 object get \
  'tranmere-web-images/2026-27/2026-08-15.png' \
  --remote \
  --file '<temporary-directory>/verified.png'
```

Stop before changing D1 if upload or verification fails.

## 4. Update D1

Update only the existing game's `programme_path`. Match by both the confirmed
game ID and date, then require exactly one affected row:

```bash
npx wrangler d1 execute tranmere-web \
  --config packages/sql/wrangler.toml <d1-target> \
  --command "UPDATE Games SET programme_path = '2026-27/2026-08-15.png' WHERE id = '<confirmed-id>' AND match_date = '2026-08-15'; SELECT changes() AS affected_rows;"
```

If the upload succeeds but the D1 update fails, report the orphaned R2 key and
retry only the D1 update after resolving the failure. Do not silently upload a
second object or delete the verified object.

## 5. Verify and report

Read the game back from D1 and require its stored value to equal the object key:

```bash
npx wrangler d1 execute tranmere-web \
  --config packages/sql/wrangler.toml <d1-target> --json \
  --command "SELECT id, season, match_date, opposition, programme_path FROM Games WHERE id = '<confirmed-id>';"
```

Report the fixture, R2 bucket and object key, original and cropped dimensions,
and final D1 `programme_path`. Remove only the temporary files created for this
run.
