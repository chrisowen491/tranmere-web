import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { MatchEvent, Match, Appearance, Goal } from '../lib/tranmere-web-types';
import {translateTeamName, translatePlayerName, translateCompetition} from '../lib/tranmere-web-mappers'
import axios from 'axios';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamoDBDocument, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import moment from 'moment'
let utils = new TranmereWebUtils();
const dynamo = DynamoDBDocument.from(new DynamoDB({apiVersion: '2012-08-10'}));
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
const chatModel = new ChatOpenAI({modelName: "gpt-4-1106-preview"});
import  {v4 as uuidv4} from 'uuid';
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{    
    
    const day = event.pathParameters ? event.pathParameters!.date : moment(new Date()).format('YYYY-MM-DD');
    const season = event.pathParameters ? event.pathParameters!.season : utils.getYear().toString();
    const theDate = new Date(day!);
    const options = {
        headers: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"            
        }
    }

    const dateString = moment(theDate).format('dddd-Do-MMMM')

    const reportQuery = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-football-scores-match-list-data%2FendDate%2F${day}%2FstartDate%2F${day}%2Fteam%2Ftranmere-rovers%2FtodayDate%2F${day}%2Fversion%2F2.4.6`
    const fixtures = await axios.get(reportQuery, options);

    if(fixtures.data.payload && fixtures.data.payload[0].body.matchData.length == 0) {
        return utils.sendResponse(200, {'message': 'nothing'});
    }

    if(fixtures.data.payload[0].body.matchData[0].tournamentDatesWithEvents[dateString][0].events[0].eventProgress.status === "POSTPONED") {
        return utils.sendResponse(200, {'message': 'postponed'});
    }

    const reportId = fixtures.data.payload[0].body.matchData[0].tournamentDatesWithEvents[dateString][0].events[0].eventKey;
    const competition =  translateCompetition(fixtures.data.payload[0].body.matchData[0].tournamentMeta.tournamentName.first);
    const venue = fixtures.data.payload[0].body.matchData[0].tournamentDatesWithEvents[dateString][0].events[0].venue.name.first;
    const hscore = fixtures.data.payload[0].body.matchData[0].tournamentDatesWithEvents[dateString][0].events[0].homeTeam.scores.score;
    const vscore = fixtures.data.payload[0].body.matchData[0].tournamentDatesWithEvents[dateString][0].events[0].awayTeam.scores.score;

    const lineup_url = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-sport-football-team-lineups-data%2Fevent%2F${reportId}%2Fversion%2F1.0.8`;
    let lineups = await axios.get(lineup_url, options);

    const attendance = lineups.data.payload[0].body.meta.attendance ? parseInt(lineups.data.payload[0].body.meta.attendance.replace(/,/g, "")) : 0;

    let theMatch : Match = {
        date : day!,
        attendance: attendance,
        referee: lineups.data.payload[0].body.meta.referee,
        formation: lineups.data.payload[0].body.teams.homeTeam.name === "Tranmere Rovers" ? lineups.data.payload[0].body.teams.homeTeam.formation : lineups.data.payload[0].body.teams.awayTeam.formation,
        id: uuidv4(),
        programme: "#N/A",
        home: translateTeamName(lineups.data.payload[0].body.teams.homeTeam.name),
        visitor: translateTeamName(lineups.data.payload[0].body.teams.awayTeam.name),
        opposition: lineups.data.payload[0].body.teams.homeTeam.name === "Tranmere Rovers" ? translateTeamName(lineups.data.payload[0].body.teams.awayTeam.name) : translateTeamName(lineups.data.payload[0].body.teams.homeTeam.name),
        static: "static",
        season: season,
        venue: venue,
        hgoal: hscore,
        vgoal: vscore,
        ft: hscore + '-' + vscore,
        competition: competition
    }

    if(fixtures.data.payload[0].body.matchData[0].tournamentDatesWithEvents[dateString][0].events[0].eventOutcomeType === 'shootout')
        theMatch.pens = fixtures.data.payload[0].body.matchData[0].tournamentDatesWithEvents[dateString][0].events[0].comment;

    await utils.insertUpdateItem(theMatch, DataTables.RESULTS_TABLE);

    let team = theMatch.home === "Tranmere Rovers" ? "homeTeam" : "awayTeam";
    for await (const element of lineups.data.payload[0].body.teams[team].players) {
        
        if(element.meta.status === "starter") {

            var app : Appearance = {
                id: uuidv4(),
                Date: day!,
                Opposition: theMatch.opposition!,
                Competition:  competition,
                Season: season!,
                Name: translatePlayerName(element.name.full),
                Number: element.meta.uniformNumber,
                SubbedBy: element.substitutions.length > 0 ? translatePlayerName(element.substitutions[0].replacedBy.name.full) : null,
                SubTime: element.substitutions.length > 0 ? element.substitutions[0].timeElapsed : null,
                YellowCard: element.bookings.find((el) => el.type === "yellow-card") ? 'TRUE' : null,
                RedCard: element.bookings.find((el) => el.type === "red-card") ? 'TRUE' : null,
                SubYellow: element.substitutions.length > 0 && element.substitutions[0].replacedBy.bookings.find((el) => el.type === "yellow-card") ? 'TRUE' : null,
                SubRed: element.substitutions.length > 0 && element.substitutions[0].replacedBy.bookings.find((el) => el.type === "red-card") ? 'TRUE' : null,
            }
            if(element.substitutions.length == 0)
                delete app.SubbedBy;
            await utils.insertUpdateItem(app, DataTables.APPS_TABLE_NAME);
        }
    };

    const events : MatchEvent[] = []    
    let page = 1;

    let url = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-lx-commentary-data-paged%2Fdiscipline%2Fsoccer%2FeventId%2F${reportId}%2FisUk%2Ffalse%2Flimit%2F20%2FnitroKey%2Flx-nitro%2FpageNumber%2F${page}%2Fversion%2F1.5.6`;

    const summary = await axios.get(url, options);

    summary.data.payload[0].body.results.forEach(element => {
        if(element.time && element.time.trim() !== '') 
            events.unshift({description: element.body[0].children[0].text, time: element.time, eventType: element.title})
    });

    if(summary.data.payload[0].body.numberOfPages > 1) {
        for (let page = 2; page <= summary.data.payload[0].body.numberOfPages; page++){
            let url = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-lx-commentary-data-paged%2Fdiscipline%2Fsoccer%2FeventId%2F${reportId}%2FisUk%2Ffalse%2Flimit%2F20%2FnitroKey%2Flx-nitro%2FpageNumber%2F${page}%2Fversion%2F1.5.6`;
            let next_page = await axios.get(url,options);
            next_page.data.payload[0].body.results.forEach(element => {
                if(element.time && element.time.trim() !== '') 
                    events.unshift({description: element.body[0].children[0].text, time: element.time, eventType: element.title})
            });
        }
    }

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a robot capable of creating soccer match reports for a tranmere rovers fan site."],
        ["user", `Write a compelling soccer match report in 5-6 paragraphs using the following match events. 
        {input}`],
    ]);
    const chain = prompt.pipe(chatModel);
    const response = await chain.invoke({
        input: JSON.stringify(events),
    });

    
    const output = response.content.toString().replace(/\n/g, "<br />")

    const params = new UpdateCommand({
        TableName: DataTables.REPORT_TABLE,
        Key:{
            "day": day
        },
        UpdateExpression: "set report = :r",
        ExpressionAttributeValues:{
            ":r": output,
        },
        ReturnValues:"UPDATED_NEW"
    });
    await dynamo.send(params);

    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          goals: z
            .array(z.object({
                Minute: z.number().describe("the minute the goal was scored"),
                Scorer: z.string().describe("the name of the goalscorer"),
                GoalType: z.enum(["Shot", "Header", "Penalty", "FreeKick", "Header"]).nullable().describe("how the goal was scored if known"),
                Assist: z.string().nullable().describe("the name of any player credited with the assist"),
                AssistType: z.enum(["Pass", "Cross", "Corner", "FreeKick", "Header"]).nullable().describe("the type of assist"),
            }))
            .describe("An array of goals scored by tranmere rovers players in this match"),
        })
      );

    const goal_chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            "Use the supplied soccer game events to extract information about goals scored by Tranmere Rovers.\n{format_instructions}\n{events}"
        ),
        chatModel,
        parser,
    ]);

    const goal_response = await goal_chain.invoke({
        events: JSON.stringify(events),
        format_instructions: parser.getFormatInstructions(),
    });

    for await (let obj of goal_response.goals) {
        let goal : Goal = {
            id: uuidv4(),
            Date: day!,
            GoalType: obj.GoalType?.valueOf(),
            Minute: obj.Minute.toString(),
            Opposition: theMatch.opposition!,
            Scorer: translatePlayerName(obj.Scorer),
            Assist: obj.Assist!,
            AssistType: obj.AssistType?.valueOf(),
            Season: season,
        };
        await utils.insertUpdateItem(goal, DataTables.GOALS_TABLE_NAME);
    }

    return utils.sendResponse(200, goal_response);
};