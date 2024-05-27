import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import fs from 'fs';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', event);

  if (!event.pathParameters) {
    throw new Error('No Path Parameters Supplied');
  }

  const start =
    '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">';
  const background = `<g><title>background</title><rect fill="${event.pathParameters.background}" id="canvas_background" height="514" width="514" y="-1" x="-1"/></g>`;
  const end = '</svg>';

  const body = fs
    .readFileSync(`./assets/body.svg`, { encoding: 'utf8' })
    .replace(start, '')
    .replace(end, '');
  const hair = fs
    .readFileSync(`./assets/hair/${event.pathParameters.hair}.svg`, {
      encoding: 'utf8'
    })
    .replace(start, '')
    .replace(end, '');
  const hairBg = fs.existsSync(
    `./assets/hair/bg/${event.pathParameters.hair}.svg`
  )
    ? fs
        .readFileSync(`./assets/hair/bg/${event.pathParameters.hair}.svg`, {
          encoding: 'utf8'
        })
        .replace(start, '')
        .replace(end, '')
    : null;
  const features = fs
    .readFileSync(`./assets/features/${event.pathParameters.features}.svg`, {
      encoding: 'utf8'
    })
    .replace(start, '')
    .replace(end, '');
  const kit = fs
    .readFileSync(`./assets/kits/home/${event.pathParameters.kit}.svg`, {
      encoding: 'utf8'
    })
    .replace(start, '')
    .replace(end, '');
  const collar = fs.existsSync(
    `./assets/kits/home/collars/${event.pathParameters.kit}.svg`
  )
    ? fs
        .readFileSync(
          `./assets/kits/home/collars/${event.pathParameters.kit}.svg`,
          { encoding: 'utf8' }
        )
        .replace(start, '')
        .replace(end, '')
    : null;

  let svg = `${start}${background}${hairBg}${kit}${body}${hair}${features}${collar}${end}`;

  svg = svg.replace(/#SKIN/g, `#${event.pathParameters.body}`);
  svg = svg.replace(/#HAIR/g, `#${event.pathParameters.hairColour}`);
  svg = svg.replace(/#NECK/g, `#${event.pathParameters.neckColour}`);
  svg = svg.replace(/#HIGHLIGHTS/g, `#${event.pathParameters.highlights}`);

  return {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=2592000'
    },
    statusCode: 200,
    body: svg
  };
};
