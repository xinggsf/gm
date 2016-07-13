// ==UserScript==
// @name           douyuTools
// @namespace      douyuTools.xinggsf
// @author         xinggsf
// @description    斗鱼TV去广告，开启CDN加速、GPU加速
// @homepageURL    https://greasyfork.org/zh-CN/scripts/18613
// updateURL       https://greasyfork.org/scripts/18613.js
// @include        http://www.douyu.com/*
// @version        2016.7.13
// @encoding       utf-8
// @compatible     chrome45+
// @compatible     firefox38+
// @grant          unsafeWindow
// @grant          GM_registerMenuCommand
// @grant          GM_setValue
// @grant          GM_getValue
// ==/UserScript==
"use strict";

const svrList = ['tct', 'ws2', 'ws', 'dl'];
function getCDN() {
	let n = GM_getValue('CDN', 9);
	if (n < svrList.length) return svrList[n];//网通
	return svrList[~~(Math.random() * (svrList.length-1))];
}
function configValue(field, v = null) {
	if (v === null) v = !GM_getValue(field, !1);
	GM_setValue(field, v);
	unsafeWindow.location.reload();
}

GM_registerMenuCommand('随机 电信线路', () => configValue('CDN',9));
GM_registerMenuCommand('主线路', () => configValue('CDN',2));
GM_registerMenuCommand('线路5', () => configValue('CDN',0));
GM_registerMenuCommand('线路2', () => configValue('CDN',1));
GM_registerMenuCommand('网通', () => configValue('CDN',3));
let title = '去未登录限制';
if (GM_getValue('notLogin', !1)) title = '√ ' + title;
GM_registerMenuCommand(title, () => configValue('notLogin'));
title = '去礼物效果';
if (GM_getValue('noDift', !1)) title = '√ ' + title;
GM_registerMenuCommand(title, () => configValue('noDift'));

let setFlash = !1,
$ = unsafeWindow.$,
options = {childList: true, subtree: true};
//$('.vcode9-sign').live('show', () => $(this).remove());//委托/后绑定事件
$('div[class|=room-ad],div[class$=-ad],.tab-content.promote').remove();
new MutationObserver(function(rs) {
	//弹幕滚屏文字不处理
	//if (rs.some(x => x.target.closest('div.chat'))) return;
	//if (!rs.some(x => x.addedNodes.length)) return;
	this.disconnect();
	$('.assort-ad,.chat-top-ad,.vcode9-sign,#watchpop,.giftbox,.focus').remove();
	$('.focus-lead,.live-lead,.show-watch,div.no-login,.pop-zoom-container').remove();
	$('focus_lead,.live_lead,.show_watch,div.no_login,.pop_zoom_container').remove();
	console.log('remove ads!');
	//this.takeRecords();
	this.observe(document.body, options);

	if (setFlash) return;
	let rm = $('object[data*="/simplayer/WebRoom"]');
	if (!rm.length) return;
	unsafeWindow.scrollTo(0, 120);
	let c = rm[0].children,
	s = c.flashvars.value;
	c.wmode.value = 'gpu';
	s = s.replace(/&cdn=\w*/, '&cdn='+getCDN());
	if (GM_getValue('notLogin', !1)) {
		s = s.replace('&uid=0', '&uid=11111')
			.replace(/&flashConfig=[^&]*/, '');
	}
	if (GM_getValue('noDift', !1)) {
		s = s.replace(/&effectSwf=[^&]*/, '')
			.replace(/&effectConfig=[^&]*/, '');
	}
	c.flashvars.value = s;
	rm.toggle().toggle();
	console.log('Flash Accelerate: gpu, cdn');
	setFlash = !0;
	delete options.subtree;
	//$('span.tab-btn-text').click();
}).observe(document.body, options);