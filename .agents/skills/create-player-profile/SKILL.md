---
name: create-player-profile
description: Research, create, and update TranmereWeb player profiles in D1 through the protected player admin page, including accurate avatar-builder likenesses and incoming transfer records for verified new signings. Use when asked to add a Tranmere Rovers player or new signing, fill missing player details or biography fields, create or refine a player avatar, apply the standard avatar, or update an existing player profile.
---

# Create Player Profile

Create verified, consistent TranmereWeb player profiles through the protected admin interface.

## Target

- Admin page: `/admin/players`
- Transfer admin page: `/admin/transfers`
- Local development URL: `http://localhost:3001/admin/players`
- Storage: the site `Players` D1 table
- Default outfield `picLink`: `https://www.tranmere-web.com/builder/2026/simple/ffd3b3/none/000000/fcb98b/none/8e740c`
- Default goalkeeper `picLink`: `https://www.tranmere-web.com/builder/2026gk/simple/ffd3b3/none/000000/fcb98b/none/8e740c`
- Always use a transparent avatar background (`none`).
- Saving in the admin page writes directly to D1. There is no draft or approval stage.

## Workflow

1. Open `/admin/players` in the signed-in browser. If authentication is required, pause for the user to sign in; never bypass the admin check.
2. Search for the exact player name and likely name variants. If a likely duplicate exists, update it only when the user requested an update; otherwise stop and report it.
3. For a new profile, select **New player**. For an authorised update, select **Edit** on the exact existing record.
4. Research missing details:
   - Prefer Tranmere Rovers, the player's current or former club, the EFL, the FA, or another primary source.
   - Use a reputable player database only for details unavailable from primary sources.
   - Cross-check uncertain birth details, position, height, preferred foot, career history, and statistics.
5. Populate only verified facts. Leave unknown optional fields blank.
6. Write a short, neutral biography in British English and Markdown.
7. Create an accurate avatar from a current reference photo when a clear image is available. Use the default `picLink` only when the user requests it or a reliable likeness cannot be made.
8. Preview the final avatar visually before entering its URL.
9. Review every field in the admin form, then select **Create player** or **Save player** only when the user's request authorises that mutation.
10. Confirm the success message and search the admin list for the saved record.
11. If the player is a verified new signing, follow the **New-signing transfer** workflow below.
12. When useful, open `/page/player/<encoded-name>` and verify the published profile and transfer.

Do not call Contentful for player profiles. Do not write directly to D1 when the admin page is available; use the admin workflow so its validation, duplicate checks, and cache revalidation run.

## Research

When the user has not supplied the facts:

- Prefer official club, league, association, or national-team sources.
- Use primary sources for current details and reputable databases only to fill gaps.
- Cross-check conflicting dates, places, heights, feet, and positions.
- Omit uncertain information rather than guessing.

When browsing, keep a short source list for the final response.

## New-signing transfer

Treat a player as a new signing only when a reliable source confirms a current or forthcoming move to Tranmere Rovers. A request to create that verified new signing's profile also authorises adding the corresponding incoming transfer unless the user limits the request. Do not treat a historical player, academy promotion, trialist, rumour, contract renewal, or merely new D1 profile as a new signing.

After creating the player:

1. Open `/admin/transfers` in the same signed-in browser.
2. Search the transfer archive by the exact player name. Do not add a record if the same move already exists.
3. Complete the new transfer form:
   - `Player`: Use the exact D1 profile name.
   - `Season`: Use the starting year of the applicable season, following existing site records.
   - `From`: Use the verified former club. Use the clubs list's canonical name where available.
   - `To`: Use exactly `Tranmere Rovers`.
   - `Transfer date`: Use ISO format only when the effective or completion date is verified; otherwise leave it blank. Do not substitute an announcement date unless the source says the move took effect that day.
   - `Fee description`: Use `Free Transfer`, `Loan`, or `Undisclosed` only when supported. Otherwise leave it blank.
   - `Numeric cost`: Enter a verified fee as a whole number of pounds. Enter `0` for free, loan, undisclosed, or unknown fees.
