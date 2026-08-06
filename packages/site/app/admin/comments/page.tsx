import { CommentAdmin } from "@/components/apps/admin/CommentAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { getAllComments } from "@/lib/comments";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage comments and ratings",
  description: "Moderate published Tranmere-Web comments and ratings.",
};

export default async function CommentAdminPage() {
  await requireAdminPage("/admin/comments");
  const env = getCloudflareContext().env;
  const comments = await getAllComments(env.DB);
  const average = comments.length
    ? comments.reduce((total, comment) => total + comment.rating, 0) /
      comments.length
    : 0;

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Admin overview
            </Link>
            <span className="text-blue-300">Comments &amp; ratings</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Manage comments
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                Review, correct or remove supporter comments and ratings
                published across the archive.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 px-6 py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-white/50">
                  Contributions
                </dt>
                <dd className="mt-1 font-mono text-3xl font-bold">
                  {comments.length.toLocaleString()}
                </dd>
              </div>
              <div className="px-6 py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-white/50">
                  Average
                </dt>
                <dd className="mt-1 font-mono text-3xl font-bold">
                  {average.toFixed(1)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <CommentAdmin initialComments={comments} />
      </section>
    </main>
  );
}
