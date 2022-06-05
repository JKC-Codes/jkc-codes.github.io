const { DateTime } = require('luxon');
const pluginExtract = require('./extract-plugin.js');
const pluginRSS = require('@11ty/eleventy-plugin-rss');
const pluginTimeToRead = require('eleventy-plugin-time-to-read');
const posthtml = require('posthtml');
const { posthtml: pluginAutomaticNoopener, parser: parserAutomaticNoopener } = require('eleventy-plugin-automatic-noopener');
const { posthtml: pluginCodeStyleHooks, parser: parserCodeStyleHooks, markdownTrimTrailingNewline} = require('eleventy-plugin-code-style-hooks');
const { posthtml: pluginManageWhitespace, parser: parserManageWhitespace } = require('eleventy-plugin-manage-whitespace');


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
	const optionsManageWhitespace = parserManageWhitespace({
		tabSize: 2
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

	eleventyConfig.addTransform('posthtml', function(HTMLString) {
		if(this?.outputPath.endsWith('.html')) {
			return posthtml([
				pluginAutomaticNoopener(optionsAutomaticNoopener),
				pluginCodeStyleHooks(optionsCodeStyleHooks),
				pluginManageWhitespace(optionsManageWhitespace),
			])
			.process(HTMLString)
			.then(result => result.html);
		}
		else {
			return HTMLString;
		}
	});


	// Group all blog posts together, newest first
	eleventyConfig.addCollection('posts', function(collectionAPI) {
		return collectionAPI
		.getFilteredByGlob('./site/Markup/posts/**')
		.sort((a, b) => b.data.published - a.data.published);
	});

	// Add Atom date filter
	eleventyConfig.addFilter('dateToRFC3339', date => {
		return date.toISOString();
	});

	// Add RSS date filter
	eleventyConfig.addFilter('dateToRFC2822', date => {
		return DateTime.fromJSDate(date).toRFC2822();
	});

	// Add last published filter
	eleventyConfig.addFilter('getLastPublishedDate', collection => {
		return new Date(Math.max(...collection.map(item => {return item.data.published})));
	});

	// Add last modified filter
	eleventyConfig.addFilter('getLastModifiedDate', collection => {
		return new Date(Math.max(...collection.map(item => {return item.data.modified})));
	});

	// Keep dates in sync with the server
	eleventyConfig.addGlobalData('postDates', async function() {
		const {default: fetch} = await import('node-fetch');
		const feed = await fetch('https://jkc.codes/feed.json');
		const feedData = await feed.json();

		postDates = {};

		for(const post of feedData.items) {
			postDates[post.url.replace('https://jkc.codes', '')] = {
				published: new Date(post.date_published),
				modified: new Date(post.date_modified)
			};
		}

		return postDates;
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