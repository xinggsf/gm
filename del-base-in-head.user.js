// ==UserScript==
// @name           去除网页head之base
// @author         xinggsf
// @updateURL      https://raw.githubusercontent.com/xinggsf/gm/master/del-base-in-head.user.js
// @namespace      del-base-in-head
// @description    去除网页head之base
// @version        0.01
// @include        https://www.xiamov.com/*
// @include        https://m.xiamov.com/*
// @run-at         document-body
// ==/UserScript==

for (const e of document.head.children)
	if (e.matches('base[target="_blank"]')) {
		e.remove();
		break;
	}