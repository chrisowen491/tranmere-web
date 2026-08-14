import {
  Competition,
  Match,
} from '@tranmere-web/lib/src/tranmere-web-types';
import { MATCH_COMPETITIONS } from './competition-constants';
import { queryOnThisDayGameRow, type D1DatabaseReader } from './d1-queries';

export const STANDARD_HEADERS = {
  headers: {
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua':
      '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1'
  }
};

export async function GetSvg(
  input: string,
  siteOrigin?: string
): Promise<string> {
  const start =
    '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">';
  const end = '</svg>';

  const sources = [
    ...(siteOrigin
      ? [new URL(`/builder/${input}`, siteOrigin).toString()]
      : []),
    `https://raw.githubusercontent.com/chrisowen491/tranmere-web/refs/heads/master/packages/site/public/builder/${input}`
  ];

  for (const source of sources) {
    try {
      const request = await fetch(source, { cache: 'no-store' });
      if (request.ok) {
        return (await request.text()).replace(start, '').replace(end, '');
      }
    } catch {
      // Try the next source when a local server or remote fallback is unavailable.
    }
  }

  return '';
}

export function GetYear(): number {
  const theDate = new Date();
  if (theDate.getUTCMonth() >= 6) {
    return theDate.getFullYear();
  } else {
    return theDate.getFullYear() - 1;
  }
}

export function GetSeasons(): number[] {
  const seasons: number[] = [];
  const wartimeSeasons = new Set([1939, 1940, 1941, 1942, 1943, 1944]);
  for (let i = GetYear(); i > 1920; i--) {
    if (!wartimeSeasons.has(i)) {
      seasons.push(i);
    }
  }
  return seasons;
}

export function GetSeasonsForPlayers(): number[] {
  const seasons: number[] = [];
  for (let i = GetYear(); i > 1976; i--) {
    seasons.push(i);
  }
  return seasons;
}

export function replaceSeasonsKit(input: string, season?: string): string {
  const seasonMapping = new Map<number, number>([
    [1931, 1930],
    [1932, 1930],
    [1933, 1930],
    [1934, 1930],    
    [1935, 1930],
    [1936, 1930],
    [1937, 1930],
    [1938, 1930], 
    [1961, 1960],
    [1961, 1960],
    [1961, 1960],
    [1961, 1960],         
    [1961, 1960],
    [1963, 1963],
    [1967, 1966],
    [1968, 1970],
    [1969, 1970],
    [1971, 1966],
    [1973, 1972],
    [1974, 1972],
    [1975, 1972],
    [1978, 1977],
    [1984, 1983],
    [1990, 1989],
    [1992, 1991],
    [1994, 1993],
    [1996, 1995],
    [1998, 1997],
    [2001, 2000],
    [2003, 2002],
    [2005, 2006],
    [2008, 2007]
  ]);

  const re = /\/\d\d\d\dA*\//gm;

  if (season) {
    let seasonKit = season;
    if (seasonMapping.get(parseInt(season))) {
      seasonKit = seasonMapping.get(parseInt(season))!.toString();
    }

    const output = input.replace(re, `/${seasonKit}/`);
    return output;
  } else {
    return input;
  }
}


export async function GetOnThisDay(
  db: D1DatabaseReader,
  now = new Date()
): Promise<Match | null> {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value || '';
  const date = `${part('year')}-${part('month')}-${part('day')}`;
  const row = await queryOnThisDayGameRow(db, date.slice(5), date);
  if (!row) return null;

  const score = row.full_time_score.match(/(\d+)\D+(\d+)/);
  return {
    id: row.id,
    date: row.match_date,
    season: String(row.season),
    opposition: row.opposition,
    programme:
      row.programme_path && row.programme_path !== '#N/A'
        ? row.programme_path
        : undefined,
    hgoal: Number(row.home_goals ?? score?.[1] ?? 0),
    vgoal: Number(row.away_goals ?? score?.[2] ?? 0),
    tier: Number(row.tier) || 0
  };
}

export async function GetAllCupCompetitions(): Promise<Competition[]> {
  return MATCH_COMPETITIONS.filter(
    (name) => name !== 'League' && name !== 'Conference'
  ).map((name) => ({ name }));
}

export function ToTitleCase(input: string): string {
  let i, j, str;
  str = input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless
  // they are the first or last words in the string
  const lowers = [
    'A',
    'An',
    'The',
    'And',
    'But',
    'Or',
    'For',
    'Nor',
    'As',
    'At',
    'By',
    'For',
    'From',
    'In',
    'Into',
    'Near',
    'Of',
    'On',
    'Onto',
    'To',
    'With'
  ];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(
      new RegExp('\\s' + lowers[i] + '\\s', 'g'),
      function (txt) {
        return txt.toLowerCase();
      }
    );

  // Certain words such as initialisms or acronyms should be left uppercase
  const uppers = ['Id', 'Tv'];
  for (i = 0, j = uppers.length; i < j; i++)
    str = str.replace(
      new RegExp('\\b' + uppers[i] + '\\b', 'g'),
      uppers[i].toUpperCase()
    );

  return str;
}
