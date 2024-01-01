import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { MatchEvent } from '../lib/tranmere-web-types';
import axios from 'axios';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamoDB } from 'aws-sdk';
import moment from 'moment'
let utils = new TranmereWebUtils();
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
import { ChatOpenAI } from "langchain/chat_models/openai";
const chatModel = new ChatOpenAI({modelName: "gpt-4-1106-preview"});

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{    
    
    const day = event.pathParameters ? event.pathParameters!.day : moment(new Date()).format('YYYY-MM-DD');
    const theDate = new Date(day!);

    const dateString = moment(theDate).format('dddd-Do-MMMM')

    const reportQuery = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-football-scores-match-list-data%2FendDate%2F${day}%2FstartDate%2F${day}%2Fteam%2Ftranmere-rovers%2FtodayDate%2F${day}%2Fversion%2F2.4.6`
    const fixtures = await axios.get(reportQuery, {
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
    });

    if(fixtures.data.payload && fixtures.data.payload[0].body.matchData.length == 0) {
        return utils.sendResponse(200, {'message': 'nothing'});
    }

    const reportId = fixtures.data.payload[0].body.matchData[0].tournamentDatesWithEvents[dateString][0].events[0].eventKey;
    const events : MatchEvent[] = []    
    let page = 1;

    let url = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-lx-commentary-data-paged%2Fdiscipline%2Fsoccer%2FeventId%2F${reportId}%2FisUk%2Ffalse%2Flimit%2F20%2FnitroKey%2Flx-nitro%2FpageNumber%2F${page}%2Fversion%2F1.5.6`;

    const summary = await axios.get(url, {
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
    });

    summary.data.payload[0].body.results.forEach(element => {
        if(element.time && element.time.trim() !== '') 
            events.unshift({description: element.body[0].children[0].text, time: element.time, eventType: element.title})
    });

    if(summary.data.payload[0].body.numberOfPages > 1) {
        for (let page = 2; page <= summary.data.payload[0].body.numberOfPages; page++){
            let url = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-lx-commentary-data-paged%2Fdiscipline%2Fsoccer%2FeventId%2F${reportId}%2FisUk%2Ffalse%2Flimit%2F20%2FnitroKey%2Flx-nitro%2FpageNumber%2F${page}%2Fversion%2F1.5.6`;
            let next_page = await axios.get(url, 
            {
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
            });
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

    var params = {
        TableName: DataTables.REPORT_TABLE,
        Key:{
            "day": day
        },
        UpdateExpression: "set report = :r",
        ExpressionAttributeValues:{
            ":r": output,
        },
        ReturnValues:"UPDATED_NEW"
    };

    await dynamo.update(params).promise();
    return utils.sendResponse(200, output);
};