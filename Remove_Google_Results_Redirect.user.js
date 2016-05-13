// ==UserScript==
// @name        Remove Google Results Redirect
// @namespace   Smiths-xinggsf
// @description    9 lines of code to remove all link redirection on Google Search Results. Prevents tracking and helps load times!
// @include     /^https?:\/\/www\.google(?:\.\w+)+\/(?:search|webhp)/
// @grant  	none
// @version     2016.5.13
// ==/UserScript==

"use strict";
if (window.chrome)
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
new MutationObserver(function() {
	let rl = document.querySelectorAll('a[onmousedown*="return rwt"]');
	for (let a of rl)
		a.removeAttribute('onmousedown');
}).observe(document.body, {
	childList: true, subtree: true
});