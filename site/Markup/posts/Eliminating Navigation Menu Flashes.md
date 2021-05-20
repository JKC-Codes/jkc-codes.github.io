When first building this website I deliberately left my mobile navigation menu open until JavaScript kicked in but this had the unfortunate side effect of the menu always being briefly visible at each page load before being hidden.

I finally got around to fixing this recently and I want to document my thought process behind the solution here in case anyone finds themselves in the same position. Note that I'll mainly focus on the decisions I made and the reasons behind them rather than the code used to implement them. The [HTML](https://github.com/JKC-Codes/jkc-codes.github.io/blob/76f9b0ba3cec59a5d86b5256e494c9548c284ca0/site/Markup/_templates/_includes/header.html), [CSS/SASS](https://github.com/JKC-Codes/jkc-codes.github.io/blob/76f9b0ba3cec59a5d86b5256e494c9548c284ca0/site/Styles/site/_header.scss) and [JavaScript](https://github.com/JKC-Codes/jkc-codes.github.io/blob/76f9b0ba3cec59a5d86b5256e494c9548c284ca0/site/Scripts/site.js) are available at [GitHub](https://github.com/JKC-Codes/jkc-codes.github.io/tree/76f9b0ba3cec59a5d86b5256e494c9548c284ca0) if that's what you're after.


## The Problem

This website has always been built with progressive enhancement and graceful degradation in mind. The goal of these two concepts is to ensure that your content is always available no matter the device or connection your viewers use.

Progressive enhancement uses a "bottom up" approach where you build a minimum viable experience and build enhancements on top of that, progressively adding more and more on top. If any of those enhancements fail you know there's a base experience to fall back to.

Graceful degradation uses a "top down" approach which starts with fully enhanced code and then asks what would happen if each piece failed and implements fallbacks to handle those errors. This way, instead of your site outright failing, it gracefully degrades to a less enhanced version instead.

The desire to always have the navigation menu accessible to users is the reason for my menu flash problem. I chose to keep the menu open until the JavaScript file is downloaded and instructed to close the menu, otherwise if the menu is initially closed and JavaScript fails to work the open menu button would do nothing and users would be unable to navigate my site. Any solutions would need to handle this case as well as others.


## Requirements

<ul>
	<li><strong>Useable without JavaScript</strong> &mdash; As already stated, this website has always been built with progressive enhancement and graceful degradation in mind. My entire site must be useable if the CSS and/or JavaScript fail.</li>
	<li><strong>Narrow pages aren't dominated by the navigation</strong> &mdash; The reason for using a collapsing menu in the first place is because I felt that my navigation links took up too much space at the smallest screen I support (320px by 480px). The navigation should always feel secondary to any other content.</li>
	<li><strong>Navigation items are fully visible on wide screens</strong> &mdash; Since I'm only using a collapsing menu because of smaller screens, I should ditch it on larger screens which can comfortably accomodate all the navigation links.</li>
	<li><strong>Accessible to assistive technology at all times</strong> &mdash; I aim to meet WAI-ARIA AAA standards unless I have a very good reason not to. Not supporting assistive technologies would be a huge step backward.</li>
</ul>


## Solutions

Here are the solutions I considered. If you have your own solution that I didn't think of [let me know on Twitter](https://twitter.com/intent/tweet?screen_name=jkc_codes).

### Do Nothing
It may feel bad to leave a known bug in my code but I have a website that gets perfect scores on lighthouse metrics including a cumulative layout shift score of 0 and the problem is only noticeable on super slow connections. If a solution would cause side effects that outweigh this minor inconvenience then doing nothing would be the better option.

### Closed By Default
If the problem was the menu being open when it should be closed, having it closed by default would solve the problem, right? Unfortunately, the menu would be permanently closed if JavaScript failed to load and therefore navigating my site would be almost impossible.

