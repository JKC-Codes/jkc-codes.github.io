self.addEventListener("install", function(event) {
	event.waitUntil(caches.open('offline')
		.then(function(cache) {
			return cache.addAll([
				'/index.html',
				'/css/site.css',
				'/css/home.css',
				'/js/site.js'
			]);
		})
	);
});


self.addEventListener('fetch', function(event) {
	if(event.request.method === 'GET') {
		event.respondWith(
			caches.match(event.request)
			.then(function(resp) {
				return resp || fetch(event.request)
				.then(function(response) {
					return caches.open('offline')
					.then(function(cache) {
						cache.put(event.request, response.clone());
						return response;
					});
				});
			})
		);
	}
});