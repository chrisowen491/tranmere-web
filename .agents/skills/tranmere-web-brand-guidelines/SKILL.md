---
name: tranmere-web-brand-guidelines
description: Apply Tranmere-Web's established archive UI language when designing or changing site pages, React components, result lists, player tables, match reports, team sheets, honours, filters, statistics and calls to action. Use for any visual or interaction work in packages/site that should match the Results, Match and Players pages.
---

# Tranmere-Web Brand Guidelines

Build on the existing archive design rather than introducing a separate visual style. Read [references/ui-patterns.md](references/ui-patterns.md) before making a substantial UI change.

## Workflow

1. Inspect the closest existing page or component before writing JSX. Prefer reuse or extension over a parallel component.
2. Start with the page shell: `max-w-7xl`, responsive `px-6 sm:px-10 lg:px-12`, navy ink text, and generous vertical rhythm.
3. Make the key archive fact immediately scannable: score, player, record, achievement or season.
4. Use a small uppercase blue eyebrow above a display heading. Use `font-display` for headings and `font-mono` for metadata, labels, scores and compact numbers.
5. Use responsive disclosure: keep the identity, key statistic and primary link on mobile; hide supporting table columns with `md:` or `lg:` rather than making text too small.
6. Make every archive entity actionable: player names link to `/page/player/<name>`, matches to `/match/<season>/<date>`, and opposition to `/games/<opposition>` or its dossier where applicable.
7. Run the narrowest relevant lint command. Run the site build for structural changes.

## Non-negotiable visual rules

- Use the existing palette and state colours from the reference. Do not add arbitrary brand colours, rounded-pill UIs, gradients or heavy shadows.
- Use sharp or near-sharp bordered panels. Standard surfaces are `bg-[#fffdf8]`, `bg-[#e8e2d6]`, and `border-[#071a2b]/15`; standard ink is `#071a2b`.
- Use blue (`text-blue-700`, `bg-blue-700`, or navy `bg-[#071a2b]`) for archive emphasis and interactive focus.
- Keep hover states restrained: pale blue table rows, cream link tiles, or a darker state colour.
- Retain semantic HTML: real tables for rankings/results; definition lists for concise match facts; headings and labelled navigation for archive groups.
- Keep accessible labels and meaningful image alt text. Decorative icons require `aria-hidden`.

## Build common archive elements

Follow the exact patterns and tokens in [references/ui-patterns.md](references/ui-patterns.md) for:

- results, score links, home/away/neutral labels and W/D/L states;
- player avatars, profile links, positions and ranking rows;
- match headers, programme artwork, facts, scorers and penalties;
- team sheets, substitutions and player status markers;
- honours, relegations and milestone callouts;
- filters, empty states, archive navigation and summary metrics.

## Source of truth

- Results table: `packages/site/components/apps/partials/ResultTable.tsx`
- Match report and team sheet: `packages/site/components/apps/MatchReport.tsx`
- Player archive: `packages/site/components/apps/PlayerSearch.tsx`
- Honours data and wording: `packages/lib/src/honours-constants.ts`

If a proposed UI conflicts with these conventions, preserve the existing pattern unless the user explicitly asks for a design-system change.
