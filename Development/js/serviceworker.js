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
const TIME_LIMIT = 3000;


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
	.catch(()=> {
		throw new Error('Network error')
	})
}

function getAlternativeImage(request) {
	return caches.open(CACHE_NAME)
	.then(cache => {
		return cache.matchAll()
	})
	.then(cacheEntries => {
		// Remove size and extension from file name, e.g. "image-480.jpg" becomes "image"
		const fileName = request.url.slice(0, request.url.lastIndexOf('-'));
		return cacheEntries.filter(entry => {
			return entry.url.includes(fileName);
		}).reduce((acc, cur) => {
			const sizeOf = response => response.headers.get('Content-Length');
			return (sizeOf(acc) > sizeOf(cur) ? acc : cur);
		})
	})
	.catch(() => {
			throw new Error('No alternative cache entry');
	})
}

function getCacheResponse(request) {
	return caches.match(request)
	.then(cacheResponse => {
		if(cacheResponse) {
			return cacheResponse;
		} else {
			throw new Error('No cache entry');
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

let countdown;
function startCountdown(time) {
	countdown = time;
	const INTERVAL = 50;
	let timer = setInterval(()=> {
		countdown -= INTERVAL;
		if(countdown <= 0) {
			clearInterval(timer);
		}
	}, INTERVAL)
}


self.addEventListener('fetch', event => {
	if(event.request.method === 'GET') {
		event.respondWith(new Promise(resolve => {
			// Start timer at page load
			if(event.request.destination === 'document') {
				startCountdown(TIME_LIMIT);
			}

			getCacheResponse(event.request)
			.then(cacheEntry => {
				if(countdown <= 0) {
					event.waitUntil(getNetworkResponse(event.request))
					return(cacheEntry);
				}
				else {
					// Set time limit for network response
					setTimeout(()=> {
						resolve(cacheEntry);
					}, countdown)

					return getNetworkResponse(event.request)
					.catch(()=> {
						return cacheEntry;
					})
				}
			})
			.catch(()=> {
				return getNetworkResponse(event.request)
				.catch(()=> {
					return new Response(null, {
						'url': event.request.url,
						'status': 404,
						'statusText': 'Not found'
					})
				})
			})
			.then(response => {
				resolve(response);
			})
		}))
	}
});