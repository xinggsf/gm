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
createPlayer = (src, p) => {
	if (src.includes('.m3u8')) {
		new Clappr.Player({
			source: src,
			autoPlay: true,
			parent: p,
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
}),
onReady = async () => {
	await sleep(900);
	let e, v = q('video');
	e = q('.p-video-button');
	console.log(e, v);
	e && e.click();
	e = v.closest('#pplive-player');

	while (!v.src) await sleep(300);
	let s = v.src;
	e.innerHTML = '';
	createPlayer(s, e);
	await sleep(1100);
	q('#p-error').remove();
};

fakeUA('Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3');
$(() => onReady() );