---
name: create-player-profile
description: Research and create verified TranmereWeb player profiles in D1 through the Tranmere-Web MCP, including accurate avatar-builder likenesses and incoming transfer records for verified new signings. Use when asked to add a Tranmere Rovers player or new signing, fill missing player details or biography fields, create or refine a player avatar, or apply the standard avatar.
---

# Create Player Profile

Create verified, consistent TranmereWeb player profiles through the Tranmere-Web MCP only. The skill does not use site admin pages.

## Target

- MCP tool: `CreatePlayerProfile` (preferred for a new profile)
- MCP read tool: `GetPlayers` (use for duplicate checks and confirmation)
- MCP tool: `CreateTransfer` (preferred for a verified new-signing transfer)
- MCP read tools: `GetTransfers` and `GetClubs` (use for transfer research and duplicate checks)
- Avatar builder: `https://www.tranmere-web.com/player-builder`
- Storage: the site `Players` D1 table
- Default outfield `picLink`: `https://www.tranmere-web.com/builder/2026/simple/ffd3b3/none/000000/fcb98b/none/8e740c`
- Default goalkeeper `picLink`: `https://www.tranmere-web.com/builder/2026gk/simple/ffd3b3/none/000000/fcb98b/none/8e740c`
- Always use a transparent avatar background (`none`).
- `CreatePlayerProfile` writes directly to D1. It requires the strict
  `write:players` Auth0 permission. There is no draft or approval stage.

## Workflow

1. Use `GetPlayers` to search for the exact player name and likely name variants. If a likely duplicate exists, stop and report it; this skill does not amend existing profiles.
2. Research missing details:
   - Prefer Tranmere Rovers, the player's current or former club, the EFL, the FA, or another primary source.
   - Use a reputable player database only for details unavailable from primary sources.
   - Cross-check uncertain birth details, position, height, preferred foot, career history, and statistics.
3. Populate only verified facts. Leave unknown optional fields blank.
4. Write a short, neutral biography in British English and Markdown.
5. Use `https://www.tranmere-web.com/player-builder` to build the best available avatar from a current reference photo when a clear image is available. Use the default `picLink` only when the user requests it or a reliable likeness cannot be made.
6. SElect an appropriate kit for the player based on teh time period thye played fior Tranmere Rovers
7. Preview the final avatar visually in the player builder before entering its generated URL.
8. Call `CreatePlayerProfile` only when the user's request authorises that mutation. It requires a token containing `write:players`; if access is denied, ask the user to grant that permission rather than falling back to a direct D1 write.
9. Confirm the created player through `GetPlayers` and, when useful, open `/page/player/<encoded-name>`.
10. If the player is a verified new signing, follow the **New-signing transfer** workflow below.

Do not call Contentful for player profiles. Do not write directly to D1. Use `CreatePlayerProfile` for new records; it performs validation and exact-name duplicate checks.

## Research

When the user has not supplied the facts:

- Prefer official club, league, association, or national-team sources.
- Use primary sources for current details and reputable databases only to fill gaps.
- Cross-check conflicting dates, places, heights, feet, and positions.
- Omit uncertain information rather than guessing.
- Do not refer to Tranmere rovers playing statistics - as these are displayed elsewhere on the profile page.
- Do not refer to win % or anything like that - since this is subjective.

When browsing, keep a short source list for the final response.

## New-signing transfer

Treat a player as a new signing only when a reliable source confirms a current or forthcoming move to Tranmere Rovers. A request to create that verified new signing's profile also authorises adding the corresponding incoming transfer unless the user limits the request. Do not treat a historical player, academy promotion, trialist, rumour, contract renewal, or merely new D1 profile as a new signing.

After creating the player:

1. Use `GetTransfers` to search the transfer archive by the exact player name. Do not add a record if the same move already exists.
2. Use `GetClubs` to identify the canonical D1 club name when necessary.
3. Call `CreateTransfer` with:
   - `Player`: Use the exact D1 profile name.
   - `Season`: Use the starting year of the applicable season, following existing site records.
   - `From`: Use the verified former club. Use the clubs list's canonical name where available.
   - `To`: Use exactly `Tranmere Rovers`.
   - `Transfer date`: Use ISO format only when the effective or completion date is verified; otherwise leave it blank. Do not substitute an announcement date unless the source says the move took effect that day.
   - `Fee description`: Use `Free Transfer`, `Loan`, or `Undisclosed` only when supported. Otherwise leave it blank.
   - `Numeric cost`: Enter a verified fee as a whole number of pounds. Enter `0` for free, loan, undisclosed, or unknown fees.
4. Review that Tranmere appears on the `To` side only, then create the record only when the user's request authorises that mutation. `CreateTransfer` requires `write:transfers`; if access is denied, ask the user to grant it rather than writing directly to D1.
5. Confirm the returned transfer and verify it through `GetTransfers`.

If the former club or direction of the move cannot be verified, do not create the transfer. Report the missing evidence instead.

## MCP field mapping

- `Name`: Full commonly used playing name. Required; the MCP rejects duplicate exact names.
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
3. Open `https://www.tranmere-web.com/player-builder` and inspect the rendered controls and avatar; do not judge a hair option by its name alone.
4. Use an appropriate home kit for outfield players based on the tim e period they played for Tranmere Rovers and an appropriate kgk kit for goalkeepers unless the user requests another kit.
5. Match the broad silhouette first. Use compatible skin and neck colours, one recognisable facial-feature layer, and an appropriate hair colour.
6. If you do not have a likelness for the player set skin, neck and hair colours to `cccccc` for a gray sioluette.
7. Set the background segment to `none`.
8. Use the live player builder preview and generated SVG URL to compare the avatar visually with the reference. Iterate by changing one control at a time.
9. Show the best avatar to the user when likeness is subjective or they are actively refining it.
10. Enter the final absolute builder URL in `Picture link`.

The builder is stylised and limited. Describe the result as the closest available match, never an exact likeness. Do not modify builder SVG assets unless the user separately asks for a new builder feature.

## Safety checks

- Treat research, form preparation, and saving as separate actions.
- Do not create a profile unless the user's request authorises it.
- Do not overwrite or amend a likely duplicate; this skill is MCP-create-only.
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
- `CreatePlayerProfile` reports a successful creation.
- The saved record is returned by `GetPlayers`.
- A verified new signing has one non-duplicate incoming transfer with `To` set to `Tranmere Rovers`.
- Transfer season, former club, date, fee description, and cost follow the verified evidence and site conventions.
- The published player page was checked when practical.
- The final response identifies whether the profile was created, whether a transfer was added, the populated fields, and key sources.
