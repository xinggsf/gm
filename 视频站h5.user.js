/* globals jQuery, $, Vue */
// ==UserScript==
// @name       HTML5视频播放工具
// @name:en	   HTML5 Video Playing Tools
// @name:it    Strumenti di riproduzione video HTML5
// @description 视频截图；切换画中画；缓存视频；万能网页全屏；添加快捷键：快进、快退、暂停/播放、音量、下一集、切换(网页)全屏、上下帧、播放速度。支持视频站点：油管、TED、优.土、QQ、B站、西瓜视频、爱奇艺、A站、PPTV、芒果TV、咪咕视频、新浪、微博、网易[娱乐、云课堂、新闻]、搜狐、风行、百度云视频等；直播：twitch、斗鱼、YY、虎牙、龙珠、战旗。可增加自定义站点
// @description:en Enable hotkeys for HTML5 playback: video screenshot; enable/disable picture-in-picture; copy cached video; send any video to full screen or browser window size; fast forward, rewind, pause/play, volume, skip to next video, skip to previous or next frame, set playback speed. Video sites supported: YouTube, TED, Youku, QQ.com, bilibili, ixigua, iQiyi, support mainstream video sites in mainland China; Live broadcasts: Twitch, Douyu.com, YY.com, Huya.com. Custom sites can be added
// @description:it Abilita tasti di scelta rapida per riproduzione HTML5: screenshot del video; abilita/disabilita picture-in-picture; copia il video nella cache; manda qualsiasi video a schermo intero o a dimensione finestra del browser; avanzamento veloce, riavvolgimento, pausa/riproduzione, imposta velocità di riproduzione. Siti video supportati: YouTube, TED, Supporto dei siti video mainstream nella Cina continentale. È possibile aggiungere siti personalizzati
// @homepage https://bbs.kafan.cn/thread-2093014-1-1.html
// @match    https://*.qq.com/*
// @exclude  https://user.qzone.qq.com/*
// @match    https://www.weiyun.com/video_*
// @match    https://v.youku.com/v_play/*
// @match    https://v.youku.com/v_show/id_*
// @match    https://vku.youku.com/live/*
// @match    https://video.tudou.com/v/*
// @match    https://www.iqiyi.com/*
// @match    https://live.bilibili.com/*
// @match    https://www.bilibili.com/*
// @match    https://www.ixigua.com/*
// @match    https://www.toutiao.com/video/*
// @match    https://www.acfun.cn/*
// @match    https://live.acfun.cn/live/*
// @match    http://v.pptv.com/show/*
// @match    https://v.pptv.com/show/*
// @match    https://www.miguvideo.com/*
// @match    https://tv.sohu.com/*
// @match    https://film.sohu.com/album/*
// @match    https://www.mgtv.com/*
// @match    https://movie.douban.com/subject/*
// @version    2.0.0
// @match    https://pan.baidu.com/*
// @match    https://yun.baidu.com/*
// @match    https://*.163.com/*
// @match    https://*.icourse163.org/*
// @match    http://video.sina.*/*
// @match    https://video.sina.*/*
// @match    http://k.sina.*/*
// @match    https://k.sina.*/*
// @match    https://weibo.com/*
// @match    https://*.weibo.com/*
// @match    https://pan.baidu.com/*
// @match    https://yun.baidu.com/*
// @match    http://v.ifeng.com/*
// @match    https://v.ifeng.com/*
// @match    http://news.mtime.com/*
// @match    http://video.mtime.com/*
// @GM_info
// @match    https://www.youtube.com/*
// @match    https://www.ted.com/talks/*
// @match    https://www.twitch.tv/*
// @inject-into content
// @match    https://www.yy.com/*
// @match    https://www.huya.com/*
// @match    https://v.douyu.com/*
// @match    https://www.douyu.com/*
// @match    https://live.douyin.com/*
// @match    https://www.douyin.com/*

// @match    https://www.longzhu.com/*
// @match    https://www.zhanqi.tv/*
// @run-at     document-start
// @require    https://cdn.staticfile.org/vue/2.6.11/vue.min.js
// @require    https://cdn.staticfile.org/jquery/3.6.0/jquery.min.js
// @grant      GM_addStyle
// @include    */play*
// @include    *play/*
// @exclude    https://www.dj92cc.net/dance/play/id/*
// @grant      window.onurlchange
// @grant      unsafeWindow
// @grant      GM_registerMenuCommand
// @grant      GM_setValue
// @grant      GM_getValue
// @namespace  https://greasyfork.org/users/7036
// @license    MIT
// ==/UserScript==

'use strict';

