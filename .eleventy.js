const { DateTime } = require('luxon');
const fs = require('fs/promises');
const fetch = require('node-fetch');
const pluginExtract = require('./extract-plugin.js');
const pluginRSS = require('@11ty/eleventy-plugin-rss');
const pluginTimeToRead = require('eleventy-plugin-time-to-read');
const posthtml = require('posthtml');
const { posthtml: pluginAutomaticNoopener, parser: parserAutomaticNoopener } = require('eleventy-plugin-automatic-noopener');
const { posthtml: pluginCodeStyleHooks, parser: parserCodeStyleHooks, markdownTrimTrailingNewline} = require('eleventy-plugin-code-style-hooks');


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
				'/img': './site/Images',
				'/js': './site/Scripts',
				'/serviceworker.js': './site/Scripts/serviceworker.js'
			}
		}
	});

	// Group all blog posts together
	eleventyConfig.addCollection('posts', function(collectionAPI) {
		return collectionAPI.getFilteredByGlob('./site/Markup/posts/**').reverse();
	});

	// Pre-parse PostHTML plugin options
	const optionsAutomaticNoopener = parserAutomaticNoopener({
		ignore: /^https?:\/\/(?:(?:(?:[^/#?]+\.)?jkc\.codes)|(?:jkc-codes\.github\.io))(?:$|\/|#|\?)[^.]*$/i
	});
	const optionsCodeStyleHooks = parserCodeStyleHooks({
		languageLabels: false,
		markdownTrimTrailingNewline: false,
		styles: '/css/syntax.css',
		prism: function(Prism, loadLanguage) {
			if(!Prism.languages['js-extras']) {
				loadLanguage.silent = true;
				loadLanguage(['js-extras']);
			}
		}
	});

	// Add plugins
	eleventyConfig.addPlugin(pluginExtract, {
		wordLimit: 50,
		initialHeadingLevel: 3
	});
	eleventyConfig.addPlugin(pluginRSS);
	eleventyConfig.addPlugin(pluginTimeToRead);
	eleventyConfig.namespace('seconds_', function() {
		eleventyConfig.addPlugin(pluginTimeToRead, {
			output: function(data) {
				return data.totalSeconds;
			}
		});
	});
	eleventyConfig.addPlugin(markdownTrimTrailingNewline);
	eleventyConfig.addTransform('posthtml', function(HTMLString, outputPath) {
		if(outputPath && outputPath.endsWith('.html')) {
			return posthtml([
				pluginAutomaticNoopener(optionsAutomaticNoopener),
				pluginCodeStyleHooks(optionsCodeStyleHooks),
			])
			.process(HTMLString)
			.then(result => result.html);
		}
		else {
			return HTMLString;
		}
	});

	// Add RSS date filter
	eleventyConfig.addFilter('dateToRfc2822', date => {
		return DateTime.fromJSDate(date).toRFC2822();
	});

	// Keep dates in sync with the server (replace with addGlobalData in 1.0)
	fetch('https://jkc.codes/feed.json')
	.then(response => response.json())
	.then(data => {
		const posts = {};
		data.items.forEach(post => {
			posts[post.url.replace('https://jkc.codes', '')] = {
				published: post.date_published,
				modified: post.date_modified
			};
		})
		return posts;
	})
	.then(posts => {
		fs.writeFile('./site/Markup/_data/postDates.json', JSON.stringify(posts, null, '\t'));
	});

	return {
		dir: {
			input: './site/Markup/',
			output: './site/html/',
			includes: './_templates/_includes',
			layouts: './_templates/_layouts'
		}
	};
};