// ==UserScript==
// @name             CCAV启用html5
// @namespace        xinggsf_CCAV
// @description      CCAV视频启用html5
// @version          0.0.1
// @include          http://tv.cntv.cn/video/*
// @include          http://*.cctv.com/*
// @noframes
// @require          https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js
// @require          https://cdn.jsdelivr.net/gh/clappr/clappr-level-selector-plugin@latest/dist/level-selector.min.js
// @grant            GM_xmlhttpRequest
// ==/UserScript==
'use strict';

const app = {
	r1(r, s) {
		return r.test(s) && RegExp.$1;
	},
	xhr2fetch(url) {
		if (url) return new Promise((success, fail) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url: url,
				onload: success,
				onerror: fail,
				ontimeout: fail
			});
		});
	},
	getVid() {
		this.vid = this.r1(/^http:\/\/tv\.cntv\.cn\/video\/\w+\/(\w+)/, location.href) ||
			this.r1(/^http:\/\/xiyou\.cctv\.com\/\w\-([\w\-]+)\.html/, location.href);

		if (!this.vid){
			let c = $('div>script:not([src])');
			c.each((i, e) => {
				let s = $(e).text();
				this.vid = this.r1(/var guid = "(\w+)"/,s) || this.r1(/"videoCenterId","(\w+)"/,s);
				if (this.vid) return !1;
			});
			c.remove();
		}
	},
	async fetchSrc() {
		try {
			const resp = await this.xhr2fetch('http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=' + this.vid);
			const data = JSON.parse(resp.responseText);
			this.createH5Player(data.hls_url);
		} catch(ex) {
			console.error(ex);
		}
	},
	createH5Player(url) {
		const e = $('#myFlash');
		const hi = e[0].clientHeight + 'px';
		e.empty().css('height', hi).parent().css('height', '100%');
		this.hls = new Clappr.Player({
			source: url,
			autoPlay: true,
			width: '100%',
			height: '100%',
			parent: e[0],
			plugins: [LevelSelector]
		});
	}
};

app.getVid();
if (app.vid) app.fetchSrc();