const curLang = navigator.language.slice(0, 2);
//感谢 Dario Costa 提供的英语和意大利语翻译
const i18n = {
	'zh': {
		'console': '%c脚本[%s] 反馈：%s\n%s',
		'cacheStoringError': '直接媒体类型（如MP4格式）缓存无效果！',
		'cacheStoringConfirm': '视频切片数据能否缓存？检测方法：刷新页面，已观看视频片段不产生网络流量则可缓存。如果能缓存视频切片，选择确认直接缓存全部视频时段；点取消则按默认缓冲区大小进行缓冲。',
		'cantOpenPIP': '无法进入画中画模式!错误:\n',
		'cantExitPIP': '无法退出画中画模式!错误：\n',
		'rememberRateMenuOption': '记忆播放速度',
		'speedRate': '播放速度 ',
		'ready': '准备就绪！ 待命中.',
		'mainPageOnly': '只处理主页面',
		'download': '下载: ',
		'videoLag': '视频卡顿',
		'fullScreen': '全屏',
		'helpMenuOption': '脚本功能快捷键表',
		'helpBody': `双击：切换（网页）全屏         鼠标中键：快进5秒

P：视频截图    i：切换画中画   M：(停止)缓存视频(hls.js)
← →方向键：快退、快进5秒;   方向键 + shift: 20秒
↑ ↓方向键：音量调节   ESC：退出（网页）全屏
空格键：暂停/播放      N：播放下一集
回车键：切换全屏;      回车键 + shift: 切换网页全屏
C(抖音V)：加速0.1倍  X(抖音S)：减速0.1倍  Z(抖音A)：切换加速状态
D：上一帧     F：下一帧(youtube.com用E键)`
	},
	'en': {
		'console': '%cScript[%s] Feedback：%s\n%s',
		'cacheStoringError': 'Trying to cache direct media types (such as MP4 format) has no effect!',
		'cacheStoringConfirm': 'Do you want all segments of the video to be cached? The detection method used is as follows: when the page is refreshed, the watched video clips will be cached so that no additional network traffic is generated. If you want all segments of the videos to be cached, select OK; or select Cancel to buffer a portion of the video based on the default buffer size (which is the default browser behavior).',
		'cantOpenPIP': 'Unable to access picture-in-picture mode! Error：\n',
		'cantExitPIP': 'Unable to exit picture-in-picture mode! Error：\n',
		'rememberRateMenuOption': 'Remember video playback speed',
		'speedRate': 'Speed rate ',
		'ready': ' ready！ Waiting for you commands.',
		'mainPageOnly': 'Process the main page only',
		'download': 'Download: ',
		'videoLag': 'Video lag',
		'fullScreen': 'Full screen',
		'helpMenuOption': 'Hotkeys list:',
		'helpBody': `Double-click: activate full screen.
Middle mouse button: fast forward 5 seconds

P key： Take a screenshot
I key： Enter/Exit picture-in-picture mode
M key： Enable/disable caching of video(hls.js)

Arrow keys ← and →： Fast forward or rewind by 5 seconds
Shift + Arrow keys ← and →： Fast forward or rewind 20 seconds
Arrow keys ↑ and ↓： Raise or lower the volume

ESC： Exit full screen (or exit video enlarged to window size)
Spacebar： Stop/Play
Enter： Enable/disable full screen video
Shift + Enter: Set/unset video enlarged to window size

N key： Play the next video (if any)
C key： Speed up video playback by 0.1
X key: Slow down video playback by 0.1
Z key, Set video playback speed: 1.0 ←→ X
D key: Previous frame
F key: Next frame (except on YouTube)
E key: Next frame (YouTube only)`
	},
	'it': {
		'console': '%cScript[%s] Feedback：%s\n%s',
		'cacheStoringError': 'Cercare di memorizzazione nella cache tipi di media diretti (come ad esempio il formato MP4) non ha alcuna efficacia!',
		'cacheStoringConfirm': 'Vuoi che tutti i segmenti del video siano memorizzati nella cache? Il metodo di rilevamento utilizzato è il seguente: all\'aggiornamento della pagina, i video clip guardati saranno memorizzati nella cache in modo da non generare ulteriore traffico di rete. Se vuoi che tutti i segmenti dei video siano memorizzati nella cache, seleziona OK; seleziona invece Annulla per bufferizzare una parte del video in base alla dimensione predefinita del buffer (come da comportamento predefinito del browser).',
		'cantOpenPIP': 'Impossibile accedere alla modalità picture-in-picture! Errore：\n',
		'cantExitPIP': 'Impossibile uscire dalla modalità picture-in-picture! Errore：\n',
		'rememberRateMenuOption': 'Memorizza la velocità di riproduzione dei video',
		'speedRate': 'Velocità di riproduzione ',
		'ready': "Pronto！ In attesa dei comandi dell'utente.",
		'mainPageOnly': 'Elaborazione della sola pagina principale',
		'download': 'Scarica: ',
		'videoLag': 'Ritardo del video',
		'fullScreen': 'Schermo intero',
		'helpMenuOption': 'Elenco dei tasti di scelta rapida',
		'helpBody': `Doppio clic: attiva lo schermo intero
Pulsante centrale del mouse: avanzamento rapido di 5 secondi

Tasto P: Esegui uno screenshot
Tasto I： Attiva modalità picture-in-picture
Tasto M： Attiva/disattiva memorizzazione del video nella cache(hls.js)

Tasti freccia ← e →： Avanza o riavvolgi di 5 secondi
Shift + Tasti freccia ← e →: Avanza o riavvolgi di 20 secondi
Tasti freccia ↑ e ↓： Alza o abbassa il volume
ESC： Esci da schermo intero
Barra spaziatrice: Ferma/Riproduci
Invio： Attiva/disattiva ingrandimento del video a schermo intero
Shift + Invio: Attiva/disattiva ingrandimento del video a dimensione della finestra

Tasto N： Riproduzione del video successivo (se presente)
Tasto C: Velocizza riproduzione video di 0,1
Tasto X: Rallenta riproduzione video di 0,1
Tasto Z, Impostare la velocità di riproduzione video: 1,0 ←→ X
Tasto D: Vai al frame precedente
Tasto F: Vai al frame successivo (escluso YouTube)
Tasto E: Vai al frame successivo (solo su YouTube)`
	}
};
const MSG = i18n[curLang] || i18n.en;

