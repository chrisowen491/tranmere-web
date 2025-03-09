import { APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
  DataTables
} from '@tranmere-web/lib/src/tranmere-web-utils';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { FixturesTool } from '@tranmere-web/tools/src/FixturesTool';
import { LeagueTableTool } from '@tranmere-web/tools/src/LeagueTableTool';
import { MatchEventTool } from '@tranmere-web/tools/src/MatchEventTool';
import { ManagerTool } from '@tranmere-web/tools/src/ManagerTool';
import { ResultsTool } from '@tranmere-web/tools/src/ResultsTool';
import { LineupsTool } from '@tranmere-web/tools/src/LineupsTool';
import {
  Appearance,
  Goal,
  Match
} from '@tranmere-web/lib/src/tranmere-web-types';
import moment from 'moment';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  translateCompetition,
  translatePlayerName,
  translateTeamName
} from '@tranmere-web/lib/src/tranmere-web-mappers';

const utils = new TranmereWebUtils();

exports.handler = async (): Promise<APIGatewayProxyResult> => {
  const model = openai('gpt-4o');

  const date = new Date();
  const day = moment(date).subtract(1, 'day').format('YYYY-MM-DD');

  const matchReport = await generateText({
    model,
    tools: {
      FixturesTool,
      LeagueTableTool,
      MatchEventTool,
      ManagerTool,
      ResultsTool
    },
    maxSteps: 10,
    prompt: `
            You are an agent capable of creating soccer match reports for a tranmere rovers fan site.
            You run at the start of every day. You should first see if any fixtures occured on ${day} and if so, generate a match report without headings. Use <br /> to separate paragraphs but avoid using other HTML.
            You should make the match report interesting by making reference to the current league position, the current manager, formation, the match events, tranmere's form over the past 5 results, plus previous recent meetings with the opponent.
            If there are no fixtures today, you should return the words NO_FIXTURE.
        `
  });

  if (matchReport.text !== 'NO_FIXTURE') {
    await utils.updateReport(matchReport.text, day);
    const { object: match } = await generateObject({
      model,
      schema: z.object({
        date: z
          .string()
          .describe('The date of the fixture in YYYY-MM-DD format')
          .default(day),
        attendance: z
          .number()
          .describe('The attendance of the fixture')
          .default(0),
        referee: z.string().describe('The referee oif the fixture').default(''),
        formation: z
          .string()
          .describe('The formation Tranmere played during the game'),
        home: z.string().describe('The home team of the fixture'),
        visitor: z.string().describe('The away team of the fixture'),
        season: z
          .string()
          .describe('The season of the fixture')
          .default(utils.getYear().toString()),
        venue: z.string().describe('The venue of the fixture'),
        hgoal: z.number().describe('The score of the home team'),
        vgoal: z.number().describe('The score of the away team'),
        competition: z.string().describe('The competition of the fixture')
      }),
      prompt: `generate a match object from the following match report

        Report to evaluate: ${matchReport.text}`
    });

    const translatedCompetition = translateCompetition(match.competition);

    const theMatch: Match = {
      date: match.date,
      attendance: match.attendance,
      referee: match.referee,
      formation: match.formation,
      id: uuidv4(),
      programme: '#N/A',
      ticket: '#N/A',
      home: translateTeamName(match.home),
      visitor: translateTeamName(match.visitor),
      opposition:
        match.home === 'Tranmere Rovers'
          ? translateTeamName(match.visitor)
          : translateTeamName(match.home),
      static: 'static',
      season: match.season,
      venue: match.venue,
      hgoal: match.hgoal,
      tier: translatedCompetition == 'League Two' ? 4 : 0,
      pens: '',
      vgoal: match.vgoal,
      ft: match.hgoal + '-' + match.vgoal,
      competition: translatedCompetition
    };

    await utils.insertUpdateItem(theMatch, DataTables.RESULTS_TABLE);

    const { object: goals } = await generateObject({
      model,
      schema: z.object({
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
      }),
      prompt: `Use the supplied soccer game events to extract information about goals scored by Tranmere Rovers.

        Events: ${matchReport.text}`
    });

    for await (const obj of goals.goals) {
      const goal: Goal = {
        id: uuidv4(),
        Date: theMatch.date,
        GoalType: obj.GoalType?.valueOf(),
        Minute: obj.Minute.toString(),
        Opposition: theMatch.opposition!,
        Scorer: translatePlayerName(obj.Scorer),
        Assist: obj.Assist!,
        AssistType: obj.AssistType?.valueOf(),
        Season: theMatch.season
      };
      await utils.insertUpdateItem(goal, DataTables.GOALS_TABLE_NAME);
    }

    // Vercel does not allow generate object to use tools - so instead we will use generateText and inspect the tool call results
    const lineups = await generateText({
      model,
      tools: {
        LineupsTool
      },
      maxSteps: 1,
      prompt: `
                Generate lineup information for the following match:
                Date: ${theMatch.date}
                Opposition ${theMatch.opposition}
                Competition: ${theMatch.competition}
                Season: ${theMatch.season}
                homeTeam: ${theMatch.home}
            `
    });

    if (lineups.toolResults.length === 1) {
      const call = lineups.toolResults[0];
      if (call.toolName === 'LineupsTool') {
        const apps = JSON.parse(call.result) as Appearance[];
        for await (const app of apps) {
          await utils.insertUpdateItem(app, DataTables.APPS_TABLE_NAME);
        }
      }
    }

    return utils.sendResponse(200, {
      matchReport,
      theMatch,
      goals,
      lineups
    });
  }

  return utils.sendResponse(200, {
    matchReport
  });
};
