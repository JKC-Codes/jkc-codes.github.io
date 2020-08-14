const pluginExtract = require('./eleventy-plugin-extract/.eleventy.js');

module.exports = function(eleventyConfig) {
	eleventyConfig.setBrowserSyncConfig({
		// Refresh browser when CSS updates
		files: './src/css/**/*.css',
		ignore: './src/css/**/*.map',

		// Redirect live server requests
		server: {
			baseDir: './src/html',
			routes: {
				'/css': './src/css',
				'/img': './src/img',
				'/js': './src/js',
				'/serviceworker.js': './src/js/serviceworker.js'
			}
		}
	});

	// Group all blog posts together
	eleventyConfig.addCollection('posts', function(collectionAPI) {
		return collectionAPI.getFilteredByGlob('./src/pages/blog/*').reverse();
	});

	// Create summaries for blog posts
	eleventyConfig.addPlugin(pluginExtract, {
		wordLimit: 50,
		initialHeadingLevel: 3
	});

	return {
		dir: {
			input: './src/pages/',
			output: './src/html/'
		},
		passthroughFileCopy: true
	};
};