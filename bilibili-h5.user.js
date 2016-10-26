// ==UserScript==
// @name        bilibili-H5
// @author      nanavao, micky7q7, xinggsf
// @namespace   nana_vao_bilibili
// @description 启用B站的h5播放，自动宽屏、自动播放、原生右键菜单、关弹幕
// @homepage    http://bbs.kafan.cn/thread-2061994-1-1.html
// @downloadUrl https://raw.githubusercontent.com/xinggsf/gm/master/bilibili-h5.user.js
// @version     2016.10.26
// @include     http://www.bilibili.com/video/av*
// @include     http://www.bilibili.com/html/html5player.html*
// @include     http://bangumi.bilibili.com/anime/v/*
// @grant       unsafeWindow
// @run-at      document-start
// ==/UserScript==
'use strict';
function q(css) {
	return document.querySelector(css);
}
function setContextMenuHandler() {
	let contextMenuEvent = unsafeWindow.$._data(q('.bilibili-player-video-wrap'), 'events').contextmenu[0];
	let danmuMenuHandler = contextMenuEvent.handler;

	let isElementClicked = function (ele, x, y) {
		let r = ele.getBoundingClientRect();
		return x > r.left && x < r.right && y > r.top && y < r.bottom;
	};

	let danmuClicked = function (arr, x, y) {
		return [].some.call(arr, e => isElementClicked(e, x, y));
	};

	let newHandler = function (e) {
		let a = document.querySelectorAll('.bilibili-danmaku');
		//if (e.target.matches('.bilibili-danmaku'))
		if (danmuClicked(a, e.clientX, e.clientY))
			danmuMenuHandler(e);
	};

	contextMenuEvent.handler = exportFunction(newHandler, contextMenuEvent);
}
function doClick(e) {
	if (e) e.click ? e.click(): e.dispatchEvent(new MouseEvent('click'));
}

localStorage.setItem('bilibililover', 'YESYESYES');
localStorage.setItem('defaulth5', '1');
let timer = setInterval( ()=> {
	let p = q('video');
	if (p) {
		q('.bilibili-player-video-btn-widescreen').click(); //自动宽屏
		q('.bilibili-player-video-btn-repeat').click(); //自动循环
		doClick(q('i[name=ctlbar_danmuku_close]')); //关弹幕
		//doClick(q('ul.bpui-selectmenu-list li[data-value=3]'));//超清
		setTimeout( ()=> {
			//自动播放'.bilibili-player-video-btn-start'
			doClick(q('i[name=play_button]'));
			setContextMenuHandler();
		}, 800);//根据自个的网速调
	}
	p = p || q('#bofqi>iframe.player');//bangumi.bilibili.com的播放器在子窗口
	if (p) {//顶层窗口和子窗口的定时器都得释放
		clearInterval(timer);
		self === top && scrollTo(0, q('.player-wrapper').offsetTop);
	}
}, 300);