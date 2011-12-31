// ==UserScript==
// @name             网易公开课启用html5
// @namespace        xinggsf.163.com
// @description      网易公开课启用html5
// @version          0.0.4
// @include          http://open.163.com/movie/20*
// @include          https://open.163.com/movie/20*
// @resource plrCSS  https://cdn.jsdelivr.net/npm/dplayer@1.25.0/dist/DPlayer.min.css
// @require          https://cdn.jsdelivr.net/npm/dplayer@1.25.0/dist/DPlayer.min.js
// @grant            GM_xmlhttpRequest
// @grant            GM_getResourceText
// @grant            GM_addStyle
// @grant            GM_info
// @updateURL        https://raw.githubusercontent.com/xinggsf/gm/master/open163.user.js
// ==/UserScript==
'use strict';

const r1 = (r, s) => r.test(s) && RegExp.$1,
xfetch = (url, type = 'json') => new Promise((success, fail) => {
	GM_xmlhttpRequest({
		method: 'GET',
		url: url,
		responseType: type,
		onload: success,
		onerror: fail,
		ontimeout: fail
	});
}),
log = console.log.bind(console, '%c脚本[%s]\n%s %s',
	'color:#74C;font-size:1.2em', GM_info.script.name);

class App {
	constructor() {
		this.plid = r1(/\/([A-Z\d]{9})_([A-Z\d]{9})/, location.pathname);
		if (!this.plid) throw new Error('非视频播放页，中止脚本执行');
		this.mid = RegExp.$2;
		this.subtitleNum = this.qualityNum = 0; //字幕数；清晰度计数
		this.tracksHtml = '';
		this.vList = [{
			name: 'shd',
			title: '超清'
		},{
			name: 'hd',
			title: '高清'
		},{
			name: 'sd',
			title: '标清'
		}];
		this._tasks = []; // 异步任务列表
		const css = `::cue {
			color: #ABE;
			background: transparent;
			text-shadow: black 0.1em 0 0.2em;
			font-size: 1.1em;
		}
		`+ GM_getResourceText('plrCSS');
		GM_addStyle(css);
	}

	async ping(url, data) {
		const r = await fetch(url, { method: 'HEAD' });
		if (r.ok) {
			data.url = url;
			this.qualityNum++;
		}
		//else if (r.status==404) log('资源不存在');
	}

	async run() {
		try {
			await this.fetchVInfo();
			if (this._tasks.length >0) await Promise.all(this._tasks);
			this.createH5Player();
			this.vList = null;
		} catch(ex) {
			console.error(ex);
		}
	}

	async doSubtitle(url, sub) {
		try {
			const resp = await xfetch(url, 'arraybuffer');
			const dv = new DataView(resp.response);
			let decoder, v1 = dv.getUint8(0), v2 = dv.getUint8(1);
			// 判断是否为UCS-2，FF FE为小端，FE FF为大端。utf8带BOM: EF BB BF, 无BOM则无前三字节标志
			if (v1 == 0xFF && v2 == 0xFE) {
				decoder = new TextDecoder('utf-16le');//utf-16又名UCS-2，火狐不支持名为UCS-2
				log(sub.title +'字幕编码为',decoder.encoding);
			}
			else if (v1 == 0xFE && v2 == 0xFF) {
				decoder = new TextDecoder('utf-16be');
				log(sub.title +'字幕编码为',decoder.encoding);
			} else {
				log(sub.title +'字幕编码为utf8。文件头二字节：',v1.toString(16),v2.toString(16));
				decoder = new TextDecoder();
			}
			const txt = decoder.decode(dv);
			sub.url = this.toWEBVTT(txt);

			this.subtitleNum++;
			this.tracksHtml += `<track kind="subtitles" label="${sub.title}" src="${sub.url}" default srclang="${sub.lang}">`;
			if (this._tasks.length >0) await Promise.all(this._tasks);
			this.qualityNum >1 && this.player.on('quality_end', this.setTrack.bind(this));
			this.setTrack();
			if (this.subtitleSum == this.subtitleNum) this._tasks = null;
		} catch (ex) {
			console.error(ex);
		}
	}

	toWEBVTT(txt) {
		let s = 'WEBVTT\n\n'+ txt.trim()
			// .replace(/\{\\([ibu])\}/g, '</$1>')
			// .replace(/\{\\([ibu])1\}/g, '<$1>')
			// .replace(/\{([ibu])\}/g, '<$1>')
			// .replace(/\{\/([ibu])\}/g, '</$1>')
			.replace(/\n\d+\s+/g,'\n')
			.replace(/,(?=\d{3})/g,'.')
			.replace(/^\d\s+/,'');
		/* let i = 0, r = /^\s*$/, //空行判定
		a = txt.trim().split('\r'),
		len = a.length;
		do {
			r.test(a[i]) && ++i;
			a[i++] = '';//删除索引行，然后处理下一行
			a[i] = a[i].replace(/,/g, '.');//时间行时间格式转换
			i += 3;
		} while(len > i);
		a[0] = 'WEBVTT\n'; */
		return URL.createObjectURL(new Blob([s], {'type': 'text/vtt'}));
	}

	async fetchVInfo() {
		const mobileUrl = `http://mobile.open.163.com/movie/${this.plid}/getMoviesForAndroid.htm`;
		const resp = await xfetch(mobileUrl);
		const v = resp.response.videoList.find(k => k.mid === this.mid);
		if (!v) {
			alert('该视频不存在或已被删除');
			throw new Error('停止执行脚本');
		}
		this.subtitleSum = v.subList.length;
		const vUrl = v.repovideourlOrigin || v.repovideourl || v.repovideourlmp4Origin || v.repovideourlmp4;
		const i = vUrl.lastIndexOf('_')+1;
		if (!i) this.vList[2].url = vUrl;
		else {
			const quality = vUrl.slice(i, -4);//清晰度
			const baseUrl = vUrl.slice(0, i);// r1(/^(.+?_?)([shd]+)?\.mp4$/, vUrl)
			for (let k of this.vList) {
				if (k.name === quality) {
					k.url = vUrl;
					break; //mobile视频一般为最低清晰度
				}
				const s = baseUrl + k.name + '.mp4';
				this._tasks.push(this.ping(s, k));
			}
		}
		this.qualityNum++;
		// 并发请求字幕，并处理
		for (let k of v.subList) {
			this.doSubtitle(k.subUrl, {
				title: k.subName,
				lang: k.subName == "英文" ? 'en': 'zh-cn',
				url: k.subUrl
			});
		}
	}

	createH5Player() {
		const qualitys = [];
		for (let k of this.vList) {
			k.url && qualitys.push({
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
	}

	setTrack() {
		this.player.video.innerHTML = this.tracksHtml;
		if (this.subtitleNum >1) this.player.video.textTracks[1].mode = 'showing';
	}
}

new App().run();