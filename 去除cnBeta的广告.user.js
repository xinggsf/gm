// ==UserScript==
// @name         去除cnBeta的广告
// @namespace    cnBeta.xinggsf
// @version      2016.5.16
// @description  去除cnBeta.com的广告
// @author       xinggsf
// @match        http://www.cnbeta.com/*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

'use strict';//HTMLElement 
let d = unsafeWindow.document,
js = d.createElement('script');
js.textContent = 'const JB = 0;';
d.head.appendChild(js);
/* //下一种方法仍然有效
let p = unsafeWindow.Node.prototype,
ib = p.insertBefore;
p.insertBefore = function(t) {
	if (t.matches('div[id][style*="position:fixed;top:0;"]')
		&& this.tagName === 'BODY' &&
		t.querySelector('a[href$=".com/articles/3.htm"]'))
	{
		p.insertBefore = ib;
		return;
	}
	ib.apply(this, Array.from(arguments));//Array.prototype.slice.call
}; */
console.log('Del AD');