// ==UserScript==
// @name       视频网HTML5播放小工具
// @description 三大功能 。启用html5播放；万能网页全屏；添加快捷键：快进、快退、暂停/播放、音量、下一集、切换(网页)全屏、上下帧、播放速度。支持视频站点：油管、TED、优.土、QQ、B站、PPTV、芒果TV、新浪、微博、网易[娱乐、云课堂、新闻]、搜狐、乐视、风行、百度云视频等；直播：斗鱼、YY、虎牙、龙珠、战旗。可增加自定义站点
// @homepage   https://bbs.kafan.cn/thread-2093014-1-1.html
// @include    https://*.qq.com/*
// @include    https://www.weiyun.com/video_*
// @include    https://www.youku.com/
// @include    https://v.youku.com/v_show/id_*
// @include    https://vku.youku.com/live/*
// @include    https://video.tudou.com/v/*
// @include    https://www.bilibili.com/*
// @include    http://v.pptv.com/show/*
// @include    https://tv.sohu.com/*
// @include    https://film.sohu.com/album/*
// @include    https://www.mgtv.com/*
// @include    *://www.fun.tv/vplay/*
// @include    *://m.fun.tv/*
// @include    *://*.mtime.com/*
// @include    *://www.miaopai.com/*
// @include    *://www.le.com/ptv/vplay/*
// @version    1.4.2
// @include    *://*.163.com/*
// @include    *://www.icourse163.org/learn/*
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
// @include    *://www.huya.com/*
// @include    https://v.douyu.com/*
// @include    https://www.douyu.com/*
// @include    *://star.longzhu.com/*
// @include    https://www.zhanqi.tv/*
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
const isEdge = navigator.userAgent.includes('Edge'),
w = isEdge ? window : unsafeWindow,
observeOpt = {childList : true, subtree : true},
q = css => document.querySelector(css),
delElem = e => e.remove(),
$$ = (c, cb = delElem, doc = document) => {
	if (!c || !c.length) return;
	if (typeof c === 'string') c = doc.querySelectorAll(c);
	if (!cb) return c;
	for (let e of c) if (e && cb(e)===false) break;
},
gmFuncOfCheckMenu = (title, saveName, defaultVal = true) => {
	const r = GM_getValue(saveName, defaultVal);
	if (r) title += '            √';
	GM_registerMenuCommand(title, () => {
		GM_setValue(saveName, !r);
		w.location.reload();
	});
	return r;
},
r1 = (regp, s) => regp.test(s) && RegExp.$1,
log = console.log.bind(console,`%c脚本[${GM_info.script.name}]`,'color:#c3c;font-size:1.2em'),
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

