export const runtime = "edge";

import { getArticle, getAssetsByTag } from "@/lib/api";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { notFound } from "next/navigation";
import { Kit } from "@/components/blogs/Kit";
import { Star } from "@/components/blogs/Star";
import { Title } from "@/components/fragments/Title";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { GetCommentsByUrl } from "@/lib/comments";
import { Reviews } from "@/components/comments/Reviews";
import CommentPanel from "@/components/comments/CommentPanel";
import { LineGraph } from "@/components/charts/LineGraph";
import Slider from "@/components/carousel/Slider";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  return {
    title: article ? article.title : "",
    description: article ? article.description : "",
  };
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const gallery = article.galleryTag
    ? await getAssetsByTag(article.galleryTag)
    : null;

  const Text = ({ children }: any) => (
    <p className="align-center">{children}</p>
  );

  const url = `/page/blog/${params.slug}`;
  const comments = await GetCommentsByUrl(getRequestContext().env, url);

  let score = 0;
  comments.forEach((c) => {
    score = score + c.rating;
  });

  const avg = Math.round(score / comments.length);

  const options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: any, children: any) => <Text>{children}</Text>,
    },
    renderText: (text: string) => text.replace("!", "?"),
  };

  return (
    <>
      <div className="relative mx-auto flex w-full max-w-8xl flex-auto justify-center sm:px-2 lg:px-8 xl:px-12">
        <div className="columns-1 px-8">
          <section className="">
            <Title
              title={article.title}
              subTitle={article.author ? `Author: ${article.author}` : "Blog"}
              summary={
                article.datePosted
                  ? `Date: ${new Date(article.datePosted).toDateString()}`
                  : undefined
              }
            ></Title>
            {article.pic ? (
              <img
                src={`${article.pic.url}?h=300`}
                alt="Image"
                className="overlay-item-bottom px-8"
              />
            ) : (
              ""
            )}
            <Reviews
              text={"Reviews"}
              avg={avg}
              count={comments.length}
              className="mx-auto max-w-7xl px-6 lg:px-8"
            ></Reviews>
          </section>

          <article className="py-10">
            <div
              className="prose 
              mx-auto px-6 lg:px-8
              prose-slate max-w-none 
              dark:prose-invert 
              dark:text-slate-400 
              prose-headings:scroll-mt-28 
              prose-headings:font-display 
              prose-headings:font-normal 
              lg:prose-headings:scroll-mt-[8.5rem] 
              prose-lead:text-slate-500 
              dark:prose-lead:text-slate-400 
              prose-a:font-semibold 
              dark:prose-a:text-blue-600 
              prose-a:text-indigo-600
              hover:prose-a:[--tw-prose-underline-size:6px] 
              dark:[--tw-prose-background:theme(colors.slate.900)] 
              dark:hover:prose-a:[--tw-prose-underline-size:6px] 
              prose-pre:rounded-xl 
              prose-pre:bg-slate-900 
              prose-pre:shadow-lg 
              dark:prose-pre:bg-slate-800/60 
              dark:prose-pre:shadow-none 
              dark:prose-pre:ring-1 
              dark:prose-pre:ring-slate-300/10 
              dark:prose-hr:border-slate-800"
            >
              {documentToReactComponents(article.blog.json, options)}

              {gallery ? <Slider images={gallery} title={article.title} /> : ""}
              {article.galleryCollection &&
              article.galleryCollection.items.length > 0 ? (
                <>
                  <p>
                    Hover over the image for the buttons to browse the gallery
                  </p>
                  <Slider
                    images={article.galleryCollection.items}
                    title={article.title}
                  />
                </>
              ) : (
                ""
              )}
              {article.blocksCollection &&
              article.blocksCollection.items.length > 0 ? (
                <div className="py-2 sm:py-2">
                  <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <ul
                      role="list"
                      className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
                    >
                      {article.blocksCollection.items.map((block, idx) => (
                        <li key={idx}>
                          {block.__typename == "Kit" ? (
                            <Kit
                              season={block.season!}
                              image={block.img!}
                            ></Kit>
                          ) : (
                            <>
                              {block.__typename == "Star" ? (
                                <Star
                                  name={block.name!}
                                  notes={block.notes!}
                                  match={block.match!}
                                  season={block.season!}
                                  date={block.date!}
                                  programme={block.programme!}
                                ></Star>
                              ) : (
                                ""
                              )}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                ""
              )}
              {article.blocksCollection &&
              article.blocksCollection.items.length > 0 ? (
                <div className="">
                  <div className="w-full">
                    {article.blocksCollection.items.map((block, idx) => (
                      <div key={idx} style={{}}>
                        {block.__typename == "Graph" ? (
                          <LineGraph
                            title={block.title!}
                            chart={block.chart!.data}
                          ></LineGraph>
                        ) : (
                          ""
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            <CommentPanel
              comments={comments}
              url={url}
              className="mx-auto max-w-7xl px-6 lg:px-8 mt-6"
            ></CommentPanel>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-6">
              {article.tags ? (
                <>
                  {article.tags.map((tag, idx) => (
                    <span key={idx}>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        <Link href={`/page/tag/${tag}`}>{tag}</Link>
                      </span>
                      &nbsp;
                    </span>
                  ))}
                </>
              ) : (
                ""
              )}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
