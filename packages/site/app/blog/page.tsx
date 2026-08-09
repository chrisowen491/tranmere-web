import ArticleList from "@/components/blogs/ArticleList";
import { getAllArticles } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 7200;

export const metadata = pageMetadata({
  title: "Tranmere Rovers stories and history",
  description: "Tranmere Rovers news, history, features and archive stories.",
  pathname: "/blog",
});

export default async function BlogHome() {
  const articles = await getAllArticles(50);

  return (
    <ArticleList
      posts={articles}
      title="Blog Index"
      subtitle="A listing of all blog articles for the site"
    />
  );
}
