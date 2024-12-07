import { BlogItem } from "@/lib/types";
import Link from "next/link";

interface Tag {
  name: string;
  count: number;
  textSize: string;
  color: string;
}

export function getRandomColor() {
  const colors: string[] = [
    "text-cyan-500",
    "text-teal-500",
    "text-red-500",
    "text-green-500",
    "text-orange-500",
    "text-blue-500",
    "text-indigo-500",
    "text-gray-500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getTextSize(articles: number) {
  const sizes: string[] = [
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
    "text-6xl",
  ];

  if (articles > sizes.length) return sizes[sizes.length];
  return sizes[articles + 1];
}

export function TagCloud(props: { articles: BlogItem[] }) {
  const tags: Tag[] = [];
  const articles = props.articles;

  articles.forEach((article) => {
    if (!article.tags) return;
    article.tags.forEach((tag) => {
      const existing = tags.find((t) => t.name === tag);
      if (existing) {
        existing.count++;
        existing.textSize = getTextSize(existing.count);
      } else {
        tags.push({
          name: tag,
          count: 1,
          textSize: "text-xs",
          color: getRandomColor(),
        });
      }
    });
  });

  return (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl my-8  text-blue-600 dark:text-gray-50">
        Article Tag Cloud
      </h2>
      <ul className="flex justify-center flex-wrap max-w-xl align-center gap-2 leading-8 mx-auto">
        {tags.map((tag) => (
          <li key={tag.name}>
            <Link
              href={`/page/tag/${tag.name}`}
              className={`${tag.textSize} ${tag.color}`}
            >
              {tag.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
