// ==UserScript==
// @name           disableThirdpartyAD
// @namespace      disableThirdpartyAD.xinggsf
// @author	       xinggsf
// @description    禁止手机站点的第三方资源，当然你也可加入其它站点
// downloadUrl     https://raw.githubusercontent.com/xinggsf/gm/master/disableThirdpartyAD.user.js
// @include        http://m.*
// @include        http://wap.*
// @include        https://m.*
// @include        https://wap.*
// @version        2016.9.26
// @encoding       utf-8
// @run-at         document-start
// ==/UserScript==
"use strict";
if (top == self) {
	let baseHost = '??',
	urlWhiteList = [],
	getUrlHost = function(url) {
		// var a = document.createElement('a');
		// a.href = url;
		// return a.host;
		return (new URL(url)).hostname;
	},
	getBaseDomain = function (host) {//取主域名
		let a = host.split('.'),
		i = a.length -2;
		if (['com','tv','net','org','gov','edu'].includes(a[i])) i--;
		return a[i];
	},
	delAdNode = function (e) {
		switch (e.tagName) {
		case 'SCRIPT':
		case 'IFRAME':
			if (isThirdparty(e.getAttribute('src')))
				e.parentNode.removeChild(e);
			break;
		/* case  'IMAGE':
		case  'VIDEO':

		case  'OBJECT':
		case  'EMBED': */
		}
	},
	isThirdparty = function (url) {
		if (!url || urlWhiteList.includes(url))
			return !1;
		return baseHost !== getBaseDomain(getUrlHost(url));
	};

	baseHost = /\.\d+$/.test(location.hostname) ?
		location.hostname : getBaseDomain(location.hostname);
	let mo = new MutationObserver(function (rs) {
		for (let col of rs) if (col.addedNodes)
			for (let e of col.addedNodes)
				delAdNode(e);
	});
	mo.observe(document, {
		childList : true,
		subtree : true
	});
}