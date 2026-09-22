---
name: ingest-match-programme
description: Prepare a front-on, background-free Tranmere match programme cover from an image URL, upload it to Cloudflare R2 and link it to an existing D1 game. Use when asked to add or replace a programme image for a known fixture. Do not use for PDF ingestion or metadata-only programme edits.
---

# Match programme ingestion

Use this skill for one image URL and one existing Tranmere-Web game. The result
is a straight-on PNG of the programme cover, with no surrounding background, in
the `tranmere-web-images` R2 bucket and a relative
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

## 2. Prepare and inspect the cover

Create a temporary directory with `mktemp -d`, then run the bundled helper to
download the source image and remove simple outer margins:

```bash
node .agents/skills/ingest-match-programme/scripts/prepare-programme-image.mjs \
  --url '<image-url>' \
  --output '<temporary-directory>/source.png'
```

The helper follows HTTP redirects, limits downloads to 50 MB, honours image
orientation and writes PNG. Its output reports dimensions and a SHA-256 hash.
Inspect the source before editing: where the opponent or date is printed,
confirm it matches the D1 fixture. Stop if visible details contradict it;
do not invent missing cover text.

If the cover is photographed at an angle or against a visible surface, use the
`imagegen` skill's built-in image-editing workflow with `source.png` as the edit
target. Request a head-on, rectangular view of **this cover only**, filling the
frame with no carpet, table, shadows or other background. Supply the printed
words and numbers verbatim in the prompt. Preserve the crest, artwork, colours,
typography and border; do not redesign the programme or add content. If the
source is already head-on and background-free, keep it rather than regenerating
it. A tighter crop alone is not a substitute for correcting perspective and
removing a photographed background.

Inspect the final PNG beside the source at readable size. Check every visible
date, opponent, issue number, price and heading, as well as the crest and border.
Image generation can change small text: make a targeted retry if needed, and
**do not upload** if printed details or artwork cannot be preserved faithfully.
Keep the approved final image as a workspace asset and use that exact PNG for
the R2 upload. Report that it is a reconstructed front-on view, not an original
scan. Do not silently replace the source with a plausible but inaccurate cover.

## 3. Upload to R2

Upload the checked file under the exact object key. For production:

```bash
npx wrangler r2 object put \
  'tranmere-web-images/2026-27/2026-08-15.png' \
  --remote \
  --file '<approved-final-image.png>' \
  --content-type 'image/png' \
  --cache-control 'public, max-age=31536000, immutable'
```

Do not include the bucket name in `programme_path`. If replacing an existing
programme, retain the same deterministic key unless the user requested a
different path.

Verify the remote object by downloading it to a second temporary filename and
comparing its SHA-256 hash with the approved final PNG:

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

Report the fixture, R2 bucket and object key, source and final dimensions, and
final D1 `programme_path`. Note that the published image is a front-on
reconstruction when image editing was used. Remove only the temporary files
created for this run; keep the approved workspace asset.
