---
name: create-tranmere-kits
description: Create, edit, and integrate Tranmere Rovers kit SVGs for this repository's player avatar builder. Use when adding a home, away, third, or goalkeeper shirt from a photo or historical reference; correcting kit colours, stripes, collars, sponsors, crests, manufacturers, cuffs, or alignment; adding a season to the kit selector; or validating a kit through the `/builder/...` SVG route.
---

# Create Tranmere Kits

Create kit artwork that matches the repository's established 512×512 layered avatar format and works locally before deployment.

## Workflow

1. Inspect the supplied reference image with the image viewer. Identify:
   - base colour and silhouette;
   - collar shape and trim;
   - central, side, shoulder, and sleeve patterns;
   - manufacturer, crest, and sponsor placement;
   - texture or gradient details that remain legible at avatar scale.
2. Inspect the closest existing SVGs in `packages/site/public/builder/kits/home/`. Prefer recent kits with a similar construction.
3. Read [references/kit-format.md](references/kit-format.md) before creating or substantially restructuring artwork.
4. Inline the canonical detailed Tranmere crest fragment described in [references/kit-format.md](references/kit-format.md) by default.
5. Create the main kit as `packages/site/public/builder/kits/home/<kit-id>.svg`.
6. If the collar must appear over the avatar neck, create `packages/site/public/builder/kits/home/collars/<kit-id>.svg`. The route layers this after the body.
7. Add a labelled option to the `kit` selector in `packages/site/components/apps/PlayerAvatarBuilder.tsx`.
8. Ensure the builder route loads the main kit and collar from local static assets. Do not make a newly created kit depend on its presence on a remote Git branch.
9. Render the complete avatar at:

   `/builder/<kit-id>/simple/ffd3b3/none/000000/fcb98b/LightGray/8e740c`

10. Compare the complete avatar with the reference. Iterate on alignment and visibility at the rendered size.
11. Format changed TypeScript files and run the site production build.

## SVG rules

- Preserve the exact root: `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">`.
- Keep artwork inside the established shirt silhouette and 512×512 canvas.
- Use stable, kit-prefixed IDs for new definitions, patterns, and clipping paths to avoid collisions when SVG fragments are composed.
- Group semantic layers with IDs such as `shirt`, `collar`, `kitmaker`, `tranmere-crest`, and `sponsor`.
- Prefer the repository's detailed canonical `tranmere-crest` group over a hand-drawn or simplified shield.
- Copy the complete crest group into every kit SVG. Never reference a crest in another file with `<use>`, `href`, `xlink:href`, an external image, or a URL.
- Put neck-overlapping collar artwork in the separate collar SVG.
- Keep important marks clear at the small avatar scale. Simplify fine photographic detail deliberately.
- Use SVG-native paths, shapes, patterns, and text. Do not embed raster images.
- Preserve sponsor and crest proportions, but avoid claiming an exact logo reproduction when only a low-resolution reference is available.
- Use `unoptimized` rendering where the existing component already expects generated SVG URLs.

## Editing existing kits

- Make the smallest targeted change that satisfies the request.
- Move a complete mark with a group `transform`, rather than changing every child coordinate.
- Remove decorative strokes that harm sponsor legibility.
- Test changes using a cache-busting query such as `?v=2`.
- Inspect the full composed avatar, not only the standalone shirt SVG.

## Validation

- Confirm the selector contains the new option.
- Confirm the standalone SVG loads from `/builder/kits/home/<kit-id>.svg`.
- Confirm the composed builder route returns an SVG with the shirt, body, hair, and collar visible.
- Confirm the kit contains the crest paths inline and has no external crest reference.
- Check desktop and builder-preview rendering for clipping, unintended white gaps, layer-order errors, or sponsor overlap.
- Run `yarn workspace @tranmere-web/site build`.
