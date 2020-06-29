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
const p = HTMLElement.prototype,
ib = p.appendChild;
p.appendChild = function(t) {
	if (
		(this.tagName === 'SCRIPT' || t.tagName === 'SCRIPT')
		&& t.textContent.includes('广告屏蔽插件')
	) {
		p.appendChild = ib;
	} else {
		ib.call(this, t);
	}
};
console.log('Kill anti-AD');