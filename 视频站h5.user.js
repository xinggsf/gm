// ==UserScript==
// @name       视频网HTML5播放小工具
// @description 三大功能 。启用HTML5播放；万能网页全屏；添加快捷键：快进、快退、暂停/播放、音量、下一集、切换(网页)全屏、上下帧、播放速度。支持视频站点：油管、TED、优.土、QQ、B站、PPTV、芒果TV、新浪、微博、网易[娱乐、云课堂、新闻]、搜狐、乐视、风行、百度云视频等；直播：斗鱼、YY、虎牙、龙珠、战旗。可增加自定义站点
// @homepage   https://bbs.kafan.cn/thread-2093014-1-1.html
// @include    https://*.qq.com/*
// @exclude    https://user.qzone.qq.com/*
// @include    https://www.weiyun.com/video_*
// @include    https://www.youku.com/
// @include    https://v.youku.com/v_show/id_*
// @include    https://vku.youku.com/live/*
// @include    https://video.tudou.com/v/*
// @include    https://www.bilibili.com/*
// @include    https://www.acfun.cn/*
// @include    http://v.pptv.com/show/*
// @include    https://tv.sohu.com/v/*
// @include    https://film.sohu.com/album/*
// @include    https://www.mgtv.com/*
// @include    *://www.fun.tv/vplay/*
// @include    *://m.fun.tv/*
// @include    *://*.mtime.com/*
// @include    *://www.miaopai.com/*
// @version    1.5.5
// @include    *://*.163.com/*
// @include    *://*.icourse163.org/*
// @include    *://*.sina.com.cn/*
// @include    *://video.sina.cn/*
// @include    *://weibo.com/*
// @include    *://*.weibo.com/*
// @include    https://pan.baidu.com/*
// @include    https://yun.baidu.com/*
// @include    *://v.yinyuetai.com/video/h5/*
// @include    *://v.yinyuetai.com/playlist/h5/*
// @include    *://www.365yg.com/*
// @include    *://v.ifeng.com/*
// @GM_info
// @include    https://www.youtube.com/watch?v=*
// @include    https://www.ted.com/talks/*
// @noframes
// @include    *://www.yy.com/*
// @include    *://v.huya.com/play/*
// @include    https://www.huya.com/*
// @include    https://v.douyu.com/*
// @include    https://www.douyu.com/*
// @include    *://star.longzhu.com/*
// @include    https://www.zhanqi.tv/*

// @include    https://www.yunbtv.com/vodplay/*
// @include    http://www.dililitv.com/vplay/*
// @include    http://www.dililitv.com/gresource/*?Play=*
// @include    http://www.vtuapp.com/tv-play-*
// @include    https://www.66s.cc/*/play/*
// @grant      unsafeWindow
// @grant      GM_addStyle
// @grant      GM_registerMenuCommand
// @grant      GM_setValue
// @grant      GM_getValue
// @run-at     document-start
// @namespace  https://greasyfork.org/users/7036
// @updateURL  https://raw.githubusercontent.com/xinggsf/gm/master/视频站h5.user.js
// ==/UserScript==

'use strict';
const isEdge = navigator.userAgent.includes('Edge');
const w = isEdge ? window : unsafeWindow;
const observeOpt = {childList : true, subtree : true};
const q = (css, p = document) => p.querySelector(css);
const delElem = e => e.remove();
const $$ = (c, cb = delElem, doc = document) => {
	if (!c || !c.length) return;
	if (typeof c === 'string') c = doc.querySelectorAll(c);
	if (!cb) return c;
	for (let e of c) {
		if (e && cb(e)===false) break;
	}
};
const gmFuncOfCheckMenu = (title, saveName, defaultVal = true) => {
	const r = GM_getValue(saveName, defaultVal);
	if (r) title += '            √';
	GM_registerMenuCommand(title, () => {
		GM_setValue(saveName, !r);
		location.reload();
	});
	return r;
};
const r1 = (regp, s) => regp.test(s) && RegExp.$1;
const log = console.log.bind(console, '%c脚本[%s] 反馈：%s\n%s', 'color:#c3c;font-size:1.5em',
	GM_info.script.name, GM_info.script.homepage);
