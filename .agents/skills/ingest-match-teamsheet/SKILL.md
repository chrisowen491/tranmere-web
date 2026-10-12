---
name: ingest-match-teamsheet
description: Upload a Tranmere match teamsheet image to Cloudflare R2 and link it to an existing D1 game. Use for a supplied local image or image URL and a known fixture; do not use to transcribe line-ups or ingest season-book statistics.
---

# Match teamsheet ingestion

Store the supplied teamsheet in the `tranmere-web-images` R2 bucket and set only
the existing game's `Games.teamsheet_path`. The key is
`teamsheets/<season>/<match-date>.jpg`, where `<season>` is the **opening year
stored in D1**, not a `YYYY-YY` folder. For the 9 September 2017 Barrow game,
the key and D1 value are `teamsheets/2017/2017-09-09.jpg`; the public image URL
is `https://img.tranmere-web.com/teamsheets/2017/2017-09-09.jpg`.

Work from the repository root. Use `npx wrangler` with
`packages/sql/wrangler.toml`. Choose `--remote` for a user-requested production
upload, or `--local --persist-to=packages/site/.wrangler/state` for a local
review. Do not perform production writes without a request or prior
authorization that covers this fixture.

## Confirm the game and source

Resolve the fixture to one exact `YYYY-MM-DD` date. Query D1 before uploading:

```bash
npx wrangler d1 execute tranmere-web --config packages/sql/wrangler.toml \
  <d1-target> --json \
  --command "SELECT id, season, match_date, home_team, away_team, opposition, teamsheet_path FROM Games WHERE match_date = '2017-09-09' ORDER BY id;"
```

Require exactly one game and check the source's visible date, clubs and home/
away arrangement against it. Do not infer the season folder from the calendar
year alone. If the game is absent, ambiguous or contradicted by the image,
stop and resolve the mismatch. If `teamsheet_path` is already populated, check
the existing image and replace it only when the user requested replacement.

The source can be a local file or an image URL. Preserve names, shirt numbers,
handwriting and annotations. Do not use generative image editing to recreate
text. If the image is unreadable, ask for a clearer scan. A teamsheet can be any
aspect ratio and need not resemble a programme cover.

## Prepare and upload the JPEG

Use [scripts/prepare-teamsheet-image.mjs](scripts/prepare-teamsheet-image.mjs)
to make an upright JPEG while preserving the visible content. Supply exactly one of
`--file` and `--url`:

```bash
node .agents/skills/ingest-match-teamsheet/scripts/prepare-teamsheet-image.mjs \
  --file '/path/to/source.jpg' --output '/tmp/2017-09-09-teamsheet.jpg'
```

The helper limits URL downloads to 50 MB, applies EXIF orientation, converts
to high-quality JPEG and reports dimensions and SHA-256. Inspect the prepared
image at readable size before uploading. Build the key from the confirmed D1
row. First check whether that R2 key exists by trying `r2 object get` to a
temporary file. If its bytes match, reuse it. If it differs, overwrite only
when the user requested replacement; otherwise stop. Treat only a confirmed
"object not found" response as an absent key; resolve authentication or network
errors before proceeding. For a new or authorized replacement, upload as
`image/jpeg`:

```bash
npx wrangler r2 object put \
  'tranmere-web-images/teamsheets/2017/2017-09-09.jpg' \
  --config packages/sql/wrangler.toml --remote \
  --file '/tmp/2017-09-09-teamsheet.jpg' \
  --content-type image/jpeg \
  --cache-control 'public, max-age=31536000, immutable'
```

Download the same R2 key to a different temporary filename and compare SHA-256
(or use `cmp`) against the prepared file:

```bash
npx wrangler r2 object get \
  'tranmere-web-images/teamsheets/2017/2017-09-09.jpg' \
  --config packages/sql/wrangler.toml --remote \
  --file '/tmp/verified-2017-09-09-teamsheet.jpg'
```

Stop before updating D1 if the upload or comparison fails. If replacing an
image at the same key, check the public URL after uploading because caches may
still serve the old copy.

## Link and verify

Update only `teamsheet_path`, guarded by the confirmed ID, season and date.
For a new link, also guard against overwriting a populated path:

```bash
npx wrangler d1 execute tranmere-web --config packages/sql/wrangler.toml \
  --remote --json \
  --command "UPDATE Games SET teamsheet_path = 'teamsheets/2017/2017-09-09.jpg' WHERE id = '<confirmed-id>' AND season = 2017 AND match_date = '2017-09-09' AND (teamsheet_path IS NULL OR TRIM(teamsheet_path) = '' OR teamsheet_path = '#N/A'); SELECT changes() AS affected_rows;"
```

Require `affected_rows = 1`. For an authorized replacement, use the exact
previous path in the guard instead. If the existing D1 path already equals the
verified key, leave D1 unchanged. Read the game back and confirm the saved path
equals the verified R2 key. If D1 fails after a successful upload, report the
orphaned key and retry only the D1 update after resolving the failure.
Report the fixture, source and final dimensions, R2 key and D1 value. Remove
only temporary files created for this run.
