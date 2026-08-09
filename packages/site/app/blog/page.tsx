import ArticleList from "@/components/blogs/ArticleList";
import { getAllArticles } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { cacheLife, cacheTag } from "next/cache";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = pageMetadata({
  title: "Tranmere Rovers stories and history",
  description: "Tranmere Rovers news, history, features and archive stories.",
  pathname: "/blog",
});

async function getCachedArticles() {
  "use cache";
  cacheLife("hours");
  cacheTag("articles");
  return getAllArticles(50);
}

export default async function BlogHome() {
  const articles = await getCachedArticles();

  return (
    <ArticleList
      posts={articles}
      title="Blog Index"
      subtitle="A listing of all blog articles for the site"
    />
  );
}
