// ==UserScript==
// @name           去除百度、搜狗重定向
// @author         xinggsf
// @updateURL      https://raw.githubusercontent.com/xinggsf/gm/master/Restore-search-results.user.js
// @namespace      Restore-search-results
// @description    去除百度、搜狗重定向
// @version        2017.07.07
// @include        *://www.baidu.com/*
// @include        *://www.so.com/s?*
// @include        *://www.sogou.com/*
// @run-at         document-body
// @grant		   GM_xmlhttpRequest
// ==/UserScript==

const bd = location.hostname === 'www.baidu.com',
so = location.hostname === 'www.so.com',//重定向XHR同sogou.com
/*
resetURL = a => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", 'http://www.sogou.com/link?url=');
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 2) return;
        let reUrl;
        if (reUrl = xhr.getResponseHeader('Location')) {
            console.log(reUrl);
        }
        xhr.abort();
    };
    xhr.send();
};
*/
resetURL = a => {
    if (so && a.hasAttribute('data-url'))
        a.href = a.getAttribute('data-url');
    else GM_xmlhttpRequest({
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
            else if (/URL='([^']+)'/.test(r.responseText)) a.href = RegExp.$1;
        }
    });
},
mo = new MutationObserver(records => {
	const css = bd ? 'h3.t>a[href*="://www.baidu.com/link?url="]'
		: so ? 'h3.res-title>a[href*="://www.so.com/link?"]'
        : 'a[href*="://www.sogou.com/link?url="]';
    const list = document.querySelectorAll(css);
    for (let i=0, l=list.length; i<l; i++)
        resetURL(list[i]);
});
mo.observe(document.body, {childList: true, subtree: true});