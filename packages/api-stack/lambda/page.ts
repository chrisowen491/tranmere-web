/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils } from '@tranmere-web/lib/src/tranmere-web-utils';
import { PlayerView } from '@tranmere-web/lib/src/tranmere-web-types';
const utils = new TranmereWebUtils();

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const classifier = event.pathParameters!.classifier;

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
    console.log('Player not found: ' + playerName);
    return utils.sendResponse(404, { message: 'Player not found' });
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

  return utils.sendResponse(200, playerview);
};