//万能网页全屏, CSS代码参考了：https://github.com/gooyie/ykh5p
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
		let d = document.body, e = video, p = e.parentNode;
		const {clientWidth: wid, clientHeight: h} = e;
		while (1) {
			this._rects.set(e, {
				width: e.clientWidth + 'px',
				height: e.clientHeight + 'px'
			});
			e.style.maxWidth = e.style.maxHeight = '100%';
			if (p == d || p.clientWidth < wid || p.clientWidth - wid >3 ||
				p.clientHeight < h || p.clientHeight - h >3) return e;
			e = p;
			p = e.parentNode;
		}
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
			e.style.width = e.style.height = e.style.maxWidth = e.style.maxHeight = '100%';
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
	_convertButton(btn) {
		(!btn.nextSibling || btn.clientWidth >1 || getStyle(btn, 'display') !== 'none') ? doClick(btn) : doClick(btn.nextSibling);
	},
	hotKey(e) {
		if (e.ctrlKey || e.altKey || e.target.contentEditable=='true' ||
			/INPUT|TEXTAREA|SELECT/.test(e.target.nodeName)) return;
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
		case 37: n = e.shiftKey ? -27 : -5; //left  快退5秒,shift加速
		case 39: //right
			n = n || (e.shiftKey ? 27 : 5); //快进5秒,shift加速
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
			e.stopPropagation();
			break;
		case 13: //回车键。 全屏
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
		}
	},
	checkUI() {
		if (this.webfullCSS && !this.btnWFS) this.btnWFS = q(this.webfullCSS);
		if (this.btnWFS) {
			this.fullPage = () => this._convertButton(this.btnWFS);
			if (_fp) _fp = null;
		} else {
			_fp = _fp || new FullPage(v, this.isFixFPView, this.switchFP);
		}

		if (this.fullCSS && !this.btnFS) this.btnFS = q(this.fullCSS);
		if (!this.btnFS) {
			_fs = _fs || new FullScreen(v);
		} else {
			this.fullScreen = () => this._convertButton(this.btnFS);
			if (_fs) _fs = null;
		}

		if (this.nextCSS && !this.btnNext) this.btnNext = q(this.nextCSS);

		if (this.playCSS && !this.btnPlay) this.btnPlay = q(this.playCSS);
		if (this.btnPlay) this.play = () => this._convertButton(this.btnPlay);
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
		log('bind event\n', v);
		const fn = ev => {
			events.canplay && events.canplay();
			v.removeEventListener('canplaythrough', fn);
		};
		if (v.readyState > 3) fn();
		else v.addEventListener('canplaythrough', fn);
		document.body.addEventListener('keydown', this.hotKey.bind(this));
		this.checkUI();
		events.foundMV && events.foundMV();

		if (this.multipleV) new MutationObserver(this.onGrowVList.bind(this))
			.observe(document.body, observeOpt);
		this.vCount = 1;
	},
	findMV() {
		if (!this.cssMV) return this.vList[0];
		for (let e of this.vList) if (e.matches(this.cssMV)) return e;
	},
	init() {
		this.switchFP = this.multipleV ? this.switchFP.bind(this) : null;//多视频页面
		this.vList = document.getElementsByTagName('video');
		document.addEventListener('DOMContentLoaded', async e => {
			events.DOMReady && events.DOMReady();
			do {
				await sleep(300);
				$$(this.adsCSS);
				v = this.findMV();
			} while (!v);
			this.bindEvent();
		});
	}
};

