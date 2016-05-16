// ==UserScript==
// @name           移除Google的搜索结果重定向，包括其图片搜索
// @namespace      google.com.xinggsf
// @description    Remove all link redirection on Google Search Results,and Google image Search!
// @homepageURL    https://greasyfork.org/scripts/19713
// updateURL       https://greasyfork.org/scripts/19713.js
// @include        /^https?:\/\/www\.google(?:\.\w+)+\/(?:search|webhp|#)/
// @grant          none
// @version        2016.5.15
// ==/UserScript==

"use strict";
if (window.chrome)
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
//let soutu = location.hash.includes('#imgrc='),
new MutationObserver(rs => {
	let a, c = document.querySelectorAll('a[onmousedown*="return rwt"]');
	for (a of c) a.removeAttribute('onmousedown');
	c = document.querySelectorAll('a[jsaction^="mousedown:irc."]');
	for (a of c) {
		a.removeAttribute('jsaction');
		a.outerHTML = a.outerHTML;
	}
}).observe(document.body, {
	childList: true, subtree: true
});