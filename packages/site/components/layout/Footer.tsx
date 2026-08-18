"use client";

import {
  ArrowLeftEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";

const linkGroups = [
  {
    label: "Archive",
    links: [
      { label: "Results", href: "/results" },
      { label: "Honours", href: "/honours" },
      { label: "Programmes", href: "/programmes" },
      { label: "Players", href: "/players" },
      { label: "Managers", href: "/managers" },
      { label: "Transfers", href: "/transfer-central" },
      { label: "Articles", href: "/blog" },
    ],
  },
  {
    label: "Explore",
    links: [
      { label: "Head-to-head", href: "/head-to-head" },
      { label: "Rovers connections", href: "/rovers-connections" },
      { label: "Player partnerships", href: "/players/partnerships" },
    ],
  },
  {
    label: "Fun stuff",
    links: [
      { label: "Fantasy XI", href: "/fantasy-team" },
      { label: "Who am I?", href: "/who-am-i" },
      { label: "Player builder", href: "/players/avatar-builder" },
      { label: "Programme checklist", href: "/programme-collections" },
    ],
  },
  {
    label: "Site",
    links: [
      { label: "About", href: "/page/blog/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy policy", href: "/page/blog/privacy-policy" },
      { label: "Terms of service", href: "/page/blog/terms-of-service" },
    ],
  },
];

export default function Footer() {
  const { user, isLoading } = useUser();

  return (
    <footer className="bg-[#071a2b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(620px,1.1fr)] lg:items-start">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center border border-white/30 text-xs font-black">
                TW
              </span>
              <span className="font-display text-2xl font-semibold">
                Tranmere-Web
              </span>
            </div>
            <p className="mt-6 max-w-md text-sm leading-6 text-white/55">
              An independent, supporter-built archive of Tranmere Rovers
              history. Not affiliated with Tranmere Rovers Football Club.
            </p>
          </div>
          <nav
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:gap-x-8"
            aria-label="Footer"
          >
            {linkGroups.map((group) => (
              <div key={group.label}>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-blue-300">
                  {group.label}
                </p>
                <div className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block text-sm font-semibold leading-5 text-white/60 transition hover:translate-x-0.5 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-4 pt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>Made in Chester · Archive online since 2020</p>
          <div className="flex flex-wrap items-center gap-2">
            {user && (
              <Link
                href="/profile"
                className="inline-flex w-fit items-center gap-2 border border-white/15 px-3 py-2 font-bold text-white/65 transition hover:border-blue-300/60 hover:text-white"
              >
                <UserCircleIcon className="h-4 w-4" />
                Your profile
              </Link>
            )}
            <a
              href={user ? "/auth/logout" : "/auth/login"}
              className={`inline-flex w-fit items-center gap-2 border border-white/15 px-3 py-2 font-bold text-white/65 transition hover:border-blue-300/60 hover:text-white ${
                isLoading ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={isLoading}
            >
              {user ? (
                <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
              ) : (
                <ArrowLeftEndOnRectangleIcon className="h-4 w-4" />
              )}
              {isLoading
                ? "Checking account…"
                : user
                  ? "Log out"
                  : "Log in"}
            </a>
          </div>
          <p>© 2026 Tranmere-Web</p>
        </div>
      </div>
    </footer>
  );
}
