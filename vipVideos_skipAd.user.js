// ==UserScript==
// @name           vipVideos_skipAd
// @namespace      vipVideos_skipAd-xinggsf
// @author	       xinggsf~gmail。com
// @description    油库、土逗 VIP免费看；配合ABP去视频广告；开启GPU加速
// @homepageURL    https://greasyfork.org/scripts/8561
// updateURL       https://greasyfork.org/scripts/8561.js
// @include        http*
// @exclude        http://v.qq.com/*
// @exclude        http://www.dj92cc.com/*
// @exclude        http://*.baidu.com/*
//芒果TV加速不了！反而加大CPU占用，芒果真垃圾
// @exclude        http://www.hunantv.com/*
//全面支持音悦台HTML5播放，详见 https://greasyfork.org/scripts/14593
// @exclude        http://*.yinyuetai.com/*
// exclude        http://www.flv.tv/*
// @version        2016.1.1
// @encoding       utf-8
// @grant          unsafeWindow
// grant          GM_openInTab
// ==/UserScript==
/*
作者的话：经过实际测试，chrome的CSS3动画BUG只发生在NPAPI Flash。
此BUG表现在某些页面刷新页面元素后，原有菜单、DIV对话框显示不出来或被flash遮住！
鉴于chrome已不再支持NPAPI Flash，我也无法可想。

2015-12-30 增加对重定向扩展的支持（50行改为true即启用）
2015-12-25 优化事件处理，及DOM刷新处理；解决了熊猫TV不能显示弹幕的问题
2015-12-18 感谢卡饭好友"吃饭好香"提供空间，更换油库播放器；解决油库外链视频变形问题
2015-12-14 iqiyi播放器升级，外链视频最高分辨率只支持到高清。建议到iqiyi.com观看
2015-12-13 感谢卡饭好友"吃饭好香"提供播放器空间;解决油库不能全屏的问题
2015-12-11 用严格模式重构;使用ES6字符串模板、大幅使用本地变量let,const
2015-12-8  更新油库播放器，可选择P1080分辨率；
           彻底解决油库盗链问题；
           解决NNAPI Flash不能播放的问题
2015-12-6  增加对acfun.tv的油库、iqiyi外链支持

开启GPU硬件加速，如显卡不支持，wmode参数换为 direct
参考了thunderhit的代码: https://greasyfork.org/scripts/6479，但用定时器太低效了

doc.querySelectorAll('div') instanceof NodeList
bd.childNodes instanceof NodeList
true
bd.children instanceof NodeList == false
bd.children.constructor: HTMLCollection
*/
-function(doc, bd) {
"use strict";
let isEmbed, 
isRedirect = !1,//是否开启重定向脚本
style = doc.createElement('style');
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
					fv = src.match(this.urls[1]) || src.match(this.varsMatch) ||
						 fv.match(this.varsMatch);
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
		urls: [
			/^http:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/MainPlayer_\w+\.swf/,
			/^http:\/\/cdn\.aixifan\.com\/player\/cooperation\/AcFunXQiyi\.swf/,
			/^http:\/\/dispatcher\.video\.qiyi\.com\/disp\/shareplayer\.swf/,
		],
		run: function(p, src) {
			var v = getFlashvars(p);
			if (doc.domain.endsWith('iqiyi.com')){
				v = v.replace(/&(?:cid|tipdataurl|\w+?Time|cpn\w|\w*?loader|adurl|yhls|exclusive|webEventID|videoIsFromQidan)=[^&]*/g,'') + '&cid=qc_100001_300089';
				setPlayer(p, iqiyiFormat(src,v));
			} else qyOutsiteFormat(p, v);
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
	},
];

