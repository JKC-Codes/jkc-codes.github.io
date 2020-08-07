const pluginExtract = require('./eleventy-plugin-extract/.eleventy.js');

module.exports = function(eleventyConfig) {
	// Move folders directly to the build directory
	eleventyConfig.addPassthroughCopy('./img/');
	eleventyConfig.addPassthroughCopy('./js/');

	// Move service worker from JS folder to the root directory
	eleventyConfig.addPassthroughCopy({'./js/serviceworker.js':'./serviceworker.js'});

	// Redirect missing pages in stage to production
	eleventyConfig.addPassthroughCopy({'./.netlify/_redirects':'./_redirects'});

	// Refresh browser when CSS updates
	eleventyConfig.setBrowserSyncConfig({
		files: ['./staging/css/**/*.css', '!./staging/css/**/*.map']
	});

	// Group all blog posts together
	eleventyConfig.addCollection('posts', function(collectionAPI) {
		return collectionAPI.getFilteredByGlob('html/blog/*').reverse();
	});

	// Create summaries for blog posts
	eleventyConfig.addPlugin(pluginExtract, {
		wordLimit: 50,
		initialHeadingLevel: 3
	});

	return {
		dir: {
			input: 'html/',
			output: 'staging/'
		},
		passthroughFileCopy: true
  };
};