// ==UserScript==
// @name        bilibili-H5
// @author      nanavao, micky7q7, xinggsf
// @namespace   nana_vao_bilibili
// @description 启用B站的h5播放，自动宽屏、自动播放、原生右键菜单、关弹幕
// @homepage    http://bbs.kafan.cn/thread-2061994-1-1.html
// @downloadUrl https://raw.githubusercontent.com/xinggsf/gm/master/bilibili-h5.user.js
// @version     2017.06.12
// @include     *://www.bilibili.com/video/av*
// @include     *://www.bilibili.com/*/html5player.html*
// @include     *://bangumi.bilibili.com/anime/v/*
// @include     *://bangumi.bilibili.com/anime/*/play*
// @grant       unsafeWindow
// @run-at      document-start
// ==/UserScript==
'use strict';

const q = css => document.querySelector(css);

const doClick = e => {
    e.click ? e.click(): e.dispatchEvent(new MouseEvent('click'));
};

function setContextMenuHandler() {
    const contextMenuEvent = unsafeWindow.$._data(q('.bilibili-player-video-wrap'), 'events').contextmenu[0];
    const danmuMenuHandler = contextMenuEvent.handler;

    const isElementClicked = function (ele, x, y) {
        const r = ele.getBoundingClientRect();
        return x > r.left && x < r.right && y > r.top && y < r.bottom;
    };

    const danmuClicked = (arr, x, y) => [].some.call(arr, e => isElementClicked(e, x, y));

    const newHandler = function (e) {
        const a = document.querySelectorAll('.bilibili-danmaku');
        //if (e.target.matches('.bilibili-danmaku'))
        if (danmuClicked(a, e.clientX, e.clientY))
            danmuMenuHandler(e);
    };

    contextMenuEvent.handler = exportFunction(newHandler, contextMenuEvent);
}

localStorage.setItem('bilibililover', 'YESYESYES');
localStorage.defaulth5 = 1;

let num = 0;
const timer = setInterval( ()=> {
	if (num > 5) {
        clearInterval(timer);
		return;
	}
	++num;
    let p = q('video');
    if (p) {
        p.setAttribute('autoplay','autoplay');//自动播放
        q('.bilibili-player-video-btn-widescreen').click(); //开宽屏
        q('.bilibili-player-video-btn-repeat').click(); //循环播放
        doClick(q('i[name=ctlbar_danmuku_close]')); //关弹幕
        //doClick(q('ul.bpui-selectmenu-list li[data-value="3"]'));//超清
        setTimeout(setContextMenuHandler, 800);//原生右键菜单
    }
    p = p || q('#bofqi>iframe.player');//bangumi.bilibili.com的播放器在子窗口
    if (p) {//顶层窗口和子窗口的定时器都得释放
        clearInterval(timer);
        self === top && scrollTo(0, q('.player-wrapper').offsetTop);
    }
}, 300);