import ArticleList from "@/components/blogs/ArticleList";
import { getAllArticles } from "@/lib/api";
import { Metadata } from "next";
export const runtime = "edge";

export var metadata: Metadata = {
  title: "Blog Index",
  description: "A listing of all blog article for the site",
};

export default async function BlogHome() {
  const articles = await getAllArticles(50);

  return (
    <ArticleList posts={articles} title="Blog Index" subtitle="A listing of all blog articles for the site" />
  );
}