const sleep = ms => new Promise(resolve => {
	setTimeout(resolve, ms);
});
const getStyle = (o, s) => {
	if (o.style[s]) return o.style[s];
	if (getComputedStyle) {//DOM
		var x = getComputedStyle(o, '');
		//s = s.replace(/([A-Z])/g,'-$1').toLowerCase();
		return x && x.getPropertyValue(s);
	}
};
const doClick = e => {
	if (typeof e === 'string') e = q(e);
	if (e) { e.click ? e.click() : e.dispatchEvent(new MouseEvent('click')) };
};
const clickDualButton = (btn) => {
	(!btn.nextSibling || btn.clientWidth >1 || getStyle(btn, 'display') !== 'none') ?
		doClick(btn) : doClick(btn.nextSibling);
};
const firefoxVer = r1(/Firefox\/(\d+)/, navigator.userAgent);
const fakeUA = ua => Object.defineProperty(navigator, 'userAgent', {
	value: ua,
	writable: false,
	configurable: false,
	enumerable: true
});
const getMainDomain = host => {
	const re = /com|tv|net|org|gov|edu/;
	const a = host.split('.');
	let i = a.length - 2;
	if (re.test(a[i])) i--;
	return a[i];
};
const ua_chrome = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3626.121 Safari/537.36';
const ua_ipad2 = 'Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3';

class FullScreen {
	constructor(video) {
		this._video = video;
		const d = document, e = video;
		this._exitFn = d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen;
		this._enterFn = e.requestFullscreen || e.webkitRequestFullScreen || e.mozRequestFullScreen || e.msRequestFullScreen;
	}

	static isFull() {
		const d = document;
		return !!(d.fullscreen || d.webkitIsFullScreen || d.mozFullScreen ||
		d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement);
	}

	enter() {
		this._enterFn && this._enterFn.call(this._video);
	}

	exit() {
		this._exitFn && this._exitFn.call(document);
	}

	toggle() {
		FullScreen.isFull() ? this.exit() : this.enter();
	}
}

//万能网页全屏, CSS代码参考了：https://github.com/gooyie/ykh5p
class FullPage {
	constructor(video, onSwitch) {
		this._video = video;
		this._isFull = !1;
		this._onSwitch = onSwitch;
		this._checkContainer();
		GM_addStyle(
			`.gm-fp-body .gm-fp-zTop {
				position: relative !important;
				z-index: 23333333 !important;
			}
			.gm-fp-wrapper .gm-fp-innerBox {
				width: 100% !important;
				height: 100% !important;
			}
			.gm-fp-wrapper {
				display: block !important;
				position: fixed !important;
				width: 100% !important;
				height: 100% !important;
				top: 0 !important;
				left: 0 !important;
				background: #000 !important;
				z-index: 23333333 !important;
			}`
		);
	}

	getPlayerContainer(video) {
		let e = video, p = e.parentNode;
		const { clientWidth: wid, clientHeight: h } = e;
		for (;;) {
			if (p==document.body || p.clientWidth-wid >3 || p.clientHeight-h >3) return e;
			e.classList.add('gm-fp-innerBox');
			e = p;
			p = e.parentNode;
		}
	}

	_checkContainer() {
		const c = this._container, e = this._video;
		if (!c || c === e) {
			this._container = this.getPlayerContainer(e);
			const d = document.body;
			let p = this._container.parentNode;
			while (p !== d) {
				p.classList.add('gm-fp-zTop');
				p = p.parentNode;
			}
		}
	}

	get container() {
		this._checkContainer();
		return this._container;
	}

	static isFull(e) {
		return w.innerWidth - e.clientWidth <5 && w.innerHeight - e.clientHeight <5;
	}

