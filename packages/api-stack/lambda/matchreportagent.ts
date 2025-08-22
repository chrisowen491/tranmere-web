import { APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
  DataTables
} from '@tranmere-web/lib/src/tranmere-web-utils';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText, stepCountIs } from 'ai';
import { FixturesTool } from '@tranmere-web/tools/src/FixturesTool';
import { LeagueTableTool } from '@tranmere-web/tools/src/LeagueTableTool';
import { MatchEventTool } from '@tranmere-web/tools/src/MatchEventTool';
import { ManagerTool } from '@tranmere-web/tools/src/ManagerTool';
import { LineupsTool } from '@tranmere-web/tools/src/LineupsTool';
import { RefereeAndFormationTool } from '@tranmere-web/tools/src/RefereeAndFormationTool';
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
  console.log(`Generating match Report For ${day}`);

  const matchReport = await generateText({
    model,
    tools: {
      FixturesTool,
      RefereeAndFormationTool,
      LeagueTableTool,
      MatchEventTool,
      ManagerTool
    },
    stopWhen: stepCountIs(6),
    prompt: `
            You are an agent capable of creating soccer match reports for a tranmere rovers fan site.
            You run at the start of every day. You should first see if any fixtures occured on ${day} and if so, generate a match report without headings. Use <br /> to separate paragraphs but avoid using other HTML.
            You should make the match report interesting by making reference to the current league position, referee, formation, the current manager, formation, the match events, tranmere's form over the past 5 results, plus previous recent meetings with the opponent.
            Do not guess the referee or attendance - just leave them blank.
            The current season is ${utils.getYear()}.
            If there are no fixtures today, you should return the words NO_FIXTURE.
        `
  });

  if (matchReport.text !== 'NO_FIXTURE') {
    await utils.updateReport(matchReport.text, day);
    const { object: match } = await generateObject({
      model,
      schema: z.object({
        attendance: z
          .number()
          .describe('The attendance of the fixture')
          .default(0),
        referee: z.string().describe('The referee of the fixture').default(''),
        formation: z
          .string()
          .describe('The formation Tranmere played during the game'),
        home: z.string().describe('The home team of the fixture'),
        visitor: z.string().describe('The away team of the fixture'),
        venue: z.string().describe('The venue of the fixture'),
        hgoal: z.number().describe('The score of the home team'),
        vgoal: z.number().describe('The score of the away team'),
        competition: z.string().describe('The competition of the fixture')
      }),
      prompt: `generate a match object from the following match report

        Report to evaluate: ${matchReport.text}`
    });
    console.log(JSON.stringify(match, null, 2));

    const translatedCompetition = translateCompetition(match.competition);

    const theMatch: Match = {
      date: day,
      attendance: match.attendance ? match.attendance : 0,
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
      season: utils.getYear().toString(),
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
      temperature: 0.1,
      stopWhen: stepCountIs(1),
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
        const apps = JSON.parse(call.output as string) as Appearance[];
        for await (const app of apps) {
          await utils.insertUpdateItem(app, DataTables.APPS_TABLE_NAME);
        }
      }
    }

    return utils.sendResponse(200, {
      matchReport: matchReport,
      theMatch,
      goals,
      lineups
    });
  }

  return utils.sendResponse(200, {
    matchReport
  });
};
