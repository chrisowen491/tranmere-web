import { getAllArticles } from "@/lib/api";
import Link from "next/link";

export async function RecentArticles(props: { count: number }) {
  const { count = props.count } = props;
  const articles = await getAllArticles(count);
  return (
    <div className="widget">
        <h3 className="widget-title">Latest Posts</h3>
        <div className="list-group list-group-related">
            {articles.map((article) => (
                <Link
                key={article.slug}
                className="list-group-item list-group-item-action d-flex align-items-center active"
                href={`/page/blog/${article.slug}`}
                >
                <i className="fs-20 icon-file-text2 text-primary mr-1"></i>
                {article.title}
                </Link>
              ))}
        </div>
    </div>

  );
}
