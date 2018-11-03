// ==UserScript==
// @name             网易公开课启用html5
// @namespace        xinggsf.163.com
// @description      网易公开课启用html5
// @version          0.0.1
// @include          http://open.163.com/movie/20*
// @include          https://open.163.com/movie/20*
// @resource plrCSS  https://cdn.jsdelivr.net/npm/dplayer@1.25.0/dist/DPlayer.min.css
// @require          https://cdn.jsdelivr.net/npm/dplayer@1.25.0/dist/DPlayer.min.js
// require          https://raw.githubusercontent.com/bestiejs/punycode.js/master/punycode.js
// @grant            GM_xmlhttpRequest
// @grant            GM_getResourceText
// @grant            GM_addStyle
// @updateURL        https://raw.githubusercontent.com/xinggsf/gm/master/open163.user.js
// @run-at           document-start
// ==/UserScript==
'use strict';

const xfetch = (url, type = 'json') => {
	if (url) return new Promise((success, fail) => {
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
	constructor() {
		this.plid = r1(/\/([A-Z\d]{9})_([A-Z\d]{9})/, location.pathname);
		if (!this.plid) throw new Error('非视频播放页，中止脚本执行');
		this.mid = RegExp.$2;
		this.subtitleNum = this.qualityNum = 0; //字幕数；清晰度计数
		this.vList = [{
			name: 'shd',
			title: '超清',
			url: ''
		},{
			name: 'hd',
			title: '高清'
		},{
			name: 'sd',
			title: '标清'
		}];
		this._tasks = []; // 异步任务列表
		const css = `::cue {
			color: #ACF;
			background: transparent;
			text-shadow: black 0 0 0.2em;
			font-size: 1.1em;
		}
		`+ GM_getResourceText('plrCSS');
		GM_addStyle(css);
	}

	_ping(url) {
		return new Promise((success, fail) => {
			GM_xmlhttpRequest({
				method: 'HEAD',
				url: url,
				onreadystatechange: r => {
					if (r.status == 200) success();
					else if (r.readyState > 2) fail();
				},
				onerror: fail,
				ontimeout: fail
			});
		});
	}

	async ping(url, data) {
		try {
			await this._ping(url);
			//success...
			data.url = url;
			this.qualityNum++;
		} catch(ex) {
			//不存在...
		}
	}

	async run() {
		try {
			await this.fetchVInfo();
			await Promise.all(this._tasks);
			await this.createH5Player();
			this.subtitleList = this._tasks = this.vList = null;
		} catch(ex) {
			console.error(ex);
		}
	}

	async doSubtitle(url, sub) {
		const resp = await xfetch(url, 'arraybuffer');
		const dv = new DataView(resp.response);
		let decoder;
		// 判断是否为utf8
		if (dv.getUint8(0) == 0xEF && dv.getUint8(1) == 0xBB && dv.getUint8(2) == 0xBF) {
			console.log('字幕编码为utf8');
			decoder = new TextDecoder();
		} else {
			decoder = new TextDecoder('UCS-2');// UCS-2 Little Endian
			console.log('字幕编码为UCS-2 Little Endian');
		}

		try {
			const txt = decoder.decode(dv);
			sub.url = this.toWEBVTT(txt);
			this.subtitleNum++;
			this.subtitleList.push(sub);
		} catch (ex) {
			//有时decoder.decode(dv)字幕解码出错，或解码成乱码
		}
	}

	toWEBVTT(txt) {
		/*
		let s = txt.replace(/\r\n\d+\r\n/g, '\n')
			.replace(/,/g, '.')
			.replace(/^\s*1/, 'WEBVTT\n');
		log(subName, s); */
		let a = txt.trim().split('\r'),
		len = a.length,
		r = /^\s*$/,
		i = 0;
		do {
			r.test(a[i]) && ++i;
			a[i++] = '';//删除索引行，然后处理下一行
			a[i] = a[i].replace(/,/g, '.');//时间行时间格式转换
			i += 3;
		} while(len > i);
		a[0] = 'WEBVTT\n';
		return URL.createObjectURL(new Blob(a), {'type': 'text/vtt'});
	}

	async fetchVInfo() {
		const mobileUrl = `http://mobile.open.163.com/movie/${this.plid}/getMoviesForAndroid.htm`;
		console.log(mobileUrl);
		const resp = await xfetch(mobileUrl);
		const data = JSON.parse(resp.responseText);
		const v = data.videoList.find(k => k.mid === this.mid);
		if (!v) return;
		const vUrl = v.repovideourlOrigin || v.repovideourl || v.repovideourlmp4Origin || v.repovideourlmp4 || '';
		console.log('原始视频地址：', vUrl);
		const baseUrl = r1(/^(.+?_?)([shd]+)?\.\w{3,4}$/, vUrl);
		if (!baseUrl) throw new Error('视频地址格式异常');
		const quality = RegExp.$2; //清晰度
		if (quality) for (let k of this.vList) {
			if (k.name === quality) {
				k.url = vUrl;
				break; //手机视频 quality一般为最低清晰度
			}
			let s = baseUrl + k.name + '.mp4';
			this._tasks.push(this.ping(s, k));
		}
		else this.vList[2].url = vUrl;
		this.qualityNum++;
		// 处理字幕
		this.subtitleList = [];
		for (let k of v.subList) {
			let sub = {
				title: k.subName,
				lang: k.subName == "英文" ? 'en': 'zh-cn',
				url: k.subUrl
			};
			this._tasks.push(this.doSubtitle(k.subUrl, sub));
		}
	}

	async createH5Player() {
		const qualitys = [];
		for (let k of this.vList) {
			if (k.url) qualitys.push({
				name: k.title,
				url: k.url,
				type: 'normal'
			});
		}
		const el = document.getElementById('j-flashArea');
		el.innerHTML = '';
		this.player = new DPlayer({
			container: el,
			screenshot: true,
			video: {
				quality: qualitys,
				defaultQuality: 0
			},
			autoplay: true
		});
		if (this.subtitleNum >0) {
			await sleep(50);
			this.tracksHtml = '';
			for (let k of this.subtitleList) if (k.url.startsWith('blob:'))
				this.tracksHtml += `<track kind="subtitles" label="${k.title}" src="${k.url}" srclang="${k.lang}" default>`;
			this.setTrack();
			this.player.on('quality_end', this.setTrack.bind(this));
			// await sleep(500);
			// for (let k of this.subtitleList)if (k.url.startsWith('blob:')) URL.revokeObjectURL(k.url);
		}
	}

	setTrack() {
		this.player.video.innerHTML = this.tracksHtml;
	}
}

new App().run();