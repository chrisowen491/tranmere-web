---
name: create-contentful-player
description: Research, create, complete, and optionally publish TranmereWeb player profiles and accurate avatar-builder likenesses in the connected Contentful space. Use when asked to add a Tranmere Rovers player, create a `player` entry, fill missing player details or biography fields, create or refine a player avatar, apply the standard avatar, or publish a completed player profile.
---

# Create Contentful Player

Create verified, consistent TranmereWeb player profiles while keeping live Contentful changes within the user's requested scope.

## Contentful target

- Space: `TranmereWeb` (`pz711f8blqyy`)
- Environment: `master`
- Content type ID: `player`
- Locale: `en-GB`
- Default outfield `picLink`: `https://www.tranmere-web.com/builder/2026/simple/ffd3b3/none/000000/fcb98b/none/8e740c`
- Default goalkeeper `picLink`: `https://www.tranmere-web.com/builder/2026gk/simple/ffd3b3/none/000000/fcb98b/none/8e740c`
- Avatar background: always use transparent (`none`).
- Create entries as drafts unless the user explicitly asks to publish.

## Workflow

1. Search `player` entries for the exact player name and likely name variants. If a likely duplicate exists, update it only when the user requested an update; otherwise stop and report it.
2. Research current player details when the user has not supplied them:
   - Prefer Tranmere Rovers, the player's current or former club, the EFL, the FA, or another primary source.
   - Use a reputable player database only for details not available from primary sources.
   - Cross-check uncertain birth details, position, height, preferred foot, career history, and statistics.
3. Populate only verified facts. Omit unknown fields rather than guessing.
4. Write a short neutral biography in British English.
5. Create or update the entry with all values under `en-GB`.
6. Create an accurate avatar from a current reference photo when a clear image is available. Use the default `picLink` only as a placeholder when the user requests it or a reliable likeness cannot be made.
7. Preview the final avatar visually before applying its URL.
8. Re-read an existing entry immediately before updating and pass its current `sys.version`.
9. Confirm the returned entry ID and state. Publish only when authorised.

## Field mapping

Populate these fields when known:

- `name`: Full commonly used playing name.
- `dateOfBirth`: ISO date (`YYYY-MM-DD`).
- `biography`: Contentful Rich Text document containing one to three concise paragraphs.
- `picLink`: User-supplied URL or the default avatar URL above.
- `foot`: Exactly `Right` or `Left`.
- `height`: Preserve the repository's existing display convention; otherwise use a concise metric value such as `1.88m`.
- `placeOfBirth`: Town or city, adding the country only when it prevents ambiguity.
- `position`: Use the closest allowed value:
  - `Goalkeeper`
  - `Striker`
  - `Winger`
  - `Central Defender`
  - `Central Midfielder`
  - `Full Back`

If the player's role does not map cleanly, choose the best supported primary position only when reasonable; otherwise leave `position` unset and report the limitation.

## Biography

Write a factual supporter-site profile, normally 80–180 words:

1. State nationality or birthplace, playing position, and when the player joined Tranmere when verified.
2. Summarise academy and senior career chronologically.
3. Mention a small number of relevant achievements, promotions, honours, international representation, or meaningful statistics.

Avoid transfer clichés, subjective scouting claims, exhaustive season-by-season statistics, rumours, private information, and unsupported assertions. Do not repeat fields mechanically or describe future success as certain.

Create `biography` as Contentful Rich Text:

```json
{
  "nodeType": "document",
  "data": {},
  "content": [
    {
      "nodeType": "paragraph",
      "data": {},
      "content": [
        {
          "nodeType": "text",
          "value": "Biography text.",
          "marks": [],
          "data": {}
        }
      ]
    }
  ]
}
```

Every text node must contain `nodeType`, `value`, `marks`, and `data`.

## Avatar workflow

Build the avatar URL as:

`https://www.tranmere-web.com/builder/<kit>/<hair>/<skin>/<feature>/<hair-colour>/<neck-colour>/<background>/<highlights>`

1. Find a recent, front-facing reference:
   - Prefer an official Tranmere, current-club, former-club, league, or national-team portrait.
   - Use image search to locate candidates, then inspect the original authoritative page.
   - Prefer even lighting, a direct head position, and an unobstructed view of the hair and face.
2. Record the visible traits before opening the builder:
   - skin and neck tone;
   - hair silhouette, length, texture, parting, fringe, braids, locks, or hairline;
   - dominant hair colour and highlights;
   - beard, moustache, stubble, brows, or other prominent feature.
3. Open `/player-builder` in the browser and inspect the available control values. Do not infer that a named hair option matches from its name alone.
4. Select the kit from the player's verified position:
   - use `2026` for every outfield player;
   - use `2026gk` when `position` is `Goalkeeper`;
   - use another kit only when the user explicitly requests it.
5. Match the broad silhouette first:
   - choose skin and neck colours as a visually compatible pair;
   - compare likely hair shapes in rendered previews;
   - add only one facial-feature layer, prioritising the most recognisable trait;
   - keep black hair as `000000` unless the reference clearly supports another colour;
   - set the background segment to `none` for transparency; do not use `LightGray` or `White`.
6. Open the generated SVG URL and visually compare it with the reference. Check hair outline, skin/neck consistency, facial-hair weight, and kit rendering.
7. Iterate over a small number of strong candidates. Change one control at a time so the effect is clear. Prefer the closest overall silhouette over extra detail.
8. Show the best avatar to the user when likeness is subjective or the user is actively refining it. Apply requested corrections exactly, such as a named hair shape.
9. Set `picLink` to the final absolute builder URL. Re-read and version-check an existing Contentful entry immediately before updating.
10. Keep the entry as a draft or changed entry unless publication is explicitly authorised.

The builder is stylised and has a limited feature set. Describe the result as the closest available match, not an exact likeness. Never modify builder SVG assets merely to complete a player profile unless the user separately asks for a new builder feature.

## Safety checks

- Treat creating, updating, and publishing as separate actions.
- Do not publish merely because the user asked to create or complete a player.
- Do not overwrite an existing profile without clear authorisation.
- Do not invent a birthplace, date of birth, preferred foot, height, or career fact.
- Attribute conflicting facts in the final response or omit them from Contentful.
- Do not replace a supplied avatar with the default.
- Do not reuse another player's custom avatar URL as a shortcut.
- Do not apply an unpreviewed avatar or claim that a stylised result is exact.
- Do not save a player avatar with an opaque background.
- Do not use the outfield kit for a goalkeeper or the goalkeeper kit for an outfield player.

## Completion checklist

- No unintended duplicate exists.
- Current details were researched when needed.
- All included facts are supported.
- All fields use `en-GB`.
- Date of birth uses ISO format.
- Position and foot match allowed values.
- Biography is valid Rich Text.
- `picLink` uses the supplied URL, a visually verified custom avatar, or the default placeholder.
- Custom avatar was compared with a current authoritative reference.
- Hair, skin, neck, feature, and kit parameters were previewed together.
- Builder URL uses `2026gk` for a goalkeeper and `2026` for every outfield position.
- Builder URL uses `none` in the background segment.
- Entry state matches the user's authorisation.
- Final response includes the entry ID, state, populated fields, and key sources.
