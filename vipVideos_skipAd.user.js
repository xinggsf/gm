// ==UserScript==
// @name           vipVideos_skipAd
// @namespace      vipVideos_skipAd-xinggsf
// @author         xinggsf
// @description    配合ABP去视频广告；开启GPU加速
// @homepageURL    https://greasyfork.org/scripts/8561
// updateURL       https://greasyfork.org/scripts/8561.js
// @include        http*
// @exclude        https://www.youtube.com/*
// @exclude        http://*.dj92cc.com/*
//全面支持音悦台HTML5播放，详见 https://greasyfork.org/scripts/14593
// @exclude        http://*.yinyuetai.com/*
// @version        2016.6.11
// @encoding       utf-8
// @grant          unsafeWindow
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_setClipboard
// ==/UserScript==

-function(doc, bd) {
"use strict";
let isEmbed, swfAddr,
regYk = /VideoIDS=(\w+)/,
playerAddrs = ['http://minggo.coding.io/swf/'],//已处理flash
swfWhiteList = [
	'.pdim.gs/static/',//熊猫直播
	'http://v.6.cn/apple/player/',
	'.plures.net/pts/swfbin/player/live.swf',//龙珠直播
	'http://www.gaoxiaovod.com/ck/player.swf',
],
PLAYER_URL = [
	{
		urls: [/^http:\/\/static\.youku\.com\/v.*?(?:play|load)er/],
		run: function(p, v) {
			setTimeout(scrollTo(0, 99), 9);
			unsafeWindow._ssPlayer = p.outerHTML.replace('direct','gpu');
			unsafeWindow.document.querySelector("div#ab_pip").outerHTML =
			'<a style="font-size:20px;" onclick="document.querySelector(\'#movie_player\').outerHTML=_ssPlayer, delete _ssPlayer, this.parentNode.removeChild(this);">换原播放器</a>';
			v = v.match(regYk);
			v && setPlayer(p, youkuFormat(v[1]));
		}
	},{//acfun.youku
		urls: [/^http:\/\/cdn\.aixifan\.com\/player\/cooperation\/AcFunXYouku\.swf/],
		run: function(p, v) {
			v = v.match(/vid=(\w+)/);
			v && setPlayer(p, youkuFormat(v[1]));
		}
	},{//youku outsite
		urls: [/^http:\/\/player\.youku\.com\/player\.php\/sid\/(\w+)/],
		run: function(p, v) {
			v = swfAddr.match(this.urls[0]) || swfAddr.match(regYk) || v.match(regYk);
			v && ykOutsitePlayer(v[1], p);
		}
	},{//iqiyi out
		urls: [
			/^https?:\/\/www\.iqiyi\.com\/(?:common\/flash)?player\/\d+\/(?:Share|Enjoy)?Player.*?\.swf/i,
			//^http:\/\/dispatcher\.video\.qiyi\.com\/disp\/shareplayer\.swf/,
			//^http:\/\/cdn\.aixifan\.com\/player\/cooperation\/AcFunXQiyi\.swf/,
		],
		run: qyOutsiteFormat
	},{//iqiyi
		urls: [/^http:\/\/www\.iqiyi\.com\/common\/flashplayer/],
		run: iqiyiFormat
	},/* {//qq video
		urls: [/^http:\/\/imgcache\.qq\.com\/tencentvideo_v1\/player\/TencentPlayer\.swf/],
		run: doQQPlayer
	}, */
];

function youkuFormat(vid) {
	return `<embed id="movie_player" wmode="gpu" width="100%" height="100%" src="http://minggo.coding.io/swf/player.swf" allowfullscreen="true" allowscriptaccess="always" type="application/x-shockwave-flash" flashvars="isShowRelatedVideo=true&showAd=0&show_ce=0&showsearch=0&VideoIDS=${vid}&isAutoPlay=true">`;
}
function ykOutsitePlayer(vid, p) {
	setPlayer(p, `<embed id="${p.id}" wmode="gpu" allowfullscreen="true" src="http://minggo.coding.io/swf/player.swf" allowscriptaccess="always" type="application/x-shockwave-flash" width="${p.width}" height="${p.height}" flashvars="isShowRelatedVideo=false&showAd=0&show_ce=0&showsearch=0&VideoIDS=${vid}">`);
}
function qyOutsiteFormat(p, v) {
	let tvid = v.match(/\btvId=(\w+)/i)[1],
	definitionID = v.match(/\b(?:definitionID|sourceId|vid)=(\w+)/)[1],
	//http://dispatcher.video.qiyi.com/disp/shareplayer.swf http://opengg.guodafanli.com/adkiller/
	s = `<embed width="100%" height="100%" allowscriptaccess="always" wmode="gpu" allowfullscreen="true" type="application/x-shockwave-flash" id="${p.id}" src="http://minggo.coding.io/swf/iqiyi_out.swf" flashvars="vid=${definitionID}&tvid=${tvid}&autoPlay=1&showSearch=0&showSearchBox=0&autoHideControl=1&cid=qc_100001_300089&showDock=0">`;
	setPlayer(p, s);
}
function iqiyiFormat(p, v) {
	let s = v.replace(/&(?:cid|tipdataurl|\w+?Time|cpn\w|\w*?loader|adurl|exclusive)=[^&]*/g, '') + '&cid=qc_100001_300089';
	s = `<embed play="true" allowfullscreen="true" wmode="gpu" type="application/x-shockwave-flash" width="100%" height="100%" id="flash" allowscriptaccess="always" src="${swfAddr}" flashvars="${s}">`;
	setPlayer(p, s);
}
/* function doQQPlayer(p, v) {
	let vid = v.match(/\bvid=(\w+)/)[1],
	cid = v.match(/\bcid=(\w+)/)[1],
	s = `<embed id="player" wmode="gpu" width="100%" height="100%" allowscriptaccess="always" allowfullscreen="true" type="application/x-shockwave-flash" src="http://cache.tv.qq.com/QQPlayer.swf" flashvars="vid=${vid}&autoplay=1&list=2&adplay=0&cid=${cid}&showcfg=1&title=版权来源：腾讯视频&rightpanel=0&share=0&popup=0&showend=0">`;
	setPlayer(p, s);
	playerAddrs.push('http://cache.tv.qq.com/QQPlayer.swf');
} */
function openFlashGPU(p) {
	isEmbed ? p.setAttribute('wmode', 'gpu') : setObjectVal(p, 'wmode', 'gpu');
	//p.parentNode.replaceChild(p.cloneNode(true), p);
	refreshElem(p);
}
function isPlayer(p) {
	if (swfWhiteList.some(x => swfAddr.includes(x))) return !0;
	if (!p.width) return !1;//p.parentNode.removeChild(p);
	if (p.width.endsWith('%')) return !0;
	if (parseInt(p.width) < 233 || parseInt(p.height) < 53) return !1;
	return isEmbed ? p.matches('[allowFullScreen]') :
		/"allowfullscreen"/i.test(p.innerHTML);
	//[].some.call(p.children, t => t.name.toLowerCase() === 'allowfullscreen')
}
function refreshElem(o) {
	let s = o.style.display;
	o.style.display = 'none';
	setTimeout(() => {
		s ? o.style.display = s : o.style.removeProperty('display');
	}, 9);
}
function setPlayer(play, oHtml) {
	console.log('new player: ', oHtml);
	play.outerHTML = oHtml;
}
function setObjectVal(p, name, v) {
	let e = p.querySelector('embed');
	e && e.setAttribute(name, v);
	p.hasAttribute(name) && p.setAttribute(name, v);
	name = name.toLowerCase();
	for (let o of p.childNodes) {
		if (o.name && o.name.toLowerCase() === name) {
			o.value = v;
			return;
		}
	}
	e = doc.createElement('param');
	e.name = name;
	e.value = v;
	p.appendChild(e);
}
function getFlashvars(p) {
	let s = 'flashvars';
	if (isEmbed) return p.getAttribute(s);
	if (!p.children[s]) s = 'flashVars';
	return p.children[s].value;
}
function doPlayer(e) {
	for (let t of PLAYER_URL) {
		if (t.urls.some(reg => reg.test(swfAddr))) {
			if (t.run) t.run(e, getFlashvars(e));
			return;
		}
	}
	openFlashGPU(e);
}

if (window.chrome)
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
new MutationObserver(function() {
	for (let k of doc.querySelectorAll('object,embed')) {
		isEmbed = k.matches('embed');
		if (isEmbed && k.parentNode.matches('object'))
			continue;
		swfAddr = isEmbed ? k.src : k.data || k.children.movie.value;
		if (!/\.swf(?:$|\?)/.test(swfAddr) || playerAddrs.some(s => swfAddr.startsWith(s)))
			continue;
		playerAddrs.push(swfAddr);
		if (isPlayer(k)) {
			console.log(k, swfAddr, ' is player!');
			doPlayer(k);
		}
	}
}).observe(bd, {childList: true, subtree: true});
let div = doc.createElement('div');
bd.appendChild(div);
bd.removeChild(div);
if (GM_getValue('unread', !0)) {
	GM_setValue('unread', !1);
	if (confirm('作者已经迭代了几十个版本，为更好的支持后续开发，你愿意捐助吗？\n（支付宝帐号xinggsf@21cn.com已复制到剪贴板，捐助后保留转帐信息可能有惊喜）'))
		GM_setClipboard('xinggsf@21cn.com');
}
}(document, document.body);