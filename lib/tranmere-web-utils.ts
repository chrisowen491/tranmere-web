import axios from 'axios';
import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
import contentful from 'contentful';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Player, Team, Competition, Manager, HatTrick, Image, SiteMapEntry} from './tranmere-web-types'

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
        var seasons = [];
        for(var i = this.getYear(); i > 1920; i--) {
          seasons.push(i);
        }
        return seasons;
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
        let body: Image = {
            bucket: "trfc-programmes",
            key: image,
            edits: {
                resize: {
                width: width,
                height: height,
                fit: "fill",
                }
            }
        };
        return "https://images.tranmere-web.com/" + Buffer.from(JSON.stringify(body)).toString('base64');
    }

    buildPage(view: any, pageTpl: string) : string {
      var pageHTML = Mustache.render(fs.readFileSync(pageTpl).toString(), view, this.loadSharedPartials());
      return pageHTML;
    }

    pad(a: any,b: any): any{
      return(1e15+a+"").slice(-b)
    }

    buildSitemapEntry(page: string) : SiteMapEntry {
      var m = new Date();
      var dateString = m.getUTCFullYear() +"-"+ this.pad(m.getUTCMonth()+1,2) +"-"+this.pad(m.getUTCDate(),2);
      return {
          url: page.replace(/&/g, '&amp;'),
          date: dateString,
          priority: 0.5,
          changes: "monthly"
      };
    };

    renderFragment(view: any, templateKey: string) : string {
      if(view.chart) {
          view.chart = JSON.stringify(view.chart);
      }
      var tpl = `./templates/partials/${templateKey}.partial.mustache`;
      return Mustache.render(fs.readFileSync(tpl).toString(), view, this.loadSharedPartials());
    }

    async getBlogs(client: contentful.ContentfulClientApi) : Promise<any> {
      return await client.getEntries({'content_type': 'blogPost', order: '-fields.datePosted', limit: 5});
    }

    async getPages(client: contentful.ContentfulClientApi) : Promise<any> {
      return await client.getEntries({'content_type': 'pageMetaData'});
    }

    async findAllPlayers() : Promise<Array<Player>> {
      var query = encodeURIComponent("{listTranmereWebPlayerTable(limit:700){items{name picLink}}}");
      var results = await axios.get(`${APP_SYNC_URL}/graphql?query=${query}`, APP_SYNC_OPTIONS);
      var players : Array<Player> = [];
      
      for(var i=0; i < results.data.data.listTranmereWebPlayerTable.items.length; i++) {
          let player: Player = results.data.data.listTranmereWebPlayerTable.items[i];
          players.push(player);
      }

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
}