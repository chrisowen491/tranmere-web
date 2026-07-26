import { BlogItem } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

const fallbackImage =
  "https://images.ctfassets.net/pz711f8blqyy/4xiJsea65ajh0swqmdEbOF/a2fc207703c03245cd64a8c01b857e28/2021.svg";

function StoryImage({
  post,
  priority = false,
}: {
  post: BlogItem;
  priority?: boolean;
}) {
  return (
    <Image
      alt={post.title}
      src={post.pic?.url ?? fallbackImage}
      width={960}
      height={720}
      unoptimized
      priority={priority}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
    />
  );
}

export default function ArticleList(props: {
  posts: BlogItem[];
  title: string;
  subtitle: string;
}) {
  const [featured, ...posts] = props.posts;

  return (
    <main className="pb-24 text-[#071a2b]">
      <header className="border-b border-[#071a2b]/10">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Stories &amp; history
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <h1 className="font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              From the archive.
            </h1>
            <p className="text-lg leading-8 text-[#071a2b]/65">
              Features, memories, research and supporter-built projects from
              across Tranmere Rovers history.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        {featured && (
          <article className="group grid overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8] lg:grid-cols-[1.05fr_0.95fr]">
            <Link
              href={`/page/blog/${featured.slug}`}
              className="relative min-h-72 overflow-hidden bg-[#e8e2d6] sm:min-h-96"
            >
              <StoryImage post={featured} priority />
              <span className="absolute left-4 top-4 bg-[#071a2b] px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-white">
                Latest story
              </span>
            </Link>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <time
                dateTime={featured.datePosted}
                className="font-mono text-xs uppercase tracking-[0.12em] text-blue-700"
              >
                {new Date(featured.datePosted).toDateString()}
              </time>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em]">
                <Link
                  href={`/page/blog/${featured.slug}`}
                  className="hover:text-blue-700"
                >
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-5 leading-7 text-[#071a2b]/65">
                {featured.description}
              </p>
              <div className="mt-8 flex items-center justify-between border-t border-[#071a2b]/10 pt-5">
                <span className="text-sm font-semibold">
                  {featured.author ?? "Tranmere-Web"}
                </span>
                <Link
                  href={`/page/blog/${featured.slug}`}
                  className="text-sm font-bold text-blue-700"
                >
                  Read story →
                </Link>
              </div>
            </div>
          </article>
        )}

        <div className="mb-6 mt-14 flex items-end justify-between border-b border-[#071a2b]/15 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              The collection
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              More stories
            </h2>
          </div>
          <p className="font-mono text-xs text-[#071a2b]/45">
            {props.posts.length} articles
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col border border-[#071a2b]/15 bg-[#fffdf8] p-3"
            >
              <Link
                href={`/page/blog/${post.slug}`}
                className="relative aspect-[4/3] overflow-hidden bg-[#e8e2d6]"
              >
                <StoryImage post={post} />
              </Link>
              <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <time
                    dateTime={post.datePosted}
                    className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#071a2b]/45"
                  >
                    {new Date(post.datePosted).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                  {post.tags?.[0] && (
                    <Link
                      href={`/page/tag/${post.tags[0]}`}
                      className="text-[11px] font-bold uppercase tracking-[0.1em] text-blue-700"
                    >
                      {post.tags[0]}
                    </Link>
                  )}
                </div>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">
                  <Link
                    href={`/page/blog/${post.slug}`}
                    className="hover:text-blue-700"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#071a2b]/60">
                  {post.description}
                </p>
                <p className="mt-auto border-t border-[#071a2b]/10 pt-5 text-sm font-semibold">
                  {post.author ?? "Tranmere-Web"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
