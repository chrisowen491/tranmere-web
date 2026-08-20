import { auth0 } from "@/lib/auth0";
import { ensureUserProfile } from "@/lib/userProfiles";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CheckBadgeIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DeleteSupporterDataControl } from "@/components/apps/DeleteSupporterDataControl";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your profile",
  description: "View your Tranmere-Web supporter profile.",
};

const usernameClaim = "https://www.tranmere-web.com/username";

function firstText(values: unknown[]) {
  return values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );
}

export default async function ProfilePage() {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/auth/login?returnTo=%2Fprofile");
  }

  const profile = await ensureUserProfile(
    getCloudflareContext().env.DB,
    session.user.sub,
  );
  const username = firstText([
    session.user[usernameClaim],
    session.user.username,
    session.user.preferred_username,
    session.user.nickname,
  ]);
  const displayName = firstText([session.user.name, username]) || "Supporter";

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Tranmere-Web · Supporter account
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Your profile
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Your place in the supporter-built Rovers archive. More account
            features and preferences will appear here over time.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <div className="grid border border-[#071a2b]/15 bg-[#fffdf8] shadow-[5px_5px_0_rgba(7,26,43,0.08)] md:grid-cols-[220px_1fr]">
          <div className="flex items-center justify-center border-b border-[#071a2b]/15 bg-[#e8e2d6] p-10 md:border-r md:border-b-0">
            <UserCircleIcon className="h-28 w-28 text-blue-700" aria-hidden />
          </div>
          <div className="p-7 sm:p-10">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
              Signed-in supporter
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
              {displayName}
            </h2>
            {username && (
              <p className="mt-2 font-mono text-sm text-[#071a2b]/60">
                @{username}
              </p>
            )}

            <dl className="mt-8 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2">
              <div className="bg-[#fffdf8] p-5">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                  Email
                </dt>
                <dd className="mt-2 break-all text-sm font-semibold">
                  {session.user.email || "Not supplied"}
                </dd>
              </div>
              <div className="bg-[#fffdf8] p-5">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                  Archive profile
                </dt>
                <dd className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckBadgeIcon className="h-5 w-5" aria-hidden />
                  {profile ? "Active" : "Unavailable"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/profile/passport"
            className="flex items-center justify-between border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-5 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
          >
            Your Rovers passport <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/profile/programmes"
            className="flex items-center justify-between border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-5 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
          >
            Programme collection tracker <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/profile/fantasy-teams"
            className="flex items-center justify-between border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-5 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
          >
            Saved Fantasy XIs <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/profile/corrections"
            className="flex items-center justify-between border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-5 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
          >
            Your archive corrections <span aria-hidden="true">→</span>
          </Link>
        </div>
        <DeleteSupporterDataControl />
      </section>
    </main>
  );
}
