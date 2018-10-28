// ==UserScript==
// @name       视频站启用html5播放器
// @description 三大功能 。启用html5播放器；万能网页全屏；添加快捷键：快进、快退、暂停/播放、音量、下一集、切换(网页)全屏、上下帧、播放速度。支持视频站点：油管、TED、优.土、QQ、B站、新浪、微博、网易[娱乐、云课堂、新闻]、搜狐、乐视、风行、百度云视频等；直播：斗鱼、熊猫、YY、虎牙、龙珠。可增加自定义站点
// @version    1.2.1
// @homepage   http://bbs.kafan.cn/thread-2093014-1-1.html
// @include    *://v.qq.com/*
// @include    *://v.sports.qq.com/*
// @include    https://y.qq.com/*/mv/v/*
// @include    *://film.qq.com/*
// @include    *://view.inews.qq.com/*
// @include    *://news.qq.com/*
// @include    https://www.weiyun.com/video_*
// @include    *://www.youku.com/
// @include    *://v.youku.com/v_show/id_*
// include    https://vku.youku.com/live/*
// @include    *://*.tudou.com/v/*
// @include    *://www.bilibili.com/*
// @include    https://tv.sohu.com/v/*
// @include    https://tv.sohu.com/201*
// @include    https://film.sohu.com/album/*
// @include    https://www.mgtv.com/*
// @include    *://www.fun.tv/vplay/*
// @include    *://m.fun.tv/*
// @include    http://*.mtime.com/*
// @include    *://www.miaopai.com/*
// @include    *://www.le.com/ptv/vplay/*

// @include    *://v.163.com/*.html*
// @include    *://ent.163.com/*.html*
// @include    *://news.163.com/*.html*
// @include    *://news.163.com/special/*
// @include    *://study.163.com/course/*.htm?courseId=*
// @include    *://www.icourse163.org/learn/*

// @include    *://news.sina.com.cn/*
// @include    *://video.sina.com.cn/*
// @include    *://video.sina.cn/*
// @include    *://weibo.com/*
// @include    *://*.weibo.com/*
// @include    *://pan.baidu.com/*
// @include    *://yun.baidu.com/*
// @include    *://v.yinyuetai.com/video/h5/*
// @include    *://v.yinyuetai.com/playlist/h5/*
// @include    *://www.365yg.com/*
// @include    *://v.ifeng.com/video_*

// @include    https://www.youtube.com/watch?v=*
// @include    https://www.ted.com/talks/*

// @include    *://www.yy.com/*
// @include    *://v.huya.com/play/*
// @include    *://www.huya.com/*
// @include    https://v.douyu.com/show/*
// @include    https://www.douyu.com/*
// @include    https://www.panda.tv/*
// @include    *://star.longzhu.com/*
// @include    *://www.zhanqi.tv/*
// @grant      unsafeWindow
// @grant      GM_addStyle
// @grant      GM_registerMenuCommand
// @grant      GM_setValue
// @grant      GM_getValue
// @run-at     document-start
// @require    https://greasyfork.org/scripts/29319-web-streams-polyfill/code/web-streams-polyfill.js?version=191261
// @require    https://greasyfork.org/scripts/29306-fetch-readablestream/code/fetch-readablestream.js?version=191832
// @namespace  https://greasyfork.org/users/7036
// @updateURL  https://raw.githubusercontent.com/xinggsf/gm/master/视频站h5.user.js
// ==/UserScript==
'use strict';
if (!NodeList.prototype[Symbol.iterator])
	NodeList.prototype[Symbol.iterator] = HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

