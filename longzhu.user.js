// ==UserScript==
// @name             龙珠直播启用html5
// @namespace        xinggsf_longzhu
// @description      龙珠直播启用html5
// @version          0.02
// @include          *://y.longzhu.com/*
// @include          *://m.longzhu.com/*
// require          https://cdn.jsdelivr.net/hls.js/latest/hls.min.js
// @require          https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js
// @run-at           document-start
// @grant            none
// ==/UserScript==

'use strict';
if (location.host.startsWith('y.'))
	location.assign(location.href.replace('y', 'm'));

const q = css => document.querySelector(css),
doHls = v => {
	if (v.src && v.src.includes('.m3u8') && Hls.isSupported()) {
		const hls = new Hls(),
		p = v.cloneNode();
		v.parentNode.replaceChild(p,v);
		p.style.display = '';
		hls.loadSource(p.src);
		hls.attachMedia(p);
		hls.on(Hls.Events.MANIFEST_PARSED, () => p.play());
		return true;
	}
},
createPlayer = v => {
	if (v.src && v.src.includes('.m3u8')) {
		new Clappr.Player({
			source: v.src,
			autoPlay: true,
			parent: v.parentNode,
			width: v.width || '100%',
			height: v.height || '100%',
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

Object.defineProperty(navigator, 'plugins', {
	get() {
		return { length: 0 };
	}
});
fakeUA('Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3');
let v, t = setInterval(() => {
	v = v || q('video');
	if (!v) return;
	createPlayer(v) && clearInterval(t);
	let e = q('#landscape_dialog');
	e && e.remove();
	e = q('.player.report-rbi-click');
	e && e.click();
}, 300);