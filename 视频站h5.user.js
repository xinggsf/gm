// ==UserScript==
// @name             视频站启用html5播放器
// @description      拥抱html5，告别Flash。添加快捷键：快进、快退、暂停/播放、音量、下一集、切换[万能网页]全屏、上下帧、播放速度。支持站点：优.土、QQ、新浪、微博、网易视频[娱乐、云课堂、新闻]、搜狐、乐视、央视、风行、百度云视频、熊猫、龙珠、战旗直播等，可自定义站点
// @version          0.68
// @homepage         http://bbs.kafan.cn/thread-2093014-1-1.html
// @include          *://pan.baidu.com/*
// @include          *://v.qq.com/*
// @include          *://v.sports.qq.com/*
// @include          *://film.qq.com/*
// @include          *://view.inews.qq.com/*
// @include          *://news.qq.com/*
// @include          *://v.youku.com/v_show/id_*
// @include          *://*.tudou.com/v/*
// @include          *://v.163.com/*.html*
// @include          *://ent.163.com/*.html*
// @include          *://news.163.com/*.html*
// @include          *://news.163.com/special/*
// @include          *://study.163.com/course/*.htm?courseId=*
// @include          *://news.sina.com.cn/*
// @include          *://video.sina.com.cn/*
// @include          *://video.sina.cn/*
// @include          *://weibo.com/*
// @include          *://*.weibo.com/*
// @include          *://*.le.com/*.html*
// @include          *://*.lesports.com/*.html*
// @include          *://tv.sohu.com/*.shtml*
// @include          *://*.tv.sohu.com/*.shtml*
// @include          *://film.sohu.com/album/*
// @include          *://www.fun.tv/vplay/*
// @include          *://m.fun.tv/*
// @include          https://www.panda.tv/*
// @exclude          https://www.panda.tv/
// @include          https://*.zhanqi.tv/*
// @include          *://*.longzhu.com/*
// @grant            unsafeWindow
// @grant            GM_addStyle
// @require          https://cdn.jsdelivr.net/hls.js/latest/hls.min.js
// @run-at           document-start
// @namespace  https://greasyfork.org/users/7036
// @updateURL  https://raw.githubusercontent.com/xinggsf/gm/master/视频站h5.user.js
// ==/UserScript==
'use strict';
if (top !== self) return;
if (window.chrome)
	NodeList.prototype[Symbol.iterator] = HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

const q = css => document.querySelector(css),
doClick = e => {
	if (e) e.click ? e.click() : e.dispatchEvent(new MouseEvent('click'));
},
r1 = (regp, s) => regp.test(s) && RegExp.$1,
fakeUA = ua => Object.defineProperty(navigator, 'userAgent', {
	value: ua,
	writable: false,
	configurable: false,
	enumerable: true
}),
getMainDomain = host => {
	let a = host.split('.'),
	i = a.length -2;
	if (['com','net','org','gov','edu'].includes(a[i])) i--;
	return a[i];
},
ua_samsung = 'Mozilla/5.0 (Linux; U; Android 4.0.4; GT-I9300 Build/IMM76D) AppleWebKit/534.30 Version/4.0 Mobile Safari/534.30',
ua_ipad2 = 'Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3';

class Fullscreen {
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
		Fullscreen.isFull() ? this.exit() : this.enter();
	}
}

