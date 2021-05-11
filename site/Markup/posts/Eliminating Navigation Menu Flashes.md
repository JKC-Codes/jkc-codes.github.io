When first building this website I deliberately left my mobile navigation menu open until JavaScript kicked in but this had the unfortunate side effect of the menu always being briefly visible at each page load before being hidden.

I finally got around to fixing this recently and I want to document my thought process behind the solution here in case anyone finds themselves in the same position. Note that I'll mainly focus on the decisions I made and the reasons behind them rather than the code used to implement them. The [HTML](https://github.com/JKC-Codes/jkc-codes.github.io/blob/76f9b0ba3cec59a5d86b5256e494c9548c284ca0/site/Markup/_templates/_includes/header.html), [CSS/SASS](https://github.com/JKC-Codes/jkc-codes.github.io/blob/76f9b0ba3cec59a5d86b5256e494c9548c284ca0/site/Styles/site/_header.scss) and [JavaScript](https://github.com/JKC-Codes/jkc-codes.github.io/blob/76f9b0ba3cec59a5d86b5256e494c9548c284ca0/site/Scripts/site.js) are available at [GitHub](https://github.com/JKC-Codes/jkc-codes.github.io/tree/76f9b0ba3cec59a5d86b5256e494c9548c284ca0) if that's what you're after.


## The Problem

This website has always been built with progressive enhancement and graceful degradation in mind. The goal of these two concepts is to ensure that your content is always available no matter the device or connection your viewers use.

Progressive enhancement uses a "bottom up" approach where you build a minimum viable experience and build enhancements on top of that, progressively adding more and more on top. If any of those enhancements fail you know there's a base experience to fall back to.

Graceful degradation uses a "top down" approach which starts with fully enhanced code and then asks what would happen if each piece failed and implements fallbacks to handle those errors. This way, instead of your site outright failing, it gracefully degrades to a less enhanced version instead.

The desire to always have the navigation menu accessible to users is the reason for my menu flash problem. I chose to keep the menu open until the JavaScript file is downloaded and instructed to close the menu, otherwise if the menu is initially closed and JavaScript fails to work the open menu button would do nothing and users would be unable to navigate my site. Any solutions would need to handle this case as well as others.


## Requirements

<ul>
	<li><strong>Useable without JavaScript</strong> &mdash; As already stated, this website has always been built with progressive enhancement and graceful degradation in mind. My entire site is useable if the CSS and/or JavaScript fail.</li>
	<li><strong>Narrow pages aren't dominated by the navigation</strong> &mdash; The reason for using a collapsing menu in the first place is because I felt that my navigation links took up too much space at the smallest screen I support (320px by 480px). The navigation should always feel secondary to any other content.</li>
	<li><strong>Navigation items are fully visible on wide screens</strong> &mdash; Since I'm only using a collapsing menu because of smaller screens, I should ditch it on larger screens which can comfortably accomodate all the navigation links.</li>
	<li><strong>Accessible to assistive technology at all times</strong> &mdash; I aim to meet WAI-ARIA AAA standards. Not supporting assistive technologies would be a huge step backward.</li>
</ul>


## Solutions

Here are the solutions I considered. If you have your own solution that I didn't think of [let me know on Twitter](https://twitter.com/intent/tweet?screen_name=jkc_codes).

### Do Nothing
### Closed By Default
### <code>noscript</code> Element
### <code>details</code> And <code>summary</code> Elements
### Checkbox Input
### No Collapsible Menu








<!--
TL;DR
Advantages/Disadvantages
Back in March I submitted my website to the [Speedlify leaderboards](https://www.11ty.dev/speedlify/) and managed to get into the top 8; however, in the next run I dropped 21 places to 29<sup>th</sup>.
-->