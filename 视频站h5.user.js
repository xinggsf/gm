// ==UserScript==
// @name             视频站启用html5播放器
// @description      三大功能 。启用html5播放器；万能网页全屏；添加快捷键：快进、快退、暂停/播放、音量、下一集、切换(网页)全屏、上下帧、播放速度。支持视频站点：优.土、QQ、B站、新浪、微博、网易视频[娱乐、云课堂、新闻]、搜狐、乐视、风行、百度云视频等；直播：斗鱼、熊猫、YY、虎牙、龙珠。可自定义站点
// @version          0.85
// @homepage         http://bbs.kafan.cn/thread-2093014-1-1.html
// @include          *://pan.baidu.com/*
// @include          *://yun.baidu.com/*
// @include          *://v.qq.com/*
// @include          *://v.sports.qq.com/*
// @include          *://film.qq.com/*
// @include          *://view.inews.qq.com/*
// @include          *://news.qq.com/*
// @include          https://www.weiyun.com/video_*
// @include          *://v.youku.com/v_show/id_*
// @include          *://*.tudou.com/v/*
// @include          *://www.bilibili.com/*
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
// @include          *://www.yy.com/*
// @include          *://www.huya.com/*
// @include          https://www.douyu.com/*
// @include          https://www.panda.tv/*
// @include          *://star.longzhu.com/*
// @grant            unsafeWindow
// @grant            GM_addStyle
// @grant            GM_registerMenuCommand
// @grant            GM_setValue
// @grant            GM_getValue
// @run-at           document-start
// @namespace  https://greasyfork.org/users/7036
// @updateURL  https://raw.githubusercontent.com/xinggsf/gm/master/视频站h5.user.js
// ==/UserScript==
'use strict';
if (window.chrome)
	NodeList.prototype[Symbol.iterator] = HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

