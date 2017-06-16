// ==UserScript==
// @name             视频站h5
// @description      视频站启用html5播放器
// @version          0.2.5
// @include          *://*.qq.com/*
// @include          *://v.youku.com/v_show/id_*
// @include          *://video.tudou.com/v/*
// @include          *://*.le.com/*.html*
// @include          *://*.lesports.com/*.html*
// @include          *://tv.sohu.com/*.shtml*
// @include          *://m*.tv.sohu.com/*.shtml*
// @include          https://www.panda.tv/*
// @exclude          https://www.panda.tv/
// @grant            unsafeWindow
// @run-at           document-start
// @namespace https://greasyfork.org/users/7036-xinggsf
// @updateURL  https://raw.githubusercontent.com/xinggsf/gm/master/视频站h5.user.js
// ==/UserScript==
'use strict';

Object.defineProperty(navigator, 'plugins', {
	get() {
		return { length: 0 };
	}
});

let siteFn, v, totalTime; //video element
const stepLen = 5, //快进快退5秒
skipLen = 21, //shift + 快进快退
u = location.hostname,
mDomain = u.split('.').reverse()[1],//主域名
path = location.pathname,

$ = id => document.getElementById(id),
q = css => document.querySelector(css),
$C = (name, attr) => {
	const el = document.createElement(name);
	if (attr) {
		for (var i in attr) //用var修正TM的for-in循环BUG
			el.setAttribute(i, attr[i]);
	}
	return el;
},
fakeUA = ua => Object.defineProperty(navigator, 'userAgent', {
	value: ua,
	writable: false,
	configurable: false,
	enumerable: true
}),
getAllDuration = css => {
	const a = q(css).innerHTML.split(':').reverse();
	let n = 0, multiplier = 1;
	for (let k of a) {
		n += k * multiplier;
		multiplier *= 60;
	}
	return n || 2e4;
},
hotKey = function (e) {
	//console.log('hotKey', v.seeking, v.seekable);
	// 可播放
	//if (!v.seekable) return;
	let seekPoint = ~~v.currentTime;
	switch (e.keyCode) {
	case 32: //space
		if (v.paused) v.play();
		else v.pause();
		e.preventDefault();
		//e.stopPropagation();
		break;
	case 37: //left
		seekPoint -= e.shiftKey ? skipLen : stepLen;
		if (seekPoint < 0) seekPoint = 0;
		v.currentTime = seekPoint;
		break;
	case 39: //right
		//if (v.readyState !== 4) return;
		seekPoint += e.shiftKey ? skipLen : stepLen;
		v.currentTime = seekPoint;
		break;
	}
},
onCanplay = function (e) {
	//v.removeEventListener('oncanplay', onCanplay);
	//v.oncanplay = null;//注释应对列表播放而不刷新页面
	console.log('脚本启用html5播放器，事件： oncanplay');
	if (totalTime && path === location.pathname) return;//分段视频返回
	if (!totalTime) document.addEventListener('keydown', hotKey, !1);
	siteFn && siteFn();
	//新页面、不刷新页面列表播放
	if (!totalTime || path !== location.pathname)
		totalTime = Math.round(v.duration);
	//跳过片头
	if (totalTime > 666 && !['youku', 'le', 'lesports'].includes(mDomain))
		v.currentTime = 66;
},
init = () => {
	let mo = new MutationObserver(mr => {
		v = q('video');
		if (v) {
			//console.log('mo', v.oncanplay);
			v.oncanplay = onCanplay;
			mo.disconnect();
			mo = undefined;
		}
	});
	document.addEventListener('DOMContentLoaded', e => mo.observe(document.body, {
		childList : true,
		subtree : true
	}), !1);
};

switch (mDomain) {
case 'qq':
	fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:48.0) Gecko/20100101 Firefox/48.0');
	break;
case 'youku':
    sessionStorage.P_l_h5 = 1;
	init();
	break;
case 'le':
case 'lesports':
	fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 Version/7.0.3 Safari/7046A194A');
	init();
	break;
case 'sohu':
	//if (window.chrome)
		fakeUA('Mozilla/5.0 (Linux; U; Android 4.0.4; GT-I9300 Build/IMM76D) AppleWebKit/534.30 Version/4.0 Mobile Safari/534.30');
	// q('meta[name=mobile-agent]').remove();
	siteFn = () => {
		totalTime = getAllDuration('span.x-duration-txt');
	};
/* 	unsafeWindow.setTimeout( () => {
		if (isUseH5Player) {
			isUseH5Player = () => 1;
			console.log(_videoInfo.videoLength);
		}
	}, 99); */
	init();
	break;
case 'tudou':
	//fakeUA('Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) Chrome/55.0.10 Mobile');
	siteFn = () => {
		//获取播放时长
		totalTime = getAllDuration('span.td-h5__player__console__time-total');
		const cur = ~~v.duration +1;
		//console.log(cur, totalTime);
		if (cur < totalTime) {
			//分段播放时，保持播放器原状
			q('#td-h5+div').remove();
		}
		else {
			document.body.innerHTML = `<video width="100%" height="100%" autoplay controls src="${v.src}"/>`;
			setTimeout(() => {
				v = q('video');
				v.oncanplay = onCanplay;
			}, 9);
		}
	};
	init();
	break;
case 'panda':
    localStorage.setItem('panda.tv/user/player', {useH5player: true});
}