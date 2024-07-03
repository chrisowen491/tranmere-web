/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils } from '@tranmere-web/lib/src/tranmere-web-utils';
import {
  View,
  PlayerView,
  TagView,
  SeasonResultsView,
  BlogView,
  SeasonPlayerStatisticsView,
  HomeView
} from '@tranmere-web/lib/src/tranmere-web-view-types';
import { createClient } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { IBlogPost } from '@tranmere-web/lib/src/contentful';
const utils = new TranmereWebUtils();

const client = createClient({
  space: process.env.CF_SPACE!,
  accessToken: process.env.CF_KEY!
});

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  let pageName = event.pathParameters!.pageName;
  const classifier = event.pathParameters!.classifier;
  const jsonview = event.queryStringParameters && event.queryStringParameters['json'] ? event.queryStringParameters['json'] : null;

  let view: View = {};


    const playerName = classifier!;
    const player = await utils.getPlayer(playerName);

    const summarySearch = await utils.getPlayerSummary(playerName);

    const transfers = await utils.getPlayerTransfers(playerName);

    const appearances = await utils.getAppsByPlayer(
      decodeURIComponent(playerName)
    );

    const amendedTansfers: any[] = [];
    for (const transfer of transfers!) {
      transfer.club =
        transfer.from == 'Tranmere Rovers' ? transfer.to : transfer.from;
      transfer.type = transfer.from == 'Tranmere Rovers' ? 'right' : 'left';
      amendedTansfers.push(transfer);
    }

    const links = await utils.getPlayerLinks(playerName);

    if (!player) {
      throw new Error('Player has no records');
    }

    const playerview: PlayerView = {
      debut: appearances[0],
      seasons: summarySearch,
      transfers: amendedTansfers,
      links: links,
      image: utils.buildImagePath('photos/kop.jpg', 1920, 1080),
      player: player,
      appearances: appearances
    };

    return utils.sendResponse(200, playerview)
};
