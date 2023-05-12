I recently noticed that my site's speed index had shot up dramatically on the [Eleventy leaderboards](https://www.11ty.dev/speedlify/) and managed to track the issue down to my mobile navigation menu. I was deliberately leaving the menu open until JavaScript kicked in to keep it accessible but this had the unfortunate side effect of it always being briefly visible at each page load.

Here's the thought process I went through when fixing it so that it doesn't affect my site's speed index or layout shift but still remains usable even if CSS and/or JavaScript fail.



## The Problem

My website has always been built with progressive enhancement and graceful degradation in mind. The goal of these two concepts is to ensure that your content is always available no matter the device or connection viewers use.

Progressive enhancement uses a "bottom up" approach where you build a minimum viable experience and build enhancements on top of that, progressively adding more and more on top. If any of those enhancements fail you know there's a base experience to fall back to.

Graceful degradation uses a "top down" approach which starts with fully enhanced code and then asks what would happen if each piece failed and implements fall backs to handle those errors. This way, instead of your site outright failing, it gracefully degrades to a less enhanced version instead.

I had chosen to keep my mobile navigation menu open until JavaScript downloaded and executed to ensure it was always available. Otherwise, if the menu was initially closed and JavaScript failed to work then the open menu button would do nothing and users wouldn't be able to navigate my site. Unfortunately, the slower the connection the longer it took to close and this sometimes led to a brief flash of the menu on page load.



## Possible Solutions

Here are the solutions I considered when trying to fix the problem. If you have your own that I didn't think of let me know!


### Do Nothing
It may feel bad to leave a known bug in my code but if a solution causes side effects that outweigh this minor inconvenience then doing nothing is the better option.


### Closed By Default
If the problem was the menu being open when it should be closed, having it closed by default would solve the problem, right? Unfortunately, that would make my site almost impossible to navigate if JavaScript failed to load because the menu would be permanently closed.


