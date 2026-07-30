import Link from "next/link";

const linkGroups = [
  {
    label: "Archive",
    links: [
      { label: "Results", href: "/results" },
      { label: "Players", href: "/playersearch" },
      { label: "Transfers", href: "/transfer-central" },
      { label: "Articles", href: "/blog" },
    ],
  },
  {
    label: "Explore",
    links: [
      { label: "Head-to-head", href: "/head-to-head" },
      { label: "Rovers connections", href: "/rovers-connections" },
      { label: "Player partnerships", href: "/player-partnerships" },
    ],
  },
  {
    label: "The club",
    links: [
      { label: "Managers", href: "/managers" },
      { label: "Manager comparison", href: "/manager-comparison" },
      { label: "Manager’s Trusted XI", href: "/manager-trusted-xi" },
      { label: "About", href: "/page/blog/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#071a2b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(560px,0.95fr)] lg:items-start">
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
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-12"
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
        <div className="flex flex-col gap-3 pt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 sm:flex-row sm:justify-between">
          <p>Made in Chester · Archive online since 2020</p>
          <p>© 2026 Tranmere-Web</p>
        </div>
      </div>
    </footer>
  );
}
