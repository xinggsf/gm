// ==UserScript==
// @name           douyuTools
// @namespace      douyuTools.xinggsf
// @author         xinggsf
// @description    斗鱼TV去广告，开启CDN加速、GPU加速
// @homepageURL    https://greasyfork.org/zh-CN/scripts/18613
// updateURL       https://greasyfork.org/scripts/18613.js
// @include        http://www.douyu.com/*
// @version        2016.6.1
// @encoding       utf-8
// @compatible     chrome45+
// @compatible     firefox38+
// @grant          unsafeWindow
// @grant          GM_registerMenuCommand
// @grant          GM_setValue
// @grant          GM_getValue
// ==/UserScript==

"use strict";
function setCDN(us) {
	GM_setValue('CDNset', us);
	unsafeWindow.location.reload();
}
const svrList = ['tct', 'ws2', 'ws', 'dl'];
function getCDN() {
	let n = GM_getValue('CDNset', 4);
	if (n === 0) return svrList[3];//网通
	return svrList[~~(Math.random() * n)];
}
GM_registerMenuCommand('电信（随机）', () => setCDN(3));
GM_registerMenuCommand('网通', () => setCDN(0));
GM_registerMenuCommand('随机', () => setCDN(4));

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
	$('.focus_lead,.live_lead,.show_watch,div.no_login,.pop_zoom_container').remove();
	console.log('remove ads!');
	//this.takeRecords();
	this.observe(document.body, options);

	if (setFlash) return;
	let rm = $('object[data*="/simplayer/WebRoom"]');
	if (!rm.length) return;
	scrollTo(0, 125);
	let c = rm[0].children,
	s = c.flashvars.value;
	c.wmode.value = 'gpu';
	c.flashvars.value = s.replace(/&cdn=\w*/, '&cdn='+getCDN());
	console.log('Flash Accelerate: gpu, cdn');
	rm.toggle().toggle();//.offsetParent() 领鱼丸：'div.get-yw.fl'
	setFlash = !0;
	delete options.subtree;
	//$('span.tab-btn-text').click();
}).observe(document.body, options);