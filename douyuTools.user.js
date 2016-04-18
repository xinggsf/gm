// ==UserScript==
// @name           douyuTools
// @namespace      douyuTools.xinggsf
// @author	       xinggsf
// @description    斗鱼TV去广告，开启CDN加速、GPU加速
// @homepageURL    https://greasyfork.org/zh-CN/scripts/18613
// updateURL       https://greasyfork.org/scripts/18613.js
// @include        http://www.douyu.com/*
// @version        2016.4.18
// @encoding       utf-8
// @compatible     chrome45+
// @compatible     firefox38+
// @grant          none
// ==/UserScript==

"use strict";
//$('.vcode9-sign').live('show', () => $(this).remove());
$('div[class|=room-ad],div[class$=-ad],.tab-content.promote').remove();
let setFlash = !1,
mo = new MutationObserver(() => {
	//console.log('Observer callback start');
	$('.assort-ad,.vcode9-sign,.focus-lead,.chat-top-ad, div.no-login,.show-watch,.pop-zoom-container').remove();
	mo.takeRecords();

	if (setFlash || !$ROOM) return;
	let rm = $('#douyu_room_flash_proxy'),
	c = rm[0].children,
	s = c.flashvars.value,
	cdn = ['tct', 'ws2', 'ws', 'dl'][~~(Math.random() * 4)];
	c.wmode.value = 'gpu';
	c.flashvars.value = s.replace(/&cdn=\w*/, `&cdn=${cdn}`);
	setFlash = !0;
	console.log('do flash');
	rm.toggle().toggle();
	//$('span.tab-btn-text').click();
});
mo.observe(document.body, {
	childList: true, subtree: true
});