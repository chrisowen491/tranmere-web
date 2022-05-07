export async function onRequest(context) {

  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    waitUntil, // same as ctx.waitUntil in existing Worker API
  } = context;

  let url = new URL(request.url)
  url.host = "tgzafameebdujmbaw4tdkuaiku.appsync-api.eu-west-1.amazonaws.com";

  let new_request = new Request(url, request)
  new_request.headers.set("x-api-key", "da2-uaiu6wz4gjeetknxcdq5bf7bo4")

  return await fetch(new_request)
}