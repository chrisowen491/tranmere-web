import Image from "next/image";
import Link from "next/link";

function GitHubIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
    </svg>
  )
}

const navigation = {
  results: [
    { name: 'Results Home', href: '/results' },
    { name: 'Results At Wembley', href: '/games/at-wembley' },
    { name: 'Penalty Shootouts', href: '/games/penalty-shootouts' },
  ],
  players: [
    { name: 'Players Home', href: '/playersearch' },
    { name: 'Record Appearances', href: '/player-records/most-appearances' },
    { name: 'Record Goalscorers', href: '/player-records/top-scorers' },
    { name: 'Only Played Once', href: '/player-records/only-one-appearance' },
    { name: 'Top Scorers By Season', href: '/top-scorers-by-season' },
    { name: 'Hat Tricks', href: '/hat-tricks' }, 
    { name: 'Transfers', href: '/transfer-central' }, 
  ],
  statistics: [
    { name: 'Top Attendences', href: '/games/top-attendances' },
    { name: 'Top Home Attendences', href: '/games/top-home-attendances' },
  ],
  media: [
    { name: 'Blog', href: '/blog' },
    { name: 'TRFC Books', href: '/page/blog/books' },
    { name: 'Football Cards', href: '/page/blog/football-cards' },
    { name: 'Player Avatar Builder', href: '/player-builder' },
  ],
}

export default function Footer() {
  return (
    <footer aria-labelledby="footer-heading" className="bg-blue-900 dark:bg-blue-600 text-gray-50 font-bold mt-28">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-4 lg:py-32">
        <div className="xl:grid xl:grid-cols-4 xl:gap-2">
          <Image
            src="/assets/images/logo_white_transparent.png"
            alt="TranmereWeb.com Logo"
            width={160}
            height={93}
          />
          <div className="mt-16 grid grid-cols-2 gap-4 xl:col-span-3 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-4">
              <div>
                <h3 className="leading-6 font-semibold ">Results</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.results.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="leading-6 hover:text-white hover:bg-rose-950 rounded-md px-3 py-2">
                        {item.name}
                      </a>
                    </li>
                  ))}
                  <li className="">            
                    <a href={'/contact'} className="leading-6 hover:text-white hover:bg-rose-950 rounded-md px-3 py-2">
                        Contact Us
                      </a>
                  </li>
                  <li className="px-3 mt-0">            
                    <Link href="https://github.com/chrisowen491/tranmere-web/"  className="" aria-label="GitHub">
                      <GitHubIcon className="h-6 w-6 fill-slate-50 group-hover:fill-slate-500 dark:group-hover:fill-slate-300" />
                    </Link> 
                  </li>

                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="leading-6 font-semibold ">Players</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.players.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="leading-6 hover:text-white hover:bg-rose-950 rounded-md px-3 py-2">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="font-semibold leading-6">Statistics</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.statistics.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="leading-6 hover:text-white hover:bg-rose-950 rounded-md px-3 py-2">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="leading-6 font-semibold ">Media</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.media.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="leading-6 hover:text-white hover:bg-rose-950 rounded-md px-3 py-2">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

