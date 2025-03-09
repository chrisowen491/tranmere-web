import { tool } from 'ai';
import { z } from 'zod';
import fetch from 'node-fetch';
import {
  FixtureSet,
  MatchEvent,
  MatchEvents
} from '@tranmere-web/lib/src/tranmere-web-types';
import moment from 'moment';
import { STANDARD_HEADERS } from '@tranmere-web/lib/src/apiFunctions';

export const MatchEventTool = tool({
  description: 'Get match events for when building a match report',
  parameters: z.object({
    date: z.string().describe('The date of the fixture in YYYY-MM-DD format')
  }),
  execute: async ({ date }) => {
    const day = moment(date).format('YYYY-MM-DD');

    const fixtureUrl = `https://www.bbc.co.uk/wc-data/container/sport-data-scores-fixtures?selectedEndDate=${day}&selectedStartDate=${day}&todayDate=${day}&urn=urn%3Abbc%3Asportsdata%3Afootball%3Ateam%3Atranmere-rovers&useSdApi=false`;
    const fixturesResponse = await fetch(fixtureUrl, STANDARD_HEADERS);
    const fixtures = (await fixturesResponse.json()) as FixtureSet;
    const reportId = fixtures.eventGroups[0].secondaryGroups[0].events[0].id;

    const events: MatchEvent[] = [];
    let page = 1;
    let complete = false;

    while (!complete) {
      const url = `https://www.bbc.co.uk/wc-data/container/stream?globalContainerPolling=true&liveTextStreamId=${reportId}&pageNumber=${page}&pageSize=40&type=football`;
      const eventsResponse = await fetch(url, STANDARD_HEADERS);
      const summary = (await eventsResponse.json()) as MatchEvents;

      summary.results.forEach((element) => {
        if (element.content.model.blocks![0].model.blocks![0].model.text)
          events.unshift({
            description:
              element.content.model.blocks![0].model.blocks![0].model.text,
            time: element.dates.time
          });
      });

      if (summary.page.total == page) {
        complete = true;
      } else {
        page++;
      }
    }

    return JSON.stringify(events);
  }
});
