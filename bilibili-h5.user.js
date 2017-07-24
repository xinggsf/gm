// ==UserScript==
// @name        bilibili-H5
// @author      nanavao, micky7q7, xinggsf
// @namespace   nana_vao_bilibili
// @description 启用B站的h5播放，自动宽屏、自动播放、原生右键菜单、关弹幕
// @homepage    http://bbs.kafan.cn/thread-2061994-1-1.html
// @downloadUrl https://raw.githubusercontent.com/xinggsf/gm/master/bilibili-h5.user.js
// @version     2017.07.24
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
    e.click ? e.click(): e.dispatchEvent(new MouseEvent('click'));
};

const setPlayer = v => {
	v.setAttribute('autoplay','');//自动播放
	q('.bilibili-player-video-btn-widescreen').click(); //开宽屏
	q('.bilibili-player-video-btn-repeat').click(); //循环播放
	doClick(q('i[name=ctlbar_danmuku_close]')); //关弹幕
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

let mo = new MutationObserver(records => {
    //bangumi.bilibili.com的播放器在子窗口
    if (location.host.startsWith('bangumi.') && q('.player-wrapper')) {
		mo.disconnect();
		mo = undefined;
        scrollTo(0, q('.player-wrapper').offsetTop);
		return;
    }
	for (let r of records) {
		if (r.type === 'attribute' && r.target.matches('video')) {
			setPlayer(r.target);
			return;
		}

		if (r.type === 'childList' && r.addedNodes)
			for (let v of r.addedNodes) {
				if (v.nodeName ==='VIDEO') {
					setPlayer(v);
					self === top && scrollTo(0, q('.player-wrapper').offsetTop);
					return;
				}
			}
	}
});
mo.observe(document.body, {
	childList : true,
	subtree : true,
	attributes: true,
	attributeFilter: ['src']
});