function youkuFormat(vid) {
//下载https://raw.githubusercontent.com/xinggsf/gm/master/yk.swf到本地，可替换
	return `<embed id="mplayer" wmode="gpu" width="100%" height="100%" src="http://yunpan.q8wl.com/o_1a6qi4boq4k51nqlpdp1brob4va.swf" allowfullscreen="true" allowscriptaccess="always" type="application/x-shockwave-flash" flashvars="isShowRelatedVideo=true&showAd=0&show_ce=0&showsearch=0&VideoIDS=${vid}&isAutoPlay=true&winType=BDskin&partnerId=youkuind_&embedid=MTEzLjE0My4xNTkuOTYCMTUwNjk2NTE3AmkueW91a3UuY29tAi91L1VOakl6T1RjMk1UVXk%3D">`;
	//return `<iframe id="mplayer" width="100%" height="100%" src="http://img2.ct2t.net/flv/youku/151126/player.swf?VideoIDS=${vid}&isAutoPlay=true" frameborder="no" border="0" scrolling="no">`; 100.100.100.100/player.swf
}
//www.300.la/filestores/2015/12/17/95103f682362f42ba8e91e41b76c6f5e.swf
function ykOutsitePlayer(vid, p) {
	setPlayer(p, `<embed id="${p.id}" wmode="gpu" allowfullscreen="true" src="http://yunpan.q8wl.com/o_1a6qi4boq4k51nqlpdp1brob4va.swf" allowscriptaccess="always" type="application/x-shockwave-flash" width="${p.width}" height="${p.height}" flashvars="isShowRelatedVideo=false&showAd=0&show_ce=0&showsearch=0&VideoIDS=${vid}&winType=BDskin&partnerId=youkuind_&embedid=MTEzLjE0My4xNTkuOTYCMTUwNjk2NTE3AmkueW91a3UuY29tAi91L1VOakl6T1RjMk1UVXk%3D">`);
}

function qyOutsiteFormat(p, v) {
	let tvid = v.match(/\btvId=(\w+)/i)[1],
	definitionID = v.match(/\b(?:definitionID|sourceId|vid)=(\w+)/)[1],
	s = isRedirect ? `<embed type="application/x-shockwave-flash" play="true" allowfullscreen="true" wmode="gpu" width="100%" height="100%" id="${p.id}" allowscriptaccess="always" src="http://www.iqiyi.com/common/flashplayer/2099/MainPlayer_5.swf" flashvars="components=fefb1060e&definitionID=${definitionID}&tvId=${tvid}&autoplay=true&flashP2PCoreUrl=http://www.iqiyi.com/common/flashplayer/20151229/3023.swf">` :
	`<embed width="100%" height="100%" allowscriptaccess="always" wmode="gpu" allowfullscreen="true" type="application/x-shockwave-flash" id="${p.id}" src="http://dispatcher.video.qiyi.com/disp/shareplayer.swf" flashvars="vid=${definitionID}&tvid=${tvid}&autoPlay=1&showSearch=0&showSearchBox=0&autoHideControl=1&cid=qc_100001_300089&bd=1&showDock=0">`;
	setPlayer(p, s);
}

function iqiyiFormat(src, fvar) {
	return `<embed play="true" allowfullscreen="true" wmode="gpu" type="application/x-shockwave-flash" width="100%" height="100%" id="flash" allowscriptaccess="always" src="${src}" flashvars="${fvar}">`;
}

function openFlashGPU(p) {
	isEmbed ? p.setAttribute('wmode', 'gpu') :
		setObjectVal(p, 'wmode', 'gpu');
	delEvent();
	refreshElem(p);
	// if (window.chrome) refreshElem(bd);
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
	bd.removeEventListener('animationstart', onAnimationStart, !1);
	bd.removeEventListener('webkitAnimationStart', onAnimationStart, !1);
	bd.removeEventListener('oAnimationStart', onAnimationStart, !1);
	doc.head.removeChild(style);
}
function setPlayer(play, oHtml) {
	console.log('new player: ', oHtml);
	delEvent();
	play.outerHTML = oHtml;
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
	ev.preventDefault();//cancel handle later
	ev.stopPropagation();//stop bubble
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