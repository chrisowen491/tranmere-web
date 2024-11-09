export const runtime = "edge";

import { GetSvg } from "@/lib/apiFunctions";
import { NextResponse } from "next/server";



export async function GET(
    request: Request,
    { params }: { params: Promise<{ kit: string, hair: string, body: string, features: string, hairColour: string, neckColour: string, background: string, highlights: string }> }
  ) {
  
  const data = await params;

  const start =
    '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">';
  const background = `<g><title>background</title><rect fill="${data.background}" id="canvas_background" height="514" width="514" y="-1" x="-1"/></g>`;
  const end = '</svg>';

  const body = await GetSvg('body.svg');
  const hair = await GetSvg(`hair/${data.hair}.svg`);
  const hairBg = await GetSvg(`hair/bg/${data.hair}.svg`);
  const features = await GetSvg(`features/${data.features}.svg`);
  const kit = await GetSvg(`kits/home/${data.kit}.svg`);
  const collar = await GetSvg( `kits/home/collars/${data.kit}.svg`);

  let svg = `${start}${background}${hairBg}${kit}${body}${hair}${features}${collar}${end}`;

  svg = svg.replace(/#SKIN/g, `#${data.body}`);
  svg = svg.replace(/#HAIR/g, `#${data.hairColour}`);
  svg = svg.replace(/#NECK/g, `#${data.neckColour}`);
  svg = svg.replace(/#HIGHLIGHTS/g, `#${data.highlights}`);

  const response = new NextResponse(svg)
  response.headers.set('Content-Type', 'image/svg+xml');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Cache-Control', 'public, max-age=2592000');
  return response;
}
