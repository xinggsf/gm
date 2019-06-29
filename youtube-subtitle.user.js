// ==UserScript==
// @name             youtube-subtitle
// @namespace        youtube-subtitle.xinggsf
// @description      Set subtitle of youtube
// @description-zh   设置油管的字幕，从而显示双字幕
// @version          0.0.1
// @homepage         http://bbs.kafan.cn/thread-2093014-1-1.html
// @include          https://www.youtube.com/watch?v=*
// @grant            unsafeWindow
// @grant            GM_addStyle
// @grant            GM_setValue
// @grant            GM_getValue
// @updateURL  https://raw.githubusercontent.com/xinggsf/gm/master/youtube-subtitle.user.js
// ==/UserScript==
'use strict';
class Subtitle{
	constructor() {
		this.lang = GM_getValue('language', '') || navigator.language || navigator.browserLanguage;
		let a = this.lang.split('-');
		if (a[1]) {//IE: browserLanguage == 'zh-cn'
			a[1] = a[1].toUpperCase();
			this.lang = a.join('-');
		}
	}

	start() {
		const t = setInterval(()=>{
			if (this.checkVar()) {
				clearInterval(t);
				if (this.getSubtitleUrl()) {
					this.fetchSubtitle();
					GM_addStyle(
`<track kind="subtitles" label="${i}" src="${url}" srclang="${lang}" default>`
`::cue {
	color: #ACF;
	background: transparent;
	text-shadow: black 0 0 0.2em;
	font-size: 1.1em;
}`
					)
				}
			}
		}, 300);
	}
	// 检查YT变量
	checkVar() {
		let p = unsafeWindow.ytplayer;
		if (p && p.config && p.config.args) {
			p = p.config.args;
			this.vid = p.vid;
			this.title = p.title;
			p = JSON.parse(p.player_response);
			this.tracks = p.captions && p.captions.playerCaptionsTracklistRenderer.captionTracks;
		}
	}

	getSubtitleUrl() {
		// firstLang = 'zh-cn', secondLang = 'en'
		if (!this.tracks) return !1;//无字幕
		var baseURL = '';
		var lang = language_code.split('-', 1)[0];

		var a = this.tracks.filter(k => k.languageCode === this.lang);
		if (a.length == 1) return a[0].baseUrl;
		if (a.length > 1) return a.find(k => 'asr' !== k.kind).baseUrl;

		if (language_code !== lang) {
			var res = this.tracks.find(k => k.languageCode.startsWith(lang));
			if (res) return res.baseUrl;
		}
		var a = this.tracks.filter(k => k.isTranslatable);
		if (!a.length) return;//无可翻译字幕
		if (lang == 'zh') lang = language_code === 'zh-cn' ? 'zh-Hans': 'zh-Hant';
		else lang = language_code;
		if (a.length > 1) {
			a = a.filter(k => 'asr' !== k.kind);// 排除自动生成的字幕
			return a[0].baseURL + "&tlang=" + lang;
		}

		for (var caption of this.tracks) {
			if (caption.isTranslatable && caption.languageCode === language_code) {
				baseURL = caption.baseUrl;
			}
		}
		if (baseURL == '') {
			return false; // 上面的 loop 要是没找到对应的语言，导致 url 是空，那也只能返回  false
		}
		var chinese_subtitle_url = baseURL + "&tlang=zh-Hans"; // 转成简中字幕。 zh-Hant 繁体中文
		return chinese_subtitle_url;
	}

	downloadSubtitle() {
		var url = get_chinese_subtitle_url(from_language_code);
		fetch(url)
		.then(r=> r.text())
		.then(r=>{
			const xml = new DOMParser().parseFromString(r, 'text/xml');
			var p, c = xml.getElementsByTagName('p');
			var a = ['WEBVTT'],
			start_time, start, end_time, end, content;
			// 保存结果的字符串
			for (var i = 0, l = c.length; i < l; i++) {
				p = c[i];
				content = p.textContent;
				start = p.getAttribute('t');
				start_time = this.process_time(start);
				end = ~~start + ~~p.getAttribute('d');
				if (!end) end = start + 3000;
				end_time = process_time(end);
				// ==== 开始处理数据 ====
				// 标准srt时间轴: 00:00:01,850 --> 00:00:02,720
				a.push(`\n\n${start_time} --> ${end_time}\n`);
				// 加字幕内容
				a.push(content);
			}
			var url = URL.createObjectURL(new Blob(a), {'type': 'text/vtt'});
			var title = get_file_name(language_name_1c7);
			downloadFile(title, result);
			// 下载

		}).catch(()=>{
			alert("Error: No response from server.");
		});

	}
	// 处理时间. 比如 start="671.33"  start="37.64"  start="12" start="23.029"
	// 处理成 srt 时间, 比如 00:00:00,090    00:00:08,460    00:10:29,350
	processTime(t) {
		//var [s, ms] = t.toFixed(3).split('.');
		var ms, s, m, h;
		if ('string' != typeof t) {
			ms = t % 1000;
			s = t / 1000 | 0;
		} else {
			ms = t.slice(-3);
			s = t.slice(0, -3) | 0;
		}

		h = m = 0;
		if (s >= 60) {
			m = s / 60 | 0;
			s %= 60;
			h = m / 60 | 0;
			m %= 60;
		}

		if (h < 10) h = '0' + h;
		if (m < 10) m = '0' + m;
		if (s < 10) s = '0' + s;
		return `${h}:${m}:${s}.${ms}`;
	}
}