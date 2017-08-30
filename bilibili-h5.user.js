// ==UserScript==
// @name        bilibili-H5
// @author      xinggsf, nanavao, micky7q7
// @namespace   nana_vao_bilibili
// @description 启用B站的h5播放，自动宽屏、自动播放、原生右键菜单、关弹幕
// @homepage    http://bbs.kafan.cn/thread-2061994-1-1.html
// @downloadUrl https://raw.githubusercontent.com/xinggsf/gm/master/bilibili-h5.user.js
// @version     2017.08.21
// @include     *://www.bilibili.com/video/av*
// @include     *://www.bilibili.com/*/html5player.html*
// @include     *://bangumi.bilibili.com/anime/v/*
// @include     *://bangumi.bilibili.com/anime/*/play*
// @grant       unsafeWindow
// @run-at      document-body
// ==/UserScript==
'use strict';

const q = css => document.querySelector(css);

const doClick = e => {
    if (e) e.click ? e.click(): e.dispatchEvent(new MouseEvent('click'));
};

const setPlayer = v => {
	v.setAttribute('autoplay', '');//自动播放
	doClick(q('i.bilibili-player-iconfont-widescreen.icon-24wideoff')); //开宽屏
	doClick(q('i.bilibili-player-iconfont-repeat.icon-24repeaton')); //关循环播放
	//单击下一视频按钮后，B站的弹幕按钮有问题 div.bilibili-player-video-btn-danmaku:not(video-state-danmaku-off)
	doClick(q('div[name=ctlbar_danmuku_close]'));//关弹幕
	//doClick(q('ul.bpui-selectmenu-list li[data-value="3"]'));//超清
	//setTimeout(setContextMenuHandler, 800);//原生右键菜单
};

function setContextMenuHandler() {
    const gMenuEvent = unsafeWindow.$._data(q('.bilibili-player-video-wrap'), 'events').contextmenu[0],
    danmuMenuHandler = gMenuEvent.handler,

    inElement = (e, x, y) => {
		console.log(e.getBoundingClientRect);
        const r = e.getBoundingClientRect();
        return r.left < x < r.right && r.top < y < r.bottom;
    },

    danmuClicked = (arr, x, y) => arr.some(e => inElement(e, x, y)),

    newHandler = e => {
        const a = [...document.querySelectorAll('.bilibili-danmaku')];
        danmuClicked(a, e.clientX, e.clientY) && danmuMenuHandler(e);
    };

    gMenuEvent.handler = exportFunction(newHandler, gMenuEvent);
}

localStorage.setItem('bilibililover', 'YESYESYES');
localStorage.defaulth5 = 1;

let scrolled = !1;
new MutationObserver(records => {
	for (let r of records) if (r.addedNodes) {
		if (!scrolled && self === top && r.target.id ==='bofqi') {
			scrollTo(0, r.target.closest('.player-wrapper').offsetTop);
			scrolled = true;
			return;
		}
		if (r.target.matches('.bilibili-player-video'))
			return setPlayer(r.addedNodes[0]);
	}
})
.observe(document.body, {
	childList : true,
	subtree : true
	//attributes: true,
	//attributeFilter: ['src']
});