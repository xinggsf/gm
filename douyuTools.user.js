// ==UserScript==
// @name           douyuTools
// @namespace      douyuTools.xinggsf
// @author	       xinggsf~gmail。com
// @description    斗鱼TV去广告，开启CDN加速、GPU加速
// @homepageURL    https://greasyfork.org/zh-CN/scripts/18613
// updateURL       https://greasyfork.org/scripts/18613.js
// @include        http://www.douyu.com/*
// @version        2016.4.10
// @encoding       utf-8
// @grant          none
// ==/UserScript==

"use strict";
$('div[class|=room-ad],div.chat-right-ad,div.lol-ad, div.tab-content.promote,div.no-login,div.show-watch').remove();
if (!$ROOM) return;
let t = setInterval(function () {
	let rm = $('#douyu_room_flash_proxy'),
	c = rm[0].children;
	if (!c.length) return;
	let s = c.flashvars.value,
	cdn = ['tct', 'ws2', 'ws', 'dl'][~~(Math.random() * 4)];
	c.wmode.value = 'gpu';
	c.flashvars.value = s.replace(/&cdn=\w*/, `&cdn=${cdn}`);
	rm.toggle().toggle();
	clearInterval(t);
	$('span.tab-btn-text').click();
}, 333);