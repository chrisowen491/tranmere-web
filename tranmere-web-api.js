addEventListener('fetch', (event) => {
  // NOTE: don’t use fetch here, as we're not in an async scope yet
  event.respondWith(eventHandler(event))
})
async function eventHandler(event) {

  let cache = caches.default
  let response = await cache.match(event.request)
  const url = new URL(event.request.url);

  if (!response) {
    var request = new Request("https://lrny1myu9b.execute-api.eu-west-1.amazonaws.com/Prod/"+url.pathname)
    response = await fetch(request)
    response = new Response(response.body, response)
    event.waitUntil(cache.put(event.request, response.clone()))
  }
  return response;
}