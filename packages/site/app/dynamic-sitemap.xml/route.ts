import { ISitemapField, getServerSideSitemap } from "next-sitemap";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import { getAllArticles, getAllPlayers } from "@/lib/api";
import { getClubs } from "@/lib/clubs";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const teams = await getClubs(db);
  const articles = await getAllArticles(50);
  const seasons = GetSeasons();
  const players = await getAllPlayers();

  const pages: ISitemapField[] = [];

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
      loc: `https://www.tranmere-web.com/season/${t}`,
      lastmod: new Date().toISOString(),
    });
  });

  teams.forEach((t) => {
    pages.push({
      loc: `https://www.tranmere-web.com/games/${encodeURI(t.name.replace(/&/g, ""))}`,
      lastmod: new Date().toISOString(),
    });
    pages.push({
      loc: `https://www.tranmere-web.com/opponents/${encodeURIComponent(t.name)}`,
      lastmod: new Date().toISOString(),
    });
  });

  return getServerSideSitemap(pages);
}
