import axios from 'axios';
import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
import {load} from 'cheerio';
import  {v4 as uuidv4} from 'uuid';
import { APIGatewayProxyResult } from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';
import { ContentfulClientApi, EntryCollection } from "contentful";
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
import { Goal, Player, Team, Competition, Manager, HatTrick, ImageEdits, Appearance, Match} from './tranmere-web-types'
import {translateTeamName, translatePlayerName} from './tranmere-web-mappers'
import {IBlogPost, IPageMetaData} from './contentful'

const APP_SYNC_URL = "https://api.prod.tranmere-web.com";
const APP_SYNC_OPTIONS = {
    headers: {
      //'x-api-key': this.APP_SYNC_KEY
    }
};
const apiOptions = {
    headers: {
      //'x-api-key': this.API_KEY
    }
  }

export enum DataTables {
    APPS_TABLE_NAME = "TranmereWebAppsTable",
    PLAYER_TABLE_NAME = "TranmereWebPlayerTable",
    GOALS_TABLE_NAME = "TranmereWebGoalsTable",
    RESULTS_TABLE = "TranmereWebGames",
    TRANSFER_TABLE = "TranmereWebPlayerTransfers",
    LINKS_TABLE = "TranmereWebPlayerLinks",
    SUMMARY_TABLE_NAME = "TranmereWebPlayerSeasonSummaryTable",
    HAT_TRICKS_TABLE =  "TranmereWebHatTricks",
    ON_THIS_DAY_TABLE = "TranmereWebOnThisDay",
}

export class ProgrammeImage {
    
  bucket: string;
  key: string;
  edits?: ImageEdits;

  constructor(key: string, edits?: ImageEdits) {
    this.bucket = 'trfc-programmes';
    this.key = key;
    if (typeof edits !== 'undefined') {
      this.edits =edits;
    }
  }
 
  imagestring() {
    return Buffer.from(JSON.stringify(this)).toString('base64');
  }
}

export class TranmereWebUtils  {

    getYear(): number {
        var theDate = new Date();
        if(theDate.getUTCMonth() > 6) {
            return theDate.getFullYear();
        } else {
            return theDate.getFullYear() -1;
        }
    }

    getSeasons(): Array<number> {
        let seasons : Array<number> = [];
        for(var i = this.getYear(); i > 1920; i--) {
          seasons.push(i);
        }
        return seasons;
    }

    extractMatchesFromHTML(html : string): Array<Match> {
      const $ = load(html);
    
      var games : Array<Match> = [];
      const matches = $('tr.match');

      matches.each((i, el) => {
        var date = $($(el).find('span.hide')[0]).text();
        var dateRegex = /\d\d\d\d-\d\d-\d\d/g;
        var compRegex = /[\w\s]+/g
        const dateMatch = date.match(dateRegex);
        const compMatch = date.match(compRegex);
        var comp = compMatch![0];
    
        if(comp.indexOf('EFL Cup') > 0) {
            comp = "League Cup"
        } else if(comp.indexOf('League Cup') > 0) {
            comp = "League Cup"
        } else if(comp.indexOf('FA Cup') > 0) {
            comp = "FA Cup"
        } else if(comp.indexOf('League One') > 0) {
            comp = "League"
        } else if(comp.indexOf('League Two') > 0) {
            comp = "League"
        } else if(comp.indexOf('Football League Trophy') > 0) {
            comp = "FL Trophy"
        } else if(comp.indexOf('National League') > 0) {
            comp = "Conference"
        } else if(comp.indexOf('Play') > 0) {
            comp = "Play Offs"
        } else if(comp.indexOf('FA Trophy') > 0) {
            comp = "FA Trophy"
        } else if(comp.indexOf('Football League Div 1') > 0) {
            comp = "League"
        } else if(comp.indexOf('Football League Div 2') > 0) {
            comp = "League"
        } else if(comp.indexOf('Capital One Cup') > 0) {
            comp = "League Cup"
        } else if(comp.indexOf('Carling Cup') > 0) {
            comp = "League Cup"
        } else if(comp.indexOf('JP Trophy') > 0) {
            comp = "FL Trophy"
        } else if(comp.indexOf('EFL Trophy') > 0) {
            comp = "FL Trophy"
        }
    
        var match : Match = {
            scrape_id : $(el).attr('id')!.replace('tgc',''),
            id: uuidv4(),
            date: dateMatch![0],
            competition: comp,
            programme: "#N/A",
            pens: ""
        };
        games.push(match);
      });
    
      return games;
    }

