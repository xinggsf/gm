// ==UserScript==
// @name           killBDMusicBox_Ad
// @namespace      killBDMusicBox_Ad.xinggsf
// @author	       xinggsf
// @description    删除百度音乐盒广告脚本,禁止插播音频广告
// @license        GPL version 3
// @include        http://play.baidu.com/*
// @version        2015.9.23
// @encoding       utf-8
// @run-at         document-start
// @grant          unsafeWindow
// ==/UserScript==
/* 三种实现之一，和之三都无须定义@run-at、@grant
-function() {
	var e, k, r = /[\W_]ad[\W_]/;
	function doAdScript(s) {
		e = document.querySelector('script[src$="' + s +'"]');
		console.log('del ', e);
		e && e.parentNode.removeChild(e);
	}
	for (k in _MD5_HASHMAP) {
		r.test(k) && doAdScript(_MD5_HASHMAP[k]);
	}
}(); */
if (unsafeWindow.top !== unsafeWindow.self) return;
var r = /(?:^|\W|_)ad(?:$|\W|_)/;
document.addEventListener('DOMNodeInserted', function (ev) {
	var e = ev.target;
	if ('SCRIPT' === e.tagName &&
		e.hasAttribute('data-requiremodule') &&
		r.test(e.getAttribute('data-requiremodule'))
	) ev.relatedNode.removeChild(e);
}, false);

window.onload = function() {
/* 三种实现之三
	var r = /(?:^|\W|_)ad(?:$|\W|_)/,
	c = document.querySelectorAll('script[data-requiremodule]');//[src^="//mu"]
	Array.prototype.forEach.call(c, function(e) {
		r.test(e.getAttribute('data-requiremodule')) &&
		e.parentNode.removeChild(e);
	}); */
	unsafeWindow.showAd = !1;
	unsafeWindow.audioAd.disable();
	//unsafeWindow.audioAd = null;

	window.onload = null;
}