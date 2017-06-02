// ==UserScript==
// @name           去除百度、搜狗重定向
// @author         xinggsf
// @namespace      Restore-search-results
// @description    去除百度、搜狗重定向
// @version        2017.06.01
// @include        http://www.baidu.com/*
// @include        https://www.baidu.com/*
// @include        http://www.sogou.com/*
// @include        https://www.sogou.com/*
// @run-at         document-start
// @grant		   GM_xmlhttpRequest
// ==/UserScript==

const bd = location.hostname === 'www.baidu.com';
const fnObserver = mutationRecords => {
	const css = bd ? 'h3.t>a[href*="www.baidu.com/link?url="]'
		: 'a[href^="http://www.sogou.com/link?url="]';
    const list = document.querySelectorAll(css);
	//console.log(css, list);
    for (let i = list.length-1; i >= 0; i--)
        resetURL(list[i]);
};
const mo = new MutationObserver(fnObserver);

document.addEventListener('DOMContentLoaded', e => {
	mo.observe(document.body, {
        childList: true,
        subtree: true
    });
	//fnObserver();
}, !1);

function resetURL(a) {
    GM_xmlhttpRequest({
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
    });
}