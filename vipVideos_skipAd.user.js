// ==UserScript==
// @name           vipVideos_skipAd
// @namespace      vipVideos_skipAd-xinggsf
// @author	       xinggsf
// @description    配合ABP去视频广告；开启GPU加速
// @homepageURL    https://greasyfork.org/scripts/8561
// updateURL       https://greasyfork.org/scripts/8561.js
// @include        http*
// @exclude        https://www.youtube.com/*
// @exclude        http://*.dj92cc.com/*
//全面支持音悦台HTML5播放，详见 https://greasyfork.org/scripts/14593
// @exclude        http://*.yinyuetai.com/*
// @version        2016.4.18
// @encoding       utf-8
// @grant          unsafeWindow
// ==/UserScript==

-function(doc, bd) {
"use strict";
let isEmbed, swfAddr,
swfBlockList = [
	'http://staticlive.douyutv.com/upload/signs/201',
	'http://www.kcis.cn/wp-content/themes/kcis/adv.',
	'http://www.kktv5.com/swf/copy.swf',
	'http://static.xcyo.com/swf/effect',
],
swfWhiteList = [
	'.pdim.gs/static/',//熊猫直播
	'http://v.6.cn/apple/player/',
	'.plures.net/pts/swfbin/player/live.swf',//龙珠直播
],
PLAYER_URL = [
	{
		urls: [
			/^http:\/\/static\.youku\.com\/.*?q?(?:play|load)er\w*\.swf/,
			/^http:\/\/player\.youku\.com\/player\.php\/sid\/(\w+).*?v\.swf$/,
			/^http:\/\/cdn\.aixifan\.com\/player\/cooperation\/AcFunXYouku\.swf/,
		],
		varsMatch: /VideoIDS=(\w+)/,
		format: youkuFormat,
		isProc: function(p, fv, src) {
			switch(true){
			case doc.domain.endsWith('acfun.tv'):
				fv = fv.match(/vid=(\w+)/);
				fv && setPlayer(p, youkuFormat(fv[1]));
				return !1;
			case !doc.domain.endsWith('youku.com'):
				fv = src.match(this.urls[1]) || src.match(this.varsMatch) ||
					 fv.match(this.varsMatch);
				fv && ykOutsitePlayer(fv[1], p);
				return !1;
			default:
				setTimeout(scrollTo(0, 99), 9);
				unsafeWindow._ssPlayer = p.outerHTML.replace('direct','gpu');
				doc.querySelector("div#ab_pip").outerHTML =
				'<a style="font-size:20px;" onclick="document.querySelector(\'#mplayer\').outerHTML=_ssPlayer, delete _ssPlayer, this.parentNode.removeChild(this);">换原播放器</a>';
				return !0;
			}
		}
	},{//iqiyi out
		urls: [
			/^https?:\/\/www\.iqiyi\.com\/(?:common\/flash)?player\/\d+\/(?:Share|Enjoy)?Player.*?\.swf/i,
			//^http:\/\/dispatcher\.video\.qiyi\.com\/disp\/shareplayer\.swf/,
			//^http:\/\/cdn\.aixifan\.com\/player\/cooperation\/AcFunXQiyi\.swf/,
		],
		run: function(p, src) {
			qyOutsiteFormat(p);
		}
	},{
		urls: [
			/^http:\/\/www\.iqiyi\.com\/common\/flashplayer/,
		],
		run: function(p, src) {
			var v = getFlashvars(p).replace(/&(?:cid|tipdataurl|\w+?Time|cpn\w|\w*?loader|adurl|yhls|exclusive|webEventID|videoIsFromQidan)=[^&]*/g,'') + '&cid=qc_100001_300089';
			setPlayer(p, iqiyiFormat(src,v));
		}
	},
];

function youkuFormat(vid) {
//下载https://raw.githubusercontent.com/xinggsf/gm/master/yk.swf到本地，可替换
	return `<embed id="mplayer" wmode="gpu" width="100%" height="100%" src="http://opengg.guodafanli.com/adkiller/player.swf" allowfullscreen="true" allowscriptaccess="always" type="application/x-shockwave-flash" flashvars="isShowRelatedVideo=true&showAd=0&show_ce=0&showsearch=0&VideoIDS=${vid}&isAutoPlay=true">`;
}
function ykOutsitePlayer(vid, p) {
	setPlayer(p, `<embed id="${p.id}" wmode="gpu" allowfullscreen="true" src="http://opengg.guodafanli.com/adkiller/player.swf" allowscriptaccess="always" type="application/x-shockwave-flash" width="${p.width}" height="${p.height}" flashvars="isShowRelatedVideo=false&showAd=0&show_ce=0&showsearch=0&VideoIDS=${vid}">`);
}
function qyOutsiteFormat(p) {
	let v = getFlashvars(p),
	//css = p.style.cssText,
	tvid = v.match(/\btvId=(\w+)/i)[1],
	definitionID = v.match(/\b(?:definitionID|sourceId|vid)=(\w+)/)[1],
	//http://dispatcher.video.qiyi.com/disp/shareplayer.swf http://minggo.coding.io/swf/
	s = `<embed width="100%" height="100%" allowscriptaccess="always" wmode="gpu" allowfullscreen="true" type="application/x-shockwave-flash" id="${p.id}" src="http://opengg.guodafanli.com/adkiller/iqiyi_out.swf" flashvars="vid=${definitionID}&tvid=${tvid}&autoPlay=1&showSearch=0&showSearchBox=0&autoHideControl=1&cid=qc_100001_300089&showDock=0">`;
	setPlayer(p, s);
	/* let id = p.id;
	p.outerHTML = p.outerHTML
	.replace(src, 'http://minggo.coding.io/swf/iqiyi_out.swf')
	.replace(src, 'http://opengg.guodafanli.com/adkiller/iqiyi_out.swf');
	openFlashGPU(doc.getElementById(id)); */
}
function iqiyiFormat(src, fvar) {
	return `<embed play="true" allowfullscreen="true" wmode="gpu" type="application/x-shockwave-flash" width="100%" height="100%" id="flash" allowscriptaccess="always" src="${src}" flashvars="${fvar}">`;
}
function openFlashGPU(p) {
	isEmbed ? p.setAttribute('wmode', 'gpu') : setObjectVal(p, 'wmode', 'gpu');
	refreshElem(p);
}
function isPlayer(p) {
	swfAddr = p.src || p.data || p.children.movie.value;
	if (swfWhiteList.some(function(x) {
		return swfAddr.includes(x);
	})) return !0;
	if (swfBlockList.some(function(x) {
		return swfAddr.startsWith(x);
	})) {
		p.parentNode.removeChild(p);
		return !1;
	}
	if (!p.width || parseInt(p.width) < 33 || parseInt(p.height) < 12) return !1;
	if (isEmbed) return p.getAttribute('allowFullScreen') === 'true';
	return /\ballowfullscreen\b/i.test(p.innerHTML);
}
function refreshElem(o) {
	let s = o.style.display;
	o.style.display = 'none';
	setTimeout(function () {
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
	name = name.toLowerCase();
	if (p.hasAttribute(name)) p.setAttribute(name, v);
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
	let t, v;
	for (t of PLAYER_URL) {
		if (t.urls.some(function(reg) {
			return reg.test(swfAddr);
		})) {
			if (t.run) {
				t.run(e, swfAddr);
				return;
			}
			v = getFlashvars(e);
			if (!t.isProc || t.isProc(e, v, swfAddr)) {
				v = v.match(t.varsMatch);
				v && setPlayer(e, t.format(v[1]));
			}
			return;
		}
	}
	openFlashGPU(e);
}
function callBack() {
	for (let k of doc.querySelectorAll('object,embed')) {
		isEmbed = 'EMBED' === k.tagName;
		if (isEmbed && 'OBJECT' === k.parentNode.tagName) continue;
		if (isPlayer(k)) {
			console.log(k, ' is player!');
			mo.disconnect();
			mo.takeRecords();
			mo = null;
			doPlayer(k);
			return;
		}
	}
}

if (window.chrome) {
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
}
let mo = new MutationObserver(callBack);
mo.observe(bd, {childList: true});
let div = doc.createElement('div');
bd.appendChild(div);
bd.removeChild(div);
}(document, document.body);