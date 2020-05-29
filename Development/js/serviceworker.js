const CACHE_NAME = 'offline';
const TIME_LIMIT = 3000;
const activeClients = {};


function addToActiveClients(pageID) {
	activeClients[pageID] = {
		loaded: false,
		loadTime: 0
	};
}

function startPageTimer(pageID) {
	let timer = setInterval(()=> {
		if(!activeClients[pageID] || activeClients[pageID].loadTime >= TIME_LIMIT) {
			clearInterval(timer);
		}
		activeClients[pageID].loadTime += 50;
	}, 50);
}

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


self.addEventListener('message', message => {
	if(message.data.command === 'fillInitialCache') {
		caches.open(CACHE_NAME)
		.then(cache => {
			cache.addAll(message.data.payload);
		})
	}
	else if(message.data === 'pageLoaded') {
		activeClients[message.source.id].loaded = true;

		// Update clients list
		clients.matchAll()
		.then(clients => {
			let currentClients = clients.map(client => client.id);
			let previousClients = Object.keys(activeClients);

			previousClients.forEach(client => {
				if(!currentClients.includes(client)) {
					delete activeClients[client];
				}
			})
		})
	}
})

self.addEventListener('activate', event => {
	event.waitUntil(
		clients.claim()
		.then(clients.matchAll()
		.then(clients => {
			clients.forEach(client => {
				addToActiveClients(client.id);
				startPageTimer(client.id);
			});
		}))
	);
});

self.addEventListener('fetch', event => {
	if(event.request.method === 'GET') {
		event.respondWith(new Promise(resolve => {
			let resolved = false;

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
					if(!resolved) {
						resolved = true;
						resolve(response);
					}
				})
			)

			// Time how long the page takes to load
			if(event.request.destination === 'document') {
				addToActiveClients(event.resultingClientId);
				startPageTimer(event.resultingClientId);
			}

			function resolveWithCache(request) {
				getCacheResponse(request)
				.then(response => {
					resolved = true;
					resolve(response);
				})
				.catch(()=> {null})
			}

			// Return cache response if page has taken too long to load
			let pageID = event.clientId || event.resultingClientId;

			if(!activeClients[pageID].loaded) {
				if(activeClients[pageID].loadTime >= TIME_LIMIT && !resolved) {
					resolveWithCache(event.request);
				}
				else {
					setTimeout(()=> {
						if(!resolved) {
							resolveWithCache(event.request);
						}
					}, TIME_LIMIT - activeClients[pageID].loadTime);
				}
			}
		}));
	}
});