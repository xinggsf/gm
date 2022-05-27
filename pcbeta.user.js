// ==UserScript==
// @name         去pcbeta.com的防广告提示
// @namespace    pcbeta.xinggsf
// @version      1.2
// @description  去pcbeta.com的防广告提示
// @author       xinggsf
// @match        https://*.pcbeta.com/*
// @updateURL    https://gitee.com/xinggsf/gm/raw/master/pcbeta.user.js
// @run-at       document-start
// ==/UserScript==

'use strict';
const p = Node.prototype;
const ib = p.insertBefore;
p.insertBefore = function (...a) {
	if (this.id === 'wp') throw '去广告';
	return ib.apply(this, a);
};