//万能网页全屏,代码参考了：https://github.com/gooyie/ykh5p
class WebFullscreen {
	constructor(video) {
		this._video = video;
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

	_checkContainer() {
		const e = this._video;
		if (!this._container || this._container === e) {
			this._container = WebFullscreen.getPlayerContainer(e);
			//this._container !== e && e.classList.contains('webfullscreen') && e.classList.remove('webfullscreen');
		}
	}

	get container() {
		this._checkContainer();
		return this._container;
	}

	static getPlayerContainer(video) {
		let d = document.body,
		e = video,
		p = e.parentNode;
		if (p === d) return e;
		const w = p.clientWidth,
		h = p.clientHeight;
		do {
			e = p;
			p = e.parentNode;
		} while (p !== d && p.clientWidth - w < 5 && p.clientHeight - h < 5);
		//console.dirxml(e);
		return e;
	}

	fixView() {
		let e = this._video, c = this._container;
		if (e === c) return;
		if (e.clientWidth < c.clientWidth || e.clientHeight < c.clientHeight) {
			let a = [];
			while (e !== c) {
				a.push(e);
				e = e.parentNode;
			}
			while (e = a.pop()) e.style.width = e.style.height = '100%';
		}
	}

	static isFull(video) {
		//return this.container.classList.contains('webfullscreen');
		//允许边框
		return window.innerWidth -video.clientWidth < 5 && window.innerHeight - video.clientHeight < 5;
	}

	toggle() {
		const d = document.body,
		state = WebFullscreen.isFull(this.container);
		d.style.overflow = state ? '' : 'hidden';
		this.container.classList.toggle('webfullscreen');

		let p = this.container.parentNode;
		while (p !== d) {
			p.classList.toggle('z-top');
			p = p.parentNode;
		}

		!state && setTimeout(this.fixView.bind(this), 9);
	}
}

let webFull, fullScreen;

const { host, pathname: path } = location,
u = getMainDomain(host),//主域名
//容器，登记事件处理方法中的回调
events = {
	on(name, fn) {
		this[name] = fn;
	}
},
app = {
	el: null,//video
	isLive: !1,
	_duration: 0,
	get duration() {
		if (this._duration) return this._duration;

		if (this.timeCSS) {
			const a = q(this.timeCSS).innerHTML.split(':');
			let n = a.pop() | 0, multiplier = 1;
			for (let k of a.reverse()) {
				multiplier *= 60;
				n += k * multiplier;
			}
			this._duration = n || 2e4;
		} else {
			this._duration = Math.round(this.el.duration);
		}
		return this._duration;
	},

	vList: null,
	getVideo() {
		this.vList = this.vList || document.getElementsByTagName('video');
		if (this.el.offsetWidth>1) return;
		for (let e of this.vList)
			if (e.offsetWidth>1) {
				e.playbackRate = this.el.playbackRate;
				e.volume = this.el.volume;
				this.el = e;
				break;
			}
	},
	_convertView(btn) {
		// !btn.clientWidth ?
		const e = btn.style.display === 'none' ? btn.nextElementSibling : btn;
		doClick(e);
	},
	observe() {
		const v = q('video');
		if (v) {
			this._mo.disconnect();
			this.el = v;
			this.oldCanplay = v.oncanplay;
			v.oncanplay = this.onCanplay.bind(this);
			document.addEventListener('keydown', this.hotKey.bind(this), !1);
			setTimeout(() => {
				v.focus();
				if (!this.webfullCSS) webFull = new WebFullscreen(v);
			}, 300);
			if (!this.fullCSS)
				fullScreen = new Fullscreen(v);
			else {
				this.btnFS = q(this.fullCSS);
				//进入、退出、切换全屏，三合一
				this.fullScreen = () => this._convertView(this.btnFS);
			}
			if (this.webfullCSS) {
				this.btnWFS = q(this.webfullCSS);
				this.webFullScreen = () => this._convertView(this.btnWFS);
			}
			if (this.nextCSS) this.btnNext = q(this.nextCSS);
			events.init && events.init();
		}
	},
	onCanplay(e) {
		const v = this.el;
		v.oncanplay = null;
		console.log('脚本[启用html5播放器]，事件oncanplay');
		events.canplay && events.canplay();
		this.oldCanplay && this.oldCanplay(e);
		if (!this.isLive && this.duration > 666 && !/qq|le/.test(u)) setTimeout(() => {
			v.currentTime = 66;//跳过片头
		}, 9);
	},
	hotKey(e) {
		//判断ctrl,alt,shift三键状态，防止浏览器快捷键被占用
		if (e.ctrlKey || e.altKey || /INPUT|TEXTAREA/.test(e.target.nodeName))
			return;
		if (e.shiftKey && ![13,37,39].includes(e.keyCode))
			return;
		if (this.isLive && [37,39,78,88,67,90].includes(e.keyCode))
			return;
		this.getVideo();
		const v = this.el;
		// if (!v || v.offsetWidth === 0) v = q('video');
		let n;
		switch (e.keyCode) {
		case 32: //space
			if (this.disableSpace) return;
			v.paused ? v.play() : v.pause();
			e.preventDefault();
			e.stopPropagation();
			break;
		case 37: //left
			n = e.shiftKey ? -27 : -5; //快退5秒,shift加速
		case 39: //right
			n = n || (e.shiftKey ? 27 : 5); //快进5秒,shift加速
			v.currentTime += n;
			break;
		case 78: // N 下一首
			doClick(this.btnNext);
			break;
		//case 80: // P 上一首
		case 38: //加音量
			n = .1;
		case 40: //降音量
			n = n || -0.1;
			n += v.volume;
			if (0 <= n && n <= 1) v.volume = n;
			e.preventDefault();
			break;
		case 13: //全屏
			if (e.shiftKey)
				webFull ? webFull.toggle() : this.webFullScreen();
			else
				fullScreen ? fullScreen.toggle() : this.fullScreen();
			break;
		case 27: //esc
			if (Fullscreen.isFull())
				fullScreen ? fullScreen.exit() : this.fullScreen();
			else if (WebFullscreen.isFull(v))
				webFull ? webFull.toggle() : this.webFullScreen();
			break;
		case 67: //按键C：加速播放 +0.1
			n = .1;
		case 88: //按键X：减速播放 -0.1
			n = n || -0.1;
			n += v.playbackRate;
			if (0 < n && n <= 16) v.playbackRate = n;
			break;
		case 90: //按键Z：正常速度播放
			v.playbackRate = 1;
			break;
		case 70: //按键F：下一帧
			n = .03;
		case 68: //按键D：上一帧
			n = n || -0.03;
			if (!v.paused) v.pause();
			v.currentTime += n;
		}
	},
	doHls() {
		const v = this.el;
		if (!v || !v.src.includes('.m3u8') || !Hls.isSupported()) return;
		const hls = new Hls();
		hls.loadSource(v.src);
		hls.attachMedia(v);
		hls.on(Hls.Events.MANIFEST_PARSED, () => v.play());
	},
	init() {
		this._mo = new MutationObserver(this.observe.bind(this));
		this._mo.observe(document.documentElement, {
			childList : true, subtree : true
		});
	}
};

if (u !== 'zhanqi') Object.defineProperty(navigator, 'plugins', {
	get: function() {
		return { length: 0 };
	}
});

const router = {
	qq() {
		Object.assign(app, {
			disableSpace: true,
			nextCSS: '.txp_btn_next',
			webfullCSS: '.txp_btn_fake',
			fullCSS: '.txp_btn_fullscreen',
		});
		events.on('canplay', app.getVideo);
		fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:48.0) Gecko/20100101 Firefox/48.0');
	},

