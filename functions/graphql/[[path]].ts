export const onRequest: PagesFunction<CloudflareEnv> = async (context) => {
  const url = new URL(context.request.url);
  url.host = 'api.prod.tranmere-web.com';
  url.protocol = 'https';
  url.port = '443';
  const new_request = new Request(url, context.request);
  new_request.headers.set('x-api-key', 'da2-upnumdu7inamne5prs2wsuxfnq');

  return await fetch(new_request);
};
