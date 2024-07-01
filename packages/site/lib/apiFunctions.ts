import { Manager, Match, PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";

const APP_SYNC_URL = 'https://api.prod.tranmere-web.com';
const APP_SYNC_OPTIONS = {
  headers: {
    //'x-api-key': this.APP_SYNC_KEY
  }
};

export function getYear(): number {
  const theDate = new Date();
  if (theDate.getUTCMonth() > 6) {
    return theDate.getFullYear();
  } else {
    return theDate.getFullYear() - 1;
  }
}

export function getSeasons(): number[] {
  const seasons: number[] = [];
  for (let i = getYear(); i > 1920; i--) {
    seasons.push(i);
  }
  return seasons;
}

export async function getTopScorersBySeason() : Promise<PlayerSeasonSummary[]> {

  const results: PlayerSeasonSummary[] = [];

  for (let i = 1977; i <= getYear(); i++) {
    const result = await fetch(
      'https://api.prod.tranmere-web.com/player-search/?season=' +
        i +
        '&sort=Goals',
    );
    const players = await result.json() as {players: PlayerSeasonSummary[]};
    if (players.players && players.players.length > 0) results.push(players.players[0]);
  }
  return results;
}

export async function findAllTranmereManagers() : Promise<Manager[]> {

  const query = encodeURIComponent(
    '{listTranmereWebManagers(limit:300){items{name dateLeft dateJoined}}}'
  );
  const results = await fetch(`${APP_SYNC_URL}/graphql?query=${query}`,
    APP_SYNC_OPTIONS
  );

  const managers: Manager[] = [];

  const list = (await results.json()) as  {data:{listTranmereWebManagers: {items : Manager[]}}}

  for (const manager of list.data.listTranmereWebManagers.items) {
    let dateLeft = 'now';
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

export async function GetLastMatch() : Promise<Match> {

    const dateobj = new Date();
    const theYear =
      dateobj.getUTCMonth() > 6
        ? dateobj.getFullYear()
        : dateobj.getFullYear() - 1;


        const results  = await fetch(`https://api.prod.tranmere-web.com/result-search/?season=${theYear}&competition=&opposition=&manager=&venue=&pens=&sort=Date&c=${dateobj.getDate()}`)

    const matches = (await results.json()) as {results: Match[]};

    var idx = matches.results.length;
    var match = matches.results[idx - 1];
    if (match.programme) {
      var largeBody = {
        bucket: 'trfc-programmes',
        key: match.programme,
        edits: {
          resize: {
            width: 200,
            fit: 'contain'
          }
        }
      };
      match.largeprogramme = btoa(JSON.stringify(largeBody));
    }
    return match;
}

