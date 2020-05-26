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
		if(!activeClients[pageID].loadTime) {
			clearInterval(timer);
		}
		activeClients[pageID].loadTime += 50;
		if(activeClients[pageID].loadTime >= TIME_LIMIT) {
			clearInterval(timer);
		}
	}, 50);
}

function updateCache(request, response) {
	console.log(`Network caching ${request.url}`);
	caches.open(CACHE_NAME)
	.then(cache => {
		cache.put(request, response);
		console.log(`Network cached ${request.url}`);
	})
}

function getNetworkResponse(request) {
	console.log(`Network fetching ${request.url}`);
	return fetch(request)
	.then(networkResponse => {
		console.log(`Network fetch received ${request.url}`);
		// Response can only be used once so must be cloned
		updateCache(request, networkResponse.clone());
		console.log(`Network fetched ${request.url}`);
		return networkResponse;
	})
	.catch(()=> {
		console.warn(`Network failed to fetch ${request.url}`);
		throw new Error(`Network error fetching ${request.url}`)
	})
}

// function getAlternativeImage(request) {
// 	console.log(`Cache fetching alternative to ${request.url}`);
// 	return caches.open(CACHE_NAME)
// 	.then(cache => {
// 		return cache.matchAll()
// 	})
// 	.then(cacheEntries => {
// 		// Remove size and extension from file name, e.g. "/image-480.jpg" becomes "/image"
// 		const fileName = request.url.slice(request.url.lastIndexOf('/'), request.url.lastIndexOf('-'));

// 		console.log(fileName);
// 		return cacheEntries.filter(entry => {
// 			return entry.url.includes(fileName);
// 		})
// 		.reduce((acc, cur) => {
// 			// Get best quality image
// 			const sizeOf = response => response.headers.get('Content-Length');
// 			console.log(`Cache returning alternative to ${request.url}`);
// 			return (sizeOf(acc) > sizeOf(cur) ? acc : cur);
// 		})
// 	})
// 	.catch(() => {
// 		console.error(`Cache failed to fetch alternative to ${request.url}`);
// 		throw new Error(`No alternative cache entry for ${request.url}`);
// 	})
// }

function getCacheResponse(request) {
	console.log(`Cache fetching ${request.url}`);
	return caches.match(request)
	.then(cacheResponse => {
		if(cacheResponse) {
			console.log(`Cache returning ${request.url}`);
			return cacheResponse;
		}
		// else if(request.destination === 'image') {
		// 	return getAlternativeImage(request);
		// }
		else {
			console.warn(`Cache failed to fetch ${request.url}`);
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
						console.log(`Resolving ${event.request.url} with ${response}`);
						resolved = true;
						resolve(response);
					}
				})
			)

			// Time how long the page takes to load
			if(event.request.destination === 'document') {
				let newPageID = event.resultingClientId;
				addToActiveClients(newPageID);
				startPageTimer(newPageID);
			}

			function resolveWithCache(request) {
				getCacheResponse(request)
				.then(response => {
					console.log(`Resolving ${request.url} with cached ${response} after time out`);
					resolved = true;
					resolve(response);
				})
				.catch(()=> {
					console.error(`no cache for timed out ${request.url}`);
				})
			}

			// Return cache response if page has taken too long to load
			let pageID = event.clientId || event.resultingClientId;

			if(!activeClients[pageID].loaded) {
				if(activeClients[pageID].loadTime >= TIME_LIMIT && !resolved) {
					console.log(`Page already timed out, getting cache response for ${event.request.url}`);
					resolveWithCache(event.request);
				}
				else {
					let countdown = setTimeout(()=> {
						if(!resolved) {
							console.log(`Page timed out while fetching ${event.request.url}, getting cache response`);
							resolveWithCache(event.request);
						}
						clearTimeout(countdown);
					}, TIME_LIMIT - activeClients[pageID].loadTime);
				}
			}



		}));

	}
});