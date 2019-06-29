// ==UserScript==
// @name           disableThirdpartyAD
// @namespace      disableThirdpartyAD.xinggsf
// @author	       xinggsf
// @description    禁止站点的第三方资源，也可加入其它自定义站点
// downloadUrl     https://raw.githubusercontent.com/xinggsf/gm/master/disableThirdpartyAD.user.js
// @include        http://m.*
// @include        http://wap.*
// @include        https://m.*
// @include        https://wap.*
// @version        2019.6.22
// @encoding       utf-8
// @run-at         document-start
// ==/UserScript==
"use strict";
if (top == self) {
	const host = location.hostname,
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
	baseHost = /\.\d+$/.test(host) ? host : getBaseDomain(host),
	delAdNode = function (e) {
		switch (e.tagName) {
		case 'SCRIPT':
		case 'IFRAME':
			if (isThirdparty(e.getAttribute('src'))) e.remove();
			break;
		/*
		case  'IMAGE':
		case  'VIDEO':
		case  'OBJECT':
		case  'EMBED': */
		}
	},
	isThirdparty = function (url) {
		if (!url || urlWhiteList.includes(url)) return !1;
		return baseHost !== getBaseDomain(getUrlHost(url));
	};

	new MutationObserver(function (rs) {
		for (let col of rs) if (col.addedNodes)
			for (let e of col.addedNodes) delAdNode(e);
	}).observe(document.documentElement, {
		childList : true,
		subtree : true
	});
}