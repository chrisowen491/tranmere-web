---
name: create-contentful-blog-post
description: Research, write, create, and optionally publish TranmereWeb blog posts in the connected Contentful space. Use when asked to draft or create a Tranmere Rovers news, signing, match, history, player, kit, or club blog post; populate the `blogPost` content type; revise a proposed post before creation; or publish a newly created blog entry.
---

# Create Contentful Blog Post

Create accurate, readable posts for TranmereWeb while keeping live Contentful changes within the user's requested scope.

## Contentful target

- Space: `TranmereWeb` (`pz711f8blqyy`)
- Environment: `master`
- Content type ID: `blogPost`
- Locale: `en-GB`
- Create new entries as drafts unless the user explicitly asks to publish or clearly requests a live post.

## Workflow

1. Identify the subject, intended angle, and any supplied source material.
2. For current news or claims that may have changed, browse before writing:
   - Prefer Tranmere Rovers' official announcement.
   - Use the player's current or former club, league, governing body, or another primary source for corroboration.
   - Use reputable reporting when a primary source is unavailable.
   - Distinguish confirmed facts from analysis. Do not turn rumours into facts.
3. Search `blogPost` entries for the proposed slug and closely matching titles before creating anything. If a likely duplicate exists, stop and report it unless the user explicitly wants another entry.
4. Draft in British English and match a concise, informed supporter-site voice.
5. Validate names, dates, contract length, former club, competition, statistics, and quotations against the sources. Paraphrase by default. Use direct quotations only when verified and useful.
6. Create the entry with the Contentful connector and `en-GB` field values.
7. Confirm the returned entry ID and status. Publish only when authorised.
8. Report the title, slug, entry ID, and draft/published state. Link the most important sources used.

## Field mapping

Populate:

- `title`: Clear headline in sentence case.
- `slug`: Lowercase kebab-case; keep it stable and descriptive.
- `description`: One-sentence summary suitable for cards and metadata.
- `blog`: Valid Contentful Rich Text document.
- `author`: Use a user-supplied byline; otherwise use `TranmereWeb`.
- `datePosted`: ISO date (`YYYY-MM-DD`), normally the announcement or publication date.
- `tags`: Three to five useful labels, including the main person/topic and category.

Leave `pic`, `gallery`, `galleryTag`, `blocks`, and `cardBlocks` unset unless the user supplies assets or explicitly requests them. Never invent or reuse an asset without confirming it depicts the subject and is appropriate to use.

## Article structure

Use this flexible default:

1. A direct opening paragraph stating the news.
2. Two or three paragraphs of verified background and relevant achievements.
3. A short descriptive subheading when it improves scanning.
4. One or two paragraphs explaining the significance for Tranmere without overstating certainty.
5. A brief closing line.

Keep routine signing posts around 300–500 words unless the user asks for another length. Avoid filler, generic transfer clichés, unsupported tactical claims, and declaring a signing successful before the player has featured.

## Rich Text rules

Create `blog` as a Contentful Rich Text document:

```json
{
  "nodeType": "document",
  "data": {},
  "content": []
}
```

Use `paragraph`, `heading-2`, `heading-3`, `ordered-list`, `unordered-list`, and `blockquote` nodes only when useful. Every text node must contain `nodeType`, `value`, `marks`, and `data`. Keep the entry title out of the Rich Text body; begin with the story rather than repeating the headline.

## Safety checks

- Treat entry creation, editing, publishing, and asset attachment as separate actions.
- Do not publish merely because the user asked to create or draft a post.
- Do not overwrite a likely duplicate or existing entry without explicit authorisation.
- Do not include private personal information, speculation presented as fact, or unverified allegations.
- If reliable sources conflict on a material fact, omit the claim or tell the user before creating the entry.

## Completion checklist

- Current claims were researched.
- Names, dates, statistics, and contract details were verified.
- No duplicate title or slug exists.
- All fields use `en-GB`.
- The slug is unique and kebab-case.
- Rich Text is valid.
- The entry state matches the user's authorisation.
