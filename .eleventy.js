const pluginExtract = require('./extract-plugin.js');
const pluginTimeToRead = require('eleventy-plugin-time-to-read');

module.exports = function(eleventyConfig) {
	eleventyConfig.setBrowserSyncConfig({
		// Refresh browser when CSS updates
		files: './site/css/**/*.css',
		ignore: './site/css/**/*.map',

		// Redirect live server requests so content isn't duplicated
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

	// Add plugins
	eleventyConfig.addPlugin(pluginExtract, {
		wordLimit: 50,
		initialHeadingLevel: 3
	});

	eleventyConfig.addPlugin(pluginTimeToRead, {
		prepend: 'About ',
		append: ' to read'
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