	toggle() {
		const cb = this._onSwitch;
		if (!this._isFull && cb) cb(true);
		const d = document.body;
		d.style.overflow = this._isFull ? '' : 'hidden';
		d.classList.toggle('gm-fp-body');
		this.container.classList.toggle('gm-fp-wrapper');
		this._isFull = !this._isFull;
		if (!this._isFull && cb) setTimeout(cb, 199, !1);
	}
}

let v, _fp, _fs;
const { host, pathname: path } = location;
const u = getMainDomain(host);
const events = {
	on(name, fn) {
		this[name] = fn;
	}
};
const app = {
	isLive: !1,
	disableSpace: !1,
	multipleV: !1, //单页面多视频
	checkMVVisible() {
		if (this.vList.length < 2 || v.offsetWidth>1) return v;
		let e = this._findList(k => k.offsetWidth>1);
		if (e) {
			e.playbackRate = v.playbackRate;
			e.volume = v.volume;
		}
		v = e;
		return v;
	},
	checkDPlayer() {
		if (v && !this.DPlayer_el && v.closest('.dplayer-video-wrap')) {
			this.DPlayer_el = v.closest('.dplayer');
			_fp = new FullPage(v, this.switchFP);
			this.btnFS = q('.dplayer-full-icon', this.DPlayer_el);
			this.btnFP = this.btnPlay = this.btnNext = _fs = null;
		}
		return this.DPlayer_el;
	},
	hotKey(e) {
		if (e.ctrlKey || e.altKey || e.target.contentEditable=='true' ||
			/INPUT|TEXTAREA|SELECT/.test(e.target.nodeName)) return;
		if (e.shiftKey && ![13,37,39].includes(e.keyCode)) return;
		if (this.isLive && [37,39,78,88,67,90].includes(e.keyCode)) return;
		if (this.extPlayer && this.extPlayer.contains(e.target) &&
			[32,37,39].includes(e.keyCode)) return;
		if (!this.checkMVVisible()) return;
		!this.checkDPlayer() && this.checkUI();
		if (events.keydown && events.keydown(e)) return;
		let n;
		switch (e.keyCode) {
		case 32: //space
			if (this.disableSpace) return;
			if (e.shiftKey) {
				v.scrollIntoView();
				v.focus();
			} else {
				if (this.btnPlay) clickDualButton(this.btnPlay);
				else v.paused ? v.play() : v.pause();
			}
			e.preventDefault();
			break;
		case 37: n = e.shiftKey ? -20 : -5; //left  快退5秒,shift加速
		case 39: //right
			n = n || (e.shiftKey ? 20 : 5); //快进5秒,shift加速
			v.currentTime += n;
			break;
		//case 80: // P 上一首
		case 78: // N 下一首
			this.btnNext && getStyle(this.btnNext, 'display') !== 'none' && doClick(this.btnNext);
			break;
		case 38: n = 0.1; //加音量
		case 40: //降音量
			n = n || -0.1;
			n += v.volume;
			if (0 <= n && n <= 1) v.volume = n;
			e.preventDefault();
			break;
		case 13: //回车键。 全屏
			if (e.shiftKey) {
				_fp ? _fp.toggle() : clickDualButton(this.btnFP);
			} else {
				_fs ? _fs.toggle() : clickDualButton(this.btnFS);
			}
			break;
		case 27: //esc
			if (FullScreen.isFull()) {
				_fs ? _fs.exit() : clickDualButton(this.btnFS);
			} else if (FullPage.isFull(v)) {
				_fp ? _fp.toggle() : clickDualButton(this.btnFP);
			}
			break;
		case 67: n = 0.1; //按键C：加速播放 +0.1
		case 88: //按键X：减速播放 -0.1
			n = n || -0.1;
			n += v.playbackRate;
			if (0 < n && n <= 16) v.playbackRate = n;
			break;
		case 90: //按键Z：正常速度播放
			v.playbackRate = 1;
			break;
		case 70: n = 0.03; //按键F：下一帧
		case 68: //按键D：上一帧
			n = n || -0.03;
			if (!v.paused) v.pause();
			v.currentTime += n;
			break;
		default: return;
		}
		e.stopPropagation();
	},
	checkUI() {
		if (this.webfullCSS && !this.btnFP) this.btnFP = q(this.webfullCSS);
		if (this.btnFP) _fp = null;
		else if (!_fp) _fp = new FullPage(v, this.switchFP);

		if (this.fullCSS && !this.btnFS) this.btnFS = q(this.fullCSS);
		if (this.btnFS) _fs = null;
		else if (!_fs) _fs = new FullScreen(v);

		if (this.nextCSS && !this.btnNext) this.btnNext = q(this.nextCSS);
		if (this.playCSS && !this.btnPlay) this.btnPlay = q(this.playCSS);
	},
	switchFP(toFull) {
		if (toFull) {
			for (let e of this.vSet) this.viewObserver.unobserve(e);
		} else {
			for (let e of this.vList) this.viewObserver.observe(e);
		}
	},
	onGrowVList() {
		if (this.vList.length > this.vCount) {
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
		}
	},
	onIntersection(entries) {
		for (let entry of entries) {
			if (entry.isIntersecting && v != entry.target) {//intersectionRatio
				v = entry.target;
				_fs = new FullScreen(v);
				_fp = new FullPage(v, this.switchFP);
				events.switchMV && events.switchMV();
				break;
			}
		}
	},
	bindEvent() {
		log('bind event\n', v);
		events.foundMV && events.foundMV();
		const fn = ev => {
			events.canplay && events.canplay();
			v.removeEventListener('canplaythrough', fn);
		};
		if (v.readyState > 3) fn();
		else v.addEventListener('canplaythrough', fn);
		document.body.addEventListener('keydown', this.hotKey.bind(this));
		if (this.extPlayerCSS) {
			this.extPlayer = v.closest(this.extPlayerCSS);
			this.extPlayer && this.extPlayer.addEventListener('keydown', this.hotKey.bind(this));
		}

		if (this.multipleV) {
			new MutationObserver(this.onGrowVList.bind(this))
				.observe(document.body, observeOpt);
			this.vCount = 0;
			this.onGrowVList();
		}
	},
	findMV() {
		return !this.cssMV ? this.vList[0] : this._findList(e => e.matches(this.cssMV));
	},
	init() {
		this.switchFP = this.multipleV ? this.switchFP.bind(this) : null;//多视频页面
		this.vList = document.getElementsByTagName('video');
		this._findList = [].find.bind(this.vList);
		const t = setInterval(() => {
			if (v = this.findMV()) {
				clearInterval(t);
				$$(this.adsCSS);
				this.bindEvent();
			}
		}, 300);
	}
};

