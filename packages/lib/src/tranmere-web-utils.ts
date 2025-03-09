/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyResult } from 'aws-lambda';
import {
  DynamoDBDocument,
  QueryCommandInput,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
const dynamo = DynamoDBDocument.from(
  new DynamoDB({ apiVersion: '2012-08-10' })
);
import {
  Goal,
  Player,
  ImageEdits,
  Appearance,
  Match,
  Report,
  Transfer,
  Link,
  PlayerSeasonSummary
} from './tranmere-web-types';

//const APP_SYNC_URL = 'https://api.tranmere-web.com';
//const APP_SYNC_OPTIONS = {
//  headers: {
//    //'x-api-key': this.APP_SYNC_KEY
//  }
//};
//const apiOptions = {
//  headers: {
//    //'x-api-key': this.API_KEY
//  }
//};

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

  simplifyName(first: string) {
    const name = first.split(' ');
    return name[0];
  }

  getSeasons(): number[] {
    const seasons: number[] = [];
    for (let i = this.getYear(); i > 1920; i--) {
      seasons.push(i);
    }
    return seasons;
  }

  sendResponse(code: number, obj: any): APIGatewayProxyResult {
    return {
      isBase64Encoded: false,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      statusCode: code,
      body: JSON.stringify(obj)
    };
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

  async getPlayer(playerName: string): Promise<Player | null> {
    const playerSearch = await dynamo.query({
      TableName: DataTables.PLAYER_TABLE_NAME,
      KeyConditionExpression: '#name = :name',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': decodeURIComponent(playerName)
      },
      IndexName: 'ByNameIndex',
      Limit: 1
    });

    const players = playerSearch.Items as Player[];
    return players.length > 0 ? players[0] : null;
  }

  async getPlayerLinks(playerName: string): Promise<Link[]> {
    const links = await dynamo.query({
      TableName: DataTables.LINKS_TABLE,
      KeyConditionExpression: '#name = :name',
      IndexName: 'ByNameIndex',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': decodeURIComponent(playerName)
      }
    });

    return links.Items as Link[];
  }

  async getPlayerSummary(playerName: string): Promise<PlayerSeasonSummary[]> {
    const summarySearch = await dynamo.query({
      TableName: DataTables.SUMMARY_TABLE_NAME,
      KeyConditionExpression: '#player = :player',
      IndexName: 'ByPlayerIndex',
      ExpressionAttributeNames: {
        '#player': 'Player'
      },
      ExpressionAttributeValues: {
        ':player': decodeURIComponent(playerName)
      }
    });
    return summarySearch.Items as PlayerSeasonSummary[];
  }

  async getPlayerSummaryForSeason(
    playerName: string,
    season: string
  ): Promise<PlayerSeasonSummary> {
    const summary = await this.getPlayerSummary(playerName);
    return summary.find((s) => s.Season == season)!;
  }

  async getPlayerDebut(playerName: string): Promise<Appearance> {
    const debutSearch = await dynamo.query({
      TableName: DataTables.APPS_TABLE_NAME,
      KeyConditionExpression: '#name = :name',
      IndexName: 'ByPlayerIndex',
      ExpressionAttributeNames: {
        '#name': 'Name'
      },
      ExpressionAttributeValues: {
        ':name': decodeURIComponent(playerName)
      },
      Limit: 1
    });
    return debutSearch.Items![0] as Appearance;
  }

  async getPlayerTransfers(playerName: string): Promise<Transfer[]> {
    const transfers = await dynamo.query({
      TableName: DataTables.TRANSFER_TABLE,
      KeyConditionExpression: '#name = :name',
      IndexName: 'ByNameIndex',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': decodeURIComponent(playerName)
      }
    });
    return transfers.Items as Transfer[];
  }

  async updateReport(report: string, day: string): Promise<any> {
    const params = new UpdateCommand({
      TableName: DataTables.REPORT_TABLE,
      Key: {
        day: day
      },
      UpdateExpression: 'set report = :r',
      ExpressionAttributeValues: {
        ':r': report
      },
      ReturnValues: 'UPDATED_NEW'
    });
    return await dynamo.send(params);
  }

  async deleteItem(id: string, type: string) {
    console.log(id);
    const params = {
      TableName: type,
      Key: {
        id: id
      }
    };
    return await dynamo.delete(params);
  }

  async getAllPlayersFromDb(): Promise<Player[]> {
    const squadSearch = await dynamo.scan({
      TableName: DataTables.PLAYER_TABLE_NAME
    });
    return squadSearch.Items!.map((p) => p as Player);
  }

  async getAppsByPlayer(playerName: string): Promise<Appearance[]> {
    const apps: Appearance[] = [];
    const params = {
      TableName: DataTables.APPS_TABLE_NAME,
      KeyConditionExpression: '#Name = :name',
      IndexName: 'ByPlayerIndex',
      ExpressionAttributeNames: {
        '#Name': 'Name'
      },
      ExpressionAttributeValues: {
        ':name': playerName
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
        ':subbedBy': playerName
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
        ':scorer': playerName
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

  async getGoalsById(id: string, season: string): Promise<Goal> {
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

  async getGoalsBySeason(season: number, date?: string): Promise<Goal[]> {
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

  async getAppsBySeason(season: number, date?: string): Promise<Appearance[]> {
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
