// ==UserScript==
// @name           killBDMusicBox_Ad
// @namespace      killBDMusicBox_Ad.xinggsf
// @author	       xinggsf
// @description    删除百度音乐盒广告脚本,禁止插播音频广告
// downloadUrl     https://raw.githubusercontent.com/xinggsf/gm/master/killBDMusicBox_Ad.user.js
// @include        http://play.baidu.com/*
// @version        2016.9.26
// @encoding       utf-8
// @run-at         document-start
// @grant          unsafeWindow
// ==/UserScript==
"use strict";
if (unsafeWindow.top === unsafeWindow.self) {
	let r = /(?:^|\W|_)ad(?:$|\W|_)/,
	delAdScript = function(e) {
		if ('SCRIPT' === e.tagName &&
			e.hasAttribute('data-requiremodule') &&
			r.test(e.getAttribute('data-requiremodule'))
		) e.parentNode.removeChild(e);
	};

	window.onload = function() {
		//mo.disconnect();
		unsafeWindow.showAd = !1;
		unsafeWindow.audioAd.disable();
		//unsafeWindow.audioAd = null;
		window.onload = null;
	};

	let mo = new MutationObserver(function(rs) {
		for (let col of rs)
			for (let e of col.addedNodes)
				delAdScript(e);
	});
	mo.observe(document.head, {childList: true});
}