const isEdge = navigator.userAgent.includes('Edge'),
w = isEdge ? window : unsafeWindow,
noopFn = () => {},
observeOpt = {childList : true, subtree : true},
q = css => document.querySelector(css),
delElem = e => e.remove(),
$$ = (c, cb = delElem, doc = document) => {
	if (!c.length) return;
	if (typeof c === 'string') c = doc.querySelectorAll(c);
	if (cb) for (let e of c) {
		if (e && cb(e)===false) break;
	}
	return c;
},
gmFuncOfCheckMenu = function(name, val) {
	GM_setValue(name, val);
	w.location.reload();
},
r1 = (regp, s) => regp.test(s) && RegExp.$1,
sleep = ms => new Promise(resolve => {
	setTimeout(resolve, ms);
}),
getStyle = (o, s) => {
    if (o.style[s]) return o.style[s];
    if (getComputedStyle) {//DOM
		var x = getComputedStyle(o, '');
		//s = s.replace(/([A-Z])/g,'-$1').toLowerCase();
		return x && x.getPropertyValue(s);
	}
},
injectJS = s => {
	const js = document.createElement('script');
	if (s.startsWith('http')) js.src = s;
	else js.textContent = s;
	document.head.appendChild(js);
},
throttle = function(fn, delay = 100){ //函数节流
	let timer = null, me = this;
	return function(...args) {
		timer && clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(me, args);
			timer = null;
		}, delay);
	};
},
willRemove = throttle($$),//多处同时调用时须防止定时器冲突
doClick = e => {
	if (typeof e === 'string') e = q(e);
	if (e) { e.click ? e.click() : e.dispatchEvent(new MouseEvent('click')) };
},
firefoxVer = r1(/Firefox\/(\d+)/, navigator.userAgent),
fakeUA = ua => Object.defineProperty(navigator, 'userAgent', {
	value: ua,
	writable: false,
	configurable: false,
	enumerable: true
}),
getMainDomain = host => {
	let a = host.split('.'),
	i = a.length -2;
	if (['com','tv','net','org','gov','edu'].includes(a[i])) i--;
	return a[i];
},
ua_samsung = 'Mozilla/5.0 (Linux; U; Android 4.0.4; GT-I9300 Build/IMM76D) AppleWebKit/534.30 Version/4.0 Mobile Safari/534.30',
ua_chrome = 'Mozilla/5.0 (Windows NT 10.0; WOW64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.9',
ua_ipad2 = 'Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3';

