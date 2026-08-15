export interface StaticSearchPage {
  id: string;
  title: string;
  description: string;
  href: string;
  aliases?: string;
}

export const STATIC_SEARCH_PAGES: StaticSearchPage[] = [
  {
    id: 'results',
    title: 'Results Archive',
    description: 'Search every recorded Tranmere Rovers result',
    href: '/results',
    aliases: 'fixtures matches scores games'
  },
  {
    id: 'players',
    title: 'Player Archive',
    description: 'Browse Tranmere Rovers player profiles and records',
    href: '/players',
    aliases: 'footballers appearances goals profiles'
  },
  {
    id: 'seasons',
    title: 'Season Archive',
    description: 'Explore Tranmere Rovers history season by season',
    href: '/seasons',
    aliases: 'campaigns years history'
  },
  {
    id: 'managers',
    title: 'Managers',
    description: 'Explore every Tranmere Rovers manager',
    href: '/managers',
    aliases: 'manager archive coaches bosses'
  },
  {
    id: 'transfers',
    title: 'Transfer Central',
    description: 'Search incoming and outgoing Tranmere Rovers transfers',
    href: '/transfer-central',
    aliases: 'transfers signings fees loans arrivals departures'
  },
  {
    id: 'honours',
    title: 'Honours',
    description: 'Trophies, promotions and landmark Rovers seasons',
    href: '/honours',
    aliases: 'trophies promotions achievements relegations'
  },
  {
    id: 'programmes',
    title: 'Programme Archive',
    description: 'Browse digitised Tranmere Rovers match programmes',
    href: '/programmes',
    aliases: 'programs matchday gallery pdf'
  },
  {
    id: 'shirts',
    title: 'Shirt Archive',
    description: 'Explore Tranmere Rovers kits through the years',
    href: '/shirts',
    aliases: 'shirts kits home away goalkeeper'
  },
  {
    id: 'blog',
    title: 'Articles',
    description: 'Read stories from the Tranmere Rovers archive',
    href: '/blog',
    aliases: 'blog posts features stories'
  },
  {
    id: 'head-to-head',
    title: 'Head-to-head Archive',
    description: 'Explore the Rovers record against every opponent',
    href: '/head-to-head',
    aliases: 'opponents clubs results record'
  },
  {
    id: 'connections',
    title: 'Rovers Connections',
    description: 'Discover players shared with opposition clubs',
    href: '/rovers-connections',
    aliases: 'connections opponents players clubs'
  },
  {
    id: 'fantasy-team',
    title: 'Fantasy XI',
    description: 'Build your all-time Tranmere Rovers team',
    href: '/fantasy-team',
    aliases: 'fantasy team eleven lineup'
  },
  {
    id: 'who-am-i',
    title: 'Who Am I?',
    description: 'Test your knowledge of Tranmere Rovers players',
    href: '/who-am-i',
    aliases: 'quiz game player'
  },
  {
    id: 'avatar-builder',
    title: 'Player Avatar Builder',
    description: 'Create a Tranmere Rovers player avatar',
    href: '/players/avatar-builder',
    aliases: 'avatar studio builder player kit'
  }
];
