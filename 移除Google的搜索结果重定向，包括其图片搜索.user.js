// ==UserScript==
// @name        移除Google的搜索结果重定向，包括其图片搜索
// @namespace   google.com.xinggsf
// @description-en Remove all link redirection on Google Search Results,and Google image Search!
// @include     /^https?:\/\/www\.google(?:\.\w+)+\/(?:search|webhp|#)/
// @grant       none
// @version     2016.5.15
// ==/UserScript==

// if (rwt) unsafeWindow.rwt = null;
"use strict";
if (window.chrome)
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
//是否为图片搜索
let soutu = location.search.includes('site=imghp'),
css = soutu ? 'a[jsaction^="mousedown:irc."]' :
	'a[onmousedown*="return rwt"]',
fn = rs => {
	let rl = document.querySelectorAll(css);
	for (let a of rl)
		a.removeAttribute('onmousedown');
},
fnSoutu = rs => {
	let s, a = document.querySelector(css);
	a.removeAttribute('jsaction');
	// a.removeAttribute('class');
	// s = 'data-ved';
	// if (!a.hasAttribute(s)) s = 'ved';
	// a.removeAttribute(s);
	// a.firstChild.removeAttribute('class');
	a.outerHTML = a.outerHTML;
};
new MutationObserver(soutu ? fnSoutu : fn).observe(document.body, {
	childList: true, subtree: true
});