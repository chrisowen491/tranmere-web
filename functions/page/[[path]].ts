export const onRequest: PagesFunction<CloudflareEnv> = async (context) => {
  const url = new URL(context.request.url);
  url.host = context.env.API_DOMAIN;
  url.protocol = context.env.API_PROTOCOL;
  url.port = context.env.API_PORT;

  const new_request = new Request(url, context.request);
  new_request.headers.set('x-api-key', context.env.API_KEY);

  // If not in cache, get it from origin
  const response = await fetch(new_request, { cf: { cacheEverything: true } });

  if (response.status < 400) {
    return response;
  } else {
    const url = new URL(context.request.url);
    url.pathname = 'error.html';
    return await fetch(new Request(url, context.request));
  }
};
