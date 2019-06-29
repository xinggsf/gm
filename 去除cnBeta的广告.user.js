// ==UserScript==
// @name         去除cnBeta的广告
// @namespace    cnBeta.xinggsf
// @version      1.1
// @description  去除cnBeta.com的防广告提示
// @author       xinggsf
// @match        *://*.cnbeta.com/*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

'use strict'; //HTMLElement
const d = unsafeWindow.document,
js = d.createElement('script');
js.textContent = 'const JB = 0;';
d.head.appendChild(js);
/* //下一种方法仍然有效
const p = unsafeWindow.Node.prototype,
ib = p.insertBefore;
p.insertBefore = function(t) {
	if (
		this.tagName === 'BODY' &&
		t.matches('div[id][style*="position:fixed;top:0;"]') &&
		t.querySelector('a[href$=".com/articles/3.htm"]'))
	{
		p.insertBefore = ib;
	} else {
		ib.apply(this, arguments);//Array.prototype.slice.call
	}
}; */
console.log('Kill anti-AD');