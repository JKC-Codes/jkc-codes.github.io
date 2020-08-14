---
title: Using SASS With Eleventy
---

TL;DR add the following to your eleventy config file and then run Eleventy's serve command and SASS' watch command as normal:
```js
eleventyConfig.setBrowserSyncConfig({
	files: './path-to-your-css-folder/**/*.css'
});
```

Eleventy and SASS are both pre-processors that let you break down code into smaller, more manageable and reusable pieces; Eleventy outputs HTML, and SASS outputs CSS. Eleventy and SASS have no need to interact with each other.

But what if you want HTML or CSS changes to show in your browser automatically? That's where `eleventy --serve` comes in.


## What is `eleventy --serve`?

`eleventy --serve` is a command line instruction that can be broken down into 3 steps: build, watch and serve.

1. ### Build
	The build step will tell Eleventy to take template files like Markdown, Nunjucks or Liquid and create HTML files from them. It is equivalent to running `eleventy` in the command line.

2. ### Watch
	The watch step will run the build step every time a change is made to any of the template files. It is equivalent to running `eleventy --watch` in the command line.

3. ### Serve
	The serve step will create a local server to display your website from and update it automatically whenever files are changed. It is similar to running `browser-sync start [options]` in the command line.

	The command is using `browser-sync` rather than `eleventy` because Eleventy uses Browsersync under the hood to handle its live server. Notably this means that any options are detailed in the <a href="https://www.browsersync.io/docs/options" rel="noopener">Browsersync docs</a> and not the <a href="https://www.11ty.dev/docs/config/#override-browsersync-server-options" rel="noopener">Eleventy docs</a>.

Since Eleventy only deals with HTML and it's actually Browsersync serving your website to the browser, we know that we should rely on Browsersync to be aware of our CSS, not Eleventy.


## Configuring Browsersync

Eleventy already provides a number of <a href="https://github.com/11ty/eleventy/blob/master/src/EleventyServe.js#L63" rel="noopener">default options to Browsersync</a> in order to serve the correct files, including a <a href="https://www.browsersync.io/docs/options#option-watch" rel="noopener">`watch` option</a> that is set to `false` because Eleventy triggers reloads manually after its own internal watch methods are complete. You could take advantage of this by adding your CSS folder as a <a href="https://www.11ty.dev/docs/config/#add-your-own-watch-targets" rel="noopener">watch target</a>. This is nice and explicit and can watch folders outside of the input directory but any CSS updates in your browser will be a byproduct of refreshing the page after Eleventy rebuilds all the HTML on your site &mdash; not ideal.




https://www.browsersync.io/docs/options#option-files

https://www.11ty.dev/docs/config/#override-browsersync-server-options



11ty watches for css file changes automatically