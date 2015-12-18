// ==UserScript==
// @name           vipVideos_skipAd
// @namespace      vipVideos_skipAd-xinggsf
// @author	       xinggsf~gmail。com
// @description    油库、土逗 VIP免费看；配合ABP去视频广告；开启GPU加速
// @homepageURL    https://greasyfork.org/scripts/8561
// updateURL       https://greasyfork.org/scripts/8561.js
// @include        http*
// @exclude        http://v.qq.com/*
// @exclude        http://*.baidu.com/*
//芒果TV加速不了！反而加大CPU占用，芒果真垃圾
// @exclude        http://www.hunantv.com/*
//全面支持音悦台HTML5播放，详见 https://greasyfork.org/scripts/14593
// @exclude        http://*.yinyuetai.com/*
// exclude        http://www.flv.tv/*
// @version        2015.12.15
// @encoding       utf-8
// @grant          unsafeWindow
// grant          GM_openInTab
// ==/UserScript==
/*
作者的话：经过实际测试，高版本chrome，如46+已经解决CSS3动画BUG了。
此BUG在脚本表现为在某些页面使其原有菜单、DIV浮动框显示不出来！
所以这样的BUG反馈请不要再提，升级浏览器才是正道！
吐糟二大浏览器：chrome的class功能很早就出来了，但实现很简单的箭头函数却
至今未有！firefox则相反，箭头函数和其它ES6功能早出来了，类功能却迟迟盼不来！

2015-12-14 iqiyi播放器升级，外链视频最高分辨率只支持到高清。建议到iqiyi.com观看
2015-12-13感谢饭友"吃饭好香"提供播放器空间;解决油库不能全屏的问题
2015-12-11用严格模式重构;使用ES6字符串模板、大幅使用本地变量let,const
2015-12-8更新油库播放器，可选择P1080分辨率；
彻底解决油库盗链问题；
解决NNAPI Flash不能播放的问题
2015-12-6增加对acfun.tv的油库、iqiyi外链支持

开启GPU硬件加速，如显卡不支持，换direct!参考了thunderhit的代码:
https://greasyfork.org/zh-CN/scripts/6479，但用定时器太低效了

doc.querySelectorAll('div') instanceof NodeList
bd.childNodes instanceof NodeList
true
bd.children instanceof NodeList == false
bd.children.constructor: HTMLCollection
*/
-function(doc, bd) {
"use strict";
let isEmbed, style = doc.createElement('style');
style.textContent = '@-webkit-keyframes gAnimatAct{from{opacity:0.99;}to{opacity:1;}}@keyframes gAnimatAct{from{opacity:0.99;}to{opacity:1;}}embed,object{animation:gAnimatAct 1ms;-webkit-animation:gAnimatAct 1ms;}';
doc.head.appendChild(style);
let PLAYER_URL = [
	{
		urls: [
			/^http:\/\/static\.youku\.com\/.*?q?(?:play|load)er\w*\.swf/,
			/^http:\/\/player\.youku\.com\/player\.php\/.*?sid\/(.*?)\/.*?v\.swf$/,
			/^http:\/\/cdn\.aixifan\.com\/player\/cooperation\/AcFunXYouku\.swf/,
		],
		varsMatch: /VideoIDS=(\w+)/,
		format: youkuFormat,
		isProc: function(p, fv, src) {
			//console.log('isProc func');
			switch(true){
				case doc.domain.endsWith('acfun.tv'):
					fv = fv.match(/vid=(\w+)/);
					fv && setPlayer(p, youkuFormat(fv[1]));
					return !1;
				case !doc.domain.endsWith('youku.com'):
					fv = src.match(this.urls[1]) || src.match(this.varsMatch) || fv.match(this.varsMatch);
					fv && ykOutsitePlayer(fv[1], p);
					return !1;
				default:
					doc.addEventListener('DOMNodeInserted', function (ev) {
						let e = ev.target;
						if (/SCRIPT|IKUADAPTER/.test(e.tagName) ||
							e.id === 'ikuadapter'
						) ev.relatedNode.removeChild(e);
					}, !1);
					setTimeout(scrollTo(0, 99), 9);
					//加入一个按钮
					unsafeWindow._ssPlayer = p.outerHTML.replace('direct','gpu');
					doc.querySelector("div#ab_pip").outerHTML =
					'<a style="font-size:20px;" onclick="document.querySelector(\'#mplayer\').outerHTML=_ssPlayer, delete _ssPlayer, this.parentNode.removeChild(this);">换原播放器</a>';
					return !0;
			}
		}
	},{
		urls: [/^http:\/\/js\.tudouui\.com\/.*?Player.*?\.swf/],
		format: youkuFormat,
		varsMatch: /vcode=([^&]+)/,
		isProc: function(p, fv, src) {
			if (!doc.domain.endsWith('tudou.com')) {
				openFlashGPU(p);
			}
			return !1;
			setTimeout(scrollTo(0, 99), 9);
			//有播放时间限制即替换播放器
			if (! /paidTime=\d{2,}&/.test(fv)) {
				setObjectVal(p, 'wmode', 'gpu');
				return !1;
			}
			var div = doc.querySelector("#summary>div:last-of-type");
			div.innerHTML = '<a id="a-rpPlayer" style="font-size:20px;cursor:pointer;" onclick="document.querySelector(\'#mplayer\').outerHTML=this._ssPlayer,this.parentNode.removeChild(this);">换原播放器</a>';
			div.style.display = 'block';
			unsafeWindow.document.getElementById('a-rpPlayer')._ssPlayer = p.outerHTML.replace('direct','gpu');
			return !0;
		}
	},{
		urls: [
			/^http:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/MainPlayer_\w+\.swf/,
			/^http:\/\/cdn\.aixifan\.com\/player\/cooperation\/AcFunXQiyi\.swf/,
			/^http:\/\/dispatcher\.video\.qiyi\.com\/disp\/shareplayer\.swf/,
		],
		run: function(p, src) {
			var v = getFlashvars(p);
			if (doc.domain.endsWith('iqiyi.com')){
				v = v.replace(/&(?:cid|tipdataurl|\w+?Time|cpn\w|\w+?loader|adurl|yhls|exclusive|webEventID|videoIsFromQidan)=[^&]*/g,'') + '&cid=qc_100001_300089';
				setPlayer(p, iqiyiFormat(src,v));
			} else {
				var tvid = v.match(/\btvId=(\w+)/i)[1],
				definitionID = v.match(/\b(?:definitionID|sourceId|vid)=(\w+)/)[1];
				setPlayer(p, `<embed width="100%" height="100%" allowscriptaccess="always" wmode="gpu" allowfullscreen="true" type="application/x-shockwave-flash" src="http://dispatcher.video.qiyi.com/disp/shareplayer.swf" flashvars="vid=${definitionID}&tvid=${tvid}&autoPlay=1&showSearch=0&showSearchBox=0&autoHideControl=1&cid=qc_100001_300089&bd=1&showDock=0">`);
			}
		}
	}, {
		urls: [
		/^http:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/PPS\w+\.swf/,
		//安装PPS插件才能播放
		// /^http:\/\/www\.iqiyi\.com\/player\/cupid\/common\/pps_\w+\.swf/
		],
		run: function(p, src) {
			var s = getFlashvars(p);
			if (s.indexOf('&cid=') === -1) {
				alert('不支持！安装PPS插件才能播放！');
				return;
			}
			s = s.replace(/&?(?:cid|coreUrl|tipdataurl|preloader|adurl|P00001|expandState)=[^&]+/g,'') +'&cid=qc_100001_300089';
			setPlayer(p, iqiyiFormat(src, s));
		}
	}, {
		urls: [
			/^http:\/\/(?:\d+\.){3}\d+\/(?:test|web)player\/Main\w*\.swf$/,
			/^http:\/\/tv\.sohu\.com\/upload\/swf\/.+?\/Main\.swf$/,
		],
		//http://update.adbyby.com/swf/sohu_livezb.swf
		//http://opengg.guodafanli.com/adkiller/sohu_live.swf
		run: function(p, src) {
			//if (!doc.domain.endsWith('tv.sohu.com')) return;
			var s = p.getAttribute('flashvars')
				.replace(/&(?:plid|api_key|on\w*?Ad\w*)=[^&]*/g, '')
				//.replace(/(&on\w*?Ad\w*=)[^&]*/g,'$1')
				+ '&plid=7038006&api_key=647bfb88a84fc3c469d289f961993be6';
			s = p.outerHTML.replace(/(flashvars=")[^"]+/, '$1'+ s)
				//.replace(src, 'http://100.100.100.100/sohu_live.swf')
				.replace(/(wmode=")\w+/, '$1gpu');
			setPlayer(p, s);
		}
	}
];

function youkuFormat(vid) {
//下载https://raw.githubusercontent.com/xinggsf/gm/master/yk.swf到本地，可替换
	return `<embed id="mplayer" wmode="gpu" src="http://www.300.la/filestores/2015/12/17/95103f682362f42ba8e91e41b76c6f5e.swf?VideoIDS=${vid}&isAutoPlay=true" allowfullscreen="true" allowscriptaccess="always" type="application/x-shockwave-flash" width="100%" height="100%">`;
	//return `<iframe id="mplayer" width="100%" height="100%" src="http://img2.ct2t.net/flv/youku/151126/player.swf?VideoIDS=${vid}&isAutoPlay=true" frameborder="no" border="0" scrolling="no">`;
}
//100.100.100.100/player.swf
function ykOutsitePlayer(vid, p) {
	setPlayer(p, `<embed id="mplayer" wmode="gpu" src="http://www.300.la/filestores/2015/12/17/95103f682362f42ba8e91e41b76c6f5e.swf?VideoIDS=${vid}" allowfullscreen="true" allowscriptaccess="always" type="application/x-shockwave-flash" width="${p.width}" height="${p.height}">`);
}

function iqiyiFormat(src, fvar) {
	return `<embed play="true" allowfullscreen="true" wmode="gpu" type="application/x-shockwave-flash" width="100%" height="100%" id="flash" allowscriptaccess="always" src="${src}" flashvars="${fvar}">`;
}

function openFlashGPU(p) {
	isEmbed ? p.setAttribute('wmode', 'gpu') :
		setObjectVal(p, 'wmode', 'gpu');
	delEvent();
	if (window.chrome) refreshElem(bd);
	// refreshElem(p.offsetParent);
}
function isPlayer(p) {
	if (!p.width || p.width < 33 || p.height < 12) return !1;
	if (isEmbed) return p.getAttribute('allowFullScreen') === 'true';
	return /\ballowfullscreen\b/i.test(p.innerHTML);//整字匹配
	//chrome下[].some.call在此处有问题：不能返回正确值
/* 	let c = p.querySelectorAll('param[value=true]');
	for (let t, i = c.length; t = c[--i];) {
		if (t.name.toLowerCase() === 'allowfullscreen')
			return !0;
	}
	return !1; */
}
function refreshElem(o) {
	let s = o.style.display;
	o.style.display = 'none';
	setTimeout(function () {
		o.style.display = s;
	}, 9);
}
function delEvent() {
	bd.removeEventListener('animationstart', onAnimationStart);
	bd.removeEventListener('webkitAnimationStart', onAnimationStart);
	bd.removeEventListener('oAnimationStart', onAnimationStart);
	doc.head.removeChild(style);
}
function setPlayer(play, oHtml) {
	console.log('new player: ', oHtml);
	delEvent();
	play.outerHTML = oHtml;
	if (window.chrome) refreshElem(bd);
}
function setObjectVal(p, name, v) {
	let e = p.querySelector('embed');
	e && e.setAttribute(name, v);
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

function onAnimationStart(ev) {
	//ev.returnValue = !1;
	//ev.cancelBubble = true;
	//if (ev.animationName !== 'gAnimatAct') return;
	let e = ev.target;//ev && ev.target || Event.srcElement
	console.log('CSS3 animation start:', ev, e);
	isEmbed = 'EMBED' === e.tagName;
	//防止OBJECT － EMBED结构重复处理
	if (isEmbed && 'OBJECT' === e.parentNode.tagName) return;
	if (!isPlayer(e)) return;
	let t, addr = e.src || e.data || e.children.movie.value;
	for (t of PLAYER_URL) {
		if (t.urls.some(function(reg) {
			return reg.test(addr);
		})) {//if
			if (t.run) {//custom function
				t.run(e, addr);
				return;
			}
			let v = getFlashvars(e);
			if (!t.isProc || t.isProc(e, v, addr)) {
				v = v.match(t.varsMatch);
				v && setPlayer(e, t.format(v[1]));
			}
			return;
		}
	}
	openFlashGPU(e);
}

if (window.chrome) {
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
//fail: bd.children.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
}
bd.addEventListener('animationstart', onAnimationStart, !1);
bd.addEventListener('webkitAnimationStart', onAnimationStart, !1);
bd.addEventListener('oAnimationStart', onAnimationStart, !1);
}(document, document.body);