/* eslint-disable  @typescript-eslint/no-explicit-any */

import axios from 'axios';
import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
import { APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocument, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { ContentfulClientApi, EntryCollection } from 'contentful';
const dynamo = DynamoDBDocument.from(
  new DynamoDB({ apiVersion: '2012-08-10' })
);
import {
  Goal,
  Player,
  Team,
  Competition,
  Manager,
  HatTrick,
  ImageEdits,
  Appearance,
  Match,
  Report
} from './tranmere-web-types';
import { IBlogPost, IPageMetaData } from './contentful';

const APP_SYNC_URL = 'https://api.prod.tranmere-web.com';
const APP_SYNC_OPTIONS = {
  headers: {
    //'x-api-key': this.APP_SYNC_KEY
  }
};
const apiOptions = {
  headers: {
    //'x-api-key': this.API_KEY
  }
};

export enum DataTables {
  APPS_TABLE_NAME = 'TranmereWebAppsTable',
  PLAYER_TABLE_NAME = 'TranmereWebPlayerTable',
  GOALS_TABLE_NAME = 'TranmereWebGoalsTable',
  RESULTS_TABLE = 'TranmereWebGames',
  TRANSFER_TABLE = 'TranmereWebPlayerTransfers',
  LINKS_TABLE = 'TranmereWebPlayerLinks',
  SUMMARY_TABLE_NAME = 'TranmereWebPlayerSeasonSummaryTable',
  HAT_TRICKS_TABLE = 'TranmereWebHatTricks',
  ON_THIS_DAY_TABLE = 'TranmereWebOnThisDay',
  REPORT_TABLE = 'TranmereWebMatchReport'
}

export class ProgrammeImage {
  bucket: string;
  key: string;
  edits?: ImageEdits;

  constructor(key: string, edits?: ImageEdits) {
    this.bucket = 'trfc-programmes';
    this.key = key;
    if (typeof edits !== 'undefined') {
      this.edits = edits;
    }
  }

  imagestring() {
    return Buffer.from(JSON.stringify(this)).toString('base64');
  }
}

export class TranmereWebUtils {
  getYear(): number {
    const theDate = new Date();
    if (theDate.getUTCMonth() > 6) {
      return theDate.getFullYear();
    } else {
      return theDate.getFullYear() - 1;
    }
  }

  getSeasons(): number[] {
    const seasons: number[] = [];
    for (let i = this.getYear(); i > 1920; i--) {
      seasons.push(i);
    }
    return seasons;
  }

  //
  sendResponse(code: number, obj: any): APIGatewayProxyResult {
    return {
      isBase64Encoded: false,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      },
      statusCode: code,
      body: JSON.stringify(obj)
    };
  }

  sendHTMLResponse(page: any, maxAge: number): APIGatewayProxyResult {
    return {
      isBase64Encoded: false,
      headers: {
        'Content-Type': 'text/html',
        'Content-Security-Policy': 'upgrade-insecure-requests',
        'Strict-Transport-Security': 'max-age=1000',
        'X-Xss-Protection': '1; mode=block',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'public, max-age=' + maxAge
      },
      statusCode: 200,
      body: page
    };
  }

  loadSharedPartials(): any {
    const partials: any = {};
    const files = fs.readdirSync('./templates/partials');
    for (let i = 0, l = files.length; i < l; i++) {
      const file = files[i];

      if (file.match(/\.partial\.mustache$/)) {
        const name = path.basename(file, '.partial.mustache');
        partials[name] = fs.readFileSync('./templates/partials/' + file, {
          encoding: 'utf8'
        });
      }
    }
    return partials;
  }

  buildImagePath(image: string, width: number, height: number): string {
    const programme = new ProgrammeImage(image, {
      resize: {
        width: width,
        height: height,
        fit: 'fill'
      }
    });
    return 'https://images.tranmere-web.com/' + programme.imagestring();
  }

  buildPage(view: any, pageTpl: string): string {
    const pageHTML = Mustache.render(
      fs.readFileSync(pageTpl).toString(),
      view,
      this.loadSharedPartials()
    );
    return pageHTML;
  }

  renderFragment(view: any, templateKey: string): string {
    if (view.chart) {
      view.chart = JSON.stringify(view.chart);
    }
    const tpl = `./templates/partials/${templateKey}.partial.mustache`;
    return Mustache.render(
      fs.readFileSync(tpl).toString(),
      view,
      this.loadSharedPartials()
    );
  }

  async getBlogs(
    client: ContentfulClientApi<undefined>
  ): Promise<EntryCollection<IBlogPost>> {
    return await client.getEntries<IBlogPost>({
      content_type: 'blogPost',
      order: ['-sys.createdAt'],
      limit: 5
    });
  }

  async getPages(
    client: ContentfulClientApi<undefined>
  ): Promise<EntryCollection<IPageMetaData>> {
    return await client.getEntries<IPageMetaData>({
      content_type: 'pageMetaData'
    });
  }

  async findAllPlayers(): Promise<Player[]> {
    const query = encodeURIComponent(
      '{listTranmereWebPlayerTable(limit:700){items{name picLink}}}'
    );
    const results = await axios.get(
      `${APP_SYNC_URL}/graphql?query=${query}`,
      APP_SYNC_OPTIONS
    );
    const players =
      results.data.data.listTranmereWebPlayerTable.items!.map(
        (p) => p as Player
      );

    players.sort(function (a: Player, b: Player) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    return players;
  }

  async findAllTranmereManagers(): Promise<Manager[]> {
    const query = encodeURIComponent(
      '{listTranmereWebManagers(limit:300){items{name dateLeft dateJoined}}}'
    );
    const results = await axios.get(
      `${APP_SYNC_URL}/graphql?query=${query}`,
      APP_SYNC_OPTIONS
    );

    const managers: Manager[] = [];
    for (
      let i = 0;
      i < results.data.data.listTranmereWebManagers.items.length;
      i++
    ) {
      const manager: Manager =
        results.data.data.listTranmereWebManagers.items[i];
      let dateLeft = 'now';
      if (manager.dateLeft) dateLeft = manager.dateLeft;
      manager.dateLeftText = dateLeft;
      managers.push(manager);
    }
    managers.sort(function (a, b) {
      if (a.dateJoined < b.dateJoined) return 1;
      if (a.dateJoined > b.dateJoined) return -1;
      return 0;
    });
    return managers;
  }

  async findAllTeams(): Promise<Array<Team>> {
    const query: string = encodeURIComponent(
      '{listTranmereWebClubs(limit:500){items{name}}}'
    );
    const result = await axios.get(
      `${APP_SYNC_URL}/graphql?query=${query}`,
      APP_SYNC_OPTIONS
    );
    const results: Array<Team> = result.data.data.listTranmereWebClubs.items;

    results.sort(function (a: Team, b: Team) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    return results;
  }

  async getAllCupCompetitions(): Promise<Array<Competition>> {
    const query = encodeURIComponent(
      '{listTranmereWebCompetitions(limit:500){items{name}}}'
    );
    const competitions = await axios.get(
      `${APP_SYNC_URL}/graphql?query=${query}`,
      APP_SYNC_OPTIONS
    );
    const results: Array<Competition> =
      competitions.data.data.listTranmereWebCompetitions.items;
    return results;
  }

  async getAllGames(): Promise<Array<Match>> {
    const result = await axios.get(
      'https://api.prod.tranmere-web.com/result-search/?season=&competition=&opposition=&manager=&venue=Prenton Park&pens=&sort=Date',
      apiOptions
    );
    const results: Array<Match> = result.data.results as Array<Match>;
    return results;
  }

  async getTopScorersBySeason(): Promise<Array<Player>> {
    const results: Array<Player> = [];

    for (let i = 1977; i <= this.getYear(); i++) {
      const result = await axios.get(
        'https://api.prod.tranmere-web.com/player-search/?season=' +
          i +
          '&sort=Goals',
        apiOptions
      );
      const player: Player = result.data.players[0];
      if (player) results.push(player);
    }
    return results;
  }

  async findAllHatTricks(): Promise<Array<HatTrick>> {
    const query = encodeURIComponent(
      '{listTranmereWebHatTricks(limit:500){items{Date Player Opposition Goals Season}}}'
    );
    const result = await axios.get(
      `${APP_SYNC_URL}/graphql?query=${query}`,
      APP_SYNC_OPTIONS
    );
    const results: Array<HatTrick> =
      result.data.data.listTranmereWebHatTricks.items;

    results.sort(function (a, b) {
      if (a.Date < b.Date) return -1;
      if (a.Date > b.Date) return 1;
      return 0;
    });
    return results;
  }

  async getResultsForSeason(season: string): Promise<Array<Match>> {
    const params = {
      TableName: DataTables.RESULTS_TABLE,
      KeyConditionExpression: 'season = :season',
      ExpressionAttributeValues: {
        ':season': season
      }
    };
    const result = await dynamo.query(params);
    return result.Items!.map((m) => m as Match);
  }

  async getResultForDate(season: number, date: string): Promise<Match | null> {
    const params = {
      TableName: DataTables.RESULTS_TABLE,
      KeyConditionExpression: 'season = :season and #date = :date',
      ExpressionAttributeValues: {
        ':season': season.toString(),
        ':date': decodeURIComponent(date)
      },
      ExpressionAttributeNames: { '#date': 'date' }
    };
    const result = await dynamo.query(params);

    return result.Items && result.Items[0] ? (result.Items[0] as Match) : null;
  }

  async getReportForDate(day: string): Promise<Report | null> {
    const params = {
      TableName: DataTables.REPORT_TABLE,
      KeyConditionExpression: '#day = :day',
      ExpressionAttributeValues: {
        ':day': decodeURIComponent(day)
      },
      ExpressionAttributeNames: { '#day': 'day' }
    };
    const result = await dynamo.query(params);

    return result.Items && result.Items[0] ? (result.Items[0] as Report) : null;
  }

  async insertUpdateItem(item: any, type: string): Promise<any> {
    const params = {
      TableName: type,
      Item: item
    };
    return await dynamo.put(params);
  }

  async deleteItem(id, type) {
    console.log(id);
    const params = {
      TableName: type,
      Key: {
        id: id
      }
    };
    return await dynamo.delete(params);
  }

  async getAllPlayersFromDb(): Promise<Array<Player>> {
    const squadSearch = await dynamo.scan({
      TableName: DataTables.PLAYER_TABLE_NAME
    });
    return squadSearch.Items!.map((p) => p as Player);
  }

  async getAppsByPlayer(Player): Promise<Appearance[]> {
    const apps: Appearance[] = [];
    const params = {
      TableName: DataTables.APPS_TABLE_NAME,
      KeyConditionExpression: '#Name = :name',
      IndexName: 'ByPlayerIndex',
      ExpressionAttributeNames: {
        '#Name': 'Name'
      },
      ExpressionAttributeValues: {
        ':name': Player
      }
    };
    const result = await dynamo.query(params);
    const starts = result.Items!.map((a) => a as Appearance);
    starts.forEach((a) => {
      a.Type = 'Start';
      a.Goals = 0;
    });

    apps.push(...starts);

    const sub_params = {
      TableName: DataTables.APPS_TABLE_NAME,
      KeyConditionExpression: '#SubbedBy = :subbedBy',
      IndexName: 'BySubbedByindex',
      ExpressionAttributeNames: {
        '#SubbedBy': 'SubbedBy'
      },
      ExpressionAttributeValues: {
        ':subbedBy': Player
      }
    };
    const sub_result = await dynamo.query(sub_params);
    const sub_apps = sub_result.Items!.map((a) => a as Appearance);
    sub_apps.forEach((a) => {
      a.Type = 'Sub';
      a.Goals = 0;
      a.SubbedBy = a.Name;
    });

    const goals_params = {
      TableName: DataTables.GOALS_TABLE_NAME,
      KeyConditionExpression: '#Scorer = :scorer',
      IndexName: 'ByScorerIndex',
      ExpressionAttributeNames: {
        '#Scorer': 'Scorer'
      },
      ExpressionAttributeValues: {
        ':scorer': Player
      }
    };
    const goals_result = await dynamo.query(goals_params);
    const goals = goals_result.Items!.map((a) => a as Goal);

    apps.push(...sub_apps);
    apps.sort(function (a: Appearance, b: Appearance) {
      if (a.Date < b.Date) return -1;
      if (a.Date > b.Date) return 1;
      return 0;
    });

    goals.forEach((g) => {
      if (apps.find((a) => a.Date == g.Date))
        apps.find((a) => a.Date == g.Date)!.Goals!++;
      else console.log('Could not find app for goal on' + g.Date);
    });

    return apps;
  }

  async getGoalsById(id, season): Promise<Goal> {
    const params = {
      TableName: DataTables.GOALS_TABLE_NAME,
      KeyConditionExpression: 'Season = :season and #id = :id',
      ExpressionAttributeNames: {
        '#id': 'id'
      },
      ExpressionAttributeValues: {
        ':id': decodeURIComponent(id),
        ':season': decodeURIComponent(season)
      }
    };
    const result = await dynamo.query(params);
    return result.Items![0] as Goal;
  }

  async getGoalsBySeason(season: number, date?: string): Promise<Array<Goal>> {
    const params: QueryCommandInput = {
      TableName: DataTables.GOALS_TABLE_NAME,
      KeyConditionExpression: 'Season = :season',
      ExpressionAttributeValues: {
        ':season': decodeURIComponent(season.toString())
      }
    };

    if (date) {
      params.FilterExpression = '#Date = :date';
      params.ExpressionAttributeNames = { '#Date': 'Date' };
      params.ExpressionAttributeValues![':date'] = decodeURIComponent(date);
    }

    const result = await dynamo.query(params);
    return result.Items!.map((g) => g as Goal);
  }

  async getAppsBySeason(
    season: number,
    date?: string
  ): Promise<Array<Appearance>> {
    const params: QueryCommandInput = {
      TableName: DataTables.APPS_TABLE_NAME,
      KeyConditionExpression: 'Season = :season',
      ExpressionAttributeValues: {
        ':season': decodeURIComponent(season.toString())
      }
    };

    if (date) {
      params.FilterExpression = '#Date = :date';
      params.ExpressionAttributeNames = { '#Date': 'Date' };
      params.ExpressionAttributeValues![':date'] = decodeURIComponent(date);
    }

    const result = await dynamo.query(params);
    return result.Items!.map((a) => a as Appearance);
  }

  isNumeric(value: string): boolean {
    return /^-?\d+$/.test(value);
  }
}