const w = unsafeWindow || window;
const { host, pathname: path } = location;
const d = document, find = [].find;
let $msg, v, _fp, _fs, by; // document.body
const observeOpt = {childList : true, subtree : true};
const noopFn = function(){};
const validEl = e => e && e.offsetWidth > 1;
const q = (css, p = d) => p.querySelector(css);
const r1 = (regp, s) => regp.test(s) && RegExp.$1;
const log = console.log.bind(
	console,
	MSG.console,
	'color:#c3c;font-size:1.2em',
	GM_info.script.name,
	GM_info.script.homepage
);
const gmFuncOfCheckMenu = (title, saveName, defaultVal = true) => {
	const r = GM_getValue(saveName, defaultVal);
	if (r) title = '√  '+ title;
	GM_registerMenuCommand(title, () => {
		GM_setValue(saveName, !r);
		location.reload();
	});
	return r;
};
const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) });
/* 画中画
<svg viewBox="0 0 22 22"><g fill="#E6E6E6" fill-rule="evenodd"><path d="M17 4a2 2 0 012 2v6h-2V6.8a.8.8 0 00-.8-.8H4.8a.8.8 0 00-.794.7L4 6.8v8.4a.8.8 0 00.7.794l.1.006H11v2H4a2 2 0 01-2-2V6a2 2 0 012-2h13z"></path><rect x="13" y="14" width="8" height="6" rx="1"></rect></g></svg>
设置
<svg viewBox="0 0 22 22">
<circle cx="11" cy="11" r="2"></circle>
<path d="M19.164 8.861L17.6 8.6a6.978 6.978 0 00-1.186-2.099l.574-1.533a1 1 0 00-.436-1.217l-1.997-1.153a1.001 1.001 0 00-1.272.23l-1.008 1.225a7.04 7.04 0 00-2.55.001L8.716 2.829a1 1 0 00-1.272-.23L5.447 3.751a1 1 0 00-.436 1.217l.574 1.533A6.997 6.997 0 004.4 8.6l-1.564.261A.999.999 0 002 9.847v2.306c0 .489.353.906.836.986l1.613.269a7 7 0 001.228 2.075l-.558 1.487a1 1 0 00.436 1.217l1.997 1.153c.423.244.961.147 1.272-.23l1.04-1.263a7.089 7.089 0 002.272 0l1.04 1.263a1 1 0 001.272.23l1.997-1.153a1 1 0 00.436-1.217l-.557-1.487c.521-.61.94-1.31 1.228-2.075l1.613-.269a.999.999 0 00.835-.986V9.847a.999.999 0 00-.836-.986zM11 15a4 4 0 110-8 4 4 0 010 8z"></path>
</svg>
next
<svg viewBox="0 0 22 22"><path d="M16 5a1 1 0 00-1 1v4.615a1.431 1.431 0 00-.615-.829L7.21 5.23A1.439 1.439 0 005 6.445v9.11a1.44 1.44 0 002.21 1.215l7.175-4.555a1.436 1.436 0 00.616-.828V16a1 1 0 002 0V6C17 5.448 16.552 5 16 5z"></path></svg>
截图
<svg version="1.1" viewBox="0 0 32 32"><path d="M16 23c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zM16 13c-2.206 0-4 1.794-4 4s1.794 4 4 4c2.206 0 4-1.794 4-4s-1.794-4-4-4zM27 28h-22c-1.654 0-3-1.346-3-3v-16c0-1.654 1.346-3 3-3h3c0.552 0 1 0.448 1 1s-0.448 1-1 1h-3c-0.551 0-1 0.449-1 1v16c0 0.552 0.449 1 1 1h22c0.552 0 1-0.448 1-1v-16c0-0.551-0.448-1-1-1h-11c-0.552 0-1-0.448-1-1s0.448-1 1-1h11c1.654 0 3 1.346 3 3v16c0 1.654-1.346 3-3 3zM24 10.5c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5zM15 4c0 0.552-0.448 1-1 1h-4c-0.552 0-1-0.448-1-1v0c0-0.552 0.448-1 1-1h4c0.552 0 1 0.448 1 1v0z"></path></svg>
const cookie = new Proxy(noopFn, {
	apply(target, ctx, args) { //清理cookie
		const keys = document.cookie.match(/[^ =;]+(?=\=)/g);
		if (keys) {
			const val = '=; expires=' + new Date(0).toUTCString() +'; domain=.; path=/';
			for (const k of keys) document.cookie = k + val;
		}
		// return Reflect.apply(target, ctx, args);
	},
	get(target, name) { // 读取cookie
		const r = r1(new RegExp(name +'=([^;]*)'), document.cookie);
		if (r) return decodeURIComponent(r);
	},
	set(target, name, value, receiver) { // 写入cookie
		let s, v, expires,
		oneParam = typeof value == 'string';
		if (oneParam) {
			expires = 6;
			v = value;
		} else {
			v = value.val;
			expires = value.expires || 6;
			delete value.expires;
		}
		s = name + '=' + encodeURIComponent(v);

		if (expires && (typeof expires == 'number' || expires.toUTCString)) {
			let date;
			if (typeof expires == 'number') {
				date = new Date();
				date.setTime(expires * 24 * 3600000 + date.getTime());
			} else {
				date = expires;
			}
			s += '; expires=' + date.toUTCString();
		}
		if (!oneParam) for (const k in value) s += '; ' + k + '=' + value[k];
		document.cookie = s;
		return true;
	},
	deleteProperty(target, name, descriptor) {// 删除cookie
		document.cookie = name + '=; path=/; expires='+ new Date(0).toUTCString();
		return true;
	}
});
const onceEvent = (ctx, eName) => new Promise(resolve => ctx.addEventListener(eName, resolve));
const promisify = (fn) => (...args) => new Promise((resolve, reject) => {
    args.push(resolve);
	fn.apply(this, args);
}); */
const hookAttachShadow = (cb) => {
	try {
		const _attachShadow = Element.prototype.attachShadow;
		Element.prototype.attachShadow = function(opt) {
			opt.mode = 'open';
			const shadowRoot = _attachShadow.call(this, opt);
			cb(shadowRoot);
			return shadowRoot;
		};
	} catch (e) {
		console.error('Hack attachShadow error', e);
	}
};
const getStyle = (o, s) => {
	if (o.style[s]) return o.style[s];
	if (getComputedStyle) {
		const x = getComputedStyle(o, '');
		s = s.replace(/([A-Z])/g,'-$1').toLowerCase();
		return x && x.getPropertyValue(s);
	}
};
const doClick = e => {
	if (typeof e === 'string') e = q(e);
	if (e) { e.click ? e.click() : e.dispatchEvent(new MouseEvent('click')) };
};
const clickDualButton = btn => { // 2合1 按钮 Element.previousElementSibling
	!btn.nextElementSibling || getStyle(btn, 'display') !== 'none' ? doClick(btn) : doClick(btn.nextElementSibling);
};
const polling = (cb, condition, stop = true) => {
	const fn = typeof condition === 'string' ? q.bind(null, condition) : condition;
	const t = setInterval(() => {
		if (fn()) {
			stop && clearInterval(t);
			cb();
		}
	}, 300);
	return t;
};
const goNextMV = () => {
	const s = location.pathname;
	const m = s.match(/(\d+)(\D*)$/);
	const d = +m[1] + 1;
	location.assign(s.slice(0, m.index) + d + m[2]);
};
const firefoxVer = r1(/Firefox\/(\d+)/, navigator.userAgent);
const isEdge = / Edge?\//.test(navigator.userAgent);
const fakeUA = ua => Object.defineProperty(navigator, 'userAgent', {
	value: ua,
	writable: false,
	configurable: false,
	enumerable: true
});
const getMainDomain = host => {
	const a = host.split('.');
	let i = a.length - 2;
	if (/^(com?|cc|tv|net|org|gov|edu)$/.test(a[i])) i--;
	return a[i];
};
const inRange = (n, min, max) => Math.max(min, n) == Math.min(n, max);
const adjustRate = n => {
	n += v.playbackRate;
	if (n < 0.1) v.playbackRate = .1;
	else if (n > 16) v.playbackRate = 16;
	else v.playbackRate = +n.toFixed(2);
};
const adjustVolume = n => {
	n += v.volume;
	if (inRange(n, 0, 1)) v.volume = +n.toFixed(2);
};
const tip = (msg) => {
	if (!$msg?.get(0)?.offsetHeight) $msg = $('<div style="max-width:455px;min-width:333px;background:#EEE;color:#111;height:22px;top:-30px;left:50%;transform:translate(-50%, 0); border-radius:8px;border:1px solid orange;text-align:center;font-size:15px;position:fixed;z-index:2147483647"></div>').appendTo(by);
    if (!msg?.length) return;
	const len = msg.length * 15;
	$msg.stop(true, true).text(msg)
		.css({width:`${len}px`})
		.animate({top:'190px'})
		.animate({top:'+=9px'},1900)
		.animate({top:'-30px'});
};
const u = getMainDomain(host);
const cfg = {
	isLive: !1,
	disableDBLClick: !1,
	isClickOnVideo: !1,
	multipleV: !1, //多视频页面
	isNumURL: !1 //网址数字分集
};
const bus = new Vue();
if (window.onurlchange === void 0) {
	history.pushState = ( f => function pushState(){
		const ret = f.apply(this, arguments);
		window.dispatchEvent(new Event('pushstate'));
		window.dispatchEvent(new Event('urlchange'));
		return ret;
	})(history.pushState);

	history.replaceState = ( f => function replaceState(){
		const ret = f.apply(this, arguments);
		window.dispatchEvent(new Event('replacestate'));
		window.dispatchEvent(new Event('urlchange'));
		return ret;
	})(history.replaceState);

	window.addEventListener('popstate',()=>{
		window.dispatchEvent(new Event('urlchange'))
	});
};

