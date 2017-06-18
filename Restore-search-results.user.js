// ==UserScript==
// @name           去除百度、搜狗重定向
// @author         xinggsf
// @updateURL      https://raw.githubusercontent.com/xinggsf/gm/master/Restore-search-results.user.js
// @namespace      Restore-search-results
// @description    去除百度、搜狗重定向
// @version        2017.06.18
// @include        *://www.baidu.com/*
// @include        *://www.sogou.com/*
// @run-at         document-body
// @grant		   GM_xmlhttpRequest
// ==/UserScript==

const bd = location.hostname === 'www.baidu.com',

resetURL = a => GM_xmlhttpRequest({
	url: a.href,
	headers: {
		"Accept": "text/xml"
	},
	method: "GET",
	onload: function(r) {
		if (bd) {
			let e = a.closest('div').querySelector('a.c-showurl');
			if (e) e.href = r.finalUrl;
			a.href = r.finalUrl;
		}
		else if (/URL='([^']+)'/.test(r.responseText)) {
			a.href = RegExp.$1;
		}
	}
}),

mo = new MutationObserver(records => {
	const css = bd ? 'h3.t>a[href*="www.baidu.com/link?url="]'
		: 'a[href^="http://www.sogou.com/link?url="]';
    const list = document.querySelectorAll(css);
    for (let i = list.length-1; i >= 0; i--)
        resetURL(list[i]);
});
mo.observe(document.body, {
	childList: true,
	subtree: true
});