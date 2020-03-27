// ==UserScript==
// @name         智能划词翻译
// @namespace    https://greasyfork.org/zh-CN/users/150560
// @version      1.6.2
// @description  划词翻译,自动切换谷歌翻译和有道词典
// @author       xinggsf  田雨菲
// @include      http*
// @run-at       document-start
// @connect      dict.youdao.com
// @connect      translate.google.cn
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/xinggsf/gm/master/word-translation.user.js
// ==/UserScript==

'use strict';
const youdaoUrl = 'http://dict.youdao.com/jsonapi?xmlVersion=5.1&dicts={"count":99,"dicts":[["ec"]]}&jsonversion=2&q=';
const googleUrl = 'https://translate.google.cn/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&source=input&hl=zh-CN&sl=auto&tl=';
const reHZ = /^[\u4E00-\u9FA5\uFF00-\uFF20\u3000-\u301C]/;

const countOfWord = s => s ? s.split(/\W+/).length : 0;
const isChina = s => reHZ.test(s);
// 翻译结果面板
class TranslateTip {
	constructor() {
		const div = document.createElement('div');
		div.setAttribute('style',
`position:absolute!important;
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
max-width:350px!important;
max-height:216px!important;
z-index:2147483647!important;`
		);
		document.documentElement.appendChild(div);
		//点击了翻译内容面板，不再创建翻译图标
		div.addEventListener('mouseup', e => e.stopPropagation());
		div.hidden = true;
		this._tip = div;
	}
	showText(text) { //显示翻译文本
		this._tip.innerHTML = text;
		this._tip.hidden = !1;
	}
	hide() {
		this._tip.innerHTML = '';
		this._tip.hidden = true;
	}
	pop(ev) {
		this._tip.style.top = ev.pageY + 'px';
		//面板最大宽度为350px
		this._tip.style.left = (ev.pageX + 350 <= document.body.clientWidth ?
			ev.pageX : document.body.clientWidth - 350) + 'px';
	}
}
const tip = new TranslateTip();

class Icon {
	constructor() {
		const icon = document.createElement('span');
		icon.innerHTML = `<svg style="margin:4px !important;" "width="24" height="24" viewBox="0 0 768 768">
			<path d="M672 640.5v-417c0-18-13.5-31.5-31.5-31.5h-282l37.5 129h61.5v-33h34.5v33h115.5v33h-40.5c-10.5 40.5-33 79.5-61.5 112.5l87 85.5-22.5 24-87-85.5-28.5 28.5 25.5 88.5-64.5 64.5h225c18 0 31.5-13.5 31.5-31.5zM447 388.5c7.5 15 19.5 34.5 36 54 39-46.5 49.5-88.5 49.5-88.5h-127.5l10.5 34.5h31.5zM423 412.5l19.5 70.5 18-16.5c-15-16.5-27-34.5-37.5-54zM355.5 339c0-7.381-0.211-16.921-3-22.5h-126v49.5h70.5c-4.5 19.5-24 48-67.5 48-42 0-76.5-36-76.5-78s34.5-78 76.5-78c24 0 39 10.5 48 19.5l3 1.5 39-37.5-3-1.5c-24-22.5-54-34.5-87-34.5-72 0-130.5 58.5-130.5 130.5s58.5 130.5 130.5 130.5c73.5 0 126-52.5 126-127.5zM640.5 160.5c34.5 0 63 28.5 63 63v417c0 34.5-28.5 63-63 63h-256.5l-31.5-96h-225c-34.5 0-63-28.5-63-63v-417c0-34.5 28.5-63 63-63h192l28.5 96h292.5z" style="fill:#3e84f4;"></svg>`;
		icon.setAttribute('style',
		`width:32px!important;
		height:32px!important;
		background:#fff!important;
		border-radius:50%!important;
		box-shadow:4px 4px 8px #888!important;
		position:absolute!important;
		z-index:2147483647!important;`
		);
		document.documentElement.appendChild(icon);
		icon.hidden = true;
		//拦截二个鼠标事件，以防止选中的文本消失
		icon.addEventListener('mousedown', e => e.preventDefault(), true);
		icon.addEventListener('mouseup', ev => ev.preventDefault(), true);
		icon.addEventListener('click', ev => {
			if (ev.ctrlKey) navigator.clipboard.readText()
			.then(text => {
				this.queryText(text.trim(),ev);
			})
			.catch(err => {
				console.error('Failed to read clipboard contents: ', err);
			});
			else {
				const text = window.getSelection().toString().trim().replace(/\s{2,}/g, ' ');
				this.queryText(text,ev);				
			}
		});
		this._icon = icon;
	}
	pop(ev) {
		const icon = this._icon;
		icon.style.top = ev.pageY + 12 + 'px';
		icon.style.left = ev.pageX + 'px';
		icon.hidden = !1;
		setTimeout(this.hide.bind(this), 2e3);
	}
	hide() {
		this._icon.hidden = true;
	}
	queryText(text,ev) {
		if (text) {
			icon.hidden = true;
			tip.pop(ev);
			const url = isChina(text) ? googleUrl +'en&q=' :
				countOfWord(text) == 1 ? youdaoUrl : googleUrl +'zh-CN&q=';
			ajax(url, text);
		}
	}
}
const icon = new Icon();

document.addEventListener('mouseup', function(e) {
	var text = window.getSelection().toString().trim();
	if (!text) {
		icon.hide();
		tip.hide();
	}
	else icon.pop(e);
});

function ajax(url, text) {
	const isYd = url.includes('//dict.youdao.');
	url += encodeURIComponent(text);
	GM_xmlhttpRequest({
		method: 'GET',
		responseType: 'json',
		url: url,
		onload: function(res) {
			isYd ? youdao(res.response, text) : google(res.response);
		},
		onerror: function(res) {
			tip.showText("连接失败\nURL: "+ url);
		}
	});
}

function youdao(rst, text) {
	if (!rst || !rst.ec) {
		ajax(googleUrl + 'zh-CN&q=', text);
		return;
	}
	const { trs, ukphone, usphone, phone } = rst.ec.word[0];
	let html = '';
	if (!!ukphone && ukphone.length > 0) {
		html = `<span style="color:#9E9E9E !important;">英[${ukphone}]</span>`;
	}
	if (!!usphone && usphone.length > 0) {
		html += `<span style="color:#9E9E9E !important;">美[${usphone}]</span>`;
	}
	if (html.length > 0) {
		html += '<br />';
	} else if (!!phone && phone.length > 0) {
		html += `<span style="color:#9E9E9E !important;">[${phone}]</span>`;
	}
	html += trs.map(el => el.tr[0].l.i[0]).join('<br />');
	tip.showText(html);
}

function google(rst) {
	let k, html = '';
	for (k of rst.sentences) html += k.trans;
	tip.showText(html);
}