    extractSquadFromHTML(html: string, date: string, competition:string, season:string): {apps: Array<Appearance>, goals: Array<Goal>} {
      const $ = load(html);
    
      const homeTeam = $('span.teamA').text().trim().replace(/\s\d+/, '');
      const awayTeam = $('span.teamB').text().trim().replace(/\d+\s/, '');
    
      const scorersItems = awayTeam == "Tranmere" ? $('div.goalscorers div.teamB span') : $('div.goalscorers div.teamA span');
    
      const rows = awayTeam == "Tranmere" ? $('.teamB tr') : $('.teamA tr');
      var goals : Array<Goal> = [];
      scorersItems.each((i, el) => {
        var minRegex = /[\w\s-]+/g;
        var timeRegex = /\d+/g;
        var text = $(el).text();
        var minute : RegExpMatchArray = text.match(timeRegex)!;
    
        for(var i=0; i < minute.length; i ++) {
            var goal : Goal = {
                id: uuidv4(),
                Date: date,
                Opposition: awayTeam == "Tranmere" ? homeTeam : awayTeam,
                Season: season,
                Scorer: translatePlayerName(text.match(minRegex)![0]),
                //Assist: null,
                GoalType: '',
                //AssistType: null,
                Minute: minute[i],
            }
            console.log("Opp:" + goal.Opposition);
            goal.Opposition = translateTeamName(goal.Opposition);
    
            if(text.indexOf('(pen') > 0)
                goal.GoalType = "Penalty"
    
            if(text.indexOf('(og') > 0)
                goal.Scorer = "Own Goal"
    
            if(text.indexOf('s/o') == -1)
                goals.push(goal);
        }
      });
    
    
      const apps: Array<Appearance> = [];
      rows.each((i, el) => {
    
        // Extract information from each row of the jobs table
        if(i != 0 &&  i != 12 ) {
    
            var playerIndex = awayTeam == "Tranmere" ? 3 : 0;
            var numberIndex = awayTeam == "Tranmere" ? 1 : 2;
            var cardIndex = awayTeam == "Tranmere" ? 0 : 3;
    
            const regex = /\s+\(\d+\)/g;
            const minRegex = /\d+/g
            var originalText = $($(el).find("td")[playerIndex]).text()
            var text = originalText.replace(regex, '')
    
            var yellowCard = $($(el).find("td")[cardIndex]).children().first() ? $($(el).find("td")[cardIndex]).children().first().attr('title') : null;
            var yellow : string | null = null;
            var red : string | null = null;
    
            if(yellowCard && yellowCard.indexOf('ellow') > -1) {
                yellow = 'TRUE'
            }
            if(yellowCard && yellowCard.indexOf('Red') > -1) {
                red = 'TRUE'
            }
    
            const sub = originalText.match(minRegex);
            var subMin;
            if(sub && !red) {            
                subMin = sub[0];
            }
            var app : Appearance = {
                id: uuidv4(),
                Date: date,
                Opposition: awayTeam == "Tranmere" ? homeTeam : awayTeam,
                Competition:  competition,
                Season: season,
                Name: translatePlayerName(text),
                Number: $($(el).find("td")[numberIndex]).text(),
                SubbedBy: null,
                SubTime: subMin,
                YellowCard: yellow,
                RedCard: red,
                SubYellow: null,
                SubRed: null
            }
    
            app.Opposition = translateTeamName(app.Opposition);
    
            if(app.Number == "N/A")
                app.Number = null;
    
            if(i < 12)
                apps.push(app);
            else if(subMin) {
                for(var y=0; y < apps.length; y++) {
                    if(apps[y].SubTime == subMin && !apps[y].SubbedBy) {
                       var subName = text.replace(/\(.*\)\s/, '');
                       apps[y].SubbedBy = translatePlayerName(subName);
                       apps[y].SubYellow = yellow;
                       apps[y].SubRed= red;
                       break;
                    }
                }
            }
        }
      });
    
      return {goals: goals, apps: apps};
    }

    extractExtraFromHTML(html : string, season : string, match : Match) : any {
      const $ = load(html);
    
      const homeTeam = $('span.teamA').text().trim().replace(/\s\d+/, '');
      const homeScore = $('span.teamA em').text().trim().replace(/\s\d+/, '');
      const awayTeam = $('span.teamB').text().trim().replace(/\d+\s/, '');
      const awayScore = $('span.teamB em').text().trim().replace(/\s\d+/, '');
    
      match.home = homeTeam == "Tranmere" ? "Tranmere Rovers" : homeTeam;
      match.visitor = awayTeam == "Tranmere" ? "Tranmere Rovers" : awayTeam;
      match.opposition = awayTeam == "Tranmere" ? homeTeam : awayTeam;
    
      match.home = translateTeamName(match.home);
      match.visitor = translateTeamName(match.visitor);
      match.opposition = translateTeamName(match.opposition);
    
      match.venue = homeTeam == "Tranmere" ? "Prenton Park" : "Unknown";
      match.static = "static";
      match.season = parseInt(season);
      match.hgoal = homeScore;
      match.vgoal = awayScore;
      match.ft = homeScore + '-' +awayScore
    
      return match;
    }

