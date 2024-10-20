import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
  DataTables
} from '@tranmere-web/lib/src/tranmere-web-utils';
import {
  MatchEvent,
  Match,
  Appearance,
  Goal,
  FixtureSet,
  MatchEvents,
  TeamLineups
} from '@tranmere-web/lib/src/tranmere-web-types';
import {
  translateTeamName,
  translatePlayerName,
  translateCompetition
} from '@tranmere-web/lib/src/tranmere-web-mappers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { DynamoDBDocument, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import moment from 'moment';
const utils = new TranmereWebUtils();
const dynamo = DynamoDBDocument.from(
  new DynamoDB({ apiVersion: '2012-08-10' })
);
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
const chatModel = new ChatOpenAI({ modelName: 'gpt-4-turbo' });
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const day = event.pathParameters
    ? event.pathParameters!.date
    : moment(new Date()).format('YYYY-MM-DD');
  const season = event.pathParameters
    ? event.pathParameters!.season
    : utils.getYear().toString();
  const theDate = new Date(day!);
  const options = {
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

  const fixtureUrl = `https://www.bbc.co.uk/wc-data/container/sport-data-scores-fixtures?selectedEndDate=${day}&selectedStartDate=${day}&todayDate=${day}&urn=urn%3Abbc%3Asportsdata%3Afootball%3Ateam%3Atranmere-rovers&useSdApi=false`;
  const fixturesResponse = await fetch(fixtureUrl, options);
  const fixtures = (await fixturesResponse.json()) as FixtureSet;

  if (!fixtures.eventGroups || fixtures.eventGroups.length === 0) {
    return utils.sendResponse(200, { message: 'nothing' });
  }

  if (
    fixtures.eventGroups[0].secondaryGroups[0].events[0].status === 'POSTPONED'
  ) {
    return utils.sendResponse(200, { message: 'postponed' });
  }

  const reportId = fixtures.eventGroups[0].secondaryGroups[0].events[0].id;

  const competition = translateCompetition(
    fixtures.eventGroups[0].secondaryGroups[0].events[0].tournament.name
  );

  const hscore =
    fixtures.eventGroups[0].secondaryGroups[0].events[0].home.score;
  const vscore =
    fixtures.eventGroups[0].secondaryGroups[0].events[0].away.score;

  const lineup_url = `https://www.bbc.co.uk/wc-data/container/match-lineups?globalContainerPolling=true&urn=urn%3Abbc%3Asportsdata%3Afootball%3Aevent%3A${reportId}`;
  const lineupResponse = await fetch(lineup_url, options);

  const lineups = (await lineupResponse.json()) as TeamLineups;

  const venue = lineups.homeTeam.name.fullName === 'Tranmere Rovers' ? 'Prenton Park' : 'Unknown';

  /*
  const attendance = lineups.payload[0].body.meta.attendance
    ? parseInt(lineups.payload[0].body.meta.attendance.replace(/,/g, ''))
    : 0;
  */

  const theMatch: Match = {
    date: day!,
    attendance: 0,
    referee: '',
    formation:
      lineups.homeTeam.name.fullName === 'Tranmere Rovers'
        ? lineups.homeTeam.formation.layout
        : lineups.awayTeam.formation.layout,
    id: uuidv4(),
    programme: '#N/A',
    home: translateTeamName(lineups.homeTeam.name.fullName),
    visitor: translateTeamName(lineups.awayTeam.name.fullName),
    opposition:
      lineups.homeTeam.name.fullName === 'Tranmere Rovers'
        ? translateTeamName(lineups.awayTeam.name.fullName)
        : translateTeamName(lineups.homeTeam.name.fullName),
    static: 'static',
    season: season,
    venue: venue,
    hgoal: hscore,
    tier: competition == 'League Two' ? '4' : '0',
    division: competition == 'League Two' ? '4' : '0',
    pens: '',
    vgoal: vscore,
    ft: hscore + '-' + vscore,
    competition: competition
  };

  /* Pens
  if (
    oldFixtureResponse.payload[0].body.matchData[0].tournamentDatesWithEvents[
      dateString
    ][0].events[0].eventOutcomeType === 'shootout'
  ) {
    theMatch.pens =
      oldFixtureResponse.payload[0].body.matchData[0].tournamentDatesWithEvents[
        dateString
      ][0].events[0].comment;
  }
      */

  const events: MatchEvent[] = [];
  let page = 1;
  let complete = false;

  while (!complete) {
    const url = `https://www.bbc.co.uk/wc-data/container/stream?globalContainerPolling=true&liveTextStreamId=${reportId}&pageNumber=${page}&pageSize=40&type=football`;
    const eventsResponse = await fetch(url, options);
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

  console.log(`Found ${events.length} events to build a match report`);
  if (events.length > 0) {
    await utils.insertUpdateItem(theMatch, DataTables.RESULTS_TABLE);

    const team = theMatch.home === 'Tranmere Rovers' ? 'homeTeam' : 'awayTeam';
    for await (const element of lineups[team].players.starters) {
      const sub = lineups[team].players.substitutes.find(
        (s) =>
          s.substitutedOn &&
          s.substitutedOn.playerOffName === element.displayName
      );
      const app: Appearance = {
        id: uuidv4(),
        Date: day!,
        Opposition: theMatch.opposition!,
        Competition: competition,
        Season: season!,
        Name: translatePlayerName(
          simplifyName(element.name.first) + ' ' + element.name.last
        ),
        Number: element.shirtNumber.toString(),
        SubbedBy: sub
          ? translatePlayerName(
              simplifyName(sub.name.first) + ' ' + sub.name.last
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
      await utils.insertUpdateItem(app, DataTables.APPS_TABLE_NAME);
    }

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are a robot capable of creating soccer match reports for a tranmere rovers fan site.'
      ],
      [
        'user',
        `Write a compelling soccer match report in 5-6 paragraphs using the following match events. 
        Competition: {competition}
        Venue: {venue}
        Date: {date}
        Attendance: {attendance}
        Match events:
          {events}`
      ]
    ]);
    const chain = prompt.pipe(chatModel);
    const response = await chain.invoke({
      events: JSON.stringify(events),
      competition: competition,
      date: theMatch.date,
      venue: venue,
      referee: theMatch.referee,
      attendance:
        theMatch.attendance && theMatch.attendance > 0
          ? theMatch.attendance
          : 'unknown'
    });

    const output = response.content.toString().replace(/\n/g, '<br />');

    const params = new UpdateCommand({
      TableName: DataTables.REPORT_TABLE,
      Key: {
        day: day
      },
      UpdateExpression: 'set report = :r',
      ExpressionAttributeValues: {
        ':r': output
      },
      ReturnValues: 'UPDATED_NEW'
    });
    await dynamo.send(params);

    if (
      (theMatch.home === 'Tranmere Rovers' && theMatch.hgoal === '0') ||
      (theMatch.visitor === 'Tranmere Rovers' && theMatch.vgoal === '0')
    ) {
      console.log('No goals scored by Tranmere Rovers in this match');
      return utils.sendResponse(200, { message: events });
    } else {
      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          goals: z
            .array(
              z.object({
                Minute: z.number().describe('the minute the goal was scored'),
                Scorer: z.string().describe('the name of the goalscorer'),
                GoalType: z
                  .enum(['Shot', 'Header', 'Penalty', 'FreeKick', 'Header'])
                  .nullable()
                  .describe('how the goal was scored if known'),
                Assist: z
                  .string()
                  .nullable()
                  .describe('the name of any player credited with the assist'),
                AssistType: z
                  .enum(['Pass', 'Cross', 'Corner', 'FreeKick', 'Header'])
                  .nullable()
                  .describe('the type of assist')
              })
            )
            .describe(
              'An array of goals scored by tranmere rovers players in this match'
            )
        })
      );

      const goal_chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
          'Use the supplied soccer game events to extract information about goals scored by Tranmere Rovers.\n{format_instructions}\n{events}'
        ),
        chatModel,
        parser
      ]);

      const goal_response = await goal_chain.invoke({
        events: JSON.stringify(events),
        format_instructions: parser.getFormatInstructions()
      });

      for await (const obj of goal_response.goals) {
        const goal: Goal = {
          id: uuidv4(),
          Date: day!,
          GoalType: obj.GoalType?.valueOf(),
          Minute: obj.Minute.toString(),
          Opposition: theMatch.opposition!,
          Scorer: translatePlayerName(obj.Scorer),
          Assist: obj.Assist!,
          AssistType: obj.AssistType?.valueOf(),
          Season: season
        };
        await utils.insertUpdateItem(goal, DataTables.GOALS_TABLE_NAME);
      }

      return utils.sendResponse(200, events);
    }
  } else {
    return utils.sendResponse(200, {
      message: 'no events - so no match report'
    });
  }
};
function simplifyName(first: string) {
  const name = first.split(' ');
  return name[0];
}
