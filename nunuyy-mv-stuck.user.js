// ==UserScript==
// @name         解决视频进度卡顿
// @namespace    nunuyy.xinggsf
// @version      0.1
// @description  解决视频进度卡顿
// @author       xinggsf
// @include      https://www.nunuyy.*
// @grant        GM_registerMenuCommand
// ==/UserScript==

GM_registerMenuCommand('视频进度卡顿', () => {
	'use strict';
	const v = document.getElementsByTagName('video')[0];
	v.pause();
	const pos = v.currentTime;
	const buf = v.buffered;
	v.currentTime = buf.end(buf.length - 1) + 3;
	const onChache = ev => {
		v.removeEventListener('progress', onChache);
		v.currentTime = pos;
		v.play();
	};
	v.addEventListener('progress', onChache);
});