    sendResponse(code: number, obj: any): APIGatewayProxyResult {
        return {
          isBase64Encoded: false,
          headers: { 
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*',
            "Cache-Control": "public, max-age=86400"
          },
          statusCode: code,
          body: JSON.stringify(obj)
        }
    }

    sendHTMLResponse(page: any, maxAge: number): APIGatewayProxyResult {
        return {
          isBase64Encoded: false,
          headers: {
            "Content-Type": "text/html",
            "Content-Security-Policy" : "upgrade-insecure-requests",
            "Strict-Transport-Security" : "max-age=1000",
            "X-Xss-Protection" : "1; mode=block",
            "X-Frame-Options" : "DENY",
            "X-Content-Type-Options" : "nosniff",
            "Referrer-Policy" : "strict-origin-when-cross-origin",
            "Cache-Control": "public, max-age=" + maxAge
          },
          statusCode: 200,
          body: page
      };
    }

    loadSharedPartials() : any {
        var partials: any = {};
        var files = fs.readdirSync('./templates/partials');
        for (var i = 0, l = files.length; i < l; i++) {
          var file = files[i];
  
          if (file.match(/\.partial\.mustache$/)) {
            var name = path.basename(file, '.partial.mustache');
            partials[name] = fs.readFileSync('./templates/partials/' + file, {
              encoding: 'utf8'
            });
          }
        }
        return partials;
    }

    buildImagePath(image: string, width: number, height: number) : string {
        let programme =  new ProgrammeImage(image, {
            resize: {
              width: width,
              height: height,
              fit: "fill",
            }
          });
        return "https://images.tranmere-web.com/" + programme.imagestring();
    }

    buildPage(view: any, pageTpl: string) : string {
      var pageHTML = Mustache.render(fs.readFileSync(pageTpl).toString(), view, this.loadSharedPartials());
      return pageHTML;
    }

    renderFragment(view: any, templateKey: string) : string {
      if(view.chart) {
          view.chart = JSON.stringify(view.chart);
      }
      var tpl = `./templates/partials/${templateKey}.partial.mustache`;
      return Mustache.render(fs.readFileSync(tpl).toString(), view, this.loadSharedPartials());
    }

    async getBlogs(client: ContentfulClientApi) : Promise<EntryCollection<IBlogPost>> {
      var blogs = await client.getEntries({'content_type': 'blogPost', order: '-fields.datePosted', limit: 5});
      return blogs as EntryCollection<IBlogPost>;
    }

    async getPages(client: ContentfulClientApi) : Promise<EntryCollection<IPageMetaData>> {
      var pages = await client.getEntries({'content_type': 'pageMetaData'});
      return pages as EntryCollection<IPageMetaData>;
    }

    async findAllPlayers() : Promise<Array<Player>> {
      var query = encodeURIComponent("{listTranmereWebPlayerTable(limit:700){items{name picLink}}}");
      var results = await axios.get(`${APP_SYNC_URL}/graphql?query=${query}`, APP_SYNC_OPTIONS);
      var players : Array<Player> = results.data.data.listTranmereWebPlayerTable.items!.map(p => p as Player);

      players.sort(function(a : Player, b : Player) {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      });
      return players;
    }

    async findAllTranmereManagers() : Promise<Array<Manager>> {    
      var query = encodeURIComponent("{listTranmereWebManagers(limit:300){items{name dateLeft dateJoined}}}");
      var results = await axios.get(`${APP_SYNC_URL}/graphql?query=${query}`, APP_SYNC_OPTIONS);

      var managers : Array<Manager> = [];
      for(var i=0; i < results.data.data.listTranmereWebManagers.items.length; i++) {
          var manager : Manager = results.data.data.listTranmereWebManagers.items[i];
          var dateLeft = "now";
          if(manager.dateLeft)
              dateLeft = manager.dateLeft;
          manager.dateLeftText = dateLeft;
          managers.push(manager)
      }
        managers.sort(function(a, b) {
          if (a.dateJoined < b.dateJoined) return 1
          if (a.dateJoined > b.dateJoined) return -1
          return 0
        });
      return managers;
    }

