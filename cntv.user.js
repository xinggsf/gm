// ==UserScript==
// @name             CCAV启用html5
// @namespace        xinggsf_CCAV
// @description      CCAV视频启用html5
// @version          0.0.6
// @include          http://tv.cntv.cn/video/*
// @include          http://*.cctv.com/*
// @exclude          http://tv.cctv.com/live/cctv*
// @noframes
// @require          https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js
// @require          https://cdn.jsdelivr.net/gh/clappr/clappr-level-selector-plugin@latest/dist/level-selector.min.js
// @grant            GM_xmlhttpRequest
// @updateURL        https://raw.githubusercontent.com/xinggsf/gm/master/cntv.user.js
// @run-at           document-start
// ==/UserScript==
'use strict';

const xfetch = (url, type = 'json') => {
	return new Promise((success, fail) => {
		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			responseType: type,
			onload: success,
			onerror: fail,
			ontimeout: fail
		});
	});
},
sleep = ms => new Promise(resolve => {
	setTimeout(resolve, ms);
}),
r1 = (r, s) => r.test(s) && RegExp.$1;

class App {
	async run() {
		try {
			await this.getVid();
			const data = await this.fetchSrc();
			await sleep(800);
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
		const e = $('#myFlash');
		const hi = (e[0].clientHeight || 500) + 'px';
		e.empty().css('height', hi).parent().css('height', '100%');
		this.player = new Clappr.Player({
			source: url,
			autoPlay: true,
			width: '100%',
			height: hi,
			parent: e[0],
			plugins: [LevelSelector]
		});
	}
}

new App().run();