	youku() {
		events.on('canplay', () => {
			q('.youku-layer-logo').remove();
			if (app.el.src.startsWith('http')) app.getVideo();//初始化vList，旧版用flv.js~地址以blob:开头
			//修正下一个按钮无效
			const btn = q('button.control-next-video');
			if (btn && btn.offsetWidth>1) {
				let e = q('.program.current');
				e = e && e.closest('.item') || q('.item.current');
				e = e.nextSibling;
				if (!e) return;
				e = e.querySelector('a');//下一个视频链接
				btn.addEventListener('click', ev => e.click());
				app.btnNext = e;
			}
		});
		app.fullCSS = '.control-fullscreen-icon';
		app.timeCSS = '.control-time-duration';
		sessionStorage.P_l_h5 = 1;
	},

	cctv() {
		fakeUA(ua_samsung);
	},

	sina() {
		fakeUA(ua_ipad2);
	},

	le() {
		//firefox 56以下 黑屏
		const isFX57 = r1(/Firefox\/(\d+)/, navigator.userAgent);
		if (isFX57 && isFX57 < 57) return true;
		fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 Version/7.0.3 Safari/7046A194A');
		//totalTime = __INFO__.video.duration;
		Object.assign(app, {
			timeCSS: 'span.hv_total_time',
			nextCSS: 'div.hv_ico_next',
			webfullCSS: 'span.hv_ico_webfullscreen',
			fullCSS: 'span.hv_ico_screen'
		});
	},

	sohu() {
		fakeUA(ua_samsung);
		Object.assign(app, {
			timeCSS: 'span.x-duration-txt',
			nextCSS: 'li.on[data-vid]+li > a',
			fullCSS: 'div.x-fs-btn'
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
			vid = unsafeWindow.vplay.videoid;
			vid && location.assign(`//m.fun.tv/implay/?mid=${mid}&vid=${vid}`);
		}, 99);
		return true;
	},

	panda() {
		localStorage.setItem('panda.tv/user/player', '{"useH5player": true}');
		app.webfullCSS = 'span.h5player-control-bar-fullscreen';
		app.fullCSS = 'span.h5player-control-bar-allfullscreen';
		app.isLive = true;
	},

	longzhu() {
		app.isLive = true;
		fakeUA(ua_ipad2);
		events.on('init', () => {
			const v = app.el;
			if (v.src && v.src.includes('.m3u8'))
				app.doHls();
			else {
				q('#landscape_dialog').remove();
				new MutationObserver(function(records) {
					this.disconnect();
					app.doHls();
				})
				.observe(v, {
					attributes: true,
					attributeFilter: ['src']
				});
				setTimeout(() => q('.player.report-rbi-click').click(), 1200);
			}
		});
	},

	zhanqi() {
		setTimeout(function getM3u8_Addr() {
			const e = q('#BFPlayerID');//flash ID
			if (!e) {
				setTimeout(getM3u8_Addr, 300);
				return;
			}
			let s = e.children.flashvars.value,
			url = r1(/PlayUrl=([^&]+)/, s);//视频
			if (!url) {
				app.isLive = true;
				s = r1(/VideoLevels=([^&]+)/, s);//直播
				s = atob(s);
				url = JSON.parse(s).streamUrl;
			}
			e.parentNode.innerHTML = `<video width="100%" height="100%" autoplay controls src="${url}"/>`;
		}, 300);
		events.on('init', app.doHls);
	}
};
router.cntv = router.cctv;
router.lesports = router.le;
router['163'] = router.sina;

if (!router[u] || !router[u].call(null)) app.init();