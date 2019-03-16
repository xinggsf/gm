// ==UserScript==
// @name             YY启用html5
// @namespace        xinggsf_YY
// @description      YY视频启用html5
// @version          0.0.1
// @include          http://www.yy.com/x/*
// @noframes
// @require          https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js
// @require          https://cdn.jsdelivr.net/gh/clappr/clappr-level-selector-plugin@latest/dist/level-selector.min.js
// @updateURL        https://raw.githubusercontent.com/xinggsf/gm/master/yy-video.user.js
// ==/UserScript==
'use strict';

const r1 = (r, s) => r.test(s) && RegExp.$1,
modeStr = r1(/^\/\w\/(\d+_\d+_\d+_\d+)/, location.pathname);
if (modeStr) {
	const src = `http://record.vod.duowan.com/xcrs/${modeStr}.m3u8`,
	p = $('#flashBox').empty();
	new Clappr.Player({
		source: src,
		autoPlay: true,
		parent: p[0],
		width: '100%',
		height: '100%',
	});
}