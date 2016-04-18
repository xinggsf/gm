// ==UserScript==
// @name         去除cnBeta的广告
// @namespace    cnBeta.xinggsf
// @version      1.0
// @description  去除cnBeta.com的广告
// @author       xinggsf
// @match        http://www.cnbeta.com/*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

'use strict';//HTMLElement textContent
let ib = unsafeWindow.Node.prototype.insertBefore;
unsafeWindow.Node.prototype.insertBefore = function(t, p) {
	if (t.tagName === 'DIV' && this.tagName === 'BODY' &&
		t.querySelector('a[href$=adblock.htm]')) {
		unsafeWindow.Node.prototype.insertBefore = ib;
		return;
	}
	ib.apply(this, Array.prototype.slice.call(arguments));
};
/* let mo = new MutationObserver(rs => {
	for (let i of unsafeWindow.document.querySelectorAll('body>div'))
		if (i.innerHTML.includes('浏览器广告屏蔽插件的拦截名单')) {
			i.parentNode.removeChild(i);
			mo = null;
			return;
		}
});
mo.observe(document, {childList: true, subtree: true}); */
console.log('Del AD');