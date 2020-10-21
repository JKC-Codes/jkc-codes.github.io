const pluginExtract = require('./extract-plugin.js');
const pluginRSS = require("@11ty/eleventy-plugin-rss");
const pluginTimeToRead = require('eleventy-plugin-time-to-read');
const pluginSafeExternalLinks = require('eleventy-plugin-safe-external-links');

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
				'/img': './site/images',
				'/js': './site/javascript',
				'/serviceworker.js': './site/javascript/serviceworker.js'
			}
		}
	});

	// Group all blog posts together
	eleventyConfig.addCollection('posts', function(collectionAPI) {
		return collectionAPI.getFilteredByGlob('./site/content/posts/**').reverse();
	});

	// Add plugins
	eleventyConfig.addPlugin(pluginExtract, {
		wordLimit: 50,
		initialHeadingLevel: 3
	});
	eleventyConfig.addPlugin(pluginRSS);
	eleventyConfig.addPlugin(pluginTimeToRead);
	eleventyConfig.addPlugin(pluginSafeExternalLinks);

	return {
		dir: {
			input: './site/content/',
			output: './site/html/',
			includes: './_templates/_includes',
			layouts: './_templates/_layouts'
		}
	};
};