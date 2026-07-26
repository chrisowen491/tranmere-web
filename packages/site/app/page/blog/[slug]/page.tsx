import { getArticle, getAssetsByTag } from "@/lib/api";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { notFound } from "next/navigation";
import { Kit } from "@/components/blogs/Kit";
import { Star } from "@/components/blogs/Star";
import { BLOCKS } from "@contentful/rich-text-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { GetCommentsByUrl } from "@/lib/comments";
import { Reviews } from "@/components/comments/Reviews";
import CommentPanel from "@/components/comments/CommentPanel";
import { LineGraph } from "@/components/charts/LineGraph";
import Slider from "@/components/carousel/Slider";
import Link from "next/link";
import { SlugParams } from "@/lib/types";

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  const article = await getArticle(params.slug);
  return {
    title: article ? article.title : "",
    description: article ? article.description : "",
  };
}

export default async function BlogPage(props: { params: SlugParams }) {
  const params = await props.params;
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const gallery = article.galleryTag
    ? await getAssetsByTag(article.galleryTag)
    : null;

  const Text = ({ children }: any) => <p className="leading-8">{children}</p>;

  const url = `/page/blog/${params.slug}`;
  const comments = await GetCommentsByUrl(getCloudflareContext().env, url);

  let score = 0;
  comments.forEach((c) => {
    score = score + c.rating;
  });

  const avg = Math.round(score / comments.length);

  const options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: any, children: any) => <Text>{children}</Text>,
    },
  };

  return (
    <main className="pb-24 text-[#071a2b]">
      <header className="border-b border-[#071a2b]/10">
        <div
          className={`mx-auto grid max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16 ${
            article.pic
              ? "gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)]"
              : ""
          }`}
        >
          <div className="flex flex-col justify-center border border-[#071a2b]/15 bg-[#fffdf8] p-7 sm:p-10 lg:p-12">
            <Link
              href="/blog"
              className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700"
            >
              Stories &amp; history
            </Link>
            <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              {article.title}
            </h1>
            {article.description && (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#071a2b]/65">
                {article.description}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#071a2b]/15 pt-5 text-sm">
              <span className="font-semibold">
                {article.author ?? "Tranmere-Web"}
              </span>
              {article.datePosted && (
                <time
                  dateTime={article.datePosted}
                  className="font-mono text-xs text-[#071a2b]/50"
                >
                  {new Date(article.datePosted).toDateString()}
                </time>
              )}
            </div>
            <Reviews
              text="Supporter rating"
              avg={avg}
              count={comments.length}
              className="mt-5"
            />
          </div>
          {article.pic && (
            <div className="relative min-h-80 overflow-hidden bg-[#132c82] lg:min-h-[540px]">
              <div
                aria-hidden="true"
                className="absolute inset-5 border border-white/20"
              />
              <img
                src={article.pic.url}
                alt={article.title}
                className="absolute inset-0 h-full w-full object-contain p-8"
              />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-12">
        <article className="min-w-0">
          <div
            className="prose prose-lg prose-slate max-w-none
              prose-headings:scroll-mt-28 prose-headings:font-display prose-headings:font-semibold
              prose-headings:tracking-[-0.025em] prose-p:text-[#071a2b]/75
              prose-a:font-semibold prose-a:text-blue-700
              prose-img:border prose-img:border-[#071a2b]/15
              prose-hr:border-[#071a2b]/15"
          >
            {documentToReactComponents(article.blog.json, options)}

            {gallery ? <Slider images={gallery} title={article.title} /> : ""}
            {article.galleryCollection &&
            article.galleryCollection.items.length > 0 ? (
              <>
                <p>Click the image for a larger version</p>
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
                      <li key={idx} className="list-none">
                        {block.__typename == "Kit" ? (
                          <Kit season={block.season!} image={block.img!}></Kit>
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
            className="mt-12 border-t border-[#071a2b]/15 pt-8"
          />
        </article>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Article details
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              Filed under
            </h2>
            {article.tags && article.tags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/page/tag/${tag}`}
                    className="border border-[#071a2b]/15 px-3 py-2 text-xs font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#071a2b]/50">
                General Tranmere history
              </p>
            )}
            <Link
              href="/blog"
              className="mt-6 block border-t border-[#071a2b]/15 pt-5 text-sm font-bold text-blue-700"
            >
              ← Back to all stories
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
