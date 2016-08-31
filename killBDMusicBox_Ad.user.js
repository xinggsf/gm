// ==UserScript==
// @name           killBDMusicBox_Ad
// @namespace      killBDMusicBox_Ad.xinggsf
// @author	       xinggsf~gmail。com
// @description    删除百度音乐盒广告脚本,禁止插播音频广告
// @license        GPL version 3
// @include        http://play.baidu.com/*
// @version        2016.8.31
// @encoding       utf-8
// @run-at         document-start
// @grant          unsafeWindow
// ==/UserScript==

var r = /(?:^|\W|_)ad(?:$|\W|_)/;
/* 三种实现中1、3都无须定义@run-at、@grant
-function() {
	var e, k;
	function delAdScript(s) {
		e = document.querySelector('script[src$="' + s +'"]');
		console.log('del ', e);
		e && e.parentNode.removeChild(e);
	}
	for (k in _MD5_HASHMAP) {
		r.test(k) && delAdScript(_MD5_HASHMAP[k]);
	}
}(); */
if (unsafeWindow.top !== unsafeWindow.self) return;
function delAdScript(ev) {
	var e = ev.target;
	if ('SCRIPT' === e.tagName &&
		e.hasAttribute('data-requiremodule') &&
		r.test(e.getAttribute('data-requiremodule'))
	) ev.relatedNode.removeChild(e);
}
document.addEventListener('DOMNodeInserted', delAdScript, !1);

window.onload = function() {
/* 三种实现之三
	var c = document.querySelectorAll('script[data-requiremodule]');//[src^="//mu"]
	Array.prototype.forEach.call(c, function(e) {
		r.test(e.getAttribute('data-requiremodule')) &&
		e.parentNode.removeChild(e);
	}); */
    document.removeEventListener('DOMNodeInserted', delAdScript);
	unsafeWindow.showAd = !1;
	unsafeWindow.audioAd.disable();
	//unsafeWindow.audioAd = null;

	window.onload = null;
}
