import { tool } from 'ai';
import { z } from 'zod';
import fetch from 'node-fetch';
import {
  Appearance,
  FixtureSet,
  TeamLineups
} from '@tranmere-web/lib/src/tranmere-web-types';
import moment from 'moment';
import { STANDARD_HEADERS } from '@tranmere-web/lib/src/apiFunctions';
import { translatePlayerName } from '@tranmere-web/lib/src/tranmere-web-mappers';
import { TranmereWebUtils } from '@tranmere-web/lib/src/tranmere-web-utils';
import { v4 as uuidv4 } from 'uuid';

const utils = new TranmereWebUtils();

export const LineupsTool = tool({
  description: 'Get lineup information for whren building a match report',
  inputSchema: z.object({
    date: z.string().describe('The date of the fixture in YYYY-MM-DD format'),
    opposition: z.string().describe('The opposition team'),
    competition: z.string().describe('The competition of the fixture'),
    season: z.string().describe('The season of the fixture'),
    homeTeam: z.string().describe('The home team of the fixture')
  }),
  execute: async ({ date, opposition, competition, season, homeTeam }) => {
    const day = moment(date).format('YYYY-MM-DD');

    const fixtureUrl = `https://www.bbc.co.uk/wc-data/container/sport-data-scores-fixtures?selectedEndDate=${day}&selectedStartDate=${day}&todayDate=${day}&urn=urn%3Abbc%3Asportsdata%3Afootball%3Ateam%3Atranmere-rovers&useSdApi=false`;
    const fixturesResponse = await fetch(fixtureUrl, STANDARD_HEADERS);
    const fixtures = (await fixturesResponse.json()) as FixtureSet;
    if (fixtures.eventGroups[0]) {
      const reportId = fixtures.eventGroups[0].secondaryGroups[0].events[0].id;
      const lineup_url = `https://www.bbc.co.uk/wc-data/container/match-lineups?globalContainerPolling=true&urn=urn%3Abbc%3Asportsdata%3Afootball%3Aevent%3A${reportId}`;
      const lineupResponse = await fetch(lineup_url, STANDARD_HEADERS);
      const lineups = (await lineupResponse.json()) as TeamLineups;


      const team = homeTeam === 'Tranmere Rovers' ? 'homeTeam' : 'awayTeam';
      const apps: Appearance[] = [];
      for await (const element of lineups[team].players.starters) {
        const sub = lineups[team].players.substitutes.find(
          (s) =>
            s.substitutedOn &&
            s.substitutedOn.playerOffName === element.displayName
        );
        try{
          const app: Appearance = {
            id: uuidv4(),
            Date: day!,
            Opposition: opposition!,
            Competition: competition!,
            Season: season,
            Name: translatePlayerName(
              utils.simplifyName(element.name.first) + ' ' + element.name.last
            ),
            Number: element.shirtNumber.toString(),
            SubbedBy: sub
              ? translatePlayerName(
                  utils.simplifyName(sub.name.first) + ' ' + sub.name.last
                )
              : null,
            SubTime: sub ? sub.substitutedOn?.timeMin.toString() : null,
            YellowCard: element.cards.find((el) => el.type === 'Yellow Card')
              ? 'TRUE'
              : null,
            RedCard: element.cards.find((el) => el.type === 'Red Card')
              ? 'TRUE'
              : null,
            SubYellow:
              sub && sub.cards.find((el) => el.type === 'Yellow Card')
                ? 'TRUE'
                : null,
            SubRed:
              sub && sub.cards.find((el) => el.type === 'Red Card')
                ? 'TRUE'
                : null
          };
          if (!sub) delete app.SubbedBy;
          apps.push(app);
        } catch (e) {
          console.log('Error processing player:', element, e);
        }
      }

      return JSON.stringify(apps);
    } else {
      return 'Could not find the fixture';
    }
  }
});
