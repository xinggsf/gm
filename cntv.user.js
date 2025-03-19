/* eslint-disable no-undef */
// ==UserScript==
// @name             CCAV启用html5
// @namespace        xinggsf.CCAV
// @description      CCAV视频启用html5
// @version          0.1.6
// @include          *://*.cntv.cn/*
// @include          *://*.cctv.com/*
// @exclude          *://tv.cctv.com/live/*
// @include          http://www.yatu.tv*/play*
// @noframes
// @require          https://cdn.jsdelivr.net/npm/clappr@0.3.12/dist/clappr.min.js
// @require          https://cdn.jsdelivr.net/gh/clappr/clappr-level-selector-plugin@latest/dist/level-selector.min.js
// @grant            GM_xmlhttpRequest
// @grant            GM_addStyle
// @connect          vdn.apps.cntv.cn
// @grant            unsafeWindow
// ==/UserScript==

// 使用说明，加广告过滤规则切换官方播放器和脚本播放器：||player.cntv.cn/h5vod/$script
'use strict';
const xfetch = (url, type = 'json') => new Promise((success, fail) => {
	GM_xmlhttpRequest({
		method: 'GET',
		url: url,
		responseType: type,
		onload: success,
		onerror: fail,
		ontimeout: fail
	});
});
const r1 = (r, s) => r.test(s) && RegExp.$1;
const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) });

class App {
	async run() {
		this.is1P = /\.c[nc]tv\.c/.test(location.hostname);
		this.is1P && this.fixWebFull();
		await sleep(600);
		if (this.is1P && unsafeWindow.vodh5player) return;
		try {
			this.getVid();
			const data = await this.fetchSrc();
			if (!data.hls_url) return;
			if (this.is1P && !unsafeWindow.vodh5player) await sleep(300);
			if (this.is1P && unsafeWindow.vodh5player) return;
			this.createH5Player(data.hls_url);
		} catch(ex) {
			console.error(ex);
		}
	}

	getVid() {
		if (this.is1P) {
			const url = location.href;
			this.vid = unsafeWindow.guid ||
				r1(/^https?:\/\/tv\.cntv\.cn\/video\/\w+\/(\w+)/, url) ||
				r1(/^https?:\/\/xiyou\.cctv\.com\/\w\-([\w\-]+)\.html/, url);

			if (!this.vid) {
				const s = $('script[src$="Advertise.js"]').siblings("script").text();
				this.vid = r1(/"videoCenterId","(\w+)"/,s);
			}
		} else {
			const s = $('embed[src*="//player.cntv.cn/"]').attr('flashvars');
			this.vid = r1(/videoCenterId=([^&]+)/,s);
		}
		if (!this.vid) throw '非CCAV视频播放页，中止脚本执行';
	}

	async fetchSrc() {
		const resp = await xfetch('https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=' + this.vid);
		return resp.response;
	}

	createH5Player(url) {
		const s = this.is1P ?'.flash,#myFlash,#myPlayer':'embed,object';
		const e = $(s);
		let hi, p;
		if (this.is1P) {
			p = e[0];
			hi = (p.clientHeight || 500) + 'px';
			e.empty().css('height', hi).parent().css('height', hi);
		} else {
			hi = '97%';
			p = e.parent().empty()[0];
		}
		new Clappr.Player({
			source: url,
			autoPlay: true,
			width: '100%',
			height: hi,
			parent: p,
			plugins: [LevelSelector]
		});
	}

	fixWebFull() {
		let s = `.video_left, .jscroll-e, #sc0 {height:500px!important}
		.gm-fp-body .flash, #myFlash, div[data-player], .vo_nr { height:100% !important }
		.gm-fp-body .flash, .gm-fp-body #myFlash { width:100% !important }`;
		/* .gm-fp-body .video_btnBar, .gm-fp-body 
		s += $('#page_body>#bpopup')[0] ?
			'#page_body > div:nth-of-type(-n+3){display:none!important}' :
			'.bg_top_owner > div:nth-of-type(-n+4){display:none!important}'; */
		GM_addStyle(s);
	}
}

if (!unsafeWindow.vodh5player) new App().run();