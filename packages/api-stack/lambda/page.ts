import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils } from '@tranmere-web/lib/src/tranmere-web-utils';
import { PlayerView } from '@tranmere-web/lib/src/tranmere-web-types';
const utils = new TranmereWebUtils();

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const classifier = event.pathParameters!.classifier;

  const playerName = classifier!;

  const summarySearch = await utils.getPlayerSummary(playerName);

  const appearances = await utils.getAppsByPlayer(
    decodeURIComponent(playerName)
  );

  const playerview: PlayerView = {
    debut: appearances[0],
    seasons: summarySearch,
    image: utils.buildImagePath('photos/kop.jpg', 1920, 1080),
    appearances: appearances
  };

  return utils.sendResponse(200, playerview);
};
