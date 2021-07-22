---
date: 2021-07-19 14:40:00
draft: true
---
Several static site generators and content management systems have built in functionality to mark posts as drafts. Eleventy (11ty) isn't one of these but fortunately it is possible to implement.

The core concept is to use two [front matter](https://www.11ty.dev/docs/data-frontmatter/) [keys](https://www.11ty.dev/docs/data-configuration/) &mdash; [`permalink`](https://www.11ty.dev/docs/permalinks/) and [`eleventyExcludeFromCollections`](https://www.11ty.dev/docs/collections/#option-exclude-content-from-collections) &mdash; to hide pages from users and then [computed data](https://www.11ty.dev/docs/data-computed/) with environment variables to automatically toggle visibility depending on the environment.


## What Is The `permalink` key?
The `permalink` front matter key controls where a file is built to. More practically, it dictates what the URL will be for the page.

When we don't want to create files for drafts or give them a URL, `permalink` should be set to `false`. To quote the [Eleventy docs](https://www.11ty.dev/docs/permalinks/#permalink-false): <q cite="https://www.11ty.dev/docs/permalinks/#permalink-false">If you set the `permalink` value to be `false`, this will disable writing the file to disk in your output folder. The file will still be processed normally (and present in collections, with its [url and outputPath properties](https://www.11ty.dev/docs/data-eleventy-supplied/) set to `false`) but will not be available in your output directory as a standalone template.</q>

We don't want the file to still be present in collections though, that's where `eleventyExcludeFromCollections` comes in.


## What Is The `eleventyExcludeFromCollections` key?
The `eleventyExcludeFromCollections` front matter key does what it says &mdash; it excludes pages from [collections](https://www.11ty.dev/docs/collections/). Collections are sets of data from related content that can be used to create dynamic pages such as RSS feeds, site maps or blog post lists.

`eleventyExcludeFromCollections` should be set to `true` when we don't want drafts to show in lists created from collections. To quote the [Eleventy docs](https://www.11ty.dev/docs/collections/#option-exclude-content-from-collections): <q cite="https://www.11ty.dev/docs/collections/#option-exclude-content-from-collections">In front matter (or further upstream in the data cascade), set the `eleventyExcludeFromCollections` option to `true` to opt out of specific pieces of content added to all collections (including `collections.all`, collections set using tags, or collections added from the Configuration API in your config file). Useful for your RSS feed, `sitemap.xml`, custom templated `.htaccess` files, et cetera.</q>

Pages can be hidden on demand by combining `permalink` and `eleventyExcludeFromCollections` but what we really want is for them to only be hidden in live production sites so we can continue to test locally. Computed data lets us do that.


## What Is Computed Data?
[Computed data](https://www.11ty.dev/docs/data-computed/) allows us to modify front matter values dynamically based on passed in data from the page, front matter or elsewhere. Front matter is usually static but with computed data we can check whether the `permalink` and `eleventyExcludeFromCollections` keys need to be toggled based on whether we are working locally or building our site for production.


## What Are Environment Variables
Environment variables aren't an Eleventy specific feature so I won't be covering them in any detail but in short they provide a global variable which we can toggle depending on the environment your code is running in.

We will be using the [dotenv NPM package](https://www.npmjs.com/package/dotenv) because it provides a consistent and easy set up across operating systems.


## How To Create Drafts
There are two popular ways to handle drafts which I'll cover:
- Using a draft key in front matter
- Using a draft folder

The code is almost identical so it's really up to you which one works best for your set up.

I'll be focusing on blog posts here but these methods can be used on any type of page as long as there's front matter somewhere in the [data cascade](https://www.11ty.dev/docs/data-cascade/).

### Set Up Your Environment
The following steps assume that you're building your site on a server using a service like Netlify. If you're building your site for production locally and then uploading the output folder you'll want to pass in the environment variable in your dev script and exclude it in your build script. Something like this:
```shell
ELEVENTY_ENV=development eleventy // dev
eleventy // production
```

Otherwise, we need to ensure that environment variables are available.

First, install dotenv using `npm i dotenv` in the command line.

Next, create a `.env` file in your root directory (the same folder as `package.json`) and add the following inside the file:
```text
ELEVENTY_ENV=development
```

This is giving us a global variable "ELEVENTY_ENV" with the value "development" we can import into files later.

Finally, we need to prevent sending the `.env` file to the server so that it doesn't think it's in a development environment. Do this by adding your `.env` file to your `.gitignore` file (create one in your root folder if it doesn't exist):
```text
.env
node_modules
```

Now that environment variables are set up we can start implementing one of our ways to handle drafts.


### Draft Keys In Front Matter
The goal here is to be able to set a draft key to true or false in the front matter of a page's content like so:
```yaml
---
draft: true
// Other front matter
---
// Page content
```

To do so we'll need to add a [directory specific data file](https://www.11ty.dev/docs/data-template-dir/) in the folder that contains the draft pages. This allows us to add the same front matter to all the files within that folder:
<pre>
blog
	|- blog.11tydata.js
	|- first-post.md
	|- second-post.md
	|- third-post.md
</pre>

I've used `blog.11tydata.js` here as it's in the blog folder. If you're using a different folder name replace "blog" in the file name to the folder's name.

Inside of the 11tydata.js file paste the following code:
```js
require('dotenv').config();

const isDevEnvironment = process.env.ELEVENTY_ENV === 'development';

module.exports = () => {
	return {
		eleventyComputed: {
			eleventyExcludeFromCollections: data => {
				const isDraft = 'draft' in data && data.draft !== false;
				return (isDraft && !isDevEnvironment) ? true : data.eleventyExcludeFromCollections;
			},
			permalink: data => {
				const isDraft = 'draft' in data && data.draft !== false;
				return (isDraft && !isDevEnvironment) ? false : data.permalink;
			}
		}
	}
}
```

On line 1 we're importing