class FullScreen {
	constructor(e) {
		let fn = d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen || noopFn;
		this.exit = fn.bind(d);
		fn = e.requestFullscreen || e.webkitRequestFullScreen || e.mozRequestFullScreen || e.msRequestFullScreen || noopFn;
		this.enter = fn.bind(e);
	}
	static isFull() {
		return !!(d.fullscreen || d.webkitIsFullScreen || d.mozFullScreen ||
		d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement);
	}
	toggle() {
		FullScreen.isFull() ? this.exit() : this.enter();
	}
}

//万能网页全屏, 参考了：https://github.com/gooyie/ykh5p
class FullPage {
	constructor(container) {
		this._isFull = !1;
		this.container = container || FullPage.getPlayerContainer(v);
		GM_addStyle(
			`.gm-fp-body .gm-fp-zTop {
				position: relative !important;
				z-index: 2147483646 !important;
			}
			.gm-fp-wrapper, .gm-fp-body{ overflow:hidden !important; }
			.gm-fp-wrapper .gm-fp-innerBox {
				width: 100% !important;
				height: 100% !important;
			}
			.gm-fp-wrapper {
				display: block !important;
				position: fixed !important;
				width: 100% !important;
				height: 100% !important;
				padding: 0 !important;
				margin: 0 !important;
				top: 0 !important;
				left: 0 !important;
				background: #000 !important;
				z-index: 2147483646 !important;
			}`
		);
	}
	static getPlayerContainer(video) {
		let e = video, p = e.parentNode;
		const { clientWidth: wid, clientHeight: h } = e;
		do {
			e = p;
			p = e.parentNode;
		} while (p && p !== by && p.clientWidth-wid < 5 && p.clientHeight-h < 5);
		//e 为返回值，在此之后不能变了
		// while (p !== by) p = p.parentNode || p.host;
		return e;
	}
	static isFull(e) {
		return w.innerWidth - e.clientWidth < 5 && w.innerHeight - e.clientHeight < 5;
	}
	toggle() {
		// assert(this.container);
		if (!this.container.contains(v)) this.container = FullPage.getPlayerContainer(v);
		bus.$emit('switchFP', !this._isFull);
		by.classList.toggle('gm-fp-body');
		let e = v;
		while (e != this.container) {
			e.classList.toggle('gm-fp-innerBox');
			e = e.parentNode;
		}
		e.classList.toggle('gm-fp-wrapper');
		e = e.parentNode;
		while (e != by) {
			e.classList.toggle('gm-fp-zTop');
			e = e.parentNode;
		}
		this._isFull = !this._isFull;
	}
}