const w = unsafeWindow,
noopFn = () => {},
q = css => document.querySelector(css),
$$ = (c, cb = e=>e.remove()) => {
	if (!c.length) return;
	if (typeof c === 'string')
		c = document.querySelectorAll(c);
	if (cb) for (let e of c) {
		if (e && cb(e)===false) break;
	}
	return c;
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
	if (e) { e.click ? e.click() : e.dispatchEvent(new MouseEvent('click')) };
},
underFirefox57 = (() => {
	const x = r1(/Firefox\/(\d+)/, navigator.userAgent);
	return x && x < 57;
})(),
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
	constructor(video) {
		this._video = video;
		console.log(video);
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
		if (!this._container || this._container === e)
			this._container = FullPage.getPlayerContainer(e);
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
		return window.innerWidth -video.clientWidth < 5 && window.innerHeight - video.clientHeight < 5;
	}

	toggle() {
		const d = document.body,
		state = FullPage.isFull(this.container);
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
	vList: null,
	getVideos() {
		this.vList = this.vList || document.getElementsByTagName('video');
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
	onCanplay(ev) {
		console.log('脚本[启用html5播放器]，事件loadeddata');
		//if (ev.target.readyState > 2)
		events.canplay && events.canplay();
		ev.target.removeEventListener('loadeddata', this.onCanplay);
	},
	hotKey(e) {
		//判断ctrl,alt,shift三键状态，防止浏览器快捷键被占用
		if (e.ctrlKey || e.altKey || /INPUT|TEXTAREA/.test(e.target.nodeName))
			return;
		if (e.shiftKey && ![13,37,39].includes(e.keyCode))
			return;
		if (this.isLive && [37,39,78,88,67,90].includes(e.keyCode))
			return;
		this.getVideos();
		this.checkUI();
		let n;
		switch (e.keyCode) {
		case 32: //space
			if (this.disableSpace) return;
			v.paused ? v.play() : v.pause();
			e.preventDefault();
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
		if (!this.webfullCSS) {
			_fp = _fp || new FullPage(v);
		} else if (!this.btnWFS) {
			this.btnWFS = q(this.webfullCSS);
			this.fullPage = () => this._convertView(this.btnWFS);
		}
		if (this.nextCSS && !this.btnNext) this.btnNext = q(this.nextCSS);
		if (!this.fullCSS) {
			_fs = _fs ||  new FullScreen(v);
		} else if (!this.btnFS) {
			this.btnFS = q(this.fullCSS);
			this.fullScreen = () => this._convertView(this.btnFS);
		}
	},
	bindEvent() {
		this.onCanplay = this.onCanplay.bind(this);
		v.addEventListener('loadeddata', this.onCanplay);
		document.addEventListener('keydown', this.hotKey.bind(this));
		this.checkUI();
		events.foundMV && events.foundMV();
	},
	findMV() {
		return q('video');
	},
	init() {
		document.addEventListener('DOMContentLoaded', () => {
			if (v = this.findMV()) this.bindEvent();
			else {
				this.observer = new MutationObserver(records => {
					if (v = this.findMV()) {
						this.observer.disconnect();
						delete this.observer;
						this.bindEvent(v);
					}
					if (this.adsCSS) willRemove(this.adsCSS);
					if (events.observe && events.observe()) delete events.observe;
				});
				this.observer.observe(document.body, {childList : true, subtree : true});
			}
			events.DOMReady && events.DOMReady();
		});
	}
};

let router = {
	qq() {
		Object.assign(app, {
			disableSpace: true,
			nextCSS: '.txp_btn_next',
			webfullCSS: '.txp_btn_fake',
			fullCSS: '.txp_btn_fullscreen',
		});
		events.on('canplay', app.getVideos);
		fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:48.0) Gecko/20100101 Firefox/48.0');
	},
	youku() {
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
			if (v.src.startsWith('http')) app.getVideos();//初始化vList，旧版用flv.js~地址以blob:开头
			//修正下一个按钮无效 yk-trigger-layer
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
	},
	bilibili() {
		let x = localStorage.bilibili_player_settings;
		if (x) {
			x = JSON.parse(x);
			x.video_status.highquality = true;
			x.video_status.iswidescreen = true;
			x.video_status.widescreensave = true;
			x.setting_config.defquality = '80';
			localStorage.bilibili_player_settings = JSON.stringify(x);
		} else
			//defquality 选择清晰度，720P：64  1080P：80   宽屏 iswidescreen
			localStorage.bilibili_player_settings = `{"setting_config":{"type":"div","opacity":"1.00","fontfamily":"SimHei, 'Microsoft JhengHei'","fontfamilycustom":"","bold":false,"preventshade":false,"fontborder":0,"speedplus":"1.0","speedsync":false,"fontsize":"1.0","fullscreensync":false,"danmakunumber":50,"fullscreensend":false,"defquality":"80","sameaspanel":false},"video_status":{"autopart":1,"highquality":true,"widescreensave":true,"iswidescreen":true,"videomirror":false,"videospeed":1,"volume":1},"block":{"status":true,"type_scroll":true,"type_top":true,"type_bottom":true,"type_reverse":true,"type_guest":true,"type_color":true,"function_normal":true,"function_subtitle":true,"function_special":true,"cloud_level":2,"cloud_source_video":true,"cloud_source_partition":true,"cloud_source_all":true,"size":0,"regexp":false,"list":[]},"message":{"system":false,"bangumi":false,"news":false}}`;
		app.nextCSS = '.bilibili-player-video-btn-next';
		app.webfullCSS = '.bilibili-player-video-web-fullscreen';
		app.fullCSS = '.bilibili-player-iconfont-fullscreen';
		const _setPlayer = () => {
			v = q('#bofqi video[src]');
			if (!v) {
				setTimeout(_setPlayer, 300);
				return;
			}
			w.scrollTo(0, v.closest('.player-wrapper,#bangumi_player').offsetTop);
			doClick(q('i.bilibili-player-iconfont-repeat.icon-24repeaton')); //关循环播放
			// doClick(q('i[name=ctlbar_danmuku_close]'));//关弹幕
			// 以下8行，自动播放
			if (v.readyState === 4)
				doClick(q('i[name=play_button]'));
			else {
				v.addEventListener('canplaythrough', ev => {
					v.paused && doClick(q('i[name=play_button]'));
				});
			}
			v.setAttribute('autoplay', '');
		};
		const fn = history.pushState;
		history.pushState = function() {
			fn.apply(this, arguments);
			setTimeout(_setPlayer, 500);
		};
		w.addEventListener('popstate', ev => {
			setTimeout(_setPlayer, 500);
		});
		events.on('canplay', _setPlayer);
	},
	sina() {
		fakeUA(ua_ipad2);
	},
	le() {
		fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 Version/7.0.3 Safari/7046A194A');
		app.nextCSS = 'div.hv_ico_next';
		app.webfullCSS = 'span.hv_ico_webfullscreen';
		app.fullCSS = 'span.hv_ico_screen';
	},
	sohu() {
		fakeUA(ua_samsung);
		app.nextCSS = 'li.on[data-vid]+li a';
		app.fullCSS = 'div.x-fs-btn';
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
router.lesports = router.le;
router['163'] = router.sina;

if (!router[u]) { //直播站点
	router = {
		douyu() {
			const css = 'i.sign-spec',
			fnWrap = throttle($$);
			app.findMV = function() {
				fnWrap(css, e=>e.parentNode.remove());
				const p = w.__player || w.__playerindex;
				if (!p) return;
				if (p.isSwitched)
					return path==='/' ? q('video') : q('#js-room-video video');
				//有直播的页面 !lastIndexOf('/') 链判断运算符: $ROOM?.room_id
				p.switchPlayer('h5');
				p.isSwitched = true;
			};
			events.on('canplay', function() {
				$$(app.adsCSS);
				$$(css, e=>e.parentNode.remove());
				if (path==='/') return;
				const player = v.parentNode.parentNode,
				s = `#${player.id}>div:not([class]):not([style]), #dialog-more-video~*`;
				setTimeout($$, 300, s);
				setTimeout($$, 3900, s);
			});
			document.addEventListener('visibilitychange', ev => {
				if (!document.hidden) {
					$$(app.adsCSS);
					$$(css, e=>e.parentNode.remove());
				}
			});
			app.webfullCSS = 'div[title="网页全屏"]';
			app.fullCSS = 'div[title="窗口全屏"]';
			// .watermark-4231db, .animation_container-005ab7 +div
			app.adsCSS = '.box-19fed6, [class|=recommendAD], [class|=room-ad], #js-recommand>div:nth-of-type(2)~*, #dialog-more-video~*, .no-login, .pop-zoom-container,#js-chat-notice';
		},
		panda() {
			localStorage.setItem('panda.tv/user/player', '{"useH5player": true}');
			app.webfullCSS = '.h5player-control-bar-fullscreen';
			app.fullCSS = '.h5player-control-bar-allfullscreen';
			app.adsCSS = '.act-zhuxianmarch-container, #liveos-container, .ad-container, .room-banner-images';
			if (path!=='/') events.on('canplay', () => {
				setTimeout($$, 900, app.adsCSS);
			});
		},
		yy() {
			if (!window.chrome) fakeUA(ua_chrome);
			app.fullCSS = '.liveplayerToolBar-fullScreenBtn';
		},
		huya() {
			if (underFirefox57) return true;
			if (!window.chrome) fakeUA(ua_chrome);
			app.webfullCSS = '.player-fullpage-btn';
			app.fullCSS = '.player-fullscreen-btn';
			events.on('canplay', function() {
				if (!w.TT_ROOM_DATA) return;
				const ti = setInterval(() => {
					const $ = w.$, items = $(".player-videotype-list li");
					if (!items.length) return;
					clearInterval(ti);
					$$('#player-login-tip-wrap,#player-subscribe-wap');
					if (items.length == 1) return;
					items.unbind('click')
					.click(function(e) {
						if ($(this).hasClass('on')) return;
						//console.log(this);
						const rate = $(this).attr("ibitrate");
						w.vplayer.vcore.reqBitRate(rate, w.TT_ROOM_DATA.channel);
						$(this).siblings('.on').removeClass('on');
						$(this).addClass('on').parent().parent().hide();
						$('.player-videotype-cur').text($(this).text());
					});
				}, 500);
			});
		},
		longzhu() {
			if (!window.chrome) fakeUA(ua_chrome);
			app.fullCSS = '#screen_vk';
			//app.webfullCSS = '.full-screen-button-outer-box';
		}
	};

	if (router[u]) app.isLive = true;
}

router.baidu = router.weibo = noopFn;
if (!window.ReadableStream)
	injectJS('https://raw.githubusercontent.com/creatorrr/web-streams-polyfill/master/dist/polyfill.min.js');
!/bilibili|douyu|panda/.test(u) && Object.defineProperty(navigator, 'plugins', {
	get() {
		return { length: 0 };
	}
});
if (!router[u] || !router[u]()) app.init();