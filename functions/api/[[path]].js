export async function onRequest(context) {

  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  const request = context.request
  const cacheUrl = new URL(request.url)

  const cacheKey = new Request(cacheUrl.toString(), request)
  const cache = caches.default

  // Get this request from this zone's cache
  let response = await cache.match(cacheKey)

  if (!response) {

      let url = new URL(context.request.url)

      if(url.pathname === "/" || url.pathname.startsWith("/page")) {
        url.host = "api.ci1.tranmere-web.com"
        if(url.pathname === "/") {
            url.pathname = "/page/home/home"
        }
      }

      if(url.pathname.startsWith("/player-search") || url.pathname.startsWith("/result-search") || url.pathname.startsWith("/builder")|| url.pathname.startsWith("/match") || url.pathname.startsWith("/contact-us")) {
        url.host = "api.ci1.tranmere-web.com"
      }

      let request = new Request(url, context.request)

      if(url.pathname.startsWith("/graphql")) {
        url.host = "tgzafameebdujmbaw4tdkuaiku.appsync-api.eu-west-1.amazonaws.com";
        request.headers.set("x-api-key", "da2-uaiu6wz4gjeetknxcdq5bf7bo4")
      } else {
        request.headers.set("x-api-key", APIKEY)
      }

    // If not in cache, get it from origin
    response = await fetch(request)

    nav_response = await fetch(new Request('https://raw.githubusercontent.com/chrisowen491/tranmere-web/master/tranmere-web/templates/partials/homenav.partial.mustache'))
    let nav_text = await nav_response.text();
    var amendedBody = await response.text()
    amendedBody = amendedBody.replace(/NAV_BAR_PLACEHOLDER/g, nav_text);

    // Must use Response constructor to inherit all of response's fields
    response = new Response(amendedBody, response)

    if(response.status != 500) {
      // Store the fetched response as cacheKey
      // Use waitUntil so computational expensive tasks don"t delay the response
      context.waitUntil(cache.put(cacheKey, response.clone()))
    }
  }
  return response
}