### `<noscript>` Element
The [`<noscript>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript) allows you to insert HTML if JavaScript can't function. So I could close the menu by default but open it using `<noscript>` if JavaScript was unavailable. This sounded like the perfect solution until I read the description on MDN more carefully: <q cite="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript">The HTML `<noscript>` element defines a section of HTML to be inserted if a script type on the page is unsupported or if scripting is currently turned off in the browser</q>.

The description only specifies JavaScript being unsupported or turned off; <strong>`<noscript>` doesn't work if JavaScript fails to load due to a connection error</strong>. Being realistic, hardly anyone is going to turn off JavaScript these days but plenty of people are going to have errors from a bad mobile connection.


### Inline The JavaScript
Placing a `<script>` element inline with my HTML would ensure that JavaScript can't fail to load due to a connection error. I could combine it with closing the menu by default and a `<noscript>` element to apply open menu styles if JavaScript is unsupported. However, there are three trade offs with this approach:
1. The JavaScript needs to be duplicated for each page, increasing build complexity.
2. Running the script delays page rendering.
3. The browser can no longer cache the script, increasing load times.

The first issue is quite easily solved by [Eleventy](https://www.11ty.dev/), my static site generator, and the remaining issues are negligible. The JavaScript for my navigation menu is only around 2.5kb and not being able to cache 2.5kb of code is better than seeing an open menu on each page load.


### Checkbox Input
Using an [`<input>` element with a `type="checkbox"` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox) gives us access to the `checked` attribute whenever it's selected. Unlike a `<button>` element, this means that I could determine whether the menu is open without any JavaScript. The code would go something like this:
```html
<nav>
	<label for="nav-menu-checkbox" hidden>Open menu</label>
	<input type="checkbox" id="nav-menu-checkbox" aria-controls="nav-menu-content" hidden>
	<ul id="nav-menu-content">
		<li>Nav item 1</li>
		<li>Nav item 2</li>
		<li>Nav item 3</li>
	</ul>
</nav>
```

```css
label[for="nav-menu-checkbox"],
input[type="checkbox"] {
	display: inline-block;
}

button[aria-expanded="false"] + ul,
input + ul {
	transition-delay: 0ms, 0.25s;
	transform: translateY(-100%);
	visibility: hidden;
}

button[aria-expanded="true"] + ul,
input:checked + ul {
	transition-delay: 0ms;
	transform: translateY(0);
	visibility: visible;
}

button[aria-expanded] + ul,
input + ul {
	transition: 0.25s ease-out;
	transition-property: transform, visibility;
}
```

Here's a brief explanation of the less obvious bits:
- The `<label>` and `<input>` elements have a `hidden` attribute which is overridden by `display: inline-block` in the CSS. This ensures that if the CSS isn't loaded there won't be a redundant checkbox that doesn't work. If you're wondering when this would be applicable, read [Sara Soueidan's article on optimising content for reader modes and reading apps](https://www.sarasoueidan.com/blog/tips-for-reader-modes/).
- There's an `aria-controls` attribute on the `<input>` linked to the nav menu list. This tells assistive technology that supports it that the two are linked so enhanced functionality can be provided.
- The `:checked` pseudo class is combined with an [`adjacent sibling combinator`](https://developer.mozilla.org/en-US/docs/Web/CSS/Adjacent_sibling_combinator) to toggle the menu. You could also use the [`general sibling combinator`](https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator) if elements are farther apart.
- `visibility: hidden` is used instead of `display: none` or `opacity: 0` to keep transitions while still removing the menu from the DOM when closed. `display: none` would hide the menu before the transition could finish and `opacity: 0` would hide the menu after the transition but only visually, causing issues with assistive technology.
- `transition-delay: 0ms, 0.25s` is used when closing the menu to allow the transform to finish before `visibility` is set to `hidden`. `visibility` doesn't fade like `opacity` but it is still an [animatable property](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties).
- There are selectors targeting a `<button>` with an `aria-expanded` attribute because <strong>the `<input>` and `<label>` must be replaced with JavaScript as soon as possible</strong> to avoid accessibility issues. `<input>` doesn't have the same functionality as `<button>` such as being triggered by the enter key or being listed in shortcut menus.

To be clear: <strong>using a checkbox to control a menu should only be used as a temporary measure until JavaScript replaces it with a button</strong>.


### `<details>` And `<summary>` Elements
The [`<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) and [`<summary>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary) elements provide an HTML native menu that can be toggled open and closed without any JavaScript. The ease of creating a navigation menu is why so many sites are now &mdash; <i>checks notes</i> &mdash; <em>not</em> using it?

`<details>` and `<summary>` were first supported in 2011 but didn't receive full adoption from all the major browser engines until 2020 when Edge switched to Chromium. However, [current support for `<details>` and `<summary>`](https://caniuse.com/details) is excellent and it's only Internet Explorer that doesn't and will never recognise them, treating them each as a `<div>` instead.

Another reason why there isn't more widespread use is because the reveal of content within `<details>` isn't animatable &mdash; but there is a way around this. Usually, everything within a closed `<details>` element except `<summary>` is removed from the DOM which doesn't give any time for a closing animation to end before it's removed. This can be avoided by moving the content outside of the `<details>` element:
```html
<nav>
	<details>
		<summary aria-controls="nav-menu-content" hidden>Open menu</summary>
	</details>
	<ul id="nav-menu-content">
		<li>Nav item 1</li>
		<li>Nav item 2</li>
		<li>Nav item 3</li>
	</ul>
</nav>
```

You can then use the checkbox solution from above to toggle the content by watching for an `open` attribute on `<details>`.


### No Collapsible Menu
The rest of these solutions assume that a collapsible navigation menu is unavoidable but it's possible to not have a menu and eliminate the problem altogether. The only reason I have one in the first place is because the existing design wraps the text 2&ndash;3 lines deep. There's no reason I couldn't change the menu style to accommodate all of the links.



## My Decision
After eliminating doing nothing, closing the menu by default and using a `<noscript>` element because there were better alternatives, I was left with 4 options:

1. No collapsible menu would have been the ideal choice but I don't have the design skills to do this quickly and make it look good.
2. Using `<details>` and `<summary>` elements was my next favourite but supporting Internet Explorer meant this wasn't possible.
3. I decided against inline JavaScript simply because I hate making users download data they don't have to.
4. In the end I went with a temporary checkbox input that's replaced by a proper button later.

My [HTML](https://github.com/JKC-Codes/jkc-codes.github.io/blob/76f9b0ba3cec59a5d86b5256e494c9548c284ca0/site/Markup/_templates/_includes/header.html), [CSS/SASS](https://github.com/JKC-Codes/jkc-codes.github.io/blob/76f9b0ba3cec59a5d86b5256e494c9548c284ca0/site/Styles/site/_header.scss) and [JavaScript](https://github.com/JKC-Codes/jkc-codes.github.io/blob/76f9b0ba3cec59a5d86b5256e494c9548c284ca0/site/Scripts/site.js) files are available on [GitHub](https://github.com/JKC-Codes/jkc-codes.github.io/tree/76f9b0ba3cec59a5d86b5256e494c9548c284ca0) if you're interested but remember that I didn't choose the best method on paper because there were other constraints limiting me. The choice came down to the least worse out of downloading extra JavaScript for all users or the menu being less accessible (but still accessible) to specific users until JavaScript loaded.

With this change I managed to knock more than a second off my speed index, from 2.18 seconds to 1.16 and move from 29<sup>th</sup> place to 13<sup>th</sup> on the [Eleventy leaderboards](https://www.11ty.dev/speedlify/#site-7702f769)!