# Current Features

This catalogue describes implemented Tranmere-Web features. Routes refer to the
canonical Next.js pages under `packages/site/app/`. See `ARCHITECTURE.md` for
data ownership and system boundaries.

## Home and Discovery

| Feature              | Route                  | Summary                                                                              |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Archive landing page | `/`                    | Promotes the match, player, shirt, season, manager, transfer and editorial archives. |
| On this day          | `/`                    | Surfaces matches and moments associated with the current calendar date.              |
| Site search          | Header search          | Algolia-backed search across indexed archive content.                                |
| Dynamic sitemap      | `/dynamic-sitemap.xml` | Adds database-backed archive pages to the generated XML sitemaps.                    |

## Matches, Results and Seasons

| Feature             | Route                      | Summary                                                                                                                                             |
| ------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Results archive     | `/results`                 | Searches and filters the complete results archive by season, competition, opponent and manager.                                                     |
| Match record        | `/match/[season]/[date]`   | Shows score, report, programme, attendance, officials, formation-aware team sheet, goals, cards, substitutions, comments and ratings when recorded. |
| Season index        | `/seasons`                 | Lists recorded seasons by decade while excluding the wartime seasons without matches.                                                               |
| Season review       | `/season/[season]`         | Combines results, squad statistics, most-used XI, manager, transfers, shirt and a month-by-month season timeline.                                   |
| Honours archive     | `/honours`                 | Collects every title, promotion, play-off triumph and landmark cup run with links to its season archive.                                            |
| Head-to-head index  | `/head-to-head`            | Provides an opponent tag cloud linking to complete club records.                                                                                    |
| Opponent record     | `/games/[club]`            | Shows the full match history against a selected opponent.                                                                                           |
| FA Cup archive      | `/results/fa-cup`          | Summarises runs, rounds reached, notable matches, records and programme covers.                                                                     |
| League Cup archive  | `/results/league-cup`      | Summarises League Cup progress, notable runs, records and programme covers.                                                                         |
| Penalty shootouts   | `/games/penalty-shootouts` | Presents every recorded shootout with match links and outcomes.                                                                                     |
| Wembley archive     | `/games/at-wembley`        | Presents every recorded Tranmere match at Wembley.                                                                                                  |
| Highest attendances | `/results/top-attendances` | Ranks the top 50 crowds and includes programme covers where available.                                                                              |

## Players

| Feature                 | Route                            | Summary                                                                                                             |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Player index and search | `/players`                       | Searches player profiles and can filter the appearance archive by season.                                           |
| Player profile          | `/page/player/[name]`            | Shows biography, avatar, personal information, season statistics, appearances, transfers and related archive links. |
| Player records          | `/players/records/[record]`      | Covers aggregate records such as appearances, goals and disciplinary statistics.                                    |
| Top scorers by season   | `/players/top-scorers-by-season` | Lists each season's leading scorer.                                                                                 |
| Lethal finishers        | `/players/lethal-finishers`      | Ranks players by goals per appearance.                                                                              |
| Misfiring strikers      | `/players/misfiring-strikers`    | Ranks eligible strikers using appearances, substitute appearances, goals and red cards.                             |
| Super subs              | `/players/super-subs`            | Ranks players by substitute appearances.                                                                            |
| Hat-trick archive       | `/players/hat-tricks`            | Lists recorded hat-tricks and links them to matches and players.                                                    |
| Partnership explorer    | `/players/partnerships`          | Autocompletes two players and analyses matches and results when they played together.                               |

## Managers, Clubs and Transfers

| Feature              | Route                        | Summary                                                                                              |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| Manager archive      | `/managers`                  | Displays every managerial spell with appointment dates, portrait and preferred formation when known. |
| Manager comparison   | `/managers/comparison`       | Compares two managers' match records and automatically refreshes when either selection changes.      |
| Manager fingerprints | `/managers/fingerprints`     | Profiles a manager's results, selection habits and tactical characteristics.                         |
| Manager's Trusted XI | `/managers/trusted-xi`       | Builds each manager's most-used XI in their preferred formation.                                     |
| Rovers connections   | `/rovers-connections`        | Links Tranmere to other clubs through shared players, transfers and matches.                         |
| Club connection      | `/rovers-connections/[club]` | Explains the individual player, transfer and fixture links for one club.                             |
| Transfer Central     | `/transfer-central`          | Searches arrivals and departures by player, club and season.                                         |

## Shirts, Stories and Interactive Features

| Feature            | Route                                   | Summary                                                                                 |
| ------------------ | --------------------------------------- | --------------------------------------------------------------------------------------- |
| Shirt archive      | `/shirts`                               | Catalogues historic home, away and goalkeeper shirts.                                   |
| Shirt detail       | `/shirts/[shirt]`                       | Presents an individual shirt with its rendered SVG and recorded details.                |
| Programme archive  | `/programmes`                           | Lists every digitised match programme stored in the Tranmere-Web database.              |
| Programme reader   | `/programmes/[date]`                    | Opens an individual programme in an interactive page-turning reader.                    |
| Blog               | `/blog`                                 | Lists Contentful news, history and archive articles with fallback imagery.              |
| Blog and tag pages | `/page/blog/[slug]`, `/page/tag/[slug]` | Renders rich editorial blocks, related content and tag archives.                        |
| Avatar builder     | `/players/avatar-builder`               | Builds shareable SVG player avatars from season kits, hair, skin, features and colours. |
| Fantasy XI         | `/fantasy-team`                         | Lets supporters select and arrange an XI from available player profiles.                |
| Who Am I?          | `/who-am-i`                             | Runs a daily player-identification game from archive clues.                             |

## Accounts, Contributions and Moderation

- Auth0 login and logout are available from the footer.
- Visitors can post match comments and ratings.
- Logged-in users can propose attendance corrections and player-profile changes.
- Player-profile proposals support optional source descriptions.
- Approval workflows protect published records until an administrator accepts a
  correction.
- Approved player-profile changes update the main D1 player record.

## Administration

The authenticated `/admin` hub links to:

- attendance-correction review;
- player-profile correction review;
- player creation and editing;
- transfer creation and editing;
- manager creation and editing;
- club creation and editing;
- programme creation and editing; and
- comment and rating moderation.

Admin routes compare the Auth0 session email with the configured administrator
email before allowing mutations.

## APIs, MCP and Machine Discovery

- The site exposes internal API routes for search, corrections, comments,
  ratings, manager XIs and admin CRUD operations.
- A GraphQL endpoint remains available at `/graphql`.
- The private authenticated MCP server offers player, club, transfer, manager,
  result and match lookup tools plus player-profile and transfer creation.
- The public unauthenticated MCP deployment reuses the read-only lookup tools.
- `GetPlayers` and `GetMatchByDate` include MCP Apps UI cards.
- `llms.txt`, page-specific metadata, JSON-LD and XML sitemaps support search
  engines and machine-readable discovery.
