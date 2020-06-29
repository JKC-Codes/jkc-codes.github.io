const CACHE_NAME = 'offline';
const TIME_LIMIT = 3000;
const loadingPages = {};


function updateCache(request, response) {
	caches.open(CACHE_NAME)
	.then(cache => {
		cache.put(request, response);
	})
}

function getNetworkResponse(request) {
	return fetch(request)
	.then(networkResponse => {
		// Response can only be used once so must be cloned
		updateCache(request, networkResponse.clone());
		return networkResponse;
	})
	.catch(()=> {
		throw new Error(`Network error fetching ${request.url}`)
	})
}

function getAlternativeImage(request) {
	return caches.open(CACHE_NAME)
	.then(cache => {
		return cache.matchAll()
	})
	.then(cacheEntries => {
		function escapeRegularExpression(string) {
			return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
		}
		// Remove size and extension from file name, e.g. "/image-480w.jpg" becomes "/image-"
		const fileName = request.url.slice(0, request.url.lastIndexOf('-') + 1);
		// Format is: filename-123w.abc
		const format = new RegExp(`${escapeRegularExpression(fileName)}\\d+w\\.\\w{3,4}`);

		return cacheEntries.filter(entry => {
			return format.test(entry.url);
		})
		.reduce((acc, cur) => {
			// Get best quality image
			const sizeOf = response => response.headers.get('Content-Length');
			return (sizeOf(acc) > sizeOf(cur) ? acc : cur);
		})
	})
	.catch(() => {
		throw new Error(`No alternative cache entry for ${request.url}`);
	})
}

function getCacheResponse(request) {
	return caches.match(request)
	.then(cacheResponse => {
		const isImage = request.destination === 'image';
		// Look for -123w.abc at end of URL
		const fileNameIncludesSize = /-\d+w\.\w{3,4}$/.test(request.url);

		if(cacheResponse) {
			return cacheResponse;
		}
		else if(isImage && fileNameIncludesSize) {
			return getAlternativeImage(request);
		}
		else {
			throw new Error(`No cache entry for ${request.url}`);
		}
	})
}


self.addEventListener('activate', event => {
	event.waitUntil(
		clients.claim()
	);
});

self.addEventListener('message', message => {
	if(message.data.command === 'fillInitialCache') {
		caches.open(CACHE_NAME)
		.then(cache => {
			cache.addAll(message.data.payload);
		})
	}
	else if(message.data === 'pageLoaded') {
		delete loadingPages[message.source.id];
	}
});

self.addEventListener('fetch', event => {
	// Only worry about outgoing requests
	if(event.request.method !== 'GET') { return; };

	let fetchResolved = false;
	event.respondWith(new Promise(resolve => {
		// Return network response or cache if it fails
		event.waitUntil(
			getNetworkResponse(event.request)
			.catch(() => {
				return getCacheResponse(event.request);
			})
			.catch(() => {
				return new Response(null, {
					'url': event.request.url,
					'status': 404,
					'statusText': 'Not found'
				})
			})
			.then(response => {
				if(!fetchResolved) {
					fetchResolved = true;
					resolve(response);
				}
			})
		)

		// Note time of page request
		if(event.request.destination === 'document') {
			loadingPages[event.resultingClientId] = Date.now();
		}

		// Compare time of page request to time of current request
		let pageID = event.clientId || event.resultingClientId;
		let delay = 0;
		if(loadingPages[pageID]) {
			delay = Date.now() - loadingPages[pageID];
		}

		setTimeout(()=> {
			// Clean up loadingPages object in case page fails to load
			if(event.request.destination === 'document') {
				delete loadingPages[pageID];
			}

			// Return cache response if page has taken too long to load
			if(!fetchResolved) {
				getCacheResponse(event.request)
				.then(response => {
					fetchResolved = true;
					resolve(response);
				})
				.catch(()=> { null })
			}
		}, TIME_LIMIT - delay);
	}));
});