const cacheMV = {
	check() {
		const buf = v.buffered;
		const i = buf.length - 1;
		this.iEnd = buf.end(i);
		return this.mode ? this.iEnd > v.duration -55 : buf.start(0) >= this.playPos || this.iEnd > v.duration -55;
	},
	finish() {
		v.removeEventListener('canplaythrough', this.onChache);
		v.currentTime = this.playPos;
		this.chached = !1;
		setTimeout(_ => v.pause(), 99);
		HTMLMediaElement.prototype.play = this.rawPlay;
	},
	onChache() {
		if (this.check()) this.finish();
		else v.currentTime = this.iEnd;
	},
	exec() {
		if (cfg.isLive || !v) return;
		if (v.src.startsWith('http')) {
			alert(MSG.cacheStoringError);
			return;
		}
		this.mode = confirm(MSG.cacheStoringConfirm);
		this.chached = true; //正在缓存
		v.pause();
		this.rawPlay = HTMLMediaElement.prototype.play;
		HTMLMediaElement.prototype.play = () => new Promise(noopFn);
		this.playPos = v.currentTime;
		v.addEventListener('canplaythrough', this.onChache);
		this.check();
		v.currentTime = this.iEnd;
	}
};
cacheMV.onChache = cacheMV.onChache.bind(cacheMV);

const actList = new Map();
actList.set(90, _ => { //按键Z: 切换加速状态
	if (v.playbackRate == 1 || v.playbackRate == 0) {
		v.playbackRate = +localStorage.mvPlayRate || 1.3;
	} else {
		// localStorage.mvPlayRate = v.playbackRate;
		v.playbackRate = 1;
	}
})
.set(88, adjustRate.bind(null, -0.1)) //按键X
.set(67, adjustRate.bind(null, 0.1)) //按键C
.set(40, adjustVolume.bind(null, -0.1)) //↓　降音量
.set(38, adjustVolume.bind(null, 0.1)) //↑　加音量
.set(37, _ => {v.currentTime -= 5}) //按键←
.set(37+1024, _ => {v.currentTime -= 20}) //按键shift+←
.set(39, _ => {v.currentTime += 5}) //按键→
.set(39+1024, _ => {v.currentTime += 20}) //按键shift+→
.set(68, _ => {v.currentTime -= 0.03;v.pause()}) //按键D：上一帧
.set(70, _ => {v.currentTime += 0.03;v.pause()}) //按键F：下一帧
.set(32, _ => {	//按键space
	if (cfg.btnPlay) clickDualButton(cfg.btnPlay);
	else v.paused ? v.play() : v.pause();
})
.set(13, _ => {	//回车键。 全屏
	_fs ? _fs.toggle() : clickDualButton(cfg.btnFS);
})
.set(13+1024, _ => {//web全屏
	self != top ? top.postMessage({id: 'gm-h5-toggle-iframeWebFull'}, '*')
	: _fp ? _fp.toggle() : clickDualButton(cfg.btnFP);
})
.set(27+1024, noopFn)	//忽略按键shift + esc
.set(27, ev => {	//按键esc
	if (FullScreen.isFull()) {
		_fs ? _fs.exit() : clickDualButton(cfg.btnFS);
	} else if (self != top) {
		top.postMessage({id: 'gm-h5-is-iframeWebFull'}, '*');
	} else if (FullPage.isFull(v)) {
		_fp ? _fp.toggle() : clickDualButton(cfg.btnFP);
	}
})
.set(73, _ => { //按键I：画中画模式
	if (!d.pictureInPictureElement) {
		v.requestPictureInPicture().catch(err => {
			alert(MSG.cantOpenPIP + err)
		});
	} else {
		d.exitPictureInPicture().catch(err => {
			alert(MSG.cantExitPIP + err)
		});
	}
})
.set(80, _ => { //按键P：截图
	const canvas = d.createElement('canvas');
	canvas.width = v.videoWidth;
	canvas.height = v.videoHeight;
	canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height);

	canvas.toBlob(async(blob) => {
		const dataURL = URL.createObjectURL(blob);
		const link = d.createElement('a');
		link.onclick = ev => {ev.stopPropagation()};
		link.href = dataURL;
		link.download = Date.now().toString(36) +'.png';
		link.style.display = 'none';
		d.body.appendChild(link);
		link.click();
		link.remove();
		await sleep(500);
		URL.revokeObjectURL(dataURL);		
	});
})
.set(77, _ => {// M 缓存视频
	cacheMV.chached ? cacheMV.finish() : cacheMV.exec();
})
.set(78, _ => {// N 下一集
	if (self != top) top.postMessage({id: 'gm-h5-play-next'}, '*');
	else if (cfg.btnNext) doClick(cfg.btnNext);
	else if (cfg.isNumURL) goNextMV();
});

