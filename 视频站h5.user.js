// ==UserScript==
// @name             视频站h5
// @description      视频站启用html5播放器
// @version          0.1.2
// @include          *://*.qq.com/*
// @include          *://v.youku.com/v_show/id_*
// @include          *://*.le.com/*
// @include          *://tv.sohu.com/*.shtml*
// @include          *://my.tv.sohu.com/*.shtml*
// @include          https://www.panda.tv/*
// @exclude          https://www.panda.tv/
// @grant            none
// @run-at           document-start
// @namespace https://greasyfork.org/users/7036-xinggsf
// @updateURL  https://raw.githubusercontent.com/xinggsf/gm/master/视频站h5.user.js
// ==/UserScript==

'use strict';

Object.defineProperty(navigator, 'plugins', {
	get: function () {
		return { length: 0 }
	}
});

const fakeUA = ua => Object.defineProperty(navigator, 'userAgent', {
	value: ua,
	writable: false,
	configurable: false,
	enumerable: true
});

const u = location.hostname;
if (u.endsWith('.qq.com'))
	fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10;  rv:48.0) Gecko/20100101 Firefox/48.0');
else if (u === 'v.youku.com')
    sessionStorage.setItem('P_l_h5', 1);
else if (u.endsWith('.le.com'))
	fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A');
else if (window.chrome && u.endsWith('tv.sohu.com'))//火狐请用UA工具
	fakeUA('Mozilla/5.0 (Linux; U; Android 4.0.4; en-gb; GT-I9300 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30');
else if (u === 'www.panda.tv')
    localStorage.setItem('panda.tv/user/player', {useH5player: true});