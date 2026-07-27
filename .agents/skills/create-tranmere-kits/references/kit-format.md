# Kit SVG format

## Composition order

The generated avatar route composes fragments in this order:

1. background;
2. hair background;
3. main kit;
4. body and neck;
5. hair;
6. facial features;
7. separate collar.

Anything in the main kit that overlaps the neck is covered by the body. Place visible neckline trim in the separate collar SVG.

## Key paths

- Main kits: `packages/site/public/builder/kits/home/<kit-id>.svg`
- Collars: `packages/site/public/builder/kits/home/collars/<kit-id>.svg`
- Selector: `packages/site/components/apps/PlayerAvatarBuilder.tsx`
- Composition route: `packages/site/app/builder/[kit]/[hair]/[body]/[features]/[hairColour]/[neckColour]/[background]/[highlights]/route.ts`

Use `packages/site/public/builder/kits/home/2026.svg` and its collar as a concise modern example. Older files may contain large traced crest and sponsor paths; reuse them only when they match the requested design.

## Canonical Tranmere crest

Use the detailed crest fragment already embedded in
`packages/site/public/builder/kits/home/2025.svg` by default. Copy the complete
group directly into the new kit SVG, beginning:

```svg
<g stroke="null" transform="matrix(0.871337 0 0 0.671184 -1739.06 -1277.91)" id="tranmere-crest">
```

and ending at its matching closing `</g>` immediately before
`<g id="sponsor">`. This is the canonical fragment supplied for future kits;
the same group also appears in several recent kit SVGs.

- Always inline the complete group and all nested paths in each kit SVG.
- Never use `<use href="...">`, `<use xlink:href="...">`, `<image>`, or another
  external reference for the crest. The builder composes SVG fragments, and
  cross-file references may disappear when the result is embedded or optimized.
- Preserve every nested path, fill colour, and the outer transform unless the
  requested shirt needs a deliberate placement adjustment.
- Move or resize the complete crest by changing only the outer transform or by
  wrapping the fragment in a new transform group.
- Keep `id="tranmere-crest"` on the outer semantic group.
- Do not redraw the crest as a simplified shield when this fragment can be
  reused.
- Fall back to a simplified crest only if the canonical fragment is missing,
  corrupt, or demonstrably fails to render in the composed avatar. State the
  reason when falling back.

## Canvas landmarks

- Canvas: 512×512
- Neck and collar area: roughly `x=195–318`, `y=307–390`
- Shirt centre: `x=256`
- Chest mark area: roughly `y=350–410`
- Sponsor area: roughly `y=400–470`
- Sleeve cuffs: roughly `y=458–480`
- Shirt hem: `y=512`

Start from the existing silhouette:

```svg
<path d="m255.742 313.009h44l98.846 21.665c27.533 6.035 47.154 30.421 47.154 58.609v85.726h-66v33h-248v-33h-66v-85.726c0-28.188 19.621-52.574 47.154-58.609l98.846-21.665h44z"/>
```

Clip broad stripes and patterns to this silhouette.

## Naming and season labels

- Use the starting season year as the kit ID, such as `2026`.
- Add suffixes where needed: `A` for away, `T` for third, and `gk` for goalkeeper, following existing files.
- Label the selector with the full season and role, for example `2026-27 Home`.

## Visual QA

Check these failure modes:

- a collar hidden behind the avatar neck;
- patterns escaping the shirt silhouette;
- centre stripes stopping below the collar;
- kitmaker and crest sitting at visibly different heights;
- sponsor strokes crossing letters;
- default white artwork disappearing against a white standalone page;
- remote asset loading preventing local preview;
- IDs colliding with other composed SVG fragments.
