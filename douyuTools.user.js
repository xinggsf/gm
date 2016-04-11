// ==UserScript==
// @name           douyuTools
// @namespace      douyuTools.xinggsf
// @author	       xinggsf
// @description    斗鱼TV去广告，开启CDN加速、GPU加速
// @homepageURL    https://greasyfork.org/zh-CN/scripts/18613
// updateURL       https://greasyfork.org/scripts/18613.js
// @include        http://www.douyu.com/*
// @version        2016.4.11
// @encoding       utf-8
// @grant          none
// ==/UserScript==

"use strict";
//$('.vcode9-sign').live('show', () => $(this).remove());
$('div[class|=room-ad],div[class$=-ad],.focus-lead,.tab-content.promote').remove();
new MutationObserver(() => {
	$('.assort-ad,.vcode9-sign,div.no-login,.show-watch').remove();
	//if (!$ROOM) return;
	let rm = $('#douyu_room_flash_proxy');
	if (!rm.length) return;
	let c = rm[0].children,
	s = c.flashvars.value,
	cdn = ['tct', 'ws2', 'ws', 'dl'][~~(Math.random() * 4)];
	c.wmode.value = 'gpu';
	c.flashvars.value = s.replace(/&cdn=\w*/, `&cdn=${cdn}`);
	rm.toggle().toggle();	
	//$('span.tab-btn-text').click();
}).observe(document.body, {
	childList: true, subtree: true
});