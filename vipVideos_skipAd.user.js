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
// @version        2016.7.19
// @encoding       utf-8
// @grant          unsafeWindow
// ==/UserScript==

-function(doc, bd) {
"use strict";
let isEmbed, swfAddr,
regYk = /VideoIDS=(\w+)/,
//已处理flash http://minggo.coding.io/swf/
playerAddrs = ['http://opengg.guodafanli.com/adkiller/'],
swfWhiteList = [
	'.pdim.gs/static/',//熊猫直播
	'http://v.6.cn/apple/player/',
	'.plures.net/pts/swfbin/player/live.swf',//龙珠直播
	'http://www.gaoxiaovod.com/ck/player.swf',
	'http://assets.dwstatic.com/video/',//yy,虎牙
],
PLAYER_URL = [
	{
		urls: [/^http:\/\/static\.youku\.com\/v.*?(?:play|load)er/],
		run: function(p, v) {
			if (doc.domain.endsWith('youku.com')) {
				unsafeWindow.scrollTo(0, 99);
				unsafeWindow._ssPlayer = p.outerHTML.replace('direct','gpu');
				unsafeWindow.document.querySelector("div#ab_pip").outerHTML =
				'<a style="font-size:20px;" onclick="document.querySelector(\'#movie_player\').outerHTML=_ssPlayer, delete _ssPlayer, this.parentNode.removeChild(this);">换原播放器</a>';
			}
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
	},/* {//iqiyi out
		urls: [
			/^http:\/\/dispatcher\.video\.qiyi\.com\/disp\/shareplayer\.swf/,
			/^http:\/\/cdn\.aixifan\.com\/player\/cooperation\/AcFunXQiyi\.swf/,
		],
		run: qyOutsiteFormat
	}, */{//iqiyi
		urls: [/^http:\/\/www\.iqiyi\.com\/common\/flashplayer/],
		run: iqiyiFormat
	},
];

function youkuFormat(vid) {
	return `<embed id="movie_player" wmode="gpu" width="100%" height="100%" src="${playerAddrs[0]}player.swf" allowfullscreen="true" allowscriptaccess="always" type="application/x-shockwave-flash" flashvars="isShowRelatedVideo=true&showAd=0&show_ce=0&showsearch=0&VideoIDS=${vid}&isAutoPlay=true">`;
}
function ykOutsitePlayer(vid, p) {
	setPlayer(p, `<embed id="${p.id}" wmode="gpu" allowfullscreen="true" src="${playerAddrs[0]}player.swf" allowscriptaccess="always" type="application/x-shockwave-flash" width="${p.width}" height="${p.height}" flashvars="isShowRelatedVideo=false&showAd=0&show_ce=0&showsearch=0&VideoIDS=${vid}">`);
}
function qyOutsiteFormat(p, v) {
	let tvid = v.match(/\btvId=(\w+)/i)[1],
	definitionID = v.match(/\b(?:definitionID|sourceId|vid)=(\w+)/)[1],
	//${playerAddrs[0]}iqiyi_out.swf
	s = `<embed width="100%" height="100%" allowscriptaccess="always" wmode="gpu" allowfullscreen="true" type="application/x-shockwave-flash" id="${p.id}" src="${playerAddrs[0]}iqiyi_out.swf" flashvars="vid=${definitionID}&tvid=${tvid}&autoPlay=1&showSearch=0&showSearchBox=0&autoHideControl=1&cid=qc_100001_300089&showDock=0">`;
	setPlayer(p, s);
}
function iqiyiFormat(p, v) {
	let s = v.replace(/&(?:cid|\w+?Time|cpn\w|\w*?loader|adurl|exclusive)=[^&]*/g, '') + '&cid=qc_100001_300089';
	s = `<embed play="true" allowfullscreen="true" wmode="gpu" type="application/x-shockwave-flash" width="100%" height="100%" id="flash" allowscriptaccess="always" src="${swfAddr}" flashvars="${s}">`;
	setPlayer(p, s);
	//setFlashParam(p, {'wmode': 'gpu','flashvars': s});
}
function openFlashGPU(p) {
	isEmbed ? p.setAttribute('wmode', 'gpu') : setFlashParam(p, {'wmode': 'gpu'});
	//p.parentNode.replaceChild(p.cloneNode(true), p);
	refreshElem(p);
}
function refreshElem(o) {
	let s = o.style.display;
	o.style.display = 'none';
	setTimeout(() => {
		s ? o.style.display = s : o.style.removeProperty('display');
		if ('' === o.getAttribute('style'))
			o.removeAttribute('style');
	}, 9);
}
function isPlayer(p) {
	if (swfWhiteList.some(x => swfAddr.includes(x))) return !0;
	if (!p.width) return !1;
	if (p.width.endsWith('%')) return !0;
	if (parseInt(p.width) < 233 || parseInt(p.height) < 53) return !1;
	return isEmbed ? p.matches('[allowFullScreen]') :
		/"allowfullscreen"/i.test(p.innerHTML);
}
function setPlayer(play, oHtml) {
	console.log('new player: ', oHtml);
	play.outerHTML = oHtml;
}
function setFlashParam(p, values) {
	let i, o, e = p.querySelector('embed');
	for (i in values) {
		if (e) e.setAttribute(i, values[i]);
		p.hasAttribute(i) && p.setAttribute(i, values[i]);
	}
	for (o of p.childNodes) {
		i = o.name.toLowerCase();
		if (i in values) {
			o.value = values[i];
			delete values[i];
		}
	}
	for (i in values) {
		e = doc.createElement('param');
		e.name = i;
		e.value = values[i];
		p.appendChild(e);
	}
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
}(document, document.body);