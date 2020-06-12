// ==UserScript==
// @name         最大化缓存视频
// @namespace    videoChache.xinggsf
// @version      0.1
// @description  最大化缓存视频
// @author       xinggsf
// @match        https://v.7cyd.com/*
// @match        https://v.youku.com/v_show/id_*
// @match        http://www.le.com/ptv/vplay/*
// @match        https://jx.iztyy.com/?url=*
// @grant        GM_registerMenuCommand
// ==/UserScript==

'use strict';
let v, chached, iEnd, playPos;
const vs = document.getElementsByTagName('video');
const find = [].find.bind(vs, e => e.clientWidth > 200);
const rawPlay = HTMLVideoElement.prototype.play;
const disablePlay = () => {
	HTMLVideoElement.prototype.play = function() {
		return chached ? new Promise((x, fail) => fail()) : rawPlay()
	}
};
const check = () => {
	const buf = v.buffered;
	const i = buf.length - 1;
	iEnd = buf.end(i);
	return buf.start(i) >= playPos || iEnd > v.duration -55;
};
const finish = () => {
	v.removeEventListener('canplaythrough', onChache, true);
	v.currentTime = playPos;
	chached = !1;
	v.pause();
	HTMLVideoElement.prototype.play = rawPlay;
};
const onChache = ev => {
	if (check()) finish();
	else v.currentTime = iEnd;
};
GM_registerMenuCommand('开始缓存视频', () => {
	v = find();
	if (!v && chached) return;
	chached = true; //正在缓存
	v.pause();
	disablePlay();
	playPos = v.currentTime;
	v.addEventListener('canplaythrough', onChache, true);
	check();
	v.currentTime = iEnd;
});
GM_registerMenuCommand('停止缓存视频', () => {
	if (chached) finish();
});