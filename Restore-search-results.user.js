// ==UserScript==
// @name           去除百度、搜狗、好搜重定向
// @author         xinggsf
// @updateURL      https://raw.githubusercontent.com/xinggsf/gm/master/Restore-search-results.user.js
// @namespace      Restore-search-results
// @description    去除百度、搜狗、好搜重定向
// @version        2017.10.31
// @include        *://www.baidu.com/*
// @include        *://www.so.com/s?*
// @include        *://www.sogou.com/*
// @run-at         document-start
// @connect        *
// @grant		   GM_xmlhttpRequest
// ==/UserScript==

const css = {
	'www.baidu.com': 'h3.t>a[href*="//www.baidu.com/link?url="]',
	'www.so.com': 'h3.res-title>a[href*="//www.so.com/link?"]',
    'www.sogou.com': 'a[href*="//www.sogou.com/link?url="]'
},
doXhr = (a, isBaidu) => {
	const xhr = GM_xmlhttpRequest({
		url: a.href,
		headers: {
			"Accept": "text/html"
		},
		method: isBaidu ? "HEAD" : "GET",
		onreadystatechange: r => {
			let s;
			if (isBaidu) {
				s = r.finalUrl;
				if (!s || a.href === s) return;
				//console.log(s);
				const e = a.closest('div').querySelector('a.c-showurl');
				if (e) e.href = s;
			} else {
				s = r.responseText;
				if (s.length<11 || !/URL='([^']+)'/.test(s)) return;
				s = RegExp.$1;
			}
			a.href = s;
			xhr.abort();
		}
	});
},
resetURL = a => {
	switch (location.hostname) {
	case 'www.so.com':
		a.href = a.getAttribute('data-url');
		break;
    case 'www.sogou.com':
        let s = a.closest('div').querySelector('div.fb>a');
		if (s) {
			s = s.href.match(/\burl=([^&]+)/)[1];
			a.href = decodeURIComponent(s);
		} else
			doXhr(a, !1);
		break;
    case 'www.baidu.com':
		doXhr(a, true);
	}
},
checkDom = () => {
    const list = document.querySelectorAll(css[location.hostname]);
    Array.prototype.forEach.call(list, resetURL);
},
mo = new MutationObserver(checkDom);
setTimeout(() => {
	checkDom();
	mo.observe(document.documentElement, {
		childList: true, subtree: true
	});
}, 99);