let router = {
	youtube() {
		app.fullCSS = '.ytp-fullscreen-button';
		app.nextCSS = '.ytp-next-button';
	},
	ted() {
		app.fullCSS = 'button[title="Enter Fullscreen"]';
		app.playCSS = 'button[title="play video"]';
		const forceHD = gmFuncOfCheckMenu('TED强制高清', 'ted_forceHD'),
		getHDSource = async () => {
			const pn = r1(/^(\/talks\/\w+)/, path);
			const resp = await fetch(`https://www.ted.com${pn}/metadata.json`);
			const data = await resp.json();
			return data.talks[0].downloads.nativeDownloads.high;
		},
		check = async (rs) => {
			if (!v.src || v.src.startsWith('http')) return;
			$$(app.vList, e => { e.removeAttribute('src') }); // 取消多余的媒体资源请求
			try {
				v.src = await getHDSource();
			} catch(ex) {
				console.error(ex);
			}
		};
		events.on('foundMV',() => {
			if (forceHD) new MutationObserver(check).observe(v, {
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
				if (!app.btnFS) {//使用了优酷播放器YAPfY扩展
					app.webfullCSS = '.ABP-Web-FullScreen';
					app.fullCSS = '.ABP-FullScreen';
				} else {
					w.$('.settings-item.disable').replaceWith('<div data-val=1080p class=settings-item data-eventlog=xsl>1080p</div>');
				}
			});
			app.fullCSS = '.control-fullscreen-icon';
			app.nextCSS = '.control-next-video';
		}
	},
	bilibili() {
		app.nextCSS = '.bilibili-player-video-btn-next';
		app.webfullCSS = '.bilibili-player-video-web-fullscreen';
		app.fullCSS = '.bilibili-player-video-btn-fullscreen';
		const danmu = gmFuncOfCheckMenu('弹幕', 'bili_danmu'),
		autoPlay = gmFuncOfCheckMenu('自动播放', 'bili_autoPlay'),
		_setPlayer = () => {
			const x = q('.bilibili-player-video-danmaku-switch input');
			if (!x) return setTimeout(_setPlayer, 300);
			if (x.checked != danmu) x.click();
			if (v.paused == autoPlay) autoPlay ? v.play() : v.pause();
			v.focus();
			doClick('i.bilibili-player-iconfont-repeat.icon-24repeaton'); //关循环播放
		},
		setPlayer = () => {
			const x = app.findMV();
			if (!x || x == v || x.readyState < 4) return; //等待视频加载完成，再进行后续动作
			v = x;
			app.btnNext = app.btnWFS = app.btnFS = null;
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
		events.on('keydown', e => {
			if (!videojs) return;
			let n, p = videojs.getPlayers("video-player").html5player;
			switch (e.keyCode) {
			case 67: n = 0.1;
			case 88:
				n = n || -0.1;
				n += +p.tech_.playbackRate().toFixed(1);
				if (0 < n && n <= 16) p.tech_.setPlaybackRate(n);
				return true;
			case 90:
				p.tech_.setPlaybackRate(1);
				return true;
			default: return !1;
			}
		});
	},
	mgtv() {
		app.nextCSS = 'mango-control-playnext-btn';
		app.webfullCSS = 'mango-webscreen';
		app.fullCSS = 'mango-screen';
	},
	['163']() {
		app.multipleV = host.startsWith('news.');
		return host.split('.').length > 3;
	},
	le() {
		fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 Version/7.0.3 Safari/7046A194A');
		app.nextCSS = 'div.hv_ico_next';
		app.webfullCSS = 'span.hv_ico_webfullscreen';
		app.fullCSS = 'span.hv_ico_screen';
	},
	sohu() {
		if (!path.endsWith('html')) return true;
		app.nextCSS = 'li.on[data-vid]+li a';
		app.fullCSS = '.x-fullscreen-btn';
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
app.disableSpace = /youtube|youku|qq|bilibili|mgtv|pptv|baidu|365yg/.test(u) || host == 'open.163.com';

if (!router[u]) { //直播站点
	router = {
		douyu() { // https://sta-op.douyucdn.cn/front-publish/live_player-master/js/h5-plugin_d7adb66.js
			const inRoom = host.startsWith('www.');
			events.on('canplay', () => {
				$$(app.adsCSS);
				$$('i.sign-spec', e=>e.parentNode.remove());
				if (inRoom) q('#js-player-aside-state').checked = true;
				else w.$(document).unbind('keydown');
			});
			app.cssMV = '[src^=blob]';
			app.playCSS = inRoom ? 'div[title="播放"]' : 'input[title="播放"]';
			app.webfullCSS = inRoom ? 'div[title="网页全屏"]' : 'input[title="进入网页全屏"]';
			app.fullCSS = inRoom ? 'div[title="窗口全屏"]' : 'input[title="进入全屏"]';
			app.adsCSS = '.layout-Player~*,[data-dysign],a[href*="wan.douyu.com"]';
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
			app.adsCSS = '#player-subscribe-wap,#wrap-income';

			let $, onBitrate = function(e) {
				const li = $(this);
				if (li.hasClass('on')) return;
				const rate = li.attr("ibitrate");
				w.vplayer.vcore.reqBitRate(rate, w.TT_ROOM_DATA.channel);
				li.siblings('.on').removeClass('on');
				li.addClass('on').parent().parent().hide();
				$('.player-videotype-cur').text(li.text());
			},
			resetMenu = () => $(".player-videotype-list li").unbind('click').click(onBitrate);

			events.on('canplay', function() {
				setTimeout($$, 900, app.adsCSS);
				$ = w.$;
				if (!w.TT_ROOM_DATA) return;
				new MutationObserver(function(rs) {
					const el = q('#player-login-tip-wrap');
					if (!el) return;
					this.disconnect();
					el.remove();
					resetMenu();
				})
				.observe(v.closest('#player-wrap'), observeOpt);
				$('.smart_menu_ul, #change-line-btn').click(e => { setTimeout(resetMenu, 100) });
			});
		},
		longzhu() {
			app.fullCSS = 'a.ya-screen-btn';
		},
		zhanqi() {
			localStorage.lastPlayer = 'h5';
			app.fullCSS = '.video-fullscreen';
		}
	};
	app.isLive = app.isLive || router[u] && !host.startsWith('v.');
}
if (app.isLive && !w.chrome) fakeUA(ua_chrome);

!/pptv/.test(u) && Object.defineProperty(navigator, 'plugins', {
	get() { return { length: 0 } }
});
if (!router[u] || !router[u]()) app.init();