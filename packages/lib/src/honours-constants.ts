export const HONOURS_ACHIEVEMENT_KINDS = [
  'Trophy',
  'Promotion',
  'Play-offs',
  'Cup run',
  'Relegation'
] as const;

export type HonoursAchievementKind = (typeof HONOURS_ACHIEVEMENT_KINDS)[number];

export type HonoursAchievement = {
  readonly title: string;
  readonly detail: string;
  readonly kind: HonoursAchievementKind;
  /** ISO date of the final, decisive tie or best-known season-ending fixture. */
  readonly achievedOn: string;
  readonly href?: string;
};

export type HonoursSeason = {
  readonly season: number;
  readonly achievements: readonly HonoursAchievement[];
};

export const HONOURS_SEASONS: readonly HonoursSeason[] = [
  {
    season: 1933,
    achievements: [
      {
        title: 'Welsh Cup runners-up',
        detail: 'Reached the Welsh Cup final.',
        kind: 'Cup run',
        achievedOn: '1934-05-03'
      }
    ]
  },
  {
    season: 1934,
    achievements: [
      {
        title: 'Welsh Cup winners',
        detail: 'Lifted the Welsh Cup.',
        kind: 'Trophy',
        achievedOn: '1935-05-04'
      }
    ]
  },
  {
    season: 1937,
    achievements: [
      {
        title: 'Division Three North champions',
        detail: 'Crowned champions and promoted.',
        kind: 'Trophy',
        achievedOn: '1938-05-07',
        href: '/season/1937'
      }
    ]
  },
  {
    season: 1938,
    achievements: [
      {
        title: 'Relegated from Division Two',
        detail: 'Relegated at the end of the season.',
        kind: 'Relegation',
        achievedOn: '1939-05-06',
        href: '/season/1938'
      }
    ]
  },
  {
    season: 1966,
    achievements: [
      {
        title: 'Promotion from Division Four',
        detail: 'Finished fourth to secure promotion.',
        kind: 'Promotion',
        achievedOn: '1967-05-17',
        href: '/season/1966'
      }
    ]
  },
  {
    season: 1975,
    achievements: [
      {
        title: 'Promotion from Division Four',
        detail: 'Finished fourth to return to Division Three.',
        kind: 'Promotion',
        achievedOn: '1976-04-26',
        href: '/season/1975'
      }
    ]
  },
  {
    season: 1974,
    achievements: [
      {
        title: 'Relegated from Division Three',
        detail: 'Relegated at the end of the season.',
        kind: 'Relegation',
        achievedOn: '1975-05-03',
        href: '/season/1974'
      }
    ]
  },
  {
    season: 1978,
    achievements: [
      {
        title: 'Relegated from Division Three',
        detail: 'Relegated at the end of the season.',
        kind: 'Relegation',
        achievedOn: '1979-05-05',
        href: '/season/1978'
      }
    ]
  },
  {
    season: 1988,
    achievements: [
      {
        title: 'Promotion from Division Four',
        detail: 'Finished runners-up and won promotion.',
        kind: 'Promotion',
        achievedOn: '1989-05-13',
        href: '/season/1988'
      }
    ]
  },
  {
    season: 1989,
    achievements: [
      {
        title: 'Leyland DAF Cup winners',
        detail: "Won the Associate Members' Cup at Wembley.",
        kind: 'Trophy',
        achievedOn: '1990-05-20',
        href: '/match/1989/1990-05-20'
      }
    ]
  },
  {
    season: 1990,
    achievements: [
      {
        title: 'Division Three play-off winners',
        detail: 'Beat Bolton Wanderers at Wembley to earn promotion.',
        kind: 'Play-offs',
        achievedOn: '1991-06-01',
        href: '/match/1990/1991-06-01'
      },
      {
        title: "Associate Members' Cup runners-up",
        detail: 'Returned to Wembley for a second successive final.',
        kind: 'Cup run',
        achievedOn: '1991-05-26',
        href: '/match/1990/1991-05-26'
      }
    ]
  },
  {
    season: 1993,
    achievements: [
      {
        title: 'League Cup semi-finalists',
        detail: 'Reached the final four of the League Cup.',
        kind: 'Cup run',
        achievedOn: '1994-02-27',
        href: '/match/1993/1994-02-27'
      }
    ]
  },
  {
    season: 1999,
    achievements: [
      {
        title: 'League Cup runners-up',
        detail: 'Reached the League Cup final at Wembley.',
        kind: 'Cup run',
        achievedOn: '2000-02-27',
        href: '/match/1999/2000-02-27'
      },
      {
        title: 'FA Cup quarter-finalists',
        detail: 'Reached the last eight of the FA Cup.',
        kind: 'Cup run',
        achievedOn: '2000-02-20',
        href: '/match/1999/2000-02-20'
      }
    ]
  },
  {
    season: 2000,
    achievements: [
      {
        title: 'FA Cup quarter-finalists',
        detail: 'Reached the last eight for a second successive season.',
        kind: 'Cup run',
        achievedOn: '2001-03-11',
        href: '/match/2000/2001-03-11'
      },
      {
        title: 'Relegated from Division One',
        detail: 'Relegated at the end of the season.',
        kind: 'Relegation',
        achievedOn: '2001-05-05',
        href: '/season/2000'
      }
    ]
  },
  {
    season: 2003,
    achievements: [
      {
        title: 'FA Cup quarter-finalists',
        detail: 'Made a third FA Cup quarter-final in five seasons.',
        kind: 'Cup run',
        achievedOn: '2004-03-16',
        href: '/match/2003/2004-03-16'
      }
    ]
  },
  {
    season: 2017,
    achievements: [
      {
        title: 'National League play-off winners',
        detail: 'Beat Boreham Wood at Wembley to return to the EFL.',
        kind: 'Play-offs',
        achievedOn: '2018-05-12',
        href: '/match/2017/2018-05-12'
      }
    ]
  },
  {
    season: 2013,
    achievements: [
      {
        title: 'Relegated from League One',
        detail: 'Relegated at the end of the season.',
        kind: 'Relegation',
        achievedOn: '2014-05-03',
        href: '/season/2013'
      }
    ]
  },
  {
    season: 2014,
    achievements: [
      {
        title: 'Relegated from League Two',
        detail: 'Relegated at the end of the season.',
        kind: 'Relegation',
        achievedOn: '2015-05-02',
        href: '/season/2014'
      }
    ]
  },
  {
    season: 2018,
    achievements: [
      {
        title: 'League Two play-off winners',
        detail: 'Beat Newport County at Wembley to win consecutive promotions.',
        kind: 'Play-offs',
        achievedOn: '2019-05-25',
        href: '/match/2018/2019-05-25'
      }
    ]
  },
  {
    season: 2020,
    achievements: [
      {
        title: 'EFL Trophy runners-up',
        detail: 'Reached the EFL Trophy final at Wembley.',
        kind: 'Cup run',
        achievedOn: '2021-03-14',
        href: '/match/2020/2021-03-14'
      }
    ]
  },
  {
    season: 2019,
    achievements: [
      {
        title: 'Relegated from League One',
        detail: 'Relegated on points per game',
        kind: 'Relegation',
        achievedOn: '2020-06-09',
        href: '/season/2019'
      }
    ]
  }
] as const;
