// ==UserScript==
// @name           jiaosm_openHtml5
// @namespace      jiaosm_openHtml5
// @author	       xinggsf~gmail。com
// @description    开启叫神马视频HTML5播放
// @homepageURL    https://greasyfork.org/zh-CN/scripts/12072
// updateURL       https://greasyfork.org/scripts/12072.js
// @compatibility  Firefox 33.0+
// @license        GPL version 3
// @include        http://www.jiaosm.net/*
// @include        https://www.tuifeiapi.com/player/viewplay.php?*
// @version        2015.9.1
// @encoding       utf-8
// @grant          none
// ==/UserScript==

-function() {
	var url, f;
	if (self === top) {
		f = document.querySelector('iframe[src$=".mp4.flv"]');
		if (!f) return;
		url = f.src;
		url = url.slice(url.indexOf('http:',30));
	/* 	f.src = url;
		f.outerHTML = f.outerHTML;
		location.assign(f.src.slice(46));
		if (window.chrome) {
			unsafeWindow.location.replace(url);
			f.parentNode.removeChild(f);
			setTimeout(function() {
				GM_openInTab(url);
			}, 0);
		} else */
		setTimeout(scrollBy(0, bfq.offsetTop-55), 9);
	} else {
		f = document.querySelector('param[name=flashvars]');
		url = f.value.match(/http%3A%2F%2F\w+\.tuifeiapi\.[^&]+/)[0];
		url = decodeURIComponent(url);
		f = f.parentNode;
	}
	f.outerHTML = '<video src="' + url + '" controls="controls" autoplay style="width:100%;height:100%">您的浏览器不支持 video 标签。</video>';
}();