---
name: create-contentful-player
description: Research, create, complete, and optionally publish TranmereWeb player profiles in the connected Contentful space. Use when asked to add a Tranmere Rovers player, create a `player` entry, fill missing player details or biography fields, apply the standard avatar, or publish a completed player profile.
---

# Create Contentful Player

Create verified, consistent TranmereWeb player profiles while keeping live Contentful changes within the user's requested scope.

## Contentful target

- Space: `TranmereWeb` (`pz711f8blqyy`)
- Environment: `master`
- Content type ID: `player`
- Locale: `en-GB`
- Default `picLink`: `https://www.tranmere-web.com/builder/2026/simple/ffd3b3/none/000000/fcb98b/none/8e740c`
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
6. Use the default `picLink` unless the user supplies a different avatar URL.
7. Re-read an existing entry immediately before updating and pass its current `sys.version`.
8. Confirm the returned entry ID and state. Publish only when authorised.

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

## Safety checks

- Treat creating, updating, and publishing as separate actions.
- Do not publish merely because the user asked to create or complete a player.
- Do not overwrite an existing profile without clear authorisation.
- Do not invent a birthplace, date of birth, preferred foot, height, or career fact.
- Attribute conflicting facts in the final response or omit them from Contentful.
- Do not replace a supplied avatar with the default.

## Completion checklist

- No unintended duplicate exists.
- Current details were researched when needed.
- All included facts are supported.
- All fields use `en-GB`.
- Date of birth uses ISO format.
- Position and foot match allowed values.
- Biography is valid Rich Text.
- `picLink` uses the supplied URL or default avatar.
- Entry state matches the user's authorisation.
- Final response includes the entry ID, state, populated fields, and key sources.