### `<noscript>` Element
The [`<noscript>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript) allows you to insert HTML if JavaScript can't function. So I could close the menu by default but open it using `<noscript>` if JavaScript was unavailable. This sounded like the perfect solution&hellip; until I read the description on MDN more carefully: <q cite="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript">The HTML `<noscript>` element defines a section of HTML to be inserted if a script type on the page is unsupported or if scripting is currently turned off in the browser</q>.

The description only specifies JavaScript being unsupported or turned off. **`<noscript>` doesn't work if JavaScript fails to load due to a connection error**. Being realistic, barely anyone is going to turn off JavaScript these days ([excluding Heydon Pickering](https://heydonworks.com/)) but plenty of people are going to have errors from a bad mobile connection.

### Inline The JavaScript
Placing a `script` element inline with my HTML would ensure that JavaScript can't fail to load due to a connection error. Combined with a `noscript` element and closing the menu by default it would meet all four of my requirements. The only problem with this approach is that the JavaScript file can no longer be cached by the browser.

As someone who was on a pay as you go mobile plan for most of my life (and probably should still be on one) I have an unhealthy aversion to unnecessary downloads.

### Checkbox Input
Using an [`input` element with a `type="checkbox"` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox) gives us access to the `checked` attribute whenever it's selected. Unlike a `button` element this means that we can determine whether the menu is open without any JavaScript. The code would go something like this:
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

The interesting parts of this code are:
- The `label` and `input` elements have a `hidden` attribute which is overriden by `display: inline-block` in the CSS. This ensures that if the CSS isn't loaded there won't be a redundant checkbox that doesn't work. If you're wondering when this would be applicable, read [Sara Soueidan's article on optimising content for reader modes and reading apps](https://www.sarasoueidan.com/blog/tips-for-reader-modes/).
- There is an `aria-controls` attribute on the input linked to the nav menu list. This tells assistive technology that supports it that the two are linked so enhanced functionality can be provided.
- The `:checked` pseudo class is combined with an [`adjacent sibling combinator`](https://developer.mozilla.org/en-US/docs/Web/CSS/Adjacent_sibling_combinator) to toggle the menu. You could also use the [`general sibling combinator`](https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator) if elements are farther apart.
- `visibility: hidden` is used instead of `display: none` or `opacity: 0` to keep transitions while still removing the menu from the DOM when closed. `display: none` would hide the menu before the transition could finish and `opacity: 0` would hide the menu after the transition but only visually, causing issues with assistive technology.
- `transition-delay: 0ms, 0.25s` is used when closing the menu to allow the transform to finish before `visibility` is set to `hidden`. `visibility` doesn't fade like `opacity` but it is still an [animatable property](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties) unlike `display`.
- There are selectors targeting a `button` with an `aria-expanded` attribute because <strong>the `input` and `label` must be replaced with JavaScript as soon as possible</strong> to avoid accessibility issues. `input` doesn't have the same functionality as `button` such as being triggered by the enter key or being listed in shortcut menus.

That last point needs repeating. <strong>Using a checkbox to control a menu should only be used as a temporary measure until JavaScript replaces it with a button</strong>.

### `<details>` And `<summary>` Elements
The [`<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) and [`<summary>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary) elements provide an HTML native menu that can be toggled open and closed without any JavaScript. The ease of creating a navigation menu is why so many sites are now &mdash; <i>checks notes</i> &mdash; <em>not</em> using it?

Poor historic support has led to low usage numbers. `<details>` and `<summary>` were first supported in 2011 but didn't receive full adoption from all the major browser engines until 2020 when Edge switched to Chromium. However, [current support for `<details>` and `<summary>`](https://caniuse.com/details) is excellent and it is only Internet Explorer that doesn't and will never recognise them, treating them as `div`s instead.

Two other reasons why there isn't more widespread use is because the reveal of `details`' contents is not animatable and it can't be toggled using CSS &mdash; but there is a way around both of these. Usually, everything within a closed `details` element except `summary` is removed from the DOM and therefore doesn't give any time for a closing animation to end before it is removed. You can get around this by moving the content outside of the `details` element:
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

You can then use the checkbox solution from above to toggle the content by watching for an `open` attribute on the details element.

### No Collapsible Menu
