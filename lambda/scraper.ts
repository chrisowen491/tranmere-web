import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';

import axios from 'axios';
let utils = new TranmereWebUtils();
const theSeason = process.env.SCRAPE_SEASON;
const id = process.env.SCRAPE_ID;
const baseUrl = process.env.SCRAPE_URL;
var today = new Date();
today.setHours(0,0,0,0);

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

  var season = await axios.get(baseUrl + '/teams/team.sd?team_id=2598&season_id='+id+'&teamTabs=results');
  const matches = utils.extractMatchesFromHTML(season.data);
  var gamesFromDb = await utils.getResultsForSeason(theSeason!);

  for(var i=0; i < matches.length; i++) {
    var res = await axios.get(baseUrl + '/matches/additional_information.sd?id_game=' + matches[i].scrape_id);
    var found = false;
    var gameDate = new Date(matches[i].date);

    if(today >= gameDate) {
        for(var x=0; x < gamesFromDb!.length; x++) {
            if(gamesFromDb![x].date == matches[i].date ) {
                found = true
            }
        }
        if(!found) {
            let result = utils.extractSquadFromHTML(res.data, matches[i].date, matches[i].competition!, theSeason!);
            
            result.apps.forEach(async function (a) {
                await utils.insertUpdateItem(a, DataTables.APPS_TABLE_NAME);
            });
            result.goals.forEach(async function (g) {
                await utils.insertUpdateItem(g, DataTables.GOALS_TABLE_NAME);
            });
            
            delete matches[i].scrape_id;
            matches[i] = utils.extractExtraFromHTML(res.data, theSeason!, matches[i]);
            await utils.insertUpdateItem(matches[i], DataTables.RESULTS_TABLE);
        }
    }
  }
  return utils.sendResponse(200, 'ok');
};