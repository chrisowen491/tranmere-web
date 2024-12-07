import {
  Competition,
  HatTrick,
  Manager,
  Match,
  Player,
  PlayerSeasonSummary,
  Team,
} from "@tranmere-web/lib/src/tranmere-web-types";

const APP_SYNC_URL = "https://api.tranmere-web.com";
const APP_SYNC_OPTIONS = {
  headers: {
    //'x-api-key': this.APP_SYNC_KEY
  },
};

export async function GetSvg(input: string): Promise<string> {
  const start =
    '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">';
  const end = "</svg>";

  const request = await fetch(
    `https://raw.githubusercontent.com/chrisowen491/tranmere-web/refs/heads/master/packages/site/public/builder/${input}`,
  );
  if (request.status !== 200) {
    return "";
  }
  const body = (await request.text()).replace(start, "").replace(end, "");
  return body;
}

export function GetYear(): number {
  const theDate = new Date();
  if (theDate.getUTCMonth() > 6) {
    return theDate.getFullYear();
  } else {
    return theDate.getFullYear() - 1;
  }
}

export function GetSeasons(): number[] {
  const seasons: number[] = [];
  for (let i = GetYear(); i > 1920; i--) {
    seasons.push(i);
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
    [2008, 2007],
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

export function GetBaseUrl(env: CloudflareEnv) {
  if (!env.API_DOMAIN) {
    env = process.env as unknown as CloudflareEnv;
  }

  return env.API_PORT
    ? `${env.API_PROTOCOL}://${env.API_DOMAIN}:${env.API_PORT}`
    : `${env.API_PROTOCOL}://${env.API_DOMAIN}:${env.API_PORT}`;
}

export async function GetTopScorersBySeason(): Promise<PlayerSeasonSummary[]> {
  const results: PlayerSeasonSummary[] = [];

  for (let i = 1960; i <= GetYear(); i++) {
    const result = await fetch(
      "https://api.tranmere-web.com/player-search/?season=" + i + "&sort=Goals",
    );
    const players = (await result.json()) as { players: PlayerSeasonSummary[] };
    if (players.players && players.players.length > 0)
      results.push(players.players[0]);
  }
  return results;
}

export async function GetAllTranmereManagers(): Promise<Manager[]> {
  const query = encodeURIComponent(
    "{listTranmereWebManagers(limit:300){items{name dateLeft dateJoined programmePath}}}",
  );
  const results = await fetch(
    `${APP_SYNC_URL}/graphql?query=${query}&v=4`,
    APP_SYNC_OPTIONS,
  );

  const managers: Manager[] = [];

  const list = (await results.json()) as {
    data: { listTranmereWebManagers: { items: Manager[] } };
  };

  for (const manager of list.data.listTranmereWebManagers.items) {
    let dateLeft = "now";
    if (manager.dateLeft) dateLeft = manager.dateLeft;
    manager.dateLeftText = dateLeft;
    managers.push(manager);
  }
  managers.sort(function (a, b) {
    if (a.dateJoined < b.dateJoined) return 1;
    if (a.dateJoined > b.dateJoined) return -1;
    return 0;
  });

  return managers;
}

export async function GetLastMatch(): Promise<Match> {
  const dateobj = new Date();
  const theYear =
    dateobj.getUTCMonth() > 6
      ? dateobj.getFullYear()
      : dateobj.getFullYear() - 1;

  const results = await fetch(
    `https://api.tranmere-web.com/result-search/?season=${theYear}&competition=&opposition=&manager=&venue=&pens=&sort=Date&c=${dateobj.getDate()}`,
  );

  const matches = (await results.json()) as { results: Match[] };

  const idx = matches.results.length;
  const match = matches.results[idx - 1];
  return match;
}

export async function GetAllTeams(): Promise<Team[]> {
  const query: string = encodeURIComponent(
    "{listTranmereWebClubs(limit:500){items{name}}}",
  );
  const result = await fetch(
    `${APP_SYNC_URL}/graphql?query=${query}`,
    APP_SYNC_OPTIONS,
  );

  const list = (await result.json()) as {
    data: { listTranmereWebClubs: { items: Team[] } };
  };

  const results: Team[] = list.data.listTranmereWebClubs.items;

  results.sort(function (a: Team, b: Team) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  return results;
}

export async function GetAllPlayers(): Promise<Player[]> {
  const query: string = encodeURIComponent(
    "{listTranmereWebPlayerTable(limit:500){items{name picLink}}}",
  );
  const result = await fetch(
    `${APP_SYNC_URL}/graphql?query=${query}`,
    APP_SYNC_OPTIONS,
  );

  const list = (await result.json()) as {
    data: { listTranmereWebPlayerTable: { items: Player[] } };
  };

  const results: Player[] = list.data.listTranmereWebPlayerTable.items;

  results.sort(function (a: Team, b: Team) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  return results;
}

export async function GetOnThisDay(): Promise<Match | null> {
  const dateobj = new Date();
  const day = dateobj.toISOString().slice(0, 10).substr(5);
  const query = encodeURIComponent(
    `{getTranmereWebOnThisDayById(day: "${day}"){opposition programme hgoal vgoal season date}}`,
  );

  const response = await fetch(
    `${APP_SYNC_URL}/graphql?query=${query}`,
    APP_SYNC_OPTIONS,
  );

  const onThisDay = (await response.json()) as {
    data: { getTranmereWebOnThisDayById: Match };
  };

  if (onThisDay.data.getTranmereWebOnThisDayById === null) return null;

  return onThisDay.data.getTranmereWebOnThisDayById;
}

export async function GetAllCupCompetitions(): Promise<Competition[]> {
  const query = encodeURIComponent(
    "{listTranmereWebCompetitions(limit:500){items{name}}}",
  );

  const competitions = await fetch(
    `${APP_SYNC_URL}/graphql?query=${query}`,
    APP_SYNC_OPTIONS,
  );

  const list = (await competitions.json()) as {
    data: { listTranmereWebCompetitions: { items: Competition[] } };
  };

  const results: Competition[] = list.data.listTranmereWebCompetitions.items;
  return results;
}

export async function GetAllHatTricks(): Promise<HatTrick[]> {
  const query = encodeURIComponent(
    "{listTranmereWebHatTricks(limit:500){items{Date Player Opposition Goals Season}}}",
  );
  const result = await fetch(
    `${APP_SYNC_URL}/graphql?query=${query}`,
    APP_SYNC_OPTIONS,
  );

  const list = (await result.json()) as {
    data: { listTranmereWebHatTricks: { items: HatTrick[] } };
  };

  const results: HatTrick[] = list.data.listTranmereWebHatTricks.items;

  const players = await GetAllPlayers();

  results.forEach((r) => {
    r.picLink = players.find((p) => p.name === r.Player)?.picLink;
  });

  results.sort(function (a, b) {
    if (a.Date < b.Date) return -1;
    if (a.Date > b.Date) return 1;
    return 0;
  });
  return results;
}

export function ToTitleCase(input: string): string {
  let i, j, str;
  str = input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless
  // they are the first or last words in the string
  const lowers = [
    "A",
    "An",
    "The",
    "And",
    "But",
    "Or",
    "For",
    "Nor",
    "As",
    "At",
    "By",
    "For",
    "From",
    "In",
    "Into",
    "Near",
    "Of",
    "On",
    "Onto",
    "To",
    "With",
  ];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(
      new RegExp("\\s" + lowers[i] + "\\s", "g"),
      function (txt) {
        return txt.toLowerCase();
      },
    );

  // Certain words such as initialisms or acronyms should be left uppercase
  const uppers = ["Id", "Tv"];
  for (i = 0, j = uppers.length; i < j; i++)
    str = str.replace(
      new RegExp("\\b" + uppers[i] + "\\b", "g"),
      uppers[i].toUpperCase(),
    );

  return str;
}

export function buildImagePath(
  image: string,
  width: number,
  height: number,
): string {
  const programme = new ProgrammeImage(image, {
    resize: {
      width: width,
      height: height,
      fit: "fill",
    },
  });
  return "https://images.tranmere-web.com/" + programme.imagestring();
}

export interface ImageEdits {
  resize?: ImageResize;
}

export interface ImageResize {
  width: number;
  height?: number;
  fit: string;
}

export class ProgrammeImage {
  bucket: string;
  key: string;
  edits?: ImageEdits;

  constructor(key: string, edits?: ImageEdits) {
    this.bucket = "trfc-programmes";
    this.key = key;
    if (typeof edits !== "undefined") {
      this.edits = edits;
    }
  }

  imagestring() {
    return Buffer.from(JSON.stringify(this)).toString("base64");
  }
}
