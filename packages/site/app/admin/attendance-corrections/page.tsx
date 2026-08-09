import { AttendanceCorrectionReview } from "@/components/apps/admin/AttendanceCorrectionReview";
import { requireAdminPage } from "@/lib/adminAuth";
import { getAttendanceCorrections } from "@/lib/attendanceCorrections";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Attendance corrections",
  description: "Review supporter-submitted match attendance corrections.",
};

export default async function AttendanceCorrectionsAdminPage() {
  await requireAdminPage("/admin/attendance-corrections");
  const env = getCloudflareContext().env;
  const corrections = await getAttendanceCorrections(env.DB, "pending");

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <div className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-[0.14em]">
            <Link href="/admin" className="text-white/45 hover:text-white">
              Overview
            </Link>
            <span className="text-blue-300">Match attendances</span>
            <Link
              href="/admin/player-profile-corrections"
              className="text-white/45 hover:text-white"
            >
              Player profiles
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Attendance corrections
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                Check each supporter&apos;s source before publishing a corrected
                attendance to the match archive.
              </p>
            </div>
            <div className="border border-white/15 px-5 py-4">
              <span className="block font-mono text-3xl font-bold">
                {corrections.length}
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-white/50">
                Awaiting review
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <AttendanceCorrectionReview initialCorrections={corrections} />
      </section>
    </main>
  );
}
