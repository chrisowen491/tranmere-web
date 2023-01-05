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
  let response = await fetch(new_request)

  if(response.status < 400) {
    let nav_response = await fetch(new Request('https://raw.githubusercontent.com/chrisowen491/tranmere-web/master/tranmere-web/templates/partials/homenav.partial.mustache'))
    let nav_text = await nav_response.text();
    let amendedBody = await response.text()
    amendedBody = amendedBody.replace(/NAV_BAR_PLACEHOLDER/g, nav_text);
    // Must use Response constructor to inherit all of response's fields
    return new Response(amendedBody, response)
  } else {
    let url = new URL(request.url)  
    url.pathname = "404.html"
    return await fetch(new Request(url, request));
  }
}