    async findAllTeams() : Promise<Array<Team>> {
      let query : string = encodeURIComponent("{listTranmereWebClubs(limit:500){items{name}}}");  
      let result = await axios.get(`${APP_SYNC_URL}/graphql?query=${query}`, APP_SYNC_OPTIONS);
      let results : Array<Team> = result.data.data.listTranmereWebClubs.items;
      
      results.sort(function(a : Team, b: Team) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      return results;
    }

    async getAllCupCompetitions() : Promise<Array<Competition>> {
      let query = encodeURIComponent("{listTranmereWebCompetitions(limit:500){items{name}}}");
      let competitions = await axios.get(`${APP_SYNC_URL}/graphql?query=${query}`, APP_SYNC_OPTIONS);
      let results : Array<Competition> =  competitions.data.data.listTranmereWebCompetitions.items;
      return results;
    }

    async getTopScorersBySeason() : Promise<Array<Player>> {
      var results: Array<Player> = [];
      
      for(var i= 1977; i <= this.getYear(); i++) {
          var result = await axios.get("https://api.prod.tranmere-web.com/player-search/?season="+i+"&sort=Goals", apiOptions);
          var player: Player = result.data.players[0];
          if(player)
            results.push(player);
      }
      return results;
    }

    async findAllHatTricks(size: number) : Promise<Array<HatTrick>> {
      var query = encodeURIComponent("{listTranmereWebHatTricks(limit:500){items{Date Player Opposition Goals Season}}}");
      var result = await axios.get(`${APP_SYNC_URL}/graphql?query=${query}`, APP_SYNC_OPTIONS);
      var results : Array<HatTrick> = result.data.data.listTranmereWebHatTricks.items;

      results.sort(function(a, b) {
        if (a.Date < b.Date) return -1;
        if (a.Date > b.Date) return 1;
        return 0;
      });
      return results;
    }


    async getResultsForSeason(season: string): Promise<Array<Match>> {
      var params = {
          TableName: DataTables.RESULTS_TABLE,
          KeyConditionExpression: "season = :season",
          ExpressionAttributeValues: {
              ":season": season
          }
      };
      var result = await dynamo.query(params).promise();
      return result.Items!.map(m => m as Match);
    }

    async getResultForDate(season: number, date: string): Promise<Match | null>  {
    
      var params = {
          TableName : DataTables.RESULTS_TABLE,
          KeyConditionExpression:  "season = :season and #date = :date",
          ExpressionAttributeValues: {
              ":season": season.toString(),
              ":date": decodeURIComponent(date)
          },
          ExpressionAttributeNames: { "#date": "date" }
      }      
      var result = await dynamo.query(params).promise();
      
      return result.Items && result.Items[0] ? result.Items[0] as Match : null;
    };

    async insertUpdateItem(item: any, type: string): Promise<any>{
      const params = {
        TableName: type,
        Item: item
      };
      return await dynamo.put(params).promise();
    }

    async deleteItem(id, type){
      console.log(id);
      const params = {
        TableName: type,
        Key:{
                "id": id
            },
      };
      return await dynamo.delete(params).promise();
    }

    async getAllPlayersFromDb() : Promise<Array<Player>> {
      var squadSearch = await dynamo.scan({TableName: DataTables.PLAYER_TABLE_NAME}).promise();
      return squadSearch.Items!.map(p => p as Player);
    }

    async getGoalsById(id, season) : Promise<Goal> {

      var params = {
          TableName : DataTables.GOALS_TABLE_NAME,
          KeyConditionExpression :  "Season = :season and #id = :id",
          ExpressionAttributeNames : {
              "#id" : "id"
          },
          ExpressionAttributeValues: {
              ":id" : decodeURIComponent(id),
              ":season" : decodeURIComponent(season)
          }
      }
      var result = await dynamo.query(params).promise();
      return result.Items![0] as Goal;
    };

    async getGoalsBySeason(season: number, date?: string, ) : Promise<Array<Goal>> {

      var params : DynamoDB.DocumentClient.QueryInput = {
          TableName : DataTables.GOALS_TABLE_NAME,
          KeyConditionExpression :  "Season = :season",
          ExpressionAttributeValues: {
              ":season" : decodeURIComponent(season.toString())
          }
      }

      if(date) {
        params.FilterExpression = "#Date = :date";
        params.ExpressionAttributeNames = { "#Date" : "Date" };
        params.ExpressionAttributeValues![":date"] = decodeURIComponent(date);
      }
  
      var result = await dynamo.query(params).promise();
      return result.Items!.map(g => g as Goal);
  };

  async getAppsBySeason(season: number, date?: string) : Promise<Array<Appearance>> {  
      var params  : DynamoDB.DocumentClient.QueryInput = {
          TableName : DataTables.APPS_TABLE_NAME,
          KeyConditionExpression :  "Season = :season",
          ExpressionAttributeValues: {
              ":season" : decodeURIComponent(season.toString())
          }
      }
      
      if(date) {
        params.FilterExpression = "#Date = :date";
        params.ExpressionAttributeNames = { "#Date" : "Date" };
        params.ExpressionAttributeValues![":date"] = decodeURIComponent(date);
      }
  
      var result = await dynamo.query(params).promise();
      return result.Items!.map(a => a as Appearance);
  };
}