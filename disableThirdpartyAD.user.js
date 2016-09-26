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
// @grant          unsafeWindow
// ==/UserScript==
"use strict";
if (unsafeWindow.top === unsafeWindow.self) {
	let baseHost = '??',
	urlWhiteList = [],
	regIp = /(?:\d{1,3}\.){3}\d{1,3}/,
	r = /:\/\/([^:\/]+)/,
	getBaseHost = function (url) {//取主域名
		let m = url.match(r);
		if (!m || m[1].includes(baseHost))
			return baseHost;
		m = m[1];
		let a = m.split('.');
		if (a.length === 2)
			return m;
		let i, s, ret = a.pop();
		for (i = 0; i < 2; i++) {
			s = a.pop();
			ret = s + '.' + ret;
			//广告主域名一般超过3字符
			if (!/[a-z]{2,3}/i.test(s))
				return ret;
		}
		return ret;
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
		return baseHost !== getBaseHost(url);
	};

	baseHost = regIp.test(location.hostname) ?
		location.hostname : getBaseHost(location.hostname);
	let mo = new MutationObserver(function (rs) {
		for (let col of rs)
			for (let e of col.addedNodes)
				delAdNode(e);
	});
	mo.observe(document, {
		childList : true,
		subtree : true
	});
}
