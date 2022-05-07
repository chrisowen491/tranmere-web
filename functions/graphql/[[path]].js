export async function onRequest(context) {

  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    waitUntil, // same as ctx.waitUntil in existing Worker API
  } = context;

  try {

    const cacheUrl = new URL(request.url)

    const cacheKey = new Request(cacheUrl.toString(), request)
    const cache = caches.default

    // Get this request from this zone's cache
    let response = await cache.match(cacheKey)

    if (!response) {

      let url = new URL(request.url)
      url.host = "tgzafameebdujmbaw4tdkuaiku.appsync-api.eu-west-1.amazonaws.com";

      let new_request = new Request(url, request)
      new_request.headers.set("x-api-key", "da2-uaiu6wz4gjeetknxcdq5bf7bo4")

      // If not in cache, get it from origin
      response = await fetch(new_request)

      if(response.status != 500) {
        // Store the fetched response as cacheKey
        // Use waitUntil so computational expensive tasks don"t delay the response
        waitUntil(cache.put(cacheKey, response.clone()))
      }
    }
    return response
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}