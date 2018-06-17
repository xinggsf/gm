// ==UserScript==
// @name         智能划词翻译
// @namespace    https://greasyfork.org/zh-CN/users/150560
// @version      1.5.1
// @description  划词翻译,自动切换谷歌翻译和有道词典
// @author       田雨菲  xinggsf
// @include      *
// @connect      dict.youdao.com
// @connect      translate.google.cn
// @grant        GM_xmlhttpRequest
// ==/UserScript==

'use strict';

var youdaoUrl = 'http://dict.youdao.com/jsonapi?xmlVersion=5.1&jsonversion=2&q=';
var googleUrl = 'https://translate.google.cn/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&source=input&hl=zh-CN&sl=auto&tl=';
var icon = document.createElement('span');
icon.innerHTML = `<svg style="margin:4px !important;" "width="24" height="24" viewBox="0 0 768 768">
	<path d="M672 640.5v-417c0-18-13.5-31.5-31.5-31.5h-282l37.5 129h61.5v-33h34.5v33h115.5v33h-40.5c-10.5 40.5-33 79.5-61.5 112.5l87 85.5-22.5 24-87-85.5-28.5 28.5 25.5 88.5-64.5 64.5h225c18 0 31.5-13.5 31.5-31.5zM447 388.5c7.5 15 19.5 34.5 36 54 39-46.5 49.5-88.5 49.5-88.5h-127.5l10.5 34.5h31.5zM423 412.5l19.5 70.5 18-16.5c-15-16.5-27-34.5-37.5-54zM355.5 339c0-7.381-0.211-16.921-3-22.5h-126v49.5h70.5c-4.5 19.5-24 48-67.5 48-42 0-76.5-36-76.5-78s34.5-78 76.5-78c24 0 39 10.5 48 19.5l3 1.5 39-37.5-3-1.5c-24-22.5-54-34.5-87-34.5-72 0-130.5 58.5-130.5 130.5s58.5 130.5 130.5 130.5c73.5 0 126-52.5 126-127.5zM640.5 160.5c34.5 0 63 28.5 63 63v417c0 34.5-28.5 63-63 63h-256.5l-31.5-96h-225c-34.5 0-63-28.5-63-63v-417c0-34.5 28.5-63 63-63h192l28.5 96h292.5z" style="fill:#3e84f4;"></svg>`;
icon.setAttribute('style', `
	width:32px!important;
	height:32px!important;
	display:none!important;
	background:#fff!important;
	border-radius:50%!important;
	box-shadow:4px 4px 8px #888!important;
	position:absolute!important;
	z-index:2147483647!important;
`);

var outTimer, overTimer;
// 添加翻译图标到 DOM
document.documentElement.appendChild(icon);
// 鼠标事件：防止选中的文本消失
icon.addEventListener('mousedown', e => e.preventDefault(), true);
// 鼠标事件：防止选中的文本消失
icon.addEventListener('mouseup', e => e.preventDefault(), true);

document.addEventListener('mouseup', function (e) {
	if (translateTip.rendered.includes(e.target)) // 点击了翻译内容面板
		return; // 不再创建翻译图标

	//console.log('mouseup!');
	var text = window.getSelection().toString().trim();
	if (text && icon.style.display != '') {
		icon.style.top = e.pageY + 12 + 'px';
		icon.style.left = e.pageX + 'px';
		icon.style.display = '';
		outTimer = setTimeout(() => {
			icon.style.display = 'none';
			outTimer = null;
		}, 1900);
	} else if (!text) {
		icon.style.display = 'none';
		translateTip.containerDestroy(); // 销毁翻译内容面板
	}
});
// 翻译图标点击事件
var clickIcon = function (e) {
	var text = window.getSelection().toString().trim();
	if (text) {
		icon.style.display = 'none';
		translateTip.containerDestroy(); // 销毁翻译内容面板
		// 新建翻译内容面板
		var container = translateTip.container();
		container.style.top = e.pageY + 'px';
		if (e.pageX + 350 <= document.body.clientWidth) // container 面板css最大宽度为250px
			container.style.left = e.pageX + 'px';
		else
			container.style.left = document.body.clientWidth - 350 + 'px';
		document.body.appendChild(container);
		translateTip.rendered.push(container);

		if (isChina(text)) {
			ajax(googleUrl + 'en&q=', text, 1, container);
		} else {
			if (countOfWord(text) == 1) {
				ajax(youdaoUrl, text, 0, container);
			} else {
				ajax(googleUrl + 'zh-CN&q=', text, 1, container);
			}
		}
	}
};
icon.addEventListener('click', clickIcon, true);

