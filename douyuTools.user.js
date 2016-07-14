// ==UserScript==
// @name           douyuTools
// @namespace      douyuTools.xinggsf
// @author         xinggsf
// @description    斗鱼TV去广告；开启CDN和GPU加速；去未登录限制；去礼物效果
// @homepageURL    https://greasyfork.org/zh-CN/scripts/18613
// updateURL       https://greasyfork.org/scripts/18613.js
// @include        http://www.douyu.com/*
// @version        2016.7.15
// @encoding       utf-8
// @compatible     chrome45+
// @compatible     firefox38+
// @grant          unsafeWindow
// @grant          GM_registerMenuCommand
// @grant          GM_setValue
// @grant          GM_getValue
// ==/UserScript==
"use strict";

const svrList = ['tct', 'ws2', 'ws', 'dl'],
menuOpt = [
			['主线路','CDN',2],
			['线路5','CDN',0],
			['线路2','CDN',1],
			['网通','CDN',2],
			['电信线路随机','CDN',9],
			['去未登录限制','notLogin',!1],
			['去礼物效果','noDift',!1],
];
function getCDN() {
	let n = GM_getValue('CDN', 9);
	if (n < svrList.length) return svrList[n];//网通
	return svrList[~~(Math.random() * (svrList.length-1))];
}
function configValue(field, v = !1) {
	if (typeof v === 'boolean') v = !GM_getValue(field, !1);
	GM_setValue(field, v);
	unsafeWindow.location.reload();
}
function buildMenu() {
	let title, i, r,
	cdn = GM_getValue('CDN', 9);
	for (i of menuOpt) {
		if (i[1] === 'CDN')
			r = cdn === i[2];
		else
			r = GM_getValue(i[1], i[2]);
		title = r ? ('√  ' + i[0]) : i[0];
		GM_registerMenuCommand(title, () => configValue(i[1], i[2]));		
	}
}

buildMenu();
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