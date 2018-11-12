// ==UserScript==
// @name             PPTV html5
// @namespace        xinggsf.pptv
// @description      PPTV开启html5
// @version          0.01
// @include          http://v.pptv.com/show/*
// @include          https://v.pptv.com/show/*
// @require          https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js
// @run-at           document-start
// @grant            none
// ==/UserScript==

'use strict';

const q = css => document.querySelector(css),
sleep = ms => new Promise(resolve => {
	setTimeout(resolve, ms);
}),
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
}),
onReady = async () => {
	let v, e;
	do {
		v = q('video');
		await sleep(300);
	} while (!v);
	e = q('.p-video-button');
	console.log(e, v);
	e && e.click();
	await sleep(500);
	createPlayer(v);
};

fakeUA('Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.4 Version/5.1 Mobile/9A334 Safari/7534.48.3');
$(() => {
	onReady();
});