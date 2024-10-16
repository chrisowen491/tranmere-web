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
      loc: `https://www.tranmere-web.com/games/${encodeURI(t.name.replace(/&/g, ""))}`,
      lastmod: new Date().toISOString(),
    });
  });

  return getServerSideSitemap(pages);
}