icon.addEventListener('mouseover', function (e) {
	if (outTimer) {
		clearTimeout(outTimer);
		outTimer = null;
	}

	overTimer = overTimer || setTimeout(clickIcon, 360, e);
}, true);
icon.addEventListener('mouseout', function (e) {
	if (overTimer) {
		clearTimeout(overTimer);
		overTimer = null;
	}

	outTimer = outTimer || setTimeout(() => {
		icon.style.display = 'none';
		outTimer = null;
	}, 360);
}, true);

function countOfWord(str) {
	var value = String(str).trim()
		.replace(/\s{2,}/g, " ");
	if (!value) return 0;

	var m = value.match(/\s/g);
	return m ? m.length + 1 : 1;
}

function isChina(str) {
	return /^[\u4E00-\u9FA5\uFF00-\uFF20\u3000-\u301C]/.test(str);
}
// ajax 跨域访问公共方法
function ajax(url, text, target, element, method, data, headers) {
	method = method || 'GET';
	// >>>因为Tampermonkey跨域访问(a.com)时会自动携带对应域名(a.com)的对应cookie
	// 不会携带当前域名的cookie
	// 所以，GM_xmlhttpRequest【不存在】cookie跨域访问安全性问题
	// 以下设置默认headers不起作用<<<
	url += encodeURIComponent(text);
	headers = headers || {'cookie': ''};
	GM_xmlhttpRequest({
		method: method,
		url: url,
		headers: headers,
		data: data,
		onload: function (res) {
			if (target == 0) {
				youdao(res.responseText, text, element);
			} else {
				google(res.responseText, element);
			}
		},
		onerror: function (res) {
			displaycontainer("连接失败\nURL: "+url, element);
		}
	});
}

// 有道翻译 引擎
function youdao(rst, text, element) {
	var ec = JSON.parse(rst).ec;
	if (!!ec) {
		var word = JSON.parse(rst).ec.word[0],
		html = '',
		tr = '';

		const { trs, ukphone, usphone, phone } = word;
		var phoneStyle = 'color:#9E9E9E!important;';
		if (!!ukphone && ukphone.length > 0) {
			html += '<span style="' + phoneStyle + '">英[' + ukphone + '] </span>';
		}
		if (!!usphone && usphone.length > 0) {
			html += '<span style="' + phoneStyle + '">美[' + usphone + '] </span>';
		}
		if (html.length > 0) {
			html += '<br />';
		} else if (!!phone && phone.length > 0) {
			html += '<span style="' + phoneStyle + '">[' + phone + '] </span><br />';
		}
		trs.forEach(element => {
			tr += element.tr[0].l.i[0] + '<br />';
		});
		html += tr;
		displaycontainer(html, element);
	} else {
		ajax(googleUrl + 'zh-CN&q=', text, 1, element);
	}
}

// 谷歌翻译 引擎
function google(rst, element) {
	let k, html = '',
	json = JSON.parse(rst);
	for (k of json.sentences) html += k.trans;
	displaycontainer(html, element);
}

function displaycontainer(text, element) {
	element.innerHTML = text;
	element.style.display = ''; // 显示结果
}

// 翻译结果面板
var translateTip = {
	// 存放已经生成的翻译内容面板（销毁的时候用）
	rendered: [],
	// 销毁已经生成的翻译内容面板
	containerDestroy: function () {
		for (let k of this.rendered) k.remove();
	},
	// 生成翻译结果面板 DOM （此时还未添加到页面）
	container: function () {
		var div = document.createElement('div');
		div.setAttribute('style',
			`display:none!important;
			position:absolute!important;
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
		return div;
	}
};