let router = {
	youtube() {
		app.fullCSS = '.ytp-fullscreen-button';
		app.webfullCSS = '.ytp-size-button';
		app.nextCSS = '.ytp-next-button';
		app.extPlayerCSS = '#ytp-player';
	},
	ted() {
		app.fullCSS = 'button[title="Enter Fullscreen"]';
		app.playCSS = 'button[title="play video"]';
		const forceHD = gmFuncOfCheckMenu('TED强制高清', 'ted_forceHD');
		const getHDSource = async () => {
			const pn = r1(/^(\/talks\/\w+)/, path);
			const resp = await fetch(`https://www.ted.com${pn}/metadata.json`);
			const data = await resp.json();
			return data.talks[0].downloads.nativeDownloads.high;
		};
		const check = async (rs) => {
			if (!v.src || v.src.startsWith('http')) return;
			$$(app.vList, e => { e.removeAttribute('src') }); // 取消多余的媒体资源请求
			try {
				v.src = await getHDSource();
			} catch(ex) {
				console.error(ex);
			}
		};
		forceHD && events.on('foundMV', () => {
			new MutationObserver(check).observe(v, {
				attributes: true,
				attributeFilter: ['src']
			});
			check();
		});
	},
	qq() {
		Object.assign(app, {
			nextCSS: '.txp_btn_next',
			webfullCSS: '.txp_btn_fake',
			fullCSS: '.txp_btn_fullscreen',
			extPlayerCSS: '#mod_player'
		});
	},
	youku() {
		if (host.startsWith('vku.')) {
			events.on('canplay', () => {
				app.isLive = !q('.spv_progress');
			});
			app.fullCSS = '.live_icon_full';
		} else {
			events.on('foundMV', () => {
				app.btnFS = q(app.fullCSS);
				if (!app.btnFS) {//使用了优酷播放器YAPfY扩展
					app.webfullCSS = '.ABP-Web-FullScreen';
					app.fullCSS = '.ABP-FullScreen';
					app.nextCSS = '.ABP-Next';
				} else {
					w.$('.settings-item.disable').replaceWith('<div data-val=1080p class=settings-item data-eventlog=xsl>1080p</div>');
				}
			});
			app.fullCSS = '.control-fullscreen-icon';
			app.nextCSS = '.control-next-video';
			app.extPlayerCSS = '#player';
		}
	},
	bilibili() {
		app.nextCSS = '.bilibili-player-video-btn-next';
		app.webfullCSS = '.bilibili-player-video-web-fullscreen';
		app.fullCSS = '.bilibili-player-video-btn-fullscreen';
		app.extPlayerCSS = '#playerWrap';
		const danmu = gmFuncOfCheckMenu('弹幕', 'bili_danmu');
		const autoPlay = gmFuncOfCheckMenu('自动播放', 'bili_autoPlay');
		const _setPlayer = () => {
			const x = q('.bilibili-player-video-danmaku-switch input');
			if (!x) return setTimeout(_setPlayer, 300);
			if (x.checked != danmu) x.click();
			if (v.paused == autoPlay) autoPlay ? v.play() : v.pause();
			v.focus();
			doClick('i.bilibili-player-iconfont-repeat.icon-24repeaton'); //关循环播放
		};
		const setPlayer = () => {
			const x = app.findMV();
			if (!x || x == v || x.readyState < 4) return; //等待视频加载完成
			v = x;
			app.btnNext = app.btnFP = app.btnFS = null;
			_setPlayer();
		};
		events.on('canplay', () => {
			_setPlayer();
			setInterval(setPlayer, 500);
		});
	},
	pptv() {
		if (!w.chrome) fakeUA(ua_chrome);
		app.fullCSS = '.w-zoomIn';
		app.nextCSS = '.w-next';
		app.playCSS = '.w-play';
		//app.extPlayerCSS = '#playerWrap';
	},
	sina() {
		fakeUA(ua_ipad2);
	},
	weibo() {
		app.multipleV = path.startsWith('/u/');
	},
	miaopai() {
		app.multipleV = path.startsWith('/u/');
	},
	baidu() {
		events.on('keydown', e => {
			if (!videojs) return;
			let n, p = videojs.getPlayers("video-player").html5player;
			switch (e.keyCode) {
			case 67: n = 0.1;
			case 88:
				n = n || -0.1;
				n += + p.tech_.playbackRate().toFixed(1);
				if (0 < n && n <= 16) p.tech_.setPlaybackRate(n);
				return true;
			case 90:
				p.tech_.setPlaybackRate(1);
				return true;
			}
		});
		app.extPlayerCSS = '.video-content';
	},
	mgtv() {
		app.nextCSS = 'mango-control-playnext';
		app.webfullCSS = 'mango-webscreen';
		app.fullCSS = 'mango-screen.control-item';
		app.extPlayerCSS = '#mgtv-player-wrap';
	},
	acfun() {
		app.webfullCSS = '.fullscreen-web';
		app.fullCSS = '.fullscreen-screen';
	},
	['163']() {
		app.multipleV = host.startsWith('news.');
		if ('open.163.com' == host) {
			app.extPlayerCSS = '#playerWrap';
		}
		return host.split('.').length > 3;
	},
	sohu() {
		app.nextCSS = 'li.on[data-vid]+li a';
		app.fullCSS = '.x-fullscreen-btn';
	},
	mtime() {
		fakeUA(ua_ipad2);
		events.on('foundMV', () => {
			v.preload = 'auto';
			v.autoplay = true;
		});
	},
	fun() {
		if (host.startsWith('m.')) {
			if (!path.includes('play')) return true;//非播放页，不执行init()
			/^\/[mv]/.test(path) && location.assign(path.replace('/', '/i') + location.search);
			app.nextCSS = 'a.btn.next-btn';
			app.fullCSS = 'a.btn.full-btn';
			GM_addStyle('div.p-ip-wrap{overflow-y: auto !important;}');
			return;
		}
		let vid = r1(/\bv-(\d+)/, path);
		let mid = r1(/\bg-(\d+)/, path);
		//剧集path: /implay/，单视频path: /ivplay/
		if (vid) {
			mid && location.assign(`//m.fun.tv/implay/?mid=${mid}&vid=${vid}`);
			location.assign('//m.fun.tv/ivplay/?vid='+vid);
		}
		mid && setTimeout(() => {
			vid = w.vplay.videoid;
			vid && location.assign(`//m.fun.tv/implay/?mid=${mid}&vid=${vid}`);
		}, 99);
		r1(/\bt-(\d+)/, path) && setTimeout(() => {
			vid = w.vplay.videoid;
			location.assign('//m.fun.tv/ivplay/?vid='+vid);
		}, 99);
		return true;
	}
};
app.disableSpace = /youtube|qq|pptv|365yg/.test(u);

