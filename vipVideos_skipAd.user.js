// ==UserScript==
// @name           vipVideos_skipAd
// @namespace      vipVideos_skipAd
// @author	       xinggsf~gmail。com
// @description    油库、土逗 VIP免费看；配合ABP去视频广告；开启GPU加速
// @homepageURL    https://greasyfork.org/scripts/8561
// updateURL       https://greasyfork.org/scripts/8561.js
// @require        https://greasyfork.org/scripts/11230.js
// @license        GPL version 3
// @include        http*
// @exclude        http://*.baidu.com/*
// @exclude        http://www.hunantv.com/*
// @exclude        http://v.yinyuetai.com/video/h5/*
// exclude        http://www.flv.tv/*
// @version        2015.12.8
// @encoding       utf-8
// @grant          unsafeWindow
// grant          GM_openInTab
// ==/UserScript==

//开启GPU硬件加速，如果显卡不支持无效，请换direct!参考了thunderhit的代码:
// https://greasyfork.org/zh-CN/scripts/6479，但用定时器太低效了
-function(doc, bd) {
var isEmbed, style = doc.createElement('style');
style.textContent = '@-webkit-keyframes gAnimatAct{from{opacity:0.99;}to{opacity:1;}}@keyframes gAnimatAct{from{opacity:0.99;}to{opacity:1;}}embed,object{animation:gAnimatAct 1ms;-webkit-animation:gAnimatAct 1ms;}';
doc.head.appendChild(style);
//var youkuMark = '<embed id="mplayer" wmode="gpu" src="http://100.100.100.100/player.swf?VideoIDS={1}&isAutoPlay=true" allowfullscreen="true" allowscriptaccess="always" type="application/x-shockwave-flash" width="100%" height="100%">',
var youkuMark = '<iframe id="mplayer" width="100%" height="100%" src="http://img2.ct2t.net/flv/youku/151126/player.swf?VideoIDS={1}&isAutoPlay=true" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no">',
iqiyiMark = '<embed play="true" allowfullscreen="true" wmode="gpu" type="application/x-shockwave-flash" width="100%" height="100%" id="flash" allowscriptaccess="always" src="{src}" flashvars="{fvars}">',
PLAYER_URL = [
	{
		urls: [
			/^http:\/\/static\.youku\.com\/.*?q?(?:play|load)er\w*\.swf/,
			/^http:\/\/player\.youku\.com\/player\.php\/.*?sid\/(.*?)\/.*?v\.swf$/,
			/^http:\/\/cdn\.aixifan\.com\/player\/cooperation\/AcFunXYouku\.swf/,
		],
		swfMark: youkuMark,
		varsMatch: /VideoIDS=(\w+)/,
		isProc: function(p, fv, src) {
			console.log('isProc func');
			if (doc.domain.endsWith('.acfun.tv')) {
				fv = fv.match(/vid=(\w+)/);
				fv && setPlayer(p, youkuMark.format(fv));
				return !1;
			}
			if (!doc.domain.endsWith('youku.com')) {
				var t = PLAYER_URL[0],
				m = src.match(t.urls[1]) || src.match(t.varsMatch);
				m && setPlayer(p, t.swfMark.format(m));
				return !m;
			}
			doc.addEventListener('DOMNodeInserted', function (ev) {
				var e = ev.target;
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
	},{
		urls: [/^http:\/\/js\.tudouui\.com\/.*?Player.*?\.swf/],
		swfMark: youkuMark,
		varsMatch: /vcode=([^&]+)/,
		isProc: function(p, fv, src) {
			if (!doc.domain.endsWith('tudou.com')) {
				openFlashGPU(p);
				return !1;
			}
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
		run: function(p, src, t) {
			if (doc.domain.endsWith('.acfun.tv')) {
				var s = getFlashvars(p);
				s = s.match(/&sourceId=(\w+).*?&tvId=(\w+)/);
				s && setPlayer(p, '<embed play="true" allowfullscreen="true" wmode="gpu" type="application/x-shockwave-flash" width="100%" height="100%" id="flash" allowscriptaccess="always" src="http://www.iqiyi.com/common/flashplayer/20151127/MainPlayer_5_2_29_3_c3_3_8_1.swf" flashvars="tvId={2}&autoplay=true&isMember=false&cyclePlay=false&qiyiProduced=0&components=feffb7e6e0&flashP2PCoreUrl=http://www.iqiyi.com/common/flashplayer/20151027/3020.swf&origin=flash&outsite=true&definitionID={1}&cid=qc_100001_300089">'.format(s));
				return;
			}
			var m = {'src': src};
			m.fvars = getFlashvars(p).replace(/&(?:cid|tipdataurl|\w+?Time|cpn\w|\w+?loader|adurl|yhls|exclusive|webEventID|videoIsFromQidan)=[^&]*/g,'') + '&cid=qc_100001_300089';
			setPlayer(p, iqiyiMark.format(m));
		}
	}, {
		urls: [
		/^http:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/PPS\w+\.swf/,
		//安装PPS插件才能播放
		// /^http:\/\/www\.iqiyi\.com\/player\/cupid\/common\/pps_\w+\.swf/
		],
		run: function(p, src, t) {
			var m = {'src': src},
			s = getFlashvars(p);
			if (s.indexOf('&cid=') === -1) {
				alert('不支持！安装PPS插件才能播放！');
				return;
			}
			m.fvars = s.replace(/&?(?:cid|coreUrl|tipdataurl|preloader|adurl|P00001|expandState)=[^&]+/g,'') +'&cid=qc_100001_300089';
			setPlayer(p, iqiyiMark.format(m));
		}
	}, {
		urls: [
			/^http:\/\/(?:\d+\.){3}\d+\/(?:test|web)player\/Main\w*\.swf$/,
			/^http:\/\/tv\.sohu\.com\/upload\/swf\/.+?\/Main\.swf$/,
		],
		//http://update.adbyby.com/swf/sohu_livezb.swf
		//http://opengg.guodafanli.com/adkiller/sohu_live.swf
		run: function(p, src, t) {
			//if (!doc.domain.endsWith('tv.sohu.com')) return;
			var s = p.getAttribute('flashvars')
				.replace(/&(?:plid|api_key|on\w*?Ad\w*)=[^&]*/g, '')
				//.replace(/(&on\w*?Ad\w*=)[^&]*/g,'$1')
				+ '&plid=7038006&api_key=647bfb88a84fc3c469d289f961993be6';
			s = p.outerHTML.replace(/(flashvars=")[^"]+/, '$1'+ s)
				.replace(/(wmode=")\w+/, '$1gpu');
		//.replace(src, 'http://100.100.100.100/swf/sohu.swf');
			setPlayer(p, s);
		}
	}
];

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
/* 	var c = p.querySelectorAll('param[value=true]');
	for (var t, i = c.length; t = c[--i];) {
		if (t.name.toLowerCase() === 'allowfullscreen')
			return !0;
	}
	return !1; */
}
function refreshElem(o) {
	var s = o.style.display;
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
	var e = p.querySelector('embed');
	e && e.setAttribute(name, v);
	name = name.toLowerCase();
	for (var o of p.childNodes) {
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
	var s = 'flashvars';
	if (isEmbed) return p.getAttribute(s);
	if (!p.children[s]) s = 'flashVars';
	return p.children[s].value;
}

function onAnimationStart(ev) {
	//ev.returnValue = !1;
	//ev.cancelBubble = true;
	if (ev.animationName !== 'gAnimatAct') return;
	var e = ev.target;//ev && ev.target || Event.srcElement
	console.log('CSS3 animation start:', ev, e);
	isEmbed = 'EMBED' === e.tagName;
	//防止OBJECT － EMBED结构重复处理
	if (isEmbed && 'OBJECT' === e.parentNode.tagName) return;
	if (!isPlayer(e)) return;
	var t, addr = e.src || e.data || e.children.movie.value;
	for (t of PLAYER_URL) {
		if (t.urls.some(function(reg) {
			return reg.test(addr);
		})) {//if
			if (t.run) {//custom function
				t.run(e, addr, t);
				return;
			}
			var v = getFlashvars(e);
			if (!t.isProc || t.isProc(e, v, addr)) {
				v = v.match(t.varsMatch);
				v && setPlayer(e, t.swfMark.format(v));
			}
			return;
		}
	}
	openFlashGPU(e);
}
/*
doc.querySelectorAll('div') instanceof NodeList
bd.childNodes instanceof NodeList
true
bd.children instanceof NodeList == false
bd.children.constructor: HTMLCollection
*/
if (window.chrome) {
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
//fail: bd.children.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
}
bd.addEventListener('animationstart', onAnimationStart, !1);
bd.addEventListener('webkitAnimationStart', onAnimationStart, !1);
bd.addEventListener('oAnimationStart', onAnimationStart, !1);
}(document, document.body);