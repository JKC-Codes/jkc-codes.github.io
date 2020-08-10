const pluginExtract = require('./eleventy-plugin-extract/.eleventy.js');

module.exports = function(eleventyConfig) {
	eleventyConfig.setBrowserSyncConfig({
		// Refresh browser when CSS updates
		files: './css/**/*.css',
		ignore: './css/**/*.map',

		// Redirect live server requests
		server: {
			baseDir: './html',
			routes: {
				'/css': './css',
				'/img': './Images',
				'/js': './Scripts',
				'/js/serviceworker.js': './Scripts/serviceworker.js'
			}
	}
	});

	// Group all blog posts together
	eleventyConfig.addCollection('posts', function(collectionAPI) {
		return collectionAPI.getFilteredByGlob('./Markup/blog/*').reverse();
	});

	// Create summaries for blog posts
	eleventyConfig.addPlugin(pluginExtract, {
		wordLimit: 50,
		initialHeadingLevel: 3
	});

	return {
		dir: {
			input: './Markup/',
			output: './html/'
		},
		passthroughFileCopy: true
  };
};