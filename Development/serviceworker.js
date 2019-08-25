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
	event.waitUntil(caches.open(CACHE_NAME)
		.then(cache => {
			// Add common files to the cache
			cache.addAll(INITIAL_CACHE);
		})
	);
});


self.addEventListener('activate', event => {
	// Start immediately instead of waiting for next page load
	event.waitUntil(clients.claim());
});


self.addEventListener('fetch', event => {
	// Cache incoming requests only
  if (event.request.method === 'GET') {

		// Update the cache with new response
		function updateCache(response) {
			caches.open(CACHE_NAME)
			.then(cache => {
				cache.put(event.request, response);
			})
		}

		// Return cache matching the request
		function getCache(request) {
			return caches.match(request)
			.then(cacheResponse => {
				if(cacheResponse) {
					return cacheResponse;
				} else {
					throw new Error('No cache entry');
				}
			})
			.catch(error => {
				throw error;
			})
		}

		// Respond to fetch request
		let eventResponse = new Promise((resolve, reject) => {
			// Ensure cache from network before service worker is shut down
			event.waitUntil(
				fetch(event.request)
				.then(networkResponse => {
					// Response can only be used once so must be cloned
					updateCache(networkResponse.clone());
					resolve(networkResponse)
				})
				.catch(networkError => {
					getCache(event.request)
					.then(cacheResponse => {
						resolve(cacheResponse);
					})
					.catch(cacheError => {
						let failureResponse = new Response(null, {
							'url': event.request.url,
							'status': 404,
							'statusText': 'Not Found'
						});
						resolve(failureResponse);
					})
				})
				// Load from cache is no longer necessary
				.then(() => {
					clearTimeout(countdown);
				})
			)

			// Wait x seconds for the network before going to the cache
			var countdown;
			caches.match(event.request)
			.then(cacheResponse => {
				if(cacheResponse) {
					countdown = setTimeout(() => {
						resolve(cacheResponse);
					}, MAX_WAIT_TIME, cacheResponse);
				}
			})
		});

		event.respondWith(eventResponse)
	}
});