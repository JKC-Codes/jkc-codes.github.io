const CACHE_NAME = 'offline';
const INITIAL_CACHE = [
	'/',
	'/css/site.css',
	'/css/home.css',
	'/js/site.js',
	'/img/site/icon-skills.svg',
	'/img/site/icon-projects.svg',
	'/img/site/icon-github.svg',
	'/img/site/icon-linkedin.svg'
];


self.addEventListener('install', event => {
	// Create cache
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(cache => {
			// Add common files to the cache
			cache.addAll(INITIAL_CACHE);
		})
	);
});


self.addEventListener('activate', event => {
	// Start immediately if no current worker instead of waiting for next page load
	event.waitUntil(clients.claim());
});


// Update the cache with new response
async function updateCache(request, response) {
	await caches.open(CACHE_NAME)
	.then(cache => {
		cache.put(request, response);
	})
}

// Fetch request then cache and return response
async function getNetworkResponse(request) {
	return await fetch(request)
	.then(networkResponse => {
		// Response can only be used once so must be cloned
		updateCache(request, networkResponse.clone());
		return networkResponse;
	})
}

// Return response from cache
async function getCacheResponse(request) {
	return await caches.match(request)
	.then(cacheResponse => {
		if(cacheResponse) {
			return cacheResponse;
		} else {
			throw new Error(`No cache entry for ${request.url}`);
		}
	})
}

// Return alternatively sized image from cache
async function getAlternativeCacheResponse(request) {
	if(request.destination === 'image') {
		return await caches.open(CACHE_NAME)
		.then(cache => {
			return cache.matchAll()
		})
		.then(matches => {
			const fileName = request.url.slice(0, request.url.lastIndexOf('-'));
			const alternativeCacheEntry = matches.find(entry => {
				return entry.url.includes(fileName);
			})
			if(alternativeCacheEntry) {
				return alternativeCacheEntry;
			}
			else {
				throw new Error(`No alternative cache entry for ${request.url}`);
			}
		})
	}
	else {
		throw new Error(`No alternative cache entry for ${request.url}`);
	}
}

self.addEventListener('fetch', event => {
	// Cache incoming requests only
	if(event.request.method === 'GET') {
		event.respondWith(
			getNetworkResponse(event.request)
			.catch(()=> {
				return getCacheResponse(event.request);
			})
			.catch(()=> {
				return getAlternativeCacheResponse(event.request);
			})
			.catch(() => {
				// Show a 404 in network console rather than net::ERR_FAILED
				return new Response(null, {
					'url': event.request.url,
					'status': 404,
					'statusText': 'Not Found'
				});
			})
		)
	}
});