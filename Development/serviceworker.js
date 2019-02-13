self.addEventListener('install', function(event) {
	event.waitUntil(caches.open('offline')
		.then(function(cache) {
			return cache.addAll([
				'/',
				'/css/site.css',
				'/css/home.css',
				'/js/site.js'
			]);
		})
	);
});


self.addEventListener('fetch', function(event) {
	// Cache incoming requests only
  if (event.request.method === 'GET') {
		event.respondWith(
			// Get response from network
			fetch(event.request)
			.then(function(response) {
				// Copy response as it can only be used once
				var copyOfResponse = response.clone();
				// Put network response in cache folder named offline
				caches.open('offline')
				.then(function(cache) {
					cache.put(event.request, copyOfResponse);
				})
				// Serve response to browser
				return response;
			})
			// If network response fails
			.catch(function(error) {
				// Return cache entry
				return caches.match(event.request);
			})
		)
	}
})