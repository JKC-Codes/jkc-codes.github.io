/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */

import posthtml from 'posthtml';
import pluginExtract from './extract-plugin.js';

export const config = {
	dir: {
		input: './site/Markup/',
		output: './docs/',
		includes: './_templates/_includes',
		layouts: './_templates/_layouts'
	}
};

export default async function(eleventyConfig) {
	const {
		pluginRSS,
		pluginTimeToRead,
		pluginAutomaticNoopener,
		parserAutomaticNoopener,
		pluginCodeStyleHooks,
		parserCodeStyleHooks,
		markdownTrimTrailingNewline,
		pluginManageWhitespace,
		parserManageWhitespace
	} = await getModules([
		['pluginRSS', '@11ty/eleventy-plugin-rss'],
		['pluginTimeToRead', 'eleventy-plugin-time-to-read'],
		['pluginAutomaticNoopener', 'eleventy-plugin-automatic-noopener', 'posthtml'],
		['parserAutomaticNoopener', 'eleventy-plugin-automatic-noopener', 'parser'],
		['pluginCodeStyleHooks', 'eleventy-plugin-code-style-hooks', 'posthtml'],
		['parserCodeStyleHooks', 'eleventy-plugin-code-style-hooks', 'parser'],
		['markdownTrimTrailingNewline', 'eleventy-plugin-code-style-hooks', 'markdownTrimTrailingNewline'],
		['pluginManageWhitespace', 'eleventy-plugin-manage-whitespace', 'posthtml'],
		['parserManageWhitespace', 'eleventy-plugin-manage-whitespace', 'parser'],
	]);

	// Refresh browser when CSS updates
	eleventyConfig.setServerOptions({
		watch: ['./docs/css/**/*.css'],
	});

	// Redirect live server requests so content isn't duplicated
	eleventyConfig.setServerPassthroughCopyBehavior('passthrough');
	eleventyConfig.addPassthroughCopy({'./site/Images/':'/img/'});
	eleventyConfig.addPassthroughCopy({'./site/Scripts/':'/js/'}, {filter: ['*', '!serviceworker.js']});
	eleventyConfig.addPassthroughCopy({'./site/Scripts/serviceworker.js':'/serviceworker.js'});
	eleventyConfig.addPassthroughCopy('./CNAME');

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

	eleventyConfig.addPlugin(pluginTimeToRead, {
		output: function(data) {
			return [data.timing, data.totalSeconds, data.totalWords];
		}
	});

	eleventyConfig.addPlugin(markdownTrimTrailingNewline);

	eleventyConfig.addTransform('posthtml', function(HTMLString) {
		if(this.outputPath && this.outputPath.endsWith('html')) {
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
	eleventyConfig.addGlobalData('layout', () => 'default.html');


	// Add draft feature
	const runMode = process.env.ELEVENTY_RUN_MODE;
	const isDevEnvironment = runMode === 'serve' || runMode === 'watch';

	eleventyConfig.addPreprocessor('drafts', '*', (data, content) => {
		const isDraft = 'draft' in data && data.draft !== false;

		if(isDraft && isDevEnvironment !== true) {
			return false;
		}
	});

	// Keep dates in sync with the server
	eleventyConfig.addGlobalData('postDates', async function() {
		const feed = await fetch('https://jkc.codes/feed.json');
		const feedData = await feed.json();
		const postDates = {};

		for(const post of feedData.items) {
			postDates[new URL(post.url).pathname] = {
				published: new Date(post.date_published),
				modified: new Date(post.date_modified)
			};
		}

		return postDates;
	});
};

async function getModules(modulesArray) {
	const pendingImports = [];
	const modules = {};

	for(const module of modulesArray) {
		const [variable, location, name = 'default'] = module;

		pendingImports.push(import(`${location}`).then(module => modules[variable] = module[name]));
	}

	await Promise.all(pendingImports);

	return modules;
}