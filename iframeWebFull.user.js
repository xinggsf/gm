// ==UserScript==
// @name         框架网页全屏
// @namespace    iframeWebFull.xinggsf
// @version      0.2
// @description  iframe网页全屏
// @author       xinggsf
// @include      https://www.imeiju.pro/Play/*
// @include      https://www.imeiju.pro/new/Play/*
// @include      http://www.hanjutvaa.com/player/*
// @include      https://www.hanjutvaa.com/player/*
// @include      *olevod.com/index.php/vod/play/id/*
// @include      *olevod.tv/index.php/vod/play/id/*
// @noframes
// @run-at       document-body
// @grant        GM_addStyle
// ==/UserScript==

(function(doc, by) {
'use strict';
const q = (css, p = doc) => p.querySelector(css);
const goNextMV = () => {
	const s = location.pathname;
	const m = s.match(/(\d+)(\D*)$/);
	const d = +m[1] + 1;
	location.assign(s.slice(0, m.index) + d + m[2]);
};
const getMainDomain = host => {
	const a = host.split('.');
	let i = a.length - 2;
	if (/^(com?|cc|tv|net|org|gov|edu)$/.test(a[i])) i--;
	return a[i];
};
const u = getMainDomain(location.hostname);
const doClick = e => {
	if (typeof e === 'string') e = q(e);
	if (e) { e.click ? e.click() : e.dispatchEvent(new MouseEvent('click')) };
};

class FullPage {
	constructor(frm, onSwitch = null) {
		this._onSwitch = onSwitch;
		this.frame = frm;
		GM_addStyle(
			`.gm-fp-body .gm-fp-zTop {
				position: relative !important;
				z-index: 2147483647 !important;
			}
			.gm-fp-wrapper, .gm-fp-body{ overflow:hidden !important; }
			.gm-fp-wrapper {
				display: block !important;
				position: fixed !important;
				width: 100% !important;
				height: 100% !important;
				top: 0 !important;
				left: 0 !important;
				background: #000 !important;
				z-index: 2147483647 !important;
			}`
		);
	}
	static isFull() {
		return by.classList.contains('gm-fp-body');
	}
	toggle() {
		this._onSwitch?.(this);
		by.classList.toggle('gm-fp-body');
		this.frame.classList.toggle('gm-fp-wrapper');
		let e = this.frame.parentNode;
		while (e != by) {
			e.classList.toggle('gm-fp-zTop');
			e = e.parentNode;
		}
	}
}

const config = {
	hanjutvaa: {
		nextCSS: 'a.playLink.active + a',
		origin: 'https://ww4.hanjutvaa.com:443' //必须带端口号
	},
	olevod: {
		nextCSS: 'i.next-p'
	}
};
// const origin = config[u]?.origin || '/';

let ffp, mvWin, topFrame;
window.addEventListener("message", ev => {
	if (!ev.source || !ev.data?.id) return;
	switch (ev.data.id) {
	case 'gm-h5-init-MVframe':
		mvWin = ev.source;
		topFrame = [...doc.getElementsByTagName('iframe')]
			.find(e => e.allowfullscreen || e.offsetWidth > 99);
		ffp = new FullPage(topFrame);
		break;
	case 'gm-h5-toggle-iframeWebFull':
		ffp.toggle();
		break;
	case 'gm-h5-is-iframeWebFull': //响应子框架的ESC按键
		FullPage.isFull() && ffp.toggle();
		break;
	case 'gm-h5-play-next':
		config[u]?.nextCSS ? doClick(config[u].nextCSS) : goNextMV();
	}
}, false);

by.addEventListener('keydown', ev => {
	if (!ffp) return;
	switch (ev.keyCode) {
	case 78: // N 下一集
		config[u]?.nextCSS ? doClick(config[u].nextCSS) : goNextMV();
		break;
	case 13: //回车键。 全屏
		if (ev.shiftKey) {
			ffp.toggle();
		} else {
			mvWin.postMessage({id: 'gm-h5-toggle-fullScreen'}, '*');
		}
		break;
	case 27: //esc
		if (doc.fullscreen) {
			mvWin.postMessage({id: 'gm-h5-toggle-fullScreen'}, '*');
		} else if (FullPage.isFull()) {
			ffp.toggle();
		}
	}
});

})(document, document.body);