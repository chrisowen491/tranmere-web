import type { Metadata } from "next";
import Link from "next/link";
import {
  getAuthErrorContent,
  normaliseAuthErrorCode,
  safeAuthReturnTo,
} from "@/lib/authError";

export const metadata: Metadata = {
  title: "Sign-in problem",
  description: "Help completing sign-in to Tranmere-Web.",
  robots: { index: false, follow: false },
};

interface AuthErrorPageProps {
  searchParams: Promise<{
    code?: string | string[];
    returnTo?: string | string[];
  }>;
}

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const params = await searchParams;
  const requestedCode = Array.isArray(params.code)
    ? params.code[0]
    : params.code;
  const code = normaliseAuthErrorCode({ code: requestedCode });
  const content = getAuthErrorContent(code);
  const requestedReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo = safeAuthReturnTo(requestedReturnTo);
  const retryHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 sm:py-24 lg:px-12">
      <section className="grid overflow-hidden border border-[#071a2b]/15 bg-[#fffdf8] lg:grid-cols-[0.75fr_1.25fr]">
        <div className="flex min-h-56 items-center justify-center bg-[#071a2b] p-10 text-center text-white lg:min-h-[440px]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
              Supporter account
            </p>
            <p className="mt-5 font-display text-8xl font-semibold tracking-[-0.06em] sm:text-9xl">
              401
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              Authentication interrupted
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {content.heading}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#071a2b]/65">
            {content.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={retryHref}
              className="bg-blue-700 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Try signing in again
            </Link>
            <Link
              href="/"
              className="border border-[#071a2b]/20 bg-[#fffdf8] px-5 py-3 text-center text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
            >
              Return to the archive
            </Link>
          </div>

          <div className="mt-10 border-t border-[#071a2b]/15 pt-5">
            <p className="text-sm leading-6 text-[#071a2b]/60">
              Still having trouble?{" "}
              <Link
                href="/contact"
                className="font-bold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
              >
                Contact Tranmere-Web
              </Link>
              .
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#071a2b]/40">
              Reference: {code}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
