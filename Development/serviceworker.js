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
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(cache => {
			cache.addAll(INITIAL_CACHE);
		})
	);
});


self.addEventListener('activate', event => {
	event.waitUntil(clients.claim());
});


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
}

function getAlternativeImage(request) {
	return caches.open(CACHE_NAME)
	.then(cache => {
		return cache.matchAll()
	})
	.then(cacheEntries => {
		const fileName = request.url.slice(0, request.url.lastIndexOf('-'));
		const matches = cacheEntries.filter(entry => {
			return entry.url.includes(fileName);
		})
		const match = matches.reduce((acc, cur) => {
			const sizeOf = response => response.headers.get('Content-Length');
			return (sizeOf(acc) > sizeOf(cur) ? acc : cur);
		})
		return match;
	})
	.catch(() => {
			throw new Error(`No alternative cache entry`);
	})
}

function getCacheResponse(request) {
	return caches.match(request)
	.then(cacheResponse => {
		if(cacheResponse) {
			return cacheResponse;
		} else {
			throw new Error(`No cache entry`);
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
	if(event.request.method === 'GET') {
		event.respondWith(
			getNetworkResponse(event.request)
			.catch(()=> {
				return getCacheResponse(event.request);
			})
			.catch(error => {
				return new Response(null, {
					'url': event.request.url,
					'status': 404,
					'statusText': error.message
				});
			})
		)
	}
});