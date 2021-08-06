---
date: 2021-08-06 13:39:37
---
Several static site generators and content management systems have built in functionality to mark posts as drafts. Eleventy (11ty) isn't one of these but fortunately it is possible to implement.

The core concept is to use two [front matter](https://www.11ty.dev/docs/data-frontmatter/) [keys](https://www.11ty.dev/docs/data-configuration/) &mdash; [`permalink`](https://www.11ty.dev/docs/permalinks/) and [`eleventyExcludeFromCollections`](https://www.11ty.dev/docs/collections/#option-exclude-content-from-collections) &mdash; to hide pages from users and then [computed data](https://www.11ty.dev/docs/data-computed/) with environment variables to automatically toggle visibility depending on the environment.



## What Functionality Is Needed?


### The `permalink` key
The `permalink` front matter key controls where a file is built to. More practically, it dictates what the URL will be for the page.

When we don't want to create files for drafts or give them a URL, `permalink` should be set to `false`. To quote the [Eleventy permalink docs](https://www.11ty.dev/docs/permalinks/#permalink-false): <q cite="https://www.11ty.dev/docs/permalinks/#permalink-false">If you set the `permalink` value to be `false`, this will disable writing the file to disk in your output folder. The file will still be processed normally (and present in collections, with its [url and outputPath properties](https://www.11ty.dev/docs/data-eleventy-supplied/) set to `false`) but will not be available in your output directory as a standalone template.</q>

We don't want the file to still be present in collections though, that's where `eleventyExcludeFromCollections` comes in.


### The `eleventyExcludeFromCollections` key
The `eleventyExcludeFromCollections` front matter key does what it says &mdash; it excludes pages from [collections](https://www.11ty.dev/docs/collections/). Collections are sets of data from related content that can be used to create dynamic pages such as RSS feeds, site maps or blog post lists.

`eleventyExcludeFromCollections` should be set to `true` to hide drafts from lists created from collections. To quote the [Eleventy collection docs](https://www.11ty.dev/docs/collections/#option-exclude-content-from-collections): <q cite="https://www.11ty.dev/docs/collections/#option-exclude-content-from-collections">In front matter (or further upstream in the data cascade), set the `eleventyExcludeFromCollections` option to `true` to opt out of specific pieces of content added to all collections (including `collections.all`, collections set using tags, or collections added from the Configuration API in your config file). Useful for your RSS feed, `sitemap.xml`, custom templated `.htaccess` files, et cetera.</q>

Pages can be hidden on demand by combining `permalink` and `eleventyExcludeFromCollections` but what we really want is for them to only be hidden in live production sites so we can continue to test locally. Computed data lets us do that.


### Computed Data
[Computed data](https://www.11ty.dev/docs/data-computed/) allows modification of front matter values dynamically based on passed in data from the page, front matter or elsewhere. Front matter is usually static but with computed data we can check whether the `permalink` and `eleventyExcludeFromCollections` keys need to be toggled based on whether we're working locally or building our site for production.


### Environment Variables
Environment variables aren't an Eleventy specific feature so I won't be covering them in any detail but in short they provide a global variable which we can toggle depending on where your code is running.

We will be using the [dotenv NPM package](https://www.npmjs.com/package/dotenv) because it provides a consistent and easy set up across operating systems.



## How To Create Drafts
There are three ways popularised by Jekyll to handle drafts which I'll cover:
- Using draft keys in front matter
- Setting a future date
- Using a draft folder

I'll be focusing on blog posts here but these methods can be used on any type of page as long as there's front matter somewhere in the [data cascade](https://www.11ty.dev/docs/data-cascade/).


### Set Up Your Environment
The following steps assume that you're building your site on a server using a service like Netlify.

First, install dotenv using `npm i dotenv` in the command line.

Next, create a `.env` file in your root directory (the same folder as `package.json`) and add the following inside the file:
```text
ELEVENTY_ENV=development
```

This is gives us a global variable "ELEVENTY_ENV" with the value "development" we can import into files later.

Finally, we need to prevent sending the `.env` file to the server so that it doesn't think it's in a development environment. Do this by adding your `.env` file to your `.gitignore` file (create one in your root folder if it doesn't exist):
```text
.env
node_modules
```

With environment variables set up we can start using them in computed data.


### Using Draft Keys Or A Future Date In Front Matter
The goal here is to either:
- Set a `draft` key to `true` or `false` in the front matter of a page to determine whether it's hidden or not; or
- Set a [`date` key](https://www.11ty.dev/docs/dates/) in the front matter of a page to a future date and only show that page if a build is triggered on or after that date
```yaml
---
date: 2150-12-31
draft: true
// Other front matter
---
// Page content
```

To do so we'll need to add a [directory specific data file](https://www.11ty.dev/docs/data-template-dir/) which allows us to add the same front matter to all files in a folder:
<pre>
blog
	|- blog.11tydata.js
	|- first-post.md
	|- second-post.md
	|- third-post.md
</pre>

I've used `blog.11tydata.js` here as it's in the blog folder. If you're using a different folder name replace "blog" in the file name for the folder's name.

Inside of the 11tydata.js file we'll export our front matter data:
```js
require('dotenv').config();

const isDevEnv = process.env.ELEVENTY_ENV === 'development';
const todaysDate = new Date();

function showDraft(data) {
	const isDraft = 'draft' in data && data.draft !== false;
	const isFutureDate = data.page.date > todaysDate;
	return isDevEnv || (!isDraft && !isFutureDate);
}

module.exports = function() {
	return {
		eleventyComputed: {
			eleventyExcludeFromCollections: function(data) {
				if(showDraft(data)) {
					return data.eleventyExcludeFromCollections;
				}
				else {
					return true;
				}
			},
			permalink: function(data) {
				if(showDraft(data)) {
					return data.permalink
				}
				else {
					return false;
				}
			}
		}
	}
}
```

On <b>line 1</b> we're importing dotenv so we can read the environment variables set in our `.env` file from a `process.env` object.

On <b>line 3</b> we're reading the `ELEVENTY_ENV` environment variable from the `process.env` object and using it to assign a boolean value to an `isDevEnv` variable.

On <b>line 4</b> we're creating a new date object containing today's date.

<b>Lines 6&ndash;10</b> contain the function which will return a boolean determining whether to show the draft page or not.

On <b>line 7</b> we're checking if a `draft` key has been set to `true` in the page's front matter. Note that using <code class="lang-js">const isDraft = data.draft === true;</code> would also work but because of type coercion any typos would assume that the page is not a draft. By explicitly checking for a draft key and that it isn't set to false we can be sure it's meant to be public.

On <b>line 8</b> we're checking the front matter date against today's date from line 4 to see if it's greater than today's date.

On <b>line 9</b> we're using the `isDevEnv` variable from line 3, the `isDraft` result from line 7 and the `isFutureDate` variable from line 8 to return a boolean result confirming whether the page should be shown or not.

<b>Lines 12&ndash;33</b> are exporting our front matter data for Eleventy to use in its data cascade. The `eleventyComputed` key is the only key I'm including here but you can add other front matter keys such as `tags` in the return object if you need to.

<b>Lines 15&ndash;22 and 23&ndash;30</b> are where we're determining the `eleventyExcludeFromCollections` and `permalink` values based on the result of the `showDraft` function being passed [data supplied by Eleventy](https://www.11ty.dev/docs/data-eleventy-supplied/). If the `showDraft` function from line 6 returns true, we're using the existing values but if it returns false we're overriding the existing values to true and false to exclude the page from collections and prevent the page being built respectively.


### Using A Draft Folder
The goal here is to be able to move files in and out of a drafts folder to hide or show them. To do so we'll need to add a [directory specific data file](https://www.11ty.dev/docs/data-template-dir/) to the drafts folder so the same front matter is added to all files in that folder:
<pre>
blog
	|- first-post.md
	|- second-post.md
drafts
	|- drafts.11tydata.js
	|- third-post.md
</pre>

I've used `drafts.11tydata.js` here as it's in the drafts folder. If you're using a different folder name replace "drafts" in the file name for the folder's name.

Inside of the 11tydata.js file we'll export our front matter data:
```js
require('dotenv').config();

const isDevEnv = process.env.ELEVENTY_ENV === 'development';

module.exports = function() {
	return {
		eleventyComputed: {
			eleventyExcludeFromCollections: function(data) {
				if(isDevEnv) {
					return data.eleventyExcludeFromCollections;
				}
				else {
					return true;
				}
			},
			permalink: function(data) {
				if(!isDevEnv) {
					return false;
				}
				else if(data.permalink !== '') {
					return data.permalink;
				}
				else {
					return data.page.filePathStem.replace('/drafts/', '/blog/') + '/';
				}
			}
		}
	}
}
```

On <b>line 1</b> we're importing dotenv so we can read the environment variables set in our `.env` file from a `process.env` object.

On <b>line 3</b> we're reading the `ELEVENTY_ENV` environment variable from the `process.env` object and using it to assign a boolean value to an `isDevEnv` variable.

<b>Lines 5&ndash;29</b> are exporting our front matter data for Eleventy to use in its data cascade. The `eleventyComputed` key is the only key I'm including here but you can add other front matter keys such as `tags` in the return object if you need to.

<b>Lines 8&ndash;15 and 16&ndash;26</b> are where we're determining the `eleventyExcludeFromCollections` and `permalink` values based on `isDevEnv` from line 3.

On <b>lines 9&ndash;14</b> we're returning the existing `eleventyExcludeFromCollections` value if we're in a development environment or true if we're not.

On <b>lines 17&ndash;19</b> we're checking if we're in a development environment and setting the `permalink` key to `false` if we're not.

On <b>lines 20&ndash;22</b> we're checking if a permalink has been explicitly set in the front matter and using it if so.

On <b>lines 23&ndash;25</b> we're modifying the page's default permalink so that the "drafts" part of the path is replaced by "blog". Instead of "/drafts/third-post/" we'll output "/blog/third-post/". Note that [adding the trailing slash on the end is important](https://www.11ty.dev/docs/permalinks/#remapping-output-(permalink)).



## Summary
The `permalink` and `eleventyExcludeFromCollections` front matter keys allow us to create drafts in Eleventy:
```yaml
---
permalink: false
eleventyExcludeFromCollections: true
---
```

By leveraging computed data and environment variables we can replicate Jekyll's draft behaviour:

<pre>Command line
<code class="lang-shell">npm i dotenv</code></pre>

<pre>.env
<code class="lang-text">ELEVENTY_ENV=development</code></pre>

<pre>.gitignore
<code class="lang-text">.env
node_modules</code></pre>

<pre>blog.11tydata.js
<code class="lang-js">require('dotenv').config();

const isDevEnv = process.env.ELEVENTY_ENV === 'development';
const todaysDate = new Date();

function showDraft(data) {
	const isDraft = 'draft' in data && data.draft !== false;
	const isFutureDate = data.page.date > todaysDate;
	return isDevEnv || (!isDraft && !isFutureDate);
}

module.exports = ()=> {
	return {
		eleventyComputed: {
			eleventyExcludeFromCollections: data => showDraft(data) ? data.eleventyExcludeFromCollections : true,
			permalink: data => showDraft(data) ? data.permalink : false,
		}
	}
}</code></pre>

<pre>drafts.11tydata.js
<code class="lang-js">require('dotenv').config();

const isDevEnv = process.env.ELEVENTY_ENV === 'development';

module.exports = ()=> {
	return {
		eleventyComputed: {
			eleventyExcludeFromCollections: data => isDevEnv ? data.eleventyExcludeFromCollections : true,
			permalink: data => {
				if(!isDevEnv) { return false; }
				return data.permalink !== '' ? data.permalink : data.page.filePathStem.replace('/drafts/', '/blog/') + '/';
			}
		}
	}
}</code></pre>

<pre>post.md
<code class="lang-yaml">---
draft: true
---</code></pre>



## Further Reading
- [Permalinks documentation](https://www.11ty.dev/docs/permalinks/)
- [Collections documentation](https://www.11ty.dev/docs/collections/)
- [Computed data documentation](https://www.11ty.dev/docs/data-computed/)
- [Data cascade documentation](https://www.11ty.dev/docs/data-cascade/)
- [Directory specific data files documentation](https://www.11ty.dev/docs/data-template-dir/)