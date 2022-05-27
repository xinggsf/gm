// ==UserScript==
// @name         disable p2p
// @namespace    xinggsf.disable-p2p
// @version      1.0
// @description  Disable p2p: hook RTCPeerConnection
// @author       xinggsf
// @include      https://v.huya.com/*
// @include      https://www.huya.com/*
// @include      https://v.douyu.com/*
// @include      https://www.douyu.com/*
// @include      https://www.yy.com/*
// @include      https://www.dandanzan10.top/*
// @include      https://www.nunuyy10.top/*
// @include      https://*.qq.com/*
// @include      https://*.bilibili.com/*
// @include      http://*.le.com/*
// @include      https://*.le.com/*
// @include      https://*.mgtv.com/*
// @run-at       document-start
// ==/UserScript==
 'use strict';

const log = console.log.bind(console);
const noop = function() {};
const obj = { close: noop, send: noop };
class pc {
	constructor(cfg) {
		log('Document tried to create an RTCPeerConnection: %o', cfg);
	}
	close() {}
	createDataChannel() { return obj }
	createOffer() {}
	setRemoteDescription() {}
	addStream() {}
	addTrack() {}
	toString() {
		return '[object RTCPeerConnection]';
	}
}

const hook = () => ['RTCPeerConnection','webkitRTCPeerConnection','mozRTCPeerConnection'].forEach((k,i) => {
	const z = window[k];
	if (!z) return;
	window[k] = pc.bind(window);
	z.prototype.createDataChannel = function() {return obj};
});

hook();
document.addEventListener('DOMContentLoaded',hook);
setTimeout(hook,2000);