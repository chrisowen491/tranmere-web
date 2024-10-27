import ArticleList from "@/components/blogs/ArticleList";
import { getAllArticlesForTag } from "@/lib/api";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return {
    title: `Articles Tagged ${params.slug}`,
    description: `All TranmereWeb.com articles tagged with  ${params.slug}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: { slug: string };
}) {
  const articles = await getAllArticlesForTag(100, decodeURI(params.slug));
  const title = `${decodeURI(params.slug)} - Blog Pages`;
  const subtitle = `All the blog posts tagged with ${decodeURI(params.slug)}`;
  return (

    <ArticleList posts={articles} title={title} subtitle={subtitle} />

  );
}
