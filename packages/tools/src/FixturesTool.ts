import { tool } from 'ai';
import { z } from 'zod';
import fetch from 'node-fetch';
import { FixtureSet } from '@tranmere-web/lib/src/tranmere-web-types';
import moment from 'moment';
import { STANDARD_HEADERS } from '@tranmere-web/lib/src/apiFunctions';

export const FixturesTool = tool({
  description: 'Get information about upcoming Tranmere Rovers fixtures.',
  parameters: z.object({
    start: z
      .string()
      .describe('The date to start searching for fixtures in YYYY-MM-DD format')
      .default(moment().format('YYYY-MM-DD')),
    monthsInFuture: z
      .number()
      .describe('The number of months in the future to search for fixtures')
      .default(3)
  }),
  execute: async ({ start, monthsInFuture }) => {
    const day = moment(start).format('YYYY-MM-DD');
    const future = moment(new Date())
      .add(monthsInFuture, 'months')
      .format('YYYY-MM-DD');

    const fixtureUrl = `https://www.bbc.co.uk/wc-data/container/sport-data-scores-fixtures?selectedEndDate=${future}&selectedStartDate=${day}&todayDate=${day}&urn=urn%3Abbc%3Asportsdata%3Afootball%3Ateam%3Atranmere-rovers&useSdApi=false`;
    const fixturesResponse = await fetch(fixtureUrl, STANDARD_HEADERS);
    const fixtures = (await fixturesResponse.json()) as FixtureSet;

    const response = fixtures.eventGroups.map((group) => {
      return {
        date: group.displayLabel,
        competition: group.secondaryGroups[0].displayLabel,
        homeTeam: group.secondaryGroups[0].events[0].home.fullName,
        awayTeam: group.secondaryGroups[0].events[0].away.fullName,
        time: group.secondaryGroups[0].events[0].time.displayTimeUK
      };
    });

    return JSON.stringify(response);
  }
});
