export async function onRequest(context) {

  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    waitUntil, // same as ctx.waitUntil in existing Worker API
  } = context;

  let url = new URL(request.url)
  url.host = "jafvqela5jaz3or4rxu3yo4xry.appsync-api.eu-west-1.amazonaws.com";

  let new_request = new Request(url, request)
  new_request.headers.set("x-api-key", "da2-upnumdu7inamne5prs2wsuxfnq")

  return await fetch(new_request)
}