4. Review that Tranmere appears on the `To` side only, then select **Add transfer**.
5. Confirm the success message and verify the new record in the transfer archive.

If the former club or direction of the move cannot be verified, do not create the transfer. Report the missing evidence instead.

## Admin field mapping

- `Name`: Full commonly used playing name. Required; the admin API rejects duplicate exact names.
- `Date of birth`: ISO date (`YYYY-MM-DD`).
- `Biography Markdown`: One to three concise paragraphs.
- `Picture link`: User-supplied URL, a verified builder URL, or the appropriate default avatar.
- `Foot`: Exactly `Right` or `Left`.
- `Height`: Follow existing display conventions; otherwise use a concise metric value such as `1.88m`.
- `Place of birth`: Town or city, adding the country only when it prevents ambiguity.
- `Position`: Use the closest allowed value:
  - `Goalkeeper`
  - `Striker`
  - `Winger`
  - `Central Defender`
  - `Central Midfielder`
  - `Full Back`
- `External links`: One valid `http` or `https` URL per line.

If a role does not map cleanly, choose the best-supported primary position only when reasonable; otherwise leave it blank and report the limitation.

## Biography

Write a factual supporter-site profile, normally 80–180 words:

1. State nationality or birthplace, playing position, and when the player joined Tranmere when verified.
2. Summarise academy and senior career chronologically.
3. Mention a small number of relevant achievements, promotions, honours, international representation, or meaningful statistics.

Use plain Markdown paragraphs. Avoid transfer clichés, subjective scouting claims, exhaustive season-by-season statistics, rumours, private information, unsupported assertions, and predictions.

## Avatar workflow

Build the avatar URL as:

`https://www.tranmere-web.com/builder/<kit>/<hair>/<skin>/<feature>/<hair-colour>/<neck-colour>/<background>/<highlights>`

1. Find a recent, front-facing reference from an official club, league, association, or national-team source where possible.
2. Record the visible skin and neck tone, hair silhouette and colour, facial hair, and other prominent features.
3. Open `/player-builder` and inspect rendered control values; do not judge a hair option by its name alone.
4. Use `2026` for outfield players and `2026gk` for goalkeepers unless the user requests another kit.
5. Match the broad silhouette first. Use compatible skin and neck colours, one recognisable facial-feature layer, and `000000` for black hair unless clearly inappropriate.
6. Set the background segment to `none`.
7. Open the generated SVG URL and compare it visually with the reference. Iterate by changing one control at a time.
8. Show the best avatar to the user when likeness is subjective or they are actively refining it.
9. Enter the final absolute builder URL in `Picture link`.

The builder is stylised and limited. Describe the result as the closest available match, never an exact likeness. Do not modify builder SVG assets unless the user separately asks for a new builder feature.

## Safety checks

- Treat research, form preparation, and saving as separate actions.
- Do not create or update a profile unless the user's request authorises it.
- Do not overwrite a likely duplicate without clear update authorisation.
- Do not add a transfer for a rumour, trial, renewal, academy promotion, or historical profile.
- Do not create a duplicate transfer or infer an unreported fee or effective date.
- Do not invent a birthplace, date of birth, preferred foot, height, or career fact.
- Do not replace a supplied avatar with the default.
- Do not reuse another player's custom avatar URL.
- Do not apply an unpreviewed custom avatar.
- Do not use an opaque avatar background.
- Do not use the outfield kit for a goalkeeper or the goalkeeper kit for an outfield player.

## Completion checklist

- No unintended duplicate exists.
- All included facts are supported.
- Date of birth uses ISO format.
- Position and foot use allowed values.
- Biography is concise Markdown.
- `picLink` uses the supplied URL, a visually verified custom avatar, or the correct default.
- Custom avatar was previewed with the selected hair, skin, neck, feature, kit, and transparent background.
- The admin page reports a successful save.
- The saved record appears in the admin list.
- A verified new signing has one non-duplicate incoming transfer with `To` set to `Tranmere Rovers`.
- Transfer season, former club, date, fee description, and cost follow the verified evidence and site conventions.
- The published player page was checked when practical.
- The final response identifies whether the profile was created or updated, whether a transfer was added, the populated fields, and key sources.
