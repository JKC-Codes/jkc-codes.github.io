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

// Return alternatively sized image from cache
async function getAlternativeImage(request) {
	return await caches.open(CACHE_NAME)
	.then(cache => {
		return cache.matchAll()
	})
	.then(cacheEntries => {
		const fileName = request.url.slice(0, request.url.lastIndexOf('-'));
		const matches = cacheEntries.filter(entry => {
			return entry.url.includes(fileName);
		})
		const match = matches.reduce((acc, cur) => {
			const accSize = acc.headers.get('Content-Length');
			const curSize = cur.headers.get('Content-Length');
			return (accSize > curSize ? acc : cur);
		})
		if(match) {
			return match;
		}
		else {
			throw new Error(`No alternative cache entry for ${request.url}`);
		}
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
	.catch(error => {
		if(request.destination === 'image') {
			return getAlternativeImage(request);
		}
		else {
			throw error;
		}
	})
}


self.addEventListener('fetch', event => {
	// Cache incoming requests only
	if(event.request.method === 'GET') {
		event.respondWith(
			getNetworkResponse(event.request)
			.catch(()=> {
				return getCacheResponse(event.request);
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