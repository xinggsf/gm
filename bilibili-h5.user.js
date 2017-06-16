// ==UserScript==
// @name        bilibili-H5
// @author      nanavao, micky7q7, xinggsf
// @namespace   nana_vao_bilibili
// @description 启用B站的h5播放，自动宽屏、自动播放、原生右键菜单、关弹幕
// @homepage    http://bbs.kafan.cn/thread-2061994-1-1.html
// @downloadUrl https://raw.githubusercontent.com/xinggsf/gm/master/bilibili-h5.user.js
// @version     2017.06.16
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

function setContextMenuHandler() {
    const gMenuEvent = unsafeWindow.$._data(q('.bilibili-player-video-wrap'), 'events').contextmenu[0],
    danmuMenuHandler = gMenuEvent.handler,

    isElementClicked = (ele, x, y) => {
        const r = ele.getBoundingClientRect();
        return x > r.left && x < r.right && y > r.top && y < r.bottom;
    },

    danmuClicked = (arr, x, y) => [].some.call(arr, e => isElementClicked(e, x, y)),

    newHandler = e => {
        const a = document.querySelectorAll('.bilibili-danmaku');
        //if (e.target.matches('.bilibili-danmaku'))
        if (danmuClicked(a, e.clientX, e.clientY))
            danmuMenuHandler(e);
    };

    gMenuEvent.handler = exportFunction(newHandler, gMenuEvent);
}

localStorage.setItem('bilibililover', 'YESYESYES');
localStorage.defaulth5 = 1;

let mo = new MutationObserver(records => {
    let v = q('video');
	if (v) {
        v.setAttribute('autoplay','autoplay');//自动播放
        q('.bilibili-player-video-btn-widescreen').click(); //开宽屏
        q('.bilibili-player-video-btn-repeat').click(); //循环播放
        doClick(q('i[name=ctlbar_danmuku_close]')); //关弹幕
        //doClick(q('ul.bpui-selectmenu-list li[data-value="3"]'));//超清
        setTimeout(setContextMenuHandler, 800);//原生右键菜单
	}
    //bangumi.bilibili.com的播放器在子窗口
    if (v || q('#bofqi>iframe.player')) {
		mo.disconnect();
		mo = undefined;
        self === top && scrollTo(0, q('.player-wrapper').offsetTop);
    }
});
mo.observe(document.body, {
	childList : true,
	subtree : true
});