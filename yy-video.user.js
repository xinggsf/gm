// ==UserScript==
// @name             YY启用html5
// @namespace        xinggsf_YY
// @description      YY视频启用html5
// @version          0.0.2
// @include          http://www.yy.com/x/*
// @include          https://www.yy.com/x/*
// @require          https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js
// @updateURL        https://raw.githubusercontent.com/xinggsf/gm/master/yy-video.user.js
// ==/UserScript==
'use strict';

const p = $('#flashBox').empty()[0];
if (p) {
	const vid = location.pathname.slice(3);
	new Clappr.Player({
		source: `http://record.vod.duowan.com/xcrs/${vid}.m3u8`,
		autoPlay: true,
		parent: p,
		width: '100%',
		height: '100%',
	});
}