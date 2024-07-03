import { ISitemapField, getServerSideSitemap } from "next-sitemap";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { GetAllTeams, GetSeasons } from "@/lib/apiFunctions";
import { getAllArticles } from "@/lib/api";

export async function GET(request: Request) {
  const teams = await GetAllTeams();
  const articles = await getAllArticles(50);
  const seasons = GetSeasons();

  const pages: ISitemapField[] = [];

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
