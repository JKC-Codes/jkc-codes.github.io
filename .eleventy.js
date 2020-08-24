module.exports = function(eleventyConfig) {
	eleventyConfig.setBrowserSyncConfig({
		// Refresh browser when CSS updates
		files: './site/css/**/*.css',
		ignore: './site/css/**/*.map',

		// Redirect live server requests
		server: {
			baseDir: './site/html',
			routes: {
				'/css': './site/css',
				'/img': './site/img',
				'/js': './site/js',
				'/serviceworker.js': './site/js/serviceworker.js'
			}
		}
	});

	// Group all blog posts together
	eleventyConfig.addCollection('posts', function(collectionAPI) {
		return collectionAPI.getFilteredByGlob('./site/pages/posts/*').reverse();
	});

	return {
		dir: {
			input: './site/pages/',
			output: './site/html/',
			includes: './_templates/_includes',
			layouts: './_templates/_layouts'
		}
	};
};