if (!router[u]) { //直播站点
	router = {
		douyu() {
			const inRoom = host.startsWith('www.');
			events.on('canplay', () => {
				setTimeout(doClick, 2e3, '.roomSmallPlayerFloatLayout-closeBtn');
				$$(app.adsCSS);
				if (inRoom) q('#js-player-aside-state').checked = true;
				else w.$(document).unbind('keydown');
			});
			app.cssMV = '[src^=blob]';
			app.playCSS = inRoom ? 'div[title="播放"]' : 'input[title="播放"]';
			app.webfullCSS = inRoom ? 'div[title="网页全屏"]' : 'input[title="进入网页全屏"]';
			app.fullCSS = inRoom ? 'div[title="窗口全屏"]' : 'input[title="进入全屏"]';
			app.adsCSS = '[data-dysign],a[href*="wan.douyu.com"]';
		},
		yy() {
			app.isLive = !path.startsWith('/x/');
			if (app.isLive) {
				app.fullCSS = '.yc__fullscreen-btn';
				app.webfullCSS = '.yc__cinema-mode-btn';
				app.playCSS = '.yc__play-btn';
			}
		},
		huya() {
			if (firefoxVer && firefoxVer < 57) return true;
			app.webfullCSS = '.player-fullpage-btn';
			app.fullCSS = '.player-fullscreen-btn';
			app.playCSS = '#player-btn';
			app.adsCSS = '#player-subscribe-wap,#wrap-income,#hy-ad';
		},
		longzhu() {
			app.fullCSS = 'a.ya-screen-btn';
		},
		zhanqi() {
			localStorage.lastPlayer = 'h5';
			app.fullCSS = '.video-fullscreen';
		}
	};
	if (router[u]) {
		app.isLive = app.isLive || !host.startsWith('v.');
		!w.chrome && fakeUA(ua_chrome);
	}
}
!/pptv|douyu/.test(u) && Object.defineProperty(navigator, 'plugins', {
	get() { return { length: 0 } }
});
if (!router[u] || !router[u]()) app.init();