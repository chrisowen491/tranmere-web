import ArticleList from "@/components/blogs/ArticleList";
import { getAllArticlesForTag } from "@/lib/api";
import { SlugParams } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  const tag = decodeURI(params.slug);
  return pageMetadata({
    title: `Tranmere Rovers articles tagged ${tag}`,
    description: `Tranmere-Web archive articles tagged ${tag}.`,
    pathname: `/page/tag/${encodeURIComponent(tag)}`,
  });
}

export default async function TagPage(props: { params: SlugParams }) {
  const params = await props.params;
  const articles = await getAllArticlesForTag(100, decodeURI(params.slug));
  const title = `${decodeURI(params.slug)} - Blog Pages`;
  const subtitle = `All the blog posts tagged with ${decodeURI(params.slug)}`;
  return <ArticleList posts={articles} title={title} subtitle={subtitle} />;
}
