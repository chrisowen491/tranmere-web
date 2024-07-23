export const runtime = "edge";
import { ISitemapField, getServerSideSitemap } from "next-sitemap";
import { GetAllTeams, GetSeasons } from "@/lib/apiFunctions";
import { getAllArticles, getAllPlayers } from "@/lib/api";

export async function GET(request: Request) {
  const teams = await GetAllTeams();
  const articles = await getAllArticles(50);
  const seasons = GetSeasons();
  const players = await getAllPlayers();

  const pages: ISitemapField[] = [];

  /*
<url>
<loc>https://www.tranmere-web.com/search-results</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/transfer-central</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/edit-goal</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/index</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/error</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/404</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/playersearch</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/hat-tricks</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/player-builder</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/top-scorers-by-season</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/managers</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/results</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
<url>
<loc>https://www.tranmere-web.com/contact</loc>
<lastmod>2024-06-11</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>
*/

  players.forEach((t) => {
    pages.push({
      loc: `https://www.tranmere-web.com/page/player/${t.name}`,
      lastmod: new Date().toISOString(),
    });
  });

  articles.forEach((t) => {
    pages.push({
      loc: `https://www.tranmere-web.com/page/blog/${t.slug}`,
      lastmod: new Date().toISOString(),
    });
  });
  seasons.forEach((t) => {
    pages.push({
      loc: `https://www.tranmere-web.com/games/${t}`,
      lastmod: new Date().toISOString(),
    });
  });

  teams.forEach((t) => {
    pages.push({
      loc: `https://www.tranmere-web.com/games/${encodeURI(t.name.replace("&", ""))}`,
      lastmod: new Date().toISOString(),
    });
  });

  return getServerSideSitemap(pages);
}
