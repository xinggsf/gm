/* globals Vue */
// ==UserScript==
// @name         智能划词翻译
// @namespace    translate.xinggsf
// @version      1.6.9
// @description  划词翻译。谷歌翻译和有道词典双引擎；CTRL + ?翻译剪贴板
// @author       xinggsf  田雨菲
// @include      http*
// @include      file://*
// @exclude      https://www.nunuyy*.html
// @exclude      https://www.dandanzan*.html
// @run-at       document-body
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @require      https://cdn.staticfile.org/vue/2.6.11/vue.min.js
// @connect      fanyi.youdao.com
// @connect      translate.googleapis.com
// ==/UserScript==

'use strict';
const youdaoUrl = 'http://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=';
const googleUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&source=input&hl=zh-CN&sl=auto&tl=';
const reHZ = /^[\u4E00-\u9FA5\uFF00-\uFF20\u3000-\u301C]/;

const countOfWord = s => s ? s.split(/\s+/).length : 0;
const isChina = s => reHZ.test(s);
const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) });
const xfetch = (url, type = 'json') => new Promise((success, fail) => {
	GM_xmlhttpRequest({
		method: 'GET',
		timeout: 3000,
		url: url,
		responseType: type,
		onload: success,
		onerror: fail,
		ontimeout: fail
	});
});

const comTranslate = {
	template: `<div class="gm-gg-yd-translate" height="0">
		<span class="icon" v-show="selText.length" :style="setPositionStyle" @click="doClick" @mousedown.stop.prevent @mouseup.stop.prevent>
		<svg style="margin:4px!important;" viewBox="0 0 768 768">
			<path d="M672 640.5v-417c0-18-13.5-31.5-31.5-31.5h-282l37.5 129h61.5v-33h34.5v33h115.5v33h-40.5c-10.5 40.5-33 79.5-61.5 112.5l87 85.5-22.5 24-87-85.5-28.5 28.5 25.5 88.5-64.5 64.5h225c18 0 31.5-13.5 31.5-31.5zM447 388.5c7.5 15 19.5 34.5 36 54 39-46.5 49.5-88.5 49.5-88.5h-127.5l10.5 34.5h31.5zM423 412.5l19.5 70.5 18-16.5c-15-16.5-27-34.5-37.5-54zM355.5 339c0-7.381-0.211-16.921-3-22.5h-126v49.5h70.5c-4.5 19.5-24 48-67.5 48-42 0-76.5-36-76.5-78s34.5-78 76.5-78c24 0 39 10.5 48 19.5l3 1.5 39-37.5-3-1.5c-24-22.5-54-34.5-87-34.5-72 0-130.5 58.5-130.5 130.5s58.5 130.5 130.5 130.5c73.5 0 126-52.5 126-127.5zM640.5 160.5c34.5 0 63 28.5 63 63v417c0 34.5-28.5 63-63 63h-256.5l-31.5-96h-225c-34.5 0-63-28.5-63-63v-417c0-34.5 28.5-63 63-63h192l28.5 96h292.5z" style="fill:#3e84f4;"></path>
		</svg>
		</span>
		<div class="tip" v-if="resultDOM.length" v-html="resultDOM" :style="setPositionStyle" @mouseup.stop></div>
	</div>`,
	data() {
		return {
			selText: '',
			resultDOM: '',
			position: { left: 0, top: 0 }
		}
	},
	methods: {
		showResult(text) { //显示翻译文本
			if (!this.resultDOM) this.resultDOM = text;
			else this.resultDOM += '<br><hr>' + text;
		},
		query() {
			const enc = encodeURIComponent(this.selText);
			const url = googleUrl + (isChina(this.selText) ? 'en&q=' : 'zh-CN&q=') + enc;
			this.selText = ''; // hide icon

			xfetch(url).then(r => {
				const ra = r.response.sentences; // 翻译结果数组
				if (ra) this.showResult('谷歌翻译：<br><hr>'+ ra.map(s => s.trans).join(''));
			})
			.catch (e => {
				this.showResult('谷歌服务器连接失败');
			});

			xfetch(youdaoUrl + enc, 'text').then(r => {
				const ro = JSON.parse(r.responseText.trim());
				if (!ro || ro.errorCode != 0) return;
				const html = ro.translateResult.reduce((a, b, i, arr) => {
					const content = b.map(s => s.tgt).join('<br>');
					return `${a}<p>${content}</p>`;
				}, '有道翻译：<br><hr>');
				this.showResult(html);
			})
			.catch (e => {
				this.showResult('有道服务器连接失败');
			});
		},
		async doClick(ev) {
			if (ev.ctrlKey) {
				this.selText = await readClipboard();
				this.selText = this.selText.trim().replace(/\s{2,}/g, ' ');
				if (!this.selText) return;
			}
			this.position.top = Math.min(this.position.top, window.innerHeight - 168);
			this.position.left = Math.min(this.position.left, window.innerWidth - 450);
			this.query();
		}
	},
	computed: {
		setPositionStyle() {
			return `left:${this.position.left}px;top:${this.position.top}px;`;
		}
	},
	mounted() {
		document.addEventListener('mouseup', async ev => {
			this.resultDOM = '';
			this.position.left = ev.clientX;
			this.position.top = ev.clientY + 12;
			this.selText = String(window.getSelection()).trim().replace(/\s{2,}/g, ' ');
			if (this.selText) {
				await sleep(2000);
				this.selText = '';
			}
		});
		document.addEventListener('keydown', async ev => {
			if (ev.ctrlKey && ev.keyCode == 191) {
				let text = await readClipboard();
				text = text.trim().replace(/\s{2,}/g, ' ');
				if (text) {
					this.selText = text;
					this.query();
				}
				else if (this.selText) this.query();
			}
		});
	}
};

GM_addStyle(`.gm-gg-yd-translate > .tip {
	position:fixed;
	z-index:21474836466 !important;
	font-size:13px!important;
	overflow:auto!important;
	background:#fff!important;
	font-family:sans-serif,Arial!important;
	font-weight:normal!important;
	text-align:left!important;
	color:#000!important;
	padding:0.5em 1em!important;
	line-height:1.5em!important;
	border-radius:5px!important;
	border:1px solid #ccc!important;
	box-shadow:4px 4px 8px #888!important;
	max-width:450px!important;
	max-height:333px!important;
}
.gm-gg-yd-translate > .icon {
	position:fixed;
	z-index:21474836466 !important;
	width:32px!important;
	height:32px!important;
	background:#fff!important;
	border-radius:50%!important;
	box-shadow:4px 4px 8px #888!important;
}`);

const vm = new Vue({
	render: h => h(comTranslate)
}).$mount();
document.documentElement.appendChild(vm.$el);

async function readClipboard() {
	if (!window.isSecureContext) {
		alert('不安全页面不允许读取剪贴板！');
		return
	}
	await navigator.permissions.query({name: 'clipboard-read'});
	try {
		return await navigator.clipboard.readText();
	} catch (ex) {
		alert('请允许读取剪贴板！')
	}
}