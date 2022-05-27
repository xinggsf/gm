// ==UserScript==
// @name           去除百度、搜狗、360搜索等的重定向
// @author         xinggsf
// @updateURL      https://gitee.com/xinggsf/gm/raw/master/Restore-search-results.user.js
// @namespace      Restore-search-results
// @description    去除百度、搜狗、360搜索等的重定向
// @version        2021.5.29
// @include        https://www.baidu.com/s?*
// @include        https://www.so.com/s?*
// @include        https://www.sogou.com/web?*
// @connect        *
// @run-at         document-start
// @grant          GM_xmlhttpRequest
// ==/UserScript==

const host = location.host,
r1 = (regp, s) => regp.test(s) && RegExp.$1,
links = new WeakMap(),
css = {
	'www.baidu.com': 'h3.t>a',
	'www.so.com': 'h3.res-title>a',
	'www.sogou.com': 'h3>a[href^="/link?url="]'
},
doXhr = (a, isBaidu) => {
	const xhr = GM_xmlhttpRequest({
		url: a.href,
		headers: { "Accept": "text/html" },
		method: isBaidu ? "HEAD" : "GET",
		onreadystatechange: r => {
			let s;
			if (isBaidu) {
				s = r.finalUrl;
				if (!s || a.href === s) return;
				// xhr.abort();
				const e = a.closest('div').querySelector('a.c-showurl'); //快照
				if (e) e.href = s;
			} else {
				s = r1(/URL='([^']+)/, r.responseText);
				if (!s) return;
			}
			links.set(a, s);
			a.href = s;
		}
	});
},
resetURL = a => {
	if (host != a.host) return;
	if (links.has(a)) {
		a.href = links.get(a);
		return;
	}
	switch (host) {
	case 'www.so.com':
		a.href = a.getAttribute('data-mdurl');
		break;
	case 'www.sogou.com':
		let s = a.closest('div').querySelector('div.fb a');
		if (!s) doXhr(a, !1);
		else a.href = decodeURIComponent(r1(/\burl=([^&]+)/,s.search));
		break;
	case 'www.baidu.com':
		doXhr(a, true);
	}
},
checkDom = () => {
	[].forEach.call(document.querySelectorAll(css[host]), resetURL);
},
mo = new MutationObserver(checkDom);
setTimeout(() => {
	checkDom();
	mo.observe(document.body, { childList: true, subtree: true });
}, 599);