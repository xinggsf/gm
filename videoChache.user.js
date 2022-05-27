// ==UserScript==
// @name         缓存视频
// @namespace    videoChache.xinggsf
// @version      0.2.3
// @description  最大化缓存视频
// @author       xinggsf
// @include      http*
// @exclude    https://www.yy.com/*
// @exclude    https://www.huya.com/*
// @exclude    https://m.huya.com/*
// @exclude    https://www.douyu.com/*
// @exclude    https://www.longzhu.com/*
// @exclude    https://www.zhanqi.tv/*
// @grant        GM_registerMenuCommand
// ==/UserScript==

'use strict';
let v, chached, iEnd, playPos;
const vs = document.getElementsByTagName('video');
const find = [].find.bind(vs, e => e.offsetParent);
const rawPlay = HTMLVideoElement.prototype.play;
const check = () => {
	const buf = v.buffered;
	const i = buf.length - 1;
	iEnd = buf.end(i);
	return buf.start(0) >= playPos || iEnd > v.duration -55;
};
const finish = () => {
	v.removeEventListener('canplaythrough', onChache);
	v.currentTime = playPos;
	chached = !1;
	setTimeout(_ => v.pause(), 99);
	HTMLVideoElement.prototype.play = rawPlay;
};
const onChache = ev => {
	if (check()) finish();
	else v.currentTime = iEnd;
};

const onload = ev => {
	v = find();
	if (v && v.played.length) {
		//v.playbackRate = 1.4;
		GM_registerMenuCommand('开始缓存视频', () => {
			v = find();
			if (!v || chached) return;
			chached = true; //正在缓存
			v.pause();
			HTMLVideoElement.prototype.play = () => new Promise(() => {});
			playPos = v.currentTime;
			v.addEventListener('canplaythrough', onChache);
			check();
			v.currentTime = iEnd;
		});
		GM_registerMenuCommand('停止缓存视频', () => chached && finish());
	}
	else setTimeout(onload, 900);
};
onload();