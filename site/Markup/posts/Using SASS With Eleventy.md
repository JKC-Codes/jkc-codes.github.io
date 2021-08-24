[Eleventy (11ty)](https://www.11ty.dev/) is a super customisable static site generator that at its core transforms template language into HTML. However, template languages like Liquid and Nunjucks are designed to output HTML rather than CSS so how does Eleventy handle styling?

Let me show you how I compile SASS automatically and display the output on a local server without triggering a build from Eleventy or refreshing the browser.

 If you haven't already, you'll need to install [Node](https://nodejs.org/), create a package.json file by typing `npm init` in the command line and then run `npm i @11ty/eleventy`.


## Transform SCSS Files

I use the terminal and [SASS' CLI commands](https://sass-lang.com/documentation/cli/dart-sass) to compile CSS but you can use any build system and skip this section if you want. The only Eleventy specific thing is placing the CSS in Eleventy's output folder &mdash; by default this is "_site".

First, install the [SASS package](https://www.npmjs.com/package/sass): `npm i sass`.

Then, tell SASS where the SCSS files are and where to output the CSS. I do this through NPM so I don't need to type out the command every time.

Assuming your file structure looks like this:

<pre>
_site
	|- index.html
	|- css
		|- styles.css
sass
	|- styles.scss
index.html
</pre>

You would use the following in `package.json`:
```json
"scripts": {
	"watch:sass": "npx sass sass:_site/css --watch"
},
```

This allows you to enter `npm run watch:sass` in the command line to take any .scss files in the "sass" directory and put them in the "_site/css" directory as .css files any time a change is made.

You can rename the script from "watch:sass" to anything you like. Similarly, you can customise the input and output paths; the sass input goes before the : and the css output goes after it. There are also a number of flags you can customise other than the `--watch` flag, full details are in the [SASS documentation](https://sass-lang.com/documentation/cli/dart-sass).


## Refresh The Browser

In order to show the newly converted CSS live in the browser I use Eleventy's `--serve` command.


### What Is `eleventy --serve`?

`eleventy --serve` is a command line instruction that can be broken down into 3 steps: build, watch and serve.


#### Build
The build step will tell Eleventy to take template files like Markdown, Nunjucks or Liquid and create HTML files from them. It is equivalent to running `eleventy` in the command line.

#### Watch
The watch step will run the above build step every time a change is made to any of the template files. It is equivalent to running `eleventy --watch` in the command line.

#### Serve
The serve step will start a local server to display your website and update it automatically whenever files are changed through the above watch step. It is similar to running `eleventy --watch & browser-sync start` in the command line.

Eleventy uses Browsersync under the hood to handle its live server. Notably this means that any options are detailed in the [Browsersync docs](https://browsersync.io/docs/) and not the [Eleventy docs](https://www.11ty.dev/docs/).


### Configuring BrowserSync

BrowserSync is automatically run when using `eleventy --serve` and its options are set via [EleventyConfig's `setBrowserSyncConfig` method](https://www.11ty.dev/docs/watch-serve/#override-browsersync-server-options).

In my [Eleventy config file](https://www.11ty.dev/docs/config/) (.eleventy.js by default) I add this:

```js
module.exports = function(eleventyConfig) {
	eleventyConfig.setBrowserSyncConfig({
		files: './_site/css/**/*.css'
	});
};
```

I'm using BrowserSync's [files option](https://browsersync.io/docs/options#option-files) to watch any file in the `_site/css/` folder with a `.css` extension and add that CSS to the page whenever those files update. It doesn't use Eleventy's build command and therefore doesn't trigger a rebuild of the HTML.


### What about addPassthroughCopy?

You may have seen other sites build their CSS files in the same folder as their SASS and then use Eleventy config's [addPassthroughCopy](https://www.11ty.dev/docs/copy/) method to copy the CSS to Eleventy's output folder. The file structure looks something like this:
<pre>
_site
	|- index.html
	|- css
	|- styles.css
sass
	|- styles.scss
css
	|- styles.css
index.html
</pre>

This works, but there are two reasons why I don't like it.
1. The CSS folder is duplicated which makes unnecessary writes to my hard drive and uses additional space.
1. It increases build times because the SCSS file and the CSS file both trigger an Eleventy build. In the terminal you see a message like this: <samp>You saved while Eleventy was running, let’s run again. (1 remain)</samp>.


### What about addWatchTarget?

Eleventy config's [addWatchTarget](https://www.11ty.dev/docs/watch-serve/) method allows you to specify a file or folder which will trigger an Eleventy build whenever it's updated.

In theory this means that we could watch our SASS folder but in practice it creates a race condition which hopes that SASS will create a CSS file faster than Eleventy can start its build. You could watch the CSS folder instead but this creates the same problems as addPassthroughCopy.


## Wrapping up

With the configuration set up, the last step is to run Eleventy and SASS together. I use VS Code's Tasks to do this but you can update your `package.json` with this instead:
```json
"scripts": {
	"watch:eleventy": "npx @11ty/eleventy --serve",
	"watch:sass": "npx sass sass:_site/css --watch",
	"start": "npm run watch:eleventy & npm run watch:sass"
},
```

And then run `npm start` in your terminal whenever you open your project.

If you're using Windows and/or Powershell, the start script's `&` syntax won't work so I recommend using [npm-run-all](https://www.npmjs.com/package/npm-run-all) or [concurrently](https://www.npmjs.com/package/concurrently) to run the two scripts at the same time instead.


### Advantages

1. Zero build time when CSS is updated
1. No duplicated CSS files
1. No additional dependencies


### Disadvantages

1. Doesn't work with inline styles
1. Some configuration is outside of Eleventy


### TL;DR
<pre>
package.json
<code class="lang-json">"scripts": {
	"watch:eleventy": "npx @11ty/eleventy --serve",
	"watch:sass": "npx sass sass:_site/css --watch",
	"start": "npm run watch:eleventy & npm run watch:sass"
},</code>
</pre>

<pre>
.eleventy.js
<code class="lang-js">module.exports = function(eleventyConfig) {
	eleventyConfig.setBrowserSyncConfig({
		files: './_site/css/**/*.css'
	});
};</code>
</pre>

<pre>
command line
<code class="lang-shell">npm start</code>
</pre>


### Further Reading

- [11ty setBrowserSyncConfig documentation](https://www.11ty.dev/docs/watch-serve/)
- [BrowserSync files option documentation](https://browsersync.io/docs/options#option-files)
- [SASS CLI documentation](https://sass-lang.com/documentation/cli/dart-sass)
- [How to inline minified CSS](https://www.11ty.dev/docs/quicktips/inline-css/)