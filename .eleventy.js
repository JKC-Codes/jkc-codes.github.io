require('dotenv').config();
const pluginExtract = require('./extract-plugin.js');
const pluginRSS = require('@11ty/eleventy-plugin-rss');
const pluginTimeToRead = require('eleventy-plugin-time-to-read');
const posthtml = require('posthtml');
const { posthtml: pluginAutomaticNoopener, parser: parserAutomaticNoopener } = require('eleventy-plugin-automatic-noopener');
const { posthtml: pluginCodeStyleHooks, parser: parserCodeStyleHooks, markdownTrimTrailingNewline} = require('eleventy-plugin-code-style-hooks');
const { posthtml: pluginManageWhitespace, parser: parserManageWhitespace } = require('eleventy-plugin-manage-whitespace');


module.exports = function(eleventyConfig) {
	// Redirect requests so files aren't duplicated
	eleventyConfig.addPassthroughCopy({'./site/css/': './css/'});
	eleventyConfig.addPassthroughCopy({'./site/Images/': './img/'});
	eleventyConfig.addPassthroughCopy({'./site/Scripts/': './js/'}, {filter: ['*', '!serviceworker.js']});
	eleventyConfig.addPassthroughCopy({'./site/Scripts/serviceworker.js': '/serviceworker.js'});
	eleventyConfig.addPassthroughCopy('./CNAME');

	// Fix passthrough files being ignored by --serve
	eleventyConfig.setUseGitIgnore(false);


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
		if(typeof this.outputPath == 'string' && this.outputPath.endsWith('.html')) {
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
	eleventyConfig.addFilter('dateToRFC3339', date => date.toISOString());

	// Add RSS date filter
	eleventyConfig.addFilter('dateToRFC2822', date => date.toUTCString());

	// Add last published filter
	eleventyConfig.addFilter('getLastPublishedDate', collection => new Date(Math.max(...collection.map(item => item.data.published))));

	// Add last modified filter
	eleventyConfig.addFilter('getLastModifiedDate', collection => new Date(Math.max(...collection.map(item => item.data.modified))));

	// Add default layout to all pages
	eleventyConfig.addGlobalData('layout', () => 'default');

	// Make environment available on all pages
	eleventyConfig.addGlobalData('isDevEnvironment', () => process.env.ELEVENTY_ENV === 'development');

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