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

	startup() {
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

	fetchSubtitle() {

	}
}