const app = {
	rawProps: new Map(),
	shellEvent() {
		const fn = ev => {
			if (ev.target.closest('svg,img,button')) return;
			ev.stopPropagation(); // preventDefault
			ev.stopImmediatePropagation();
			this.checkUI();
			actList.get(1037)(); //web全屏
		};
		const e = cfg.isClickOnVideo ? v : cfg.mvShell;
		e.addEventListener('mousedown', ev => {
			if (1 == ev.button) {
				ev.preventDefault();
				ev.stopPropagation();
				ev.stopImmediatePropagation();
				if (!cfg.isLive) {
					actList.has(39) ? actList.get(39)() : v.currentTime += 5;
				}
			}
		});
		!cfg.disableDBLClick && e.addEventListener('dblclick', fn);
	},
	setShell() {
		const e = this.getDPlayer() || this.getArtplayer() || this.getVjsPlayer() ||
			(cfg.shellCSS && q(cfg.shellCSS)) ||
			(top != self ? by : FullPage.getPlayerContainer(v));
		if (e && cfg.mvShell !== e) {
			cfg.mvShell = e;
			this.shellEvent();
		}
	},
	checkMV() {
		if (this.vList) {
			const e = this.findMV();
			if (e && e != v) {
				v = e;
				cfg.btnPlay = cfg.btnNext = cfg.btnFP = cfg.btnFS = _fs = _fp = null;
				if (!cfg.isLive && GM_getValue('remberRate', true)) {
					v.playbackRate = +localStorage.mvPlayRate || 1;
					v.addEventListener('ratechange', ev => {
						if (v.playbackRate && v.playbackRate != 1) localStorage.mvPlayRate = v.playbackRate;
					});
				}
				this.setShell();
			}
		}
		if (!validEl(cfg.mvShell)) {
			cfg.mvShell = null;
			this.setShell();
		}
		this.checkUI();
		return v;
	},
	getArtplayer() {
		const e = v.parentNode;
		if (!v.matches('.art-video') || !e.matches('.art-video-player')) return !1;
		cfg.btnFP = q('.art-control-fullscreenWeb', e);
		cfg.btnFS = q('.art-control-fullscreen', e);
		e.closest('body > *')?.classList.add('gm-dp-zTop');
		return e;
	},
	getDPlayer() {
		if (!v.matches('.dplayer-video')) return !1;
		const e = v.closest('.dplayer');
		if (e) {
			cfg.btnFP = q('.dplayer-full-in-icon > span', e);
			cfg.btnFS = q('.dplayer-full-icon', e);
			e.closest('body > *').classList.add('gm-dp-zTop');
		}
		return e;
	},
	getVjsPlayer() {
		const e = v.closest('.video-js');
		if (e) {
			cfg.btnFS = q('.vjs-control-bar > button.vjs-button:nth-last-of-type(1)');
			cfg.webfullCSS = '.vjs-control-bar > button.vjs-button[title$="全屏"]:nth-last-of-type(2)';
		}
		return e;
	},
	hotKey(e) {
		const t = e.target;
		if (e.ctrlKey || e.metaKey || e.altKey || t.contentEditable=='true' || // e.isComposing
			/INPUT|TEXTAREA|SELECT/.test(t.nodeName)) return;
		if (e.shiftKey && ![13,37,39].includes(e.keyCode)) return;
		if (e.shiftKey && e.keyCode == 27) return;
		if (!this.checkMV()) return;
		if (!e.shiftKey && cfg.mvShell && cfg.mvShell.contains(t) && [32,37,39].includes(e.keyCode)) return;
		const key = e.shiftKey ? e.keyCode + 1024 : e.keyCode;
		if (actList.has(key)) {
			e.stopImmediatePropagation();
			e.stopPropagation();
			e.preventDefault();
			actList.get(key)(e);
			if (!cfg.isLive && [67,88,90].includes(e.keyCode)) tip(MSG.speedRate + v.playbackRate);
		}
	},
	checkUI() {
		if (cfg.webfullCSS && !validEl(cfg.btnFP)) cfg.btnFP = q(cfg.webfullCSS);
		if (cfg.btnFP) _fp = null;
		else if (!_fp && self == top) _fp = new FullPage(cfg.mvShell);

		if (cfg.fullCSS && !validEl(cfg.btnFS)) cfg.btnFS = q(cfg.fullCSS);
		if (cfg.btnFS) _fs = null;
		else if (!_fs) _fs = new FullScreen(v);

		if (cfg.nextCSS && (!validEl(cfg.btnNext) || !cfg.btnNext.matches(cfg.nextCSS))) cfg.btnNext = q(cfg.nextCSS);
		if (cfg.playCSS && !validEl(cfg.btnPlay)) cfg.btnPlay = q(cfg.playCSS);
	},
	onGrowVList() {
		if (this.vList.length == this.vCount) return;
		if (this.viewObserver) {
			for (let e of this.vList) {
				if (!this.vSet.has(e)) this.viewObserver.observe(e);
			}
		} else {
			const config = {
				rootMargin: '0px',
				threshold: 0.9
			};
			this.viewObserver = new IntersectionObserver(this.onIntersection.bind(this), config);
			for (let e of this.vList) this.viewObserver.observe(e);
		}
		this.vSet = new Set(this.vList);
		this.vCount = this.vList.length;
	},
	onIntersection(entries) {
		if (this.vList.length < 2) return;
		const entry = find.call(entries, k => k.isIntersecting);
		if (!entry || v == entry.target) return;
		v = entry.target;
		_fs = new FullScreen(v);
		_fp = new FullPage(v);
		bus.$on('switchFP', async (toFull) => {
			// const c = toFull ? this.vSet : this.vList;
			// for (const e of c) this.viewObserver.unobserve(e);
			sleep(200);
			if (!toFull) v.scrollIntoView();
		});
		bus.$emit('switchMV');
	},
	bindEvent() {
		clearInterval(this.timer);
		for (const [i,k] of this.rawProps) Reflect.defineProperty(HTMLVideoElement.prototype, i, k);
		this.rawProps.clear();
		this.rawProps = void 0;
		by = d.body;
		log('bind event\n', v);
		bus.$emit('foundMV');
		const bRate = gmFuncOfCheckMenu(MSG.rememberRateMenuOption,'remberRate');
		window.addEventListener('urlchange', async (info) => { //TM event: info.url
			await sleep(1990);
			this.checkMV();
			if (bRate) v.playbackRate = +localStorage.mvPlayRate || 1;
			bus.$emit('urlchange');
		});
		if (top != self) {
			top.postMessage({id: 'gm-h5-init-MVframe'}, '*');
			window.addEventListener("message", ev => {
				if (!ev.source || !ev.data || !ev.data.id) return;
				switch (ev.data.id) {
				case 'gm-h5-toggle-fullScreen':
					_fs ? _fs.toggle() : clickDualButton(cfg.btnFS);
					break;
				}
			}, false);
		}
		$(v).one('canplay', ev => {
			cfg.isLive = cfg.isLive || v.duration == Infinity;
			if (cfg.isLive) for(const k of [37,37+1024,39,39+1024,78,77,88,67,90]) actList.delete(k);
			else {
				if (bRate) v.playbackRate = +localStorage.mvPlayRate || 1;
				v.addEventListener('ratechange', ev => {
					if (bRate && v.playbackRate && v.playbackRate != 1) localStorage.mvPlayRate = v.playbackRate;
				});
			}
			 
			this.checkMV();
			bus.$emit('canplay');
		});
		$(by).keydown(this.hotKey.bind(this));

		cfg.mvShell ? this.shellEvent() : this.setShell();
		this.checkUI();
		if (cfg.multipleV) {
			new MutationObserver(this.onGrowVList.bind(this)).observe(by, observeOpt);
			this.vCount = 0;
			this.onGrowVList();
		}
		// tip((GM_info.script.name_i18n?.[curLang] || GM_info.script.name) + MSG.ready);
	},
	init() {
		const rawAel = EventTarget.prototype.addEventListener;
		EventTarget.prototype.addEventListener = function(...args) {
			const inMV = this instanceof HTMLMediaElement;
			const block = inMV && (args[0] == 'dblclick' && !args[1].toString().includes('actList.get(1037)'))
				|| (args[0] == 'ratechange' && 'baidu'== u && !args[1].toString().includes('localStorage.mvPlayRate'));
			if (!block) return rawAel.apply(this, args);
		};
		for (const i of this.rawProps.keys()) this.rawProps.set(i,
			Reflect.getOwnPropertyDescriptor(HTMLMediaElement.prototype, i));
		this.vList = d.getElementsByTagName('video');
		const fn = e => cfg.cssMV ? e.matches(cfg.cssMV) : e.offsetWidth > 9;
		this.findMV = find.bind(this.vList, fn);
		this.timer = polling(e => {
			v = e;
			this.bindEvent();
		}, this.findMV);

		hookAttachShadow(async shadowRoot => {
			bus.$emit('addShadowRoot', shadowRoot);
			await sleep(600);
			if (v) return;
			if (v = q('video', shadowRoot)) { // v.getRootNode() == shadowRoot
				log('Found MV in ShadowRoot\n', v, shadowRoot);
				if (!cfg.shellCSS) cfg.mvShell = shadowRoot.host;
				this.bindEvent();

				this.vList = shadowRoot.getElementsByTagName('video');
				this.findMV = find.bind(this.vList, fn);
			}
		});
	}
};