class FullScreen {
	constructor(video) {
		this._video = video;
		const d = document;
		this._exitFn = d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen;

		const e = video;
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

//万能网页全屏,代码参考了：https://github.com/gooyie/ykh5p
class FullPage {
	constructor(video, isFixView, onSwitch) {
		this._video = video;
		this._isFixView = isFixView;
		this._isFull = !1;
		this._onSwitch = onSwitch;
		this._rects = new Map();
		this._checkContainer();
		GM_addStyle(`
			.z-top {
				position: relative !important;
				z-index: 23333333 !important;
			}
			.webfullscreen {
				display: block !important;
				position: fixed !important;
				width: 100% !important;
				height: 100% !important;
				top: 0 !important;
				left: 0 !important;
				background: #000 !important;
				z-index: 23333333 !important;
			}
		`);
	}

	getPlayerContainer(video) {
		let d = document.body,
		e = video,
		p = e.parentNode;
		if (p === d) return e;
		const wid = p.clientWidth,
		h = p.clientHeight;
		do {
			this._rects.set(e, {
				width: e.clientWidth + 'px',
				height: e.clientHeight + 'px'
			});
			e = p;
			p = e.parentNode;
		} while (p !== d && p.clientWidth - wid < 5 && p.clientHeight - h < 5);
		this._rects.delete(e);
		return e;
	}

	_checkContainer() {
		const e = this._video;
		if (!this._container || this._container === e)
			this._container = this.getPlayerContainer(e);
	}

	get container() {
		this._checkContainer();
		return this._container;
	}

	fixView() {
		if (!this._isFixView && !this._isFull) return;
		if (this._video === this._container) return;
		for(let [e, v] of this._rects) if (this._isFull)
			e.style.width = e.style.height = '100%';
		else {
			e.style.width = v.width;
			e.style.height = v.height;
		}
	}

	static isFull(video) {
		return window.innerWidth -video.clientWidth < 5 && window.innerHeight - video.clientHeight < 5;
	}

	toggle() {
		const cb = this._onSwitch;
		if (!this._isFull && cb) cb(true);
		const d = document.body;
		d.style.overflow = this._isFull ? '' : 'hidden';
		this.container.classList.toggle('webfullscreen');

		let p = this.container.parentNode;
		while (p !== d) {
			p.classList.toggle('z-top');
			p = p.parentNode;
		}
		this._isFull = !this._isFull;

		setTimeout(this.fixView.bind(this), 9);
		if (!this._isFull && cb) setTimeout(cb, 199, !1);
	}
}

let v, _fp, _fs;

const { host, pathname: path } = location,
u = getMainDomain(host),//主域名
//容器，登记事件处理方法中的回调
events = {
	on(name, fn) {
		this[name] = fn;
	}
},
app = {
	isLive: !1,
	disableSpace: !1,
	multipleV: !1, //单页面多视频
	isFixFPView: !1, //退出网页全屏时是否修正DOM视图
	getVideos() {
		if (v.offsetWidth>1) return;
		for (let e of this.vList) if (e.offsetWidth>1) {
			e.playbackRate = v.playbackRate;
			e.volume = v.volume;
			v = e;
			break;
		}
	},
	_convertView(btn) {
		(!btn.nextSibling || btn.clientWidth >1 || getStyle(btn, 'display') !== 'none') ? doClick(btn) : doClick(btn.nextSibling);
	},
	hotKey(e) {
		//判断ctrl,alt,shift三键状态，防止浏览器快捷键被占用
		if (e.ctrlKey || e.altKey || /INPUT|TEXTAREA/.test(e.target.nodeName)) return;
		if (e.shiftKey && ![13,37,39].includes(e.keyCode)) return;
		if (this.isLive && [37,39,78,88,67,90].includes(e.keyCode)) return;
		this.getVideos();
		this.checkUI();
		if (events.keydown && events.keydown(e)) return;
		let n;
		switch (e.keyCode) {
		case 32: //space
			if (this.disableSpace) return;
			if (this.btnPlay) this.play();
			else v.paused ? v.play() : v.pause();
			e.preventDefault();
			break;
		case 37: //left
			n = e.shiftKey ? -27 : -5; //快退5秒,shift加速
		case 39: //right
			n = n || (e.shiftKey ? 27 : 5); //快进5秒,shift加速
			v.currentTime += n;
			break;
		case 78: // N 下一首
			this.btnNext && getStyle(this.btnNext, 'display') !== 'none' && doClick(this.btnNext);
			break;
		//case 80: // P 上一首
		case 38: //加音量
			n = 0.1;
		case 40: //降音量
			n = n || -0.1;
			n += v.volume;
			if (0 <= n && n <= 1) v.volume = n;
			e.preventDefault();
			e.stopPropagation();
			break;
		case 13: //全屏
			if (e.shiftKey) {
				_fp ? _fp.toggle() : this.fullPage();
			} else {
				_fs ? _fs.toggle() : this.fullScreen();
			}
			break;
		case 27: //esc
			if (FullScreen.isFull()) {
				_fs ? _fs.exit() : this.fullScreen();
			} else if (FullPage.isFull(v)) {
				_fp ? _fp.toggle() : this.fullPage();
			}
			break;
		case 67: //按键C：加速播放 +0.1
			n = 0.1;
		case 88: //按键X：减速播放 -0.1
			n = n || -0.1;
			n += v.playbackRate;
			if (0 < n && n <= 16) v.playbackRate = n;
			break;
		case 90: //按键Z：正常速度播放
			v.playbackRate = 1;
			break;
		case 70: //按键F：下一帧
			n = 0.03;
		case 68: //按键D：上一帧
			n = n || -0.03;
			if (!v.paused) v.pause();
			v.currentTime += n;
		}
	},
	checkUI() {
		if (this.webfullCSS && !this.btnWFS) this.btnWFS = q(this.webfullCSS);
		if (this.btnWFS) {
			this.fullPage = () => this._convertView(this.btnWFS);
			if (_fp) _fp = null;
		} else {
			_fp = _fp || new FullPage(v, this.isFixFPView, this.switchFP);
		}

		if (this.fullCSS && !this.btnFS) this.btnFS = q(this.fullCSS);
		if (!this.btnFS) {
			_fs = _fs || new FullScreen(v);
		} else {
			this.fullScreen = () => this._convertView(this.btnFS);
			if (_fs) _fs = null;
		}

		if (this.nextCSS && !this.btnNext) this.btnNext = q(this.nextCSS);

		if (this.playCSS && !this.btnPlay) this.btnPlay = q(this.playCSS);
		if (this.btnPlay) this.play = () => this._convertView(this.btnPlay);
	},
	switchFP(toFull) {
		//if (!this.viewObserver) return;
		if (toFull) {
			for (let e of this.vSet) this.viewObserver.unobserve(e);
		} else {
			for (let e of this.vList) this.viewObserver.observe(e);
		}
	},
	onGrowVList() {
		if (this.vList.length > this.vCount) {
			if (this.viewObserver) {
				for (let e of this.vList) if (!this.vSet.has(e)) {
					this.viewObserver.observe(e);
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
				_fp = new FullPage(v, this.isFixFPView, this.switchFP);
				events.switchMV && events.switchMV();
				break;
			}
		}
	},
	bindEvent() {
		const fn = ev => {
			console.log('脚本[启用html5播放器]，事件canplaythrough');
			events.canplay && events.canplay();
			v.removeEventListener('canplaythrough', fn);
		};
		if (v.readyState > 2) fn(); else
		v.addEventListener('canplaythrough', fn);
		document.addEventListener('keydown', this.hotKey.bind(this));
		this.checkUI();
		events.foundMV && events.foundMV();

		this.vCount = 1;
		if (this.multipleV) {
			new MutationObserver(this.onGrowVList.bind(this))
				.observe(document.body, observeOpt);
		}
	},
	findMV() {
		if (!this.cssMV) return (v = this.vList[0]);
		for (let e of this.vList) if (e.matches(this.cssMV)) return (v = e);
	},
	init() {
		this.switchFP = this.multipleV ? this.switchFP.bind(this) : null;//多视频页面
		document.addEventListener('DOMContentLoaded', e => {
			this.vList = document.getElementsByTagName('video');
			if (this.findMV()) this.bindEvent();
			else {
				this.observer = new MutationObserver(records => {
					if (v || this.findMV()) {
						this.observer.disconnect();
						delete this.observer;
						this.bindEvent();
					}
					if (this.adsCSS) willRemove(this.adsCSS);
					if (events.observe && events.observe()) delete events.observe;
				});
				this.observer.observe(document.body, observeOpt);
			}
			events.DOMReady && events.DOMReady();
		});
	}
};

let router = {
	youtube() {
		app.fullCSS = '.ytp-fullscreen-button';
		app.disableSpace = true;
		app.nextCSS = '.ytp-next-button';
	},
	ted() {
		app.fullCSS = 'button[title="Enter Fullscreen"]';
		app.playCSS = 'button[title="play video"]';
		const opt = GM_getValue('ted_forceHD', true);
		let title = 'TED强制高清';
		if (opt) title += '    √';
		GM_registerMenuCommand(title, gmFuncOfCheckMenu.bind(null, 'ted_forceHD', !opt));

		const getHDSource = async () => {
			const pn = r1(/^(\/talks\/\w+)/, location.pathname);
			const resp = await fetch(`https://www.ted.com${pn}/metadata.json`);
			const data = await resp.json();
			return data.talks[0].downloads.nativeDownloads.high;
		},
		check = async (rs) => {
			if (!v.src || v.src.startsWith('http')) return;
			$$(app.vList, e => { e.src = ''}); // 取消多余的媒体资源请求
			try {
				v.src = await getHDSource();
			} catch(ex) {
				console.log(ex);
			}
		};
		events.on('foundMV',() => {
			if (opt) new MutationObserver(check).observe(v, {
				attributes: true,
				attributeFilter: ['src']
			});
		});
	},
	qq() {
		Object.assign(app, {
			disableSpace: true,
			nextCSS: '.txp_btn_next',
			webfullCSS: '.txp_btn_fake',
			fullCSS: '.txp_btn_fullscreen',
		});
		const fn = () => {
			for (let i = localStorage.length -1; i >= 0; i--) {
				const s = localStorage.key(i);
				!/^ten_|^txp-/.test(s) && localStorage.removeItem(s);
			}
		};
		events.on('DOMReady', fn);
		const ps = history.pushState;
		history.pushState = function() {
			fn();
			ps.apply(this, arguments);
		};
		w.addEventListener('popstate', fn);
		document.addEventListener('visibilitychange', ev => !document.hidden && fn());
		fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:48.0) Gecko/20100101 Firefox/48.0');
	},
	youku() {
		if (!host.startsWith('vku.')) {
			events.on('foundMV', () => {
				//使用了优酷播放器YAPfY扩展
				if (!app.btnFS) {
					app.webfullCSS = '.ABP-Web-FullScreen';
					app.fullCSS = '.ABP-FullScreen';
				}
			});
			events.on('canplay', () => {
				$$('.youku-layer-logo');//去水印。  破解1080P
				w.$('.settings-item.disable').replaceWith('<div data-val=1080p class=settings-item data-eventlog=xsl>1080p</div>');
			});
			app.fullCSS = '.control-fullscreen-icon';
			app.nextCSS = '.control-next-video';
		}
	},
	bilibili() {
		const autoPlay = GM_getValue('bili_autoPlay', true);
		let title = '自动播放';
		if (autoPlay) title += '    √';
		GM_registerMenuCommand(title, gmFuncOfCheckMenu.bind(null, 'bili_autoPlay', !autoPlay));
		const danmu = GM_getValue('bili_danmu', true);
		title = '弹幕';
		if (danmu) title += '    √';
		GM_registerMenuCommand(title, gmFuncOfCheckMenu.bind(null, 'bili_danmu', !danmu));

		let newPlayer, x = localStorage.bilibili_player_settings;
		if (x) {
			x = JSON.parse(x);
			x.video_status.highquality = true;
			x.video_status.iswidescreen = true;
			//x.setting_config.defquality = '80';
			localStorage.bilibili_player_settings = JSON.stringify(x);
		} else
			//defquality 选择清晰度，720P：64  1080P：80
			localStorage.bilibili_player_settings = `{"setting_config":{"type":"div","opacity":"1.00","fontfamily":"SimHei, 'Microsoft JhengHei'","fontfamilycustom":"","bold":false,"preventshade":false,"fontborder":0,"speedplus":"1.0","speedsync":false,"fontsize":"1.0","fullscreensync":false,"danmakunumber":50,"fullscreensend":false,"defquality":"80","sameaspanel":false},"video_status":{"autopart":1,"highquality":true,"widescreensave":true,"iswidescreen":true,"videomirror":false,"videospeed":1,"volume":1},"block":{"status":true,"type_scroll":true,"type_top":true,"type_bottom":true,"type_reverse":true,"type_guest":true,"type_color":true,"function_normal":true,"function_subtitle":true,"function_special":true,"cloud_level":2,"cloud_source_video":true,"cloud_source_partition":true,"cloud_source_all":true,"size":0,"regexp":false,"list":[]},"message":{"system":false,"bangumi":false,"news":false}}`;
		app.nextCSS = '.bilibili-player-video-btn-next';
		app.playCSS = 'button[title="play video"]';
		events.on('foundMV', () => {
			newPlayer = !!q('#entryOld');
			app.webfullCSS = newPlayer ? '.bilibili-player-video-web-fullscreen': 'i[name="web_fullscreen"]';
			app.fullCSS = newPlayer ? '.bilibili-player-video-btn-fullscreen' : 'i[name="browser_fullscreen"]';
		});
		const _setPlayer = () => {
			v = q('#bofqi video[src]');
			if (!v) {
				setTimeout(_setPlayer, 300);
				return;
			}
			app.btnNext = app.btnWFS = app.btnFS = null;
			doClick('i.bilibili-player-iconfont-repeat.icon-24repeaton'); //关循环播放
			const css = newPlayer ? '.bilibili-player-video-danmaku-switch input' : 'i[name=ctlbar_danmuku_close]';
			!danmu && setTimeout(doClick, 90, css);//关弹幕

			if (autoPlay) {
				if (v.readyState === 4) v.play();
				else v.oncanplaythrough = ev => { v.play() };
			}

			!newPlayer && v.scrollIntoView();
		};
		const fn = history.pushState;
		history.pushState = function() {
			fn.apply(this, arguments);
			setTimeout(_setPlayer, 500);
		};
		const doLater = () => { setTimeout(_setPlayer, 500) };
		w.addEventListener('popstate', doLater);
		events.on('canplay', doLater);
	},
	sina() {
		fakeUA(ua_ipad2);
	},
	weibo() {
		app.isFixFPView = true;
		app.multipleV = path.startsWith('/u/');
	},
	miaopai() {
		app.multipleV = path.startsWith('/u/');
	},
	baidu() {
		if (path.startsWith('/play/')) events.on('keydown', e => {
			let n, api = w.videojs.getPlayers("video-player").html5player.tech_;
			switch (e.keyCode) {
			case 67: //按键C：加速播放 +0.1
				n = 0.1;
			case 88: //按键X：减速播放 -0.1
				n = n || -0.1;
				n += v.playbackRate;
				if (0 < n && n <= 16) api.setPlaybackRate(n);
				break;
			case 90: //按键Z：正常速度播放
				api.setPlaybackRate(1);
				break;
			default:
				return !1;
			}
			return true;
		});
	},
	mgtv() {
		//app.playCSS = '.control-item.btn-play';
		app.disableSpace = true;
		app.nextCSS = 'mango-control-playnext-btn';
		app.webfullCSS = 'mango-webscreen';
		app.fullCSS = 'mango-screen';
	},
	le() {
		fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 Version/7.0.3 Safari/7046A194A');
		app.nextCSS = 'div.hv_ico_next';
		app.webfullCSS = 'span.hv_ico_webfullscreen';
		app.fullCSS = 'span.hv_ico_screen';
	},
	sohu() {
		if (!path.endsWith('html')) return true;
		//fakeUA(ua_samsung);
		app.nextCSS = 'li.on[data-vid]+li a';
		app.fullCSS = '.x-fullscreen-btn';//x-fs-btn
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
		return true;
	}
};
router.mtime = router.sina;

if (!router[u]) { //直播站点
	router = {
		douyu() {
			if (isEdge) fakeUA(ua_chrome);
			let h5El, //播放器窗口
			inRoom = /^\/(t\/)?\w+$/.test(path), //w.$ROOM?.room_id
			cleanAds = throttle((c) => {
				$$(app.adsCSS);
				$$('i.sign-spec', e=>e.parentNode.remove());
				inRoom && $$('.layout-Player~*,#dialog-more-video~*');
			}, 300),
			doMV_Ads = throttle(() => {
				$$(h5El.children, e => {
					!e.hidden && e.matches('div:not([class]):not([style])') && (e.hidden = true);
				});
			}, 300),
			mo = new MutationObserver(rs => {
				const container = rs[0].target;
				if (!rs[0].addedNodes.length || !container || container.nodeName == 'UL') return;
				inRoom && doMV_Ads();
				cleanAds(container);
			}),
			onPlay = async () => {
				v.removeEventListener('play', onPlay);
				await sleep(9900);
				mo.disconnect();
			},
			swapH5 = async () => {
				await sleep(190);
				const p = w.__player;
				!v && p && !p.isSwitch && p.switchPlayer('h5');
			};
			events.on('foundMV', function() {
				mo.observe(document.body, observeOpt);
				v.addEventListener('play', onPlay);
				h5El = v.parentNode.parentNode; // #__h5player
			});

			w.addEventListener('load', swapH5);
			setTimeout(swapH5, 1500); //防止某个资源请求卡住，导致onload事件不能激发
			app.cssMV = inRoom ? 'div[id^=__h5player] video' : '.video-box video';
			app.webfullCSS = inRoom ? 'div[title="网页全屏"]' : 'input[title="进入网页全屏"]';
			app.fullCSS = inRoom ? 'div[title="窗口全屏"]' : 'input[title="进入全屏"]';
			app.adsCSS = '#js-recommand>div:nth-of-type(2)~*,div[data-dysign],a[href*="wan.douyu.com"]';
		},
		panda() {
			if (isEdge) fakeUA(ua_chrome);
			app.webfullCSS = '.h5player-control-bar-fullscreen';
			app.fullCSS = '.h5player-control-bar-allfullscreen';
			app.adsCSS = '.act-zhuxianmarch-container, #liveos-container, .ad-container, .room-banner-images';
			setTimeout($$, 1900, app.adsCSS);
		},
		yy() {
			if (!w.chrome) fakeUA(ua_chrome);
			app.fullCSS = '.liveplayerToolBar-fullScreenBtn';
			app.webfullCSS = '.liveplayerToolbar-cinema';
		},
		huya() {
			if (firefoxVer && firefoxVer < 57) return true;
			if (!w.chrome) fakeUA(ua_chrome);
			app.webfullCSS = '.player-fullpage-btn';
			app.fullCSS = '.player-fullscreen-btn';
			app.playCSS = '#player-btn';
			app.adsCSS = '#player-subscribe-wap,#wrap-income,.room-footer,#J_spbg,.room-core-r,.room-hd-r';//清爽界面,#player-login-tip-wrap

			events.on('canplay', function() {
				setTimeout($$, 900, app.adsCSS);
				if (!w.TT_ROOM_DATA) return;
				const ti = setInterval(() => {
					if (!q("li[ibitrate='500']")) return;
					clearInterval(ti);
					const $ = w.$;
					$(".player-videotype-list li").unbind('click')
					.click(function(e) {
						const li = $(this);
						if (li.hasClass('on')) return;
						const rate = li.attr("ibitrate");
						w.vplayer.vcore.reqBitRate(rate, w.TT_ROOM_DATA.channel);
						li.siblings('.on').removeClass('on');
						li.addClass('on').parent().parent().hide();
						$('.player-videotype-cur').text(li.text());
					});
				}, 500);
			});
		},
		longzhu() {
			if (!w.chrome) fakeUA(ua_chrome);
			app.fullCSS = 'a.ya-screen-btn';
		},
		zhanqi() {
			if (isEdge) fakeUA(ua_chrome);
			app.fullCSS = '.video-fullscreen';
		}
	};

	app.isLive = router[u] && !host.startsWith('v.');
}

!/zhanqi|sohu/.test(u) && Object.defineProperty(navigator, 'plugins', {
	get() {
		return { length: 0 };
	}
});
if (!router[u] || !router[u]()) app.init();
