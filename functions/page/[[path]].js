export async function onRequest(context) {

  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    waitUntil, // same as ctx.waitUntil in existing Worker API
  } = context;
  
  let url = new URL(request.url)  
  url.host = "api.prod.tranmere-web.com"

  let new_request = new Request(url, request)
  new_request.headers.set("x-api-key", env.API_KEY)
  
  // If not in cache, get it from origin
  let response = await fetch(new_request, { cf: { cacheEverything: true } });

  if(response.status < 400) {
    return response
  } else {
    let url = new URL(request.url)  
    url.pathname = "error.html"
    return await fetch(new Request(url, request));
  }
}