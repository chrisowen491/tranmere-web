---
name: tranmere-avatar-builder
description: Create a suitable, shareable Tranmere Rovers-inspired player avatar with Tranmere-Web’s Avatar Studio. Use when asked to turn a player description, an attached photo, or public web photo references into a stateless avatar URL and inline preview; use for real players, historical players, fan-made players, and fictional Rovers characters.
---

# Tranmere Avatar Builder

Create a visual likeness from the available controls, then render the generated SVG directly in chat. Do not claim photorealistic accuracy: this is a stylised portrait with limited features.

## Gather the best available reference

Use these sources in order:

1. Use a user-provided written description when it is specific enough.
2. Inspect an attached photo when one is supplied. Treat it as reference only; the builder does not need the file.
3. If asked to find a reference, search the web for a clear, recent-facing image of the named player. Prefer official club, league, or reputable editorial sources. State briefly if the visual reference is uncertain.

Do not infer protected characteristics beyond what is visibly apparent. Do not use a real person’s image to make a deceptive impersonation; frame results as a fan-made, stylised likeness.

## Build the avatar

1. Use the `control-browser` skill and open `https://www.tranmere-web.com/players/avatar-builder`.
2. Inspect the visible controls before choosing values. The page currently provides Kit, Skin, Neck, Hair Shape, Hair Colour, Hair Highlights, Facial Feature, and Background.
3. Match the most distinctive visible traits first: skin tone, hair shape/length, hair colour, facial hair, then kit era. Set Background to `Transparent` by default. Use white or another background only when the user requests it.
4. For a real Tranmere player, choose the kit era that fits the requested period. If no period is supplied, use the current home kit. For a fictional fan character, use the current home kit unless requested otherwise.
5. Change the controls through the visible UI. Do not construct or guess an SVG URL from parameter values.
6. Read the `Open your SVG` link after the preview updates. Record its exact href and open it to verify that it renders the finished SVG. This is the stateless sharing link.

## Return the result

Return a concise result containing:

- A one-sentence note on the likeness choices.
- The actual avatar image embedded with Markdown: `![Tranmere-style avatar](<verified-svg-url>)`.
- A direct, clickable link to the verified SVG, labelled `Open the full-size SVG`.

Always return the direct SVG link, even when the inline image renders successfully. The link is the reliable stateless handoff if a chat client does not render SVGs.

Do not save, apply, publish, or change any player profile. If the user asks for revisions, adjust the builder controls and return a newly verified URL.
