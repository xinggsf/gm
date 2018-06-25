// ==UserScript==
// @name             youtube-subtitle
// @namespace        youtube-subtitle.xinggsf
// @description      Set subtitle of youtube
// @version          0.0.1
// @homepage         http://bbs.kafan.cn/thread-2093014-1-1.html
// @include          https://www.youtube.com/watch?v=*
// @grant            unsafeWindow
// @grant            GM_addStyle
// @grant            GM_setValue
// @grant            GM_getValue
// @updateURL  https://raw.githubusercontent.com/xinggsf/gm/master/youtube-subtitle.user.js
// ==/UserScript==
'use strict';
class Subtitle{
	constructor() {
		this.lang = GM_getValue('language', '') || (navigator.language || navigator.browserLanguage).toLowerCase();

	}
}