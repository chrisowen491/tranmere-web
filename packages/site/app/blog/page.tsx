import { getAllArticles } from "@/lib/api";
import { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { LastMatch } from "@/components/fragments/LastMatch";

export const runtime = "edge";

export var metadata: Metadata = {
  title: "Blog Index",
  description: "A listing of all blog article for the site",
};

export default async function BlogHome() {
  const articles = await getAllArticles(50);

  return (
    <div className="relative mx-auto flex w-full max-w-8xl flex-auto justify-center sm:px-2 lg:px-8 xl:px-12">
      <div className="columns-1">
        <div className="py-10 sm:py-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <p className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-50">
                Blog Pages
              </p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-indigo-50">
                Blogs & Articles
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-200">
                All the blog posts and articles from across the site
              </p>
            </div>
          </div>
        </div>
        <div className="p-8">
          {articles.map((article) => (
            <article
              key={article.sys.id}
              className="flex max-w-xl flex-col items-start justify-between py-10"
            >
              <div className="flex items-center gap-x-4 text-xs">
                <time dateTime={article.datePosted} className="text-gray-500">
                  {new Date(article.datePosted).toDateString()}
                </time>
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 dark:text-indigo-50 group-hover:text-gray-600">
                  <a href={`/page/blog/${article.slug}`}>
                    <span className="absolute inset-0" />
                    {article.title}
                  </a>
                </h3>
                <p className="mt-5 mb-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-200">
                  {article.description}
                </p>
                <a
                  href={`/page/blog/${article.slug}`}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Read
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
