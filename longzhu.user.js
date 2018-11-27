// ==UserScript==
// @name             龙珠直播启用html5
// @namespace        xinggsf_longzhu
// @description      龙珠直播启用html5
// @version          0.03
// @include          *://y.longzhu.com/*
// @include          *://m.longzhu.com/*
// require          https://cdn.jsdelivr.net/hls.js/latest/hls.min.js
// @require          https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js
// @run-at           document-start
// @grant            none
// ==/UserScript==

'use strict';
if (location.host.startsWith('y.')) location.assign(location.href.replace('y', 'm'));

const createPlayer = v => {
	const src = v.src;
	if (src && src.includes('.m3u8')) {
		const p = $(v).parent().empty();
		new Clappr.Player({
			source: src,
			autoPlay: true,
			parent: p[0],
			width: '100%',
			height: '100%',
		});
		return true;
	}
},
fakeUA = ua => Object.defineProperty(navigator, 'userAgent', {
	value: ua,
	writable: false,
	configurable: false,
	enumerable: true
});

fakeUA('Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3');
const vs = document.getElementsByTagName('video'),
t = setInterval(() => {
	if (!vs.length || !createPlayer(vs[0])) return;
	clearInterval(t);
	$('#landscape_dialog').remove();
	$('.player.report-rbi-click').click();
}, 300);