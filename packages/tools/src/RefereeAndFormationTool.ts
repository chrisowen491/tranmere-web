import { tool } from 'ai';
import { z } from 'zod';
import fetch from 'node-fetch';
import {
  FixtureSet,
  TeamLineups
} from '@tranmere-web/lib/src/tranmere-web-types';
import moment from 'moment';
import { STANDARD_HEADERS } from '@tranmere-web/lib/src/apiFunctions';


export const RefereeAndFormationTool = tool({
  description: 'Get referee and formation information for when building a match report',
  inputSchema: z.object({
    date: z.string().describe('The date of the fixture in YYYY-MM-DD format'),
    homeTeam: z.string().describe('The home team of the fixture')
  }),
  execute: async ({ date, homeTeam }) => {
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
      const referee = lineups.officials.find(ref => ref.type === 'Referee');
      
      return JSON.stringify({
        referee: referee ? `${referee.firstName} ${referee.lastName}` : '',
        formation: lineups[team].formation,
      });
      
    } else {
      return 'Could not find the fixture';
    }
  }
});
