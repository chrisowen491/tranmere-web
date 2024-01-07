export async function onRequest(context) {

  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    waitUntil, // same as ctx.waitUntil in existing Worker API
  } = context;
  
  let url = new URL(request.url)  
  url.host = env.API_DOMAIN
  url.protocol = env.API_PROTOCOL
  url.port = env.API_PORT

  console.log(url)
  let new_request = new Request(url, request)
  new_request.headers.set("x-api-key", env.API_KEY)
  
  return await fetch(new_request);
}