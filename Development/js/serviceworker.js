const CACHE_NAME = 'offline';
const TIME_LIMIT = 3000;
const activeClients = {};

self.addEventListener('message', message => {
	if(message.data.command === 'fillInitialCache') {
		caches.open(CACHE_NAME)
		.then(cache => {
			cache.addAll(message.data.payload);
		})
	}
})

self.addEventListener('activate', event => {
	event.waitUntil(clients.claim());
});

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

function getAlternativeImage(request) {
	console.log(`Cache fetching alternative to ${request.url}`);
	return caches.open(CACHE_NAME)
	.then(cache => {
		return cache.matchAll()
	})
	.then(cacheEntries => {
		// Remove size and extension from file name, e.g. "image-480.jpg" becomes "image"
		const fileName = request.url.slice(0, request.url.lastIndexOf('-'));

		return cacheEntries.filter(entry => {
			return entry.url.includes(fileName);
		})
		.reduce((acc, cur) => {
			const sizeOf = response => response.headers.get('Content-Length');
			console.log(`Cache returning alternative to ${request.url}`);
			return (sizeOf(acc) > sizeOf(cur) ? acc : cur);
		})
	})
	.catch(() => {
		console.error(`Cache failed to fetch alternative to ${request.url}`);
		throw new Error(`No alternative cache entry for ${request.url}`);
	})
}

function getCacheResponse(request) {
	console.log(`Cache fetching ${request.url}`);
	return caches.match(request)
	.then(cacheResponse => {
		if(cacheResponse) {
			console.log(`Cache returning ${request.url}`);
			return cacheResponse;
		}
		else if(request.destination === 'image') {
			return getAlternativeImage(request);
		}
		else {
			console.warn(`Cache failed to fetch ${request.url}`);
			throw new Error(`No cache entry for ${request.url}`);
		}
	})
}

self.addEventListener('fetch', event => {
	if(event.request.method === 'GET') {

		event.respondWith(new Promise(resolve => {

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
					console.log(`Resolving ${event.request.url} with ${response}`);
					resolve(response);
				})
			)



			// console.log(`target is: ${event.resultingClientId}, current is: ${event.clientId}, url is: ${event.request.url}`);
			self.clients.matchAll()
			.then(clients => {
				console.log(...clients);
			})

			// save client on new page load
			// start countdown on new page load
			// update clients on new page load
			// once countdown = 0 return cache


		}));

	}
});