// ==UserScript==
// @name           移除Google的搜索结果重定向，包括其图片搜索
// @namespace      google.com.xinggsf
// @description    Remove all link redirection on Google Search Results,and Google image Search!
// @homepageURL    https://greasyfork.org/scripts/19713
// @updateURL      https://greasyfork.org/scripts/19713.js
// @include        https://www.google.*
// @include        https://prism-kangaroo.glitch.me/search?*
// @grant          none
// @version        2019.11.11
// ==/UserScript==

main.addEventListener('mousedown', ev => {//图片搜索
	if (ev.target.closest('a[jsaction^="mousedown:irc."] > img')) ev.stopPropagation();
});
Object.defineProperty(window, 'rwt', { writable: false });