import { getAttendanceCorrections } from "@/lib/attendanceCorrections";
import { requireAdminPage } from "@/lib/adminAuth";
import { getPlayerProfileCorrections } from "@/lib/playerProfileCorrections";
import { getFormationCorrections } from "@/lib/formationCorrections";
import { getKitCorrections } from "@/lib/kitCorrections";
import { getGoalCorrections } from "@/lib/goalCorrections";
import { getAppearanceCorrections } from "@/lib/appearanceCorrections";
import { getGoalSubmissions } from "@/lib/goalSubmissions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  IdentificationIcon,
  UserCircleIcon,
  UserGroupIcon,
  SwatchIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Review and publish community archive corrections.",
};

export default async function AdminPage() {
  const session = await requireAdminPage("/admin");
  const env = getCloudflareContext().env;
  const [
    attendanceCorrections,
    profileCorrections,
    formationCorrections,
    kitCorrections,
    goalCorrections,
    appearanceCorrections,
    goalSubmissions,
  ] = await Promise.all([
    getAttendanceCorrections(env.DB, "pending"),
    getPlayerProfileCorrections(env.DB, "pending"),
    getFormationCorrections(env.DB, "pending"),
    getKitCorrections(env.DB, "pending"),
    getGoalCorrections(env.DB, "pending"),
    getAppearanceCorrections(env.DB, "pending"),
    getGoalSubmissions(env.DB),
  ]);
  const totalPending =
    attendanceCorrections.length +
    profileCorrections.length +
    formationCorrections.length +
    kitCorrections.length +
    goalCorrections.length +
    appearanceCorrections.length +
    goalSubmissions.length;

  const queues = [
    {
      title: "Match attendances",
      description:
        "Check supporter evidence and publish corrected attendance figures.",
      href: "/admin/attendance-corrections",
      count: attendanceCorrections.length,
      icon: CalendarDaysIcon,
    },
    {
      title: "Player profiles",
      description:
        "Compare proposed biographies and profile details with current records.",
      href: "/admin/player-profile-corrections",
      count: profileCorrections.length,
      icon: UserCircleIcon,
    },
    {
      title: "Match formations",
      description:
        "Review supporter-suggested formations before updating the match archive.",
      href: "/admin/formation-corrections",
      count: formationCorrections.length,
      icon: UserGroupIcon,
    },
    {
      title: "Match kits",
      description:
        "Review supporter-suggested kits before updating player imagery on match pages.",
      href: "/admin/kit-corrections",
      count: kitCorrections.length,
      icon: SwatchIcon,
    },
    {
      title: "Goal details",
      description:
        "Review suggested scorer, minute, assist and goal-type corrections.",
      href: "/admin/goal-corrections",
      count: goalCorrections.length + goalSubmissions.length,
      icon: FlagIcon,
    },
    {
      title: "Match appearances",
      description:
        "Review suggested team-sheet, shirt-number, card and substitution corrections.",
      href: "/admin/appearance-corrections",
      count: appearanceCorrections.length,
      icon: UserGroupIcon,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            Tranmere-Web · Admin
          </p>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
            <div>
              <h1 className="font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Approval centre
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                Review community contributions before they become part of the
                public Tranmere archive.
              </p>
            </div>
            <div className="border border-white/15 px-6 py-5">
              <span className="block font-mono text-4xl font-bold">
                {totalPending}
              </span>
              <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-white/50">
                Total awaiting review
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Moderation queues
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            What needs your attention
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {queues.map((queue) => {
            const Icon = queue.icon;
            return (
              <Link
                key={queue.href}
                href={queue.href}
                className="group flex min-h-64 flex-col border border-[#071a2b]/15 bg-[#fffdf8] p-7 transition hover:-translate-y-1 hover:border-blue-700 hover:shadow-[8px_8px_0_#132c82] sm:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="grid h-12 w-12 place-items-center bg-blue-700 text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span
                    className={`grid min-h-12 min-w-12 place-items-center px-3 font-mono text-2xl font-bold ${
                      queue.count > 0
                        ? "bg-amber-300 text-[#071a2b]"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {queue.count}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-3xl font-semibold">
                  {queue.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#071a2b]/60">
                  {queue.description}
                </p>
                <span className="mt-auto flex items-center gap-2 pt-7 text-xs font-bold uppercase tracking-[0.13em] text-blue-700">
                  Open approval queue
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Archive management
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Edit published records
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            {
              href: "/admin/players",
              title: "Players",
              description:
                "Review and edit the player profiles imported into the local D1 database.",
              action: "Manage players",
              icon: IdentificationIcon,
            },
            {
              href: "/admin/comments",
              title: "Comments & ratings",
              description:
                "Review, edit or remove supporter comments and ratings from across the site.",
              action: "Manage comments",
              icon: ChatBubbleLeftRightIcon,
            },
            {
              href: "/admin/transfers",
              title: "Transfers",
              description:
                "Add new arrivals and departures or edit existing transfer details.",
              action: "Manage transfers",
              icon: ArrowsRightLeftIcon,
            },
            {
              href: "/admin/managers",
              title: "Managers",
              description:
                "Add managerial appointments or edit names, dates, formations and portraits.",
              action: "Manage managers",
              icon: UserGroupIcon,
            },
            {
              href: "/admin/clubs",
              title: "Clubs",
              description:
                "Manage club names, abbreviations, colours, divisions and locations.",
              action: "Manage clubs",
              icon: BuildingOffice2Icon,
            },
            {
              href: "/admin/programmes",
              title: "Programmes",
              description:
                "Add digitised programme PDFs and keep their match details up to date.",
              action: "Manage programmes",
              icon: DocumentTextIcon,
            },
            {
              href: "/admin/games",
              title: "Games",
              description:
                "Filter a season and update published fixture, result and archive details.",
              action: "Manage games",
              icon: CalendarDaysIcon,
            },
            {
              href: "/admin/apps",
              title: "Appearances",
              description:
                "Add, edit or remove player appearances, substitutions and discipline records.",
              action: "Manage appearances",
              icon: UserGroupIcon,
            },
            {
              href: "/admin/goals",
              title: "Goals",
              description:
                "Add, edit or remove scoring events, assists and goal details.",
              action: "Manage goals",
              icon: DocumentTextIcon,
            },
            {
              href: "/admin/hat-tricks",
              title: "Hat-tricks",
              description:
                "Maintain the archive of three-goal and four-goal performances.",
              action: "Manage hat-tricks",
              icon: DocumentTextIcon,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-52 flex-col border border-[#071a2b]/15 bg-[#fffdf8] p-7 transition hover:-translate-y-1 hover:border-blue-700 hover:shadow-[8px_8px_0_#132c82] sm:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="grid h-12 w-12 place-items-center bg-blue-700 text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#071a2b]/40">
                    D1 records
                  </span>
                </div>
                <h3 className="mt-7 font-display text-3xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#071a2b]/60">
                  {item.description}
                </p>
                <span className="mt-auto flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-[0.13em] text-blue-700">
                  {item.action}
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#071a2b]/15 pt-6 text-sm text-[#071a2b]/55">
          <p>
            Signed in as{" "}
            <span className="font-semibold text-[#071a2b]">
              {session.user.email}
            </span>
          </p>
          <Link
            href="/"
            className="font-bold text-blue-700 underline underline-offset-4"
          >
            Return to the public site
          </Link>
        </div>
      </section>
    </main>
  );
}
