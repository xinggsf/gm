// ==UserScript==
// @name         去除cnBeta的广告
// @namespace    cnBeta.xinggsf
// @version      1.2
// @description  去除cnBeta.com的防广告提示
// @author       xinggsf
// @match        https://*.cnbeta.com/*
// @run-at       document-start
// ==/UserScript==

'use strict';
const p = HTMLElement.prototype;
const ib = p.insertBefore;
p.insertBefore = function(...a) {
	if (
		(this.tagName === 'BODY' || a[0].tagName === 'DIV')
		&& a[0].textContent.includes('广告屏蔽插件')
	) {
		p.insertBefore = ib;
	} else {
		return ib.apply(this, a);
	}
};
console.log('Kill anti-AD');