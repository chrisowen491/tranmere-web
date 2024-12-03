import { BlogItem } from "@/lib/types";
import { UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

export default function ArticleList(props: {
  posts: BlogItem[];
  title: string;
  subtitle: string;
}) {
  const posts = props.posts;

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
            {props.title}
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            {props.subtitle}
          </p>
          <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
            {posts.map((post, idx) => (
              <article
                key={idx}
                className="relative isolate flex flex-col gap-8 lg:flex-row"
              >
                <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                  <Link href={`/page/blog/${post.slug}`}>
                    {post.pic != null ? (
                      <img
                        alt={post.title}
                        src={post.pic.url}
                        className="absolute inset-0 h-full rounded-2xl bg-gray-50 dark:bg-gray-950 mx-auto"
                      />
                    ) : (
                      <Image
                        alt={post.title}
                        width={512}
                        height={512}
                        src="https://images.ctfassets.net/pz711f8blqyy/4xiJsea65ajh0swqmdEbOF/a2fc207703c03245cd64a8c01b857e28/2021.svg"
                        className="absolute inset-0 h-full rounded-2xl bg-gray-50 dark:bg-gray-950 mx-auto"
                      />
                    )}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                  </Link>
                </div>
                <div>
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={post.datePosted} className="text-gray-500">
                      {new Date(post.datePosted).toDateString()}
                    </time>
                    {post.tags &&
                      post.tags.map((tag, idx) => (
                        <div key={idx}>
                          {idx < 5 ? (
                            <Link
                              href={`/page/tag/${tag}`}
                              key={idx}
                              className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600  hover:bg-gray-100"
                            >
                              {tag}
                            </Link>
                          ) : (
                            ""
                          )}
                        </div>
                      ))}
                  </div>
                  <div className="group relative max-w-xl">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 dark:text-gray-50 group-hover:text-gray-600">
                      <Link href={`/page/blog/${post.slug}`}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-50">
                      {post.description}
                    </p>
                  </div>
                  <div className="mt-6 flex border-t border-gray-900/5 pt-6">
                    {post.author && (
                      <div className="relative flex items-center gap-x-4">
                        <UserIcon
                          aria-hidden="true"
                          className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-950"
                        />
                        <div className="text-sm leading-6">
                          <p className="font-semibold text-gray-900 dark:text-gray-50">
                            <span className="absolute inset-0" />
                            {post.author}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