const router = {
	ted() {
		cfg.fullCSS = 'button[title=Fullscreen]';
	},
	youtube() {
		GM_addStyle(
			`.gm-fp-body #player-container-inner{padding-top:0!important}
			.gm-fp-body #player-container-outer{
				max-width:100%!important;
				margin:0!important;
			}`
		);
		cfg.shellCSS = '#player';
		cfg.playCSS = 'button.ytp-play-button';
		cfg.nextCSS = 'a.ytp-next-button';
		cfg.fullCSS = 'button.ytp-fullscreen-button';
		cfg.isClickOnVideo = true;
		actList.delete(32);
		actList.set(69, actList.get(70)).delete(70); //F键 >> E键
	},
	douyin() {
		cfg.isLive = host.startsWith('live.');
		cfg.fullCSS = '.xgplayer-fullscreen';
		// cfg.webfullCSS = cfg.isLive ? '.xgplayer-fullscreen + xg-icon' : '.xgplayer-page-full-screen';
		if (!cfg.isLive) {
			GM_addStyle('.xgplayer-progress-cache{background-color:green!important}');
			actList.set(65, actList.get(90)).delete(90); //Z键 >> A键
			actList.set(83, actList.get(88)).delete(88); //X键 >> S键
			actList.set(86, actList.get(67)).delete(67); //C键 >> V键
		}
	},
	qq() {
		if (self != top &&(host == 'v.qq.com' || host == 'video.qq.com') ) throw MSG.mainPageOnly;
		actList.delete(32);
		cfg.shellCSS = '#player';
		cfg.nextCSS = '.txp_btn_next_u';
		cfg.webfullCSS = '.txp_btn_fake';
		cfg.fullCSS = '.txp_btn_fullscreen';
		// w.__PLAYER__ || w.PLAYER
		app.rawProps.set('playbackRate', 1);
	},
	youku() {
		actList.delete(37);
		actList.delete(39);
		if (host.startsWith('vku.')) {
			bus.$on('canplay', () => {
				cfg.isLive = !q('.spv_progress');
			});
			cfg.fullCSS = '.live_icon_full';
		} else {
			bus.$on('foundMV',() => { $(document).unbind('keyup') });
			cfg.shellCSS = '#ykPlayer';
			cfg.webfullCSS = '.kui-webfullscreen-icon-0';
			cfg.fullCSS = '.kui-fullscreen-icon-0';
			cfg.nextCSS = '.kui-next-icon-0';
		}
	},
	bilibili() {
		cfg.isLive = host.startsWith('live.');
		if (cfg.isLive) return;
		actList.delete(32);

		bus.$on('addShadowRoot', r => {
			if (r.host.nodeName === 'BWP-VIDEO') {
				app.vList = d.getElementsByTagName('bwp-video');
				app.findMV = find.bind(app.vList, e => e.offsetWidth > 9);
				v = r.host;
				app.bindEvent();
			}
		});
		cfg.shellCSS = '#bilibili-player';
		cfg.nextCSS = '.bpx-player-ctrl-next';
		cfg.webfullCSS = '.bpx-player-ctrl-web';
		cfg.fullCSS = '.bpx-player-ctrl-full';
		/*
		const seek = function(step) {
			const p = this.player;
			p.seek(p.getCurrentTime()+ step, p.getState() === "PAUSED");
		};
		actList.set(38, _ => w.player.volume(w.player.volume()+0.1)) //加音量
		.set(40, _ => w.player.volume(w.player.volume()-0.1))
		.set(37, seek.bind(w, -5))
		.set(37+1024, seek.bind(w, -20)) //shift+left  快退20秒
		.set(39, seek.bind(w, 5))
		.set(39+1024, seek.bind(w, 20)) //shift+→  快进20秒
		.set(70, seek.bind(w, 0.03)) //按键F：下一帧
		.set(68, seek.bind(w, -0.03)); //按键D：上一帧
		*/
	},
	iqiyi() {
		cfg.fullCSS = '.iqp-btn-fullscreen:not(.fake__click)';
		cfg.nextCSS = '.iqp-btn-next';
	},
	pptv() {
		cfg.fullCSS = '.w-zoom-container > div';
		cfg.webfullCSS = '.w-expand-container > div';
		cfg.nextCSS = '.w-next';
	},
	mgtv() {
		cfg.fullCSS = 'mango-screen';
		cfg.webfullCSS = 'mango-webscreen > a';
		cfg.nextCSS = 'mango-control-playnext-btn';
	},
	ixigua() {
		cfg.fullCSS = 'div[aria-label="全屏"]';
		cfg.nextCSS = '.xgplayer-control-item.control_playnext';
		GM_addStyle('.gm-fp-body .xgplayer{padding-top:0!important} .gm-fp-wrapper #player_default{max-height: 100%!important} h1.title~a, .videoTitle h1~a{ padding-left:12px; color:blue; }');
	},
	miguvideo() {
		cfg.nextCSS = '.next-btn';
		cfg.fullCSS = '.zoom-btn';
		cfg.shellCSS = '.mod-player';
	},
	baidu() {
		app.rawProps.set('playbackRate', 1);
	},
	weibo() {
		cfg.multipleV = path.startsWith('/u/');
	},
	acfun() {
		cfg.nextCSS = '.btn-next-part .control-btn';
		cfg.webfullCSS = '.fullscreen-web';
		cfg.fullCSS = '.fullscreen-screen';
	},
	['163']() {
		cfg.multipleV = host.startsWith('news.');
		GM_addStyle('div.video,video{max-height: 100% !important;}');
		return host.split('.').length > 3;
	},
	sohu() {
		cfg.nextCSS = 'li.on[data-vid]+li a';
		cfg.fullCSS = '.x-fullscreen-btn';
		cfg.webfullCSS = '.x-pagefs-btn';
	},
	fun() {
		cfg.nextCSS = '.btn-item.btn-next';
	},
	le() {
		GM_addStyle('.gm-fp-body .le_head{display:none!important}');
		cfg.cssMV = '#video video';
		cfg.shellCSS = '#video';
		cfg.nextCSS = '.hv_ico_next';
		const delHiddenProp = _ => {
			if (!v.offsetWidth) Object.values(v.attributes).reverse().some(k => {
				if (v.getAttribute(k.name) == '') {
					v.removeAttribute(k.name);
					return true;
				}
			});
		};
		bus.$on('urlchange',delHiddenProp);
		bus.$once('canplay',delHiddenProp);
	},
	agedm() {
		actList.set(78, _ => { location.href = location.href.replace(/\d+$/, s => ++s) });
	},
	nnyy() {
		GM_registerMenuCommand(MSG.videoLag, () => {
			'use strict';
			v.pause();
			const pos = v.currentTime;
			const buf = v.buffered;
			v.currentTime = buf.end(buf.length - 1) + 1;
			$(v).one('progress', ev => {
				v.currentTime = pos;
				v.play();
			});
		});
		cfg.nextCSS = '.playlist .on + li a';
	},
	douban() {
		cfg.nextCSS = 'a.next-series';
	},	
	douyu() {
		cfg.isLive = !host.startsWith('v.');
		if (cfg.isLive) {
			cfg.cssMV = '.layout-Player video';
			cfg.shellCSS = '#js-player-video';
			cfg.webfullCSS = '.wfs-2a8e83';
			cfg.fullCSS = '.fs-781153';
			cfg.playCSS = 'div[class|=play]';
			path != '/' && $(ev => {
				q('.u-specialStateInput').checked = true;
			});
		} else bus.$on('addShadowRoot', async function(r) {
			if (r.host.matches('#demandcontroller-bar')) {
				await sleep(600);
				cfg.shellCSS = 'div[fullscreen].video';
				cfg.btnFP = q('.ControllerBar-PageFull', r);
				cfg.btnFS = q('.ControllerBar-WindowFull', r);
			}
		});
	},
	yy() {
		cfg.isLive = !path.startsWith('/x/');
		if (cfg.isLive) {
			cfg.fullCSS = '.yc__fullscreen-btn';
			cfg.webfullCSS = '.yc__cinema-mode-btn';
			cfg.playCSS = '.yc__play-btn';
		}
	},
	huya() {
		if (firefoxVer && firefoxVer < 57) return true;
		cfg.disableDBLClick = !0;
		cfg.webfullCSS = '.player-fullpage-btn';
		cfg.fullCSS = '.player-fullscreen-btn';
		cfg.playCSS = '#player-btn';
		polling(doClick, '.login-tips-close');
		localStorage['sidebar/ads'] = '{}';
		localStorage['sidebar/state'] = 0;
		// localStorage.TT_ROOM_SHIELD_CFG_0_ = '{"10000":1,"20001":1,"20002":1,"20003":1,"30000":1}';
	},
	twitch() {
		cfg.isLive = !path.startsWith('/videos/');
		cfg.fullCSS = 'button[data-a-target=player-fullscreen-button]';
		cfg.webfullCSS = '.player-controls__right-control-group > div:nth-child(4) > button';
		cfg.playCSS = 'button[data-a-target=player-play-pause-button]';
	},
	longzhu() {
		cfg.fullCSS = 'a.ya-screen-btn';
	},
	zhanqi() {
		localStorage.lastPlayer = 'h5';
		cfg.fullCSS = '.video-fullscreen';
	}
};

Reflect.defineProperty(navigator, 'plugins', {
	get() { return { length: 0 } }
});
GM_registerMenuCommand(MSG.helpMenuOption, alert.bind(w, MSG.helpBody));
if (!router[u] || !router[u]()) app.init();
if (!router[u] && !cfg.isNumURL) cfg.isNumURL = /[_\W]\d+(\/|\.[a-z]{3,8})?$/.test(path);