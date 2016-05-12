// ==UserScript==
// @name        Remove Google Results Redirect
// @namespace   Smiths
// @description    9 lines of code to remove all link redirection on Google Search Results. Prevents tracking and helps load times!
// @include     /^https?:\/\/www\.google(?:\.\w+)+\/(?:search|webhp)/
// @grant  	unsafeWindow
// @version     2.0
// ==/UserScript==

if (unsafeWindow.top == unsafeWindow.self) {
	document.addEventListener('DOMNodeInserted', function (e) {
		window.setTimeout(function () {
			var rl = document.querySelectorAll('a[onmousedown*="return rwt"]');
			for (var l = 0; l < rl.length; l++)
				rl[l].removeAttribute('onmousedown');
		}, 250);
	}, false);
}