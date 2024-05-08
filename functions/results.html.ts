import { CloudflareEnv } from '../lib/tranmere-web-types';

export const onRequest: PagesFunction<CloudflareEnv> = async (context) => {
  const url = new URL(context.request.url);
  if(url.searchParams.get("season")) {
    const destinationURL = `https://www.tranmere-web.com/games/${url.searchParams.get("season")}`;
    const statusCode = 301;
    return Response.redirect(destinationURL, statusCode);
  }
  else {
    const destinationURL = `https://www.tranmere-web.com/404`;
    const statusCode = 301;
    return Response.redirect(destinationURL, statusCode);
  }
};
