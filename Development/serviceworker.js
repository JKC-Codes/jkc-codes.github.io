const CACHE_NAME = 'offline';
const INITIAL_CACHE = [
	'/',
	'/css/site.css',
	'/css/home.css',
	'/js/site.js',
	'/img/icon-skills.svg',
	'/img/icon-projects.svg',
	'/img/icon-github.svg',
	'/img/icon-linkedin.svg'
];
const MAX_WAIT_TIME = 3000;


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
async function networkResponse(request) {
	return await fetch(request)
	.then(networkResponse => {
		// Response can only be used once so must be cloned
		updateCache(request, networkResponse.clone());
		return networkResponse;
	})
}

// Return response from cache
async function cacheResponse(request) {
	return await caches.match(request)
	.then(cacheResponse => {
		if(cacheResponse) {
			return cacheResponse;
		} else {
			throw new Error(`No cache entry for ${request.url}`);
		}
	})
}

self.addEventListener('fetch', event => {
	// Cache incoming requests only
	if (event.request.method === 'GET') {
		event.respondWith(
			networkResponse(event.request)
			.catch(()=> {
				return cacheResponse(event.request)
			})
			.catch(error => {
				return new Response(null, {
					'url': event.request.url,
					'status': 404,
					'statusText': 'Not Found'
				});
			})
		)
	}
});