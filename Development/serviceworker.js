const cacheName = 'offline';
const initialCache = [
	'/',
	'/css/site.css',
	'/css/home.css',
	'/js/site.js',
	'/img/icon-skills.svg',
	'/img/icon-projects.svg',
	'/img/icon-github.svg',
	'/img/icon-linkedin.svg'
];
const maxWaitTime = 3000;


self.addEventListener('install', event => {
	// Create cache
	event.waitUntil(caches.open(cacheName)
		.then(cache => {
			// Add common files to the cache
			return cache.addAll(initialCache);
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
		event.respondWith(
			new Promise((resolve, reject) => {
				let loaded = false;
				// Wait a maximum time before returning the cache
				let timeLimit;
				function setTimeLimit() {
					timeLimit = setTimeout(() => {
						if(!loaded) {
							loaded = true;
							resolve(caches.match(event.request));
						}
					}, maxWaitTime)
				}

				// Check for cached version
				caches.match(event.request)
				.then(cacheResponse => {
					if(cacheResponse) {
						// Start countdown
						setTimeLimit();
					}
				})

				// Get response from network
				fetch(event.request)
				.then(response => {
					// Copy response as it can only be used once
					let copyOfResponse = response.clone();
					// Put copy of network response in cache
					caches.open(cacheName)
					.then(cache => {
						cache.put(event.request, copyOfResponse);
					})
					// Serve response to browser
					if(!loaded) {
						loaded = true;
						clearTimeout(timeLimit);
						resolve(response);
					}
				})
				// If network response fails, try the cache
				.catch(error => {
					// Check for cache entry
					caches.match(event.request)
					.then(cacheResponse => {
						if(cacheResponse) {
							// Return cache entry if available
							if(!loaded) {
								loaded = true;
								clearTimeout(timeLimit);
								resolve(caches.match(event.request));
							}
						} else {
							// Throw if nothing available
							return reject(new Error(error));
						}
					})
				})
			})
		);
	}
});