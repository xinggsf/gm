// ==UserScript==
// @name             CCAV启用html5
// @namespace        xinggsf_CCAV
// @description      CCAV视频启用html5
// @version          0.0.9
// @include          *://tv.cntv.cn/video/*
// @include          *://*.cctv.com/*
// @exclude          *://tv.cctv.com/live/*
// @noframes
// @grant      		 GM_addStyle
// @require          https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js
// @require          https://cdn.jsdelivr.net/gh/clappr/clappr-level-selector-plugin@latest/dist/level-selector.min.js
// @grant            GM_xmlhttpRequest
// @updateURL        https://raw.githubusercontent.com/xinggsf/gm/master/cntv.user.js
// ==/UserScript==
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

class App {
	async run() {
		try {
			await this.getVid();
			const data = await this.fetchSrc();
			this.createH5Player(data.hls_url);
		} catch(ex) {
			console.error(ex);
		}
	}

	async getVid() {
		const url = location.href;
		this.vid = r1(/^http:\/\/tv\.cntv\.cn\/video\/\w+\/(\w+)/, url) ||
					r1(/^http:\/\/xiyou\.cctv\.com\/\w\-([\w\-]+)\.html/, url);

		if (!this.vid) {
			const resp = await fetch(url);
			const s = await resp.text();
			this.vid = r1(/var guid = "(\w+)"/,s) || r1(/"videoCenterId","(\w+)"/,s);
		}
		if (!this.vid) throw new Error('非视频播放页，中止脚本执行');
	}

	async fetchSrc() {
		const resp = await xfetch('http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=' + this.vid);
		return resp.response;
	}

	createH5Player(url) {
		const e = $('#myFlash,.flash');
		const hi = (e[0].clientHeight || 500) + 'px';
		e.empty().css('height', hi).parent().css('height', '100%');
		new Clappr.Player({
			source: url,
			autoPlay: true,
			width: '100%',
			height: hi,
			parent: e[0],
			plugins: [LevelSelector]
		});
	}
}

GM_addStyle(
`#myFlash, #myFlash > div:first-child,.vo_nr,.vo_nr>div{height:100% !important}
.jscroll-e{height:460px!important}`);
new App().run();