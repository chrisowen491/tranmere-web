import Link from "next/link";

const links = [
  { label: "Results", href: "/results" },
  { label: "Head-to-head", href: "/head-to-head" },
  { label: "Players", href: "/playersearch" },
  { label: "Transfers", href: "/transfer-central" },
  { label: "Articles", href: "/blog" },
  { label: "About", href: "/page/blog/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#071a2b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[1fr_auto] lg:items-end">
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
          <nav className="flex flex-wrap gap-x-7 gap-y-3" aria-label="Footer">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-white/65 hover:text-white"
              >
                {link.label}
              </Link>
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
