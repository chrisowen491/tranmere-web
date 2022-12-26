const errorHandler = async ({ next }) => {
    try {
      return await next();
    } catch (err) {
      return new Response(`${err.message}\n${err.stack}`, { status: 500 });
    }
};

const cacheHandler = async ({ request, next, waitUntil }) => {

    const cacheUrl = new URL(request.url)
  
    const cacheKey = new Request(cacheUrl.toString(), request)
    const cache = caches.default

    // Get this request from this zone's cache
    let response = await cache.match(cacheKey)

    if(!response) {
        let downstream_response = await next(); 
        if(downstream_response.status == 200) {
            // Store the fetched response as cacheKey
            // Use waitUntil so computational expensive tasks dont delay the response
            waitUntil(cache.put(cacheKey, downstream_response.clone()))
        }
        return downstream_response   
    } else {
        return response;
    }
};

export const onRequest = [errorHandler, cacheHandler];