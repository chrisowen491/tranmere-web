import { CloudflareEnv } from '../lib/tranmere-web-types';

export const onRequest: PagesFunction<CloudflareEnv> = async (context) => {
  const url = new URL(context.request.url);
  url.pathname = '/page/home/home';
  url.host = context.env.API_DOMAIN;
  url.protocol = context.env.API_PROTOCOL;
  url.port = context.env.API_PORT;

  console.log(url);
  const new_request = new Request(url, context.request);
  new_request.headers.set('x-api-key', context.env.API_KEY);
  return await fetch(new_request);
};
