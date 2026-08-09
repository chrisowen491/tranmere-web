# Tranmere-Web UI Patterns

Use these patterns as implementation references, not a replacement for inspecting the nearest component.

## Foundation

| Purpose | Convention |
| --- | --- |
| Ink | `text-[#071a2b]` |
| Main surface | `bg-[#fffdf8]` |
| Warm table/header surface | `bg-[#e8e2d6]` |
| Archive/navy surface | `bg-[#071a2b]` |
| Archive accent | `text-blue-700`, `bg-blue-700`, `text-blue-300` on navy |
| Structural border | `border-[#071a2b]/15` |
| Desktop container | `mx-auto max-w-7xl px-6 sm:px-10 lg:px-12` |
| Label | `font-mono text-[10px]` or `text-xs`, uppercase, `tracking-[0.14em]`–`[0.16em]` |
| Heading | `font-display font-semibold tracking-[-0.04em]` |
| Number/score | `font-mono font-bold` |

Use one strong rectangular panel at a time. Borders create hierarchy; use shadows only as the existing result table does: `shadow-[5px_5px_0_rgba(7,26,43,0.08)]`.

## Archive headers and navigation

Use a blue uppercase eyebrow, display heading and muted explainer copy:

```tsx
<p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
  Player archive
</p>
<h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
  Every player. Every season.
</h1>
<p className="mt-5 max-w-2xl text-lg leading-8 text-[#071a2b]/65">…</p>
```

For a group of archive links, use a `gap-px` grid with a navy separator background and cream tiles. Each tile gets `bg-[#fffdf8] px-4 py-4 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700`.

## Results and match links

Use `ResultTable` for ordinary result lists. Do not build an alternative list if its functionality fits this component.

- Display the venue as a compact cream badge: `Home`, `Away`, or `Neutral`.
- Link the date and score to the same match path: `/match/${season}/${date}`.
- Link an opposition name to its archive path. Do not use a plain non-interactive club name where a destination exists.
- Use a four-pixel left row rule and a filled score tile for outcome:

| Outcome | Row rule | Score tile |
| --- | --- | --- |
| Win | `border-l-emerald-500` | `bg-emerald-600 hover:bg-emerald-700 text-white` |
| Draw | `border-l-amber-400` | `bg-amber-500 hover:bg-amber-600 text-white` |
| Loss | `border-l-rose-500` | `bg-rose-600 hover:bg-rose-700 text-white` |

- Use W/D/L colours as state, never as the only explanation of meaning. Keep scores/text visible.
- For record summaries, show wins in `emerald`, draws in `amber`, losses in `red`. Use pale tones for row values and stronger tones in total rows.

## Players and avatars

- Render the player avatar in a square `h-12 w-12` container with `overflow-hidden border border-[#071a2b]/10 bg-[#e8e2d6]`.
- Use `next/image`, `unoptimized`, `object-cover`, and the avatar/kit helper already used by the surrounding page. Do not obtain avatars from the legacy API.
- Link the name to `/page/player/${playerName}`. Pair it with a small arrow icon only when the surrounding table uses one.
- Put primary and secondary positions below the name in a small uppercase mono label: `Primary / Secondary`.
- If no avatar exists, use the existing `UserIcon` fallback rather than a broken image or initials overlay.
- Keep the player name and avatar visible at all breakpoints. Hide secondary metric columns first.

## Match report header and facts

- Use the split programme/summary composition from `MatchReport` for a primary match page: navy programme pane on the left, cream facts pane on the right.
- Programme pane: `bg-[#132c82]`, an inset white/20 border and `object-contain`; retain the `Match archive` label.
- Match identity is three stacked lines: competition/date label, home team, monospaced score, away team.
- Use a bordered two-column `dl` for venue and attendance. Add referee as a full-width row only when present.
- Make penalty outcomes a separate semantic badge. Use emerald for a Rovers shootout win and red for a loss.
- Display Rovers scorers as a distinct small-label/large-value block.

## Team sheets and match events

- Label the section `Team sheet` and headline it `Rovers XI`.
- Use the existing blue pitch treatment (`fantasy-pitch`, navy background, white/25 markings) and `arrangeMatchLineup`; do not substitute a generic card grid.
- Player photos are circular on the pitch and player names are links below them. Do not show positions on the pitch unless a user explicitly requests it.
- Use the existing simple event markers: yellow `h-3.5 w-2.5 bg-yellow-400`, red `bg-red-500`, and `ArrowPathIcon` in blue for substitutions.
- Put textual substitutions in a cream bordered panel beneath the pitch, with both player names linked.

## Honours, relegations and milestones

- Read `HONOURS_SEASONS` and its `kind` values before presenting achievement data. Preserve its date and wording.
- Treat `Trophy`, `Promotion`, `Play-offs` and `Cup run` as achievements using blue/navy archive emphasis and, where suitable, a trophy icon.
- Treat `Relegation` as historically important but visually distinct; use restrained rose/red text or border treatment. Do not present it with gold, trophy styling or celebratory language.
- For match milestones, use a bordered, pale-blue section and a `gap-px` list of cream, linked tiles. Use short circular mono markers (`D`, `F`, `G`, `3`, `M`) plus a plain-language description.

## Tables, filters and empty states

- Wrap data tables in `overflow-x-auto` and give the inner table a sensible minimum width. Preserve horizontal scrolling on small screens.
- Use navy table headers with muted white uppercase mono labels for result lists; use a warm cream header for ranking tables.
- Use `divide-y divide-[#071a2b]/10`, `text-sm`, and `hover:bg-blue-50/60` or `/70` row states.
- Start result/player filter controls with search, then selects. Inputs and selects use `border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-semibold` and blue focus states.
- Use a complete empty panel: bordered cream surface, display heading and a concise next action such as broadening filters or trying another season.

## Avoid

- Rounded “SaaS dashboard” cards, rainbow status schemes, dense all-caps body text, new gradients, or arbitrary iconography.
- Making a whole row a link when the component convention links its date, score, player or opposition individually.
- Breaking existing archive paths, match routes or profile routes merely to fit a new component.
- Hiding the only useful fact on mobile. Preserve the entity, outcome/key metric and primary destination.
