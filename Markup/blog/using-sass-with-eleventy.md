---
title: Using SASS With Eleventy
reviewed: TODO
---

TL;DR add the following to your eleventy config file:

```js
eleventyConfig.setBrowserSyncConfig({
	files: ['./staging/css/**/*.css']
});
```

Eleventy and SASS are both pre-processors that let you break down code into smaller, more manageable and reusable pieces. Eleventy outputs HTML and SASS outputs CSS so the two will usually never meet. However, if you want live updates while building then you're probably using eleventy --serve to fire up a live server which combines HTML, CSS and JavaScript.