// ==UserScript==
// @name             视频站h5
// @description      视频站启用html5播放器
// @version          0.2.3
// @include          *://*.qq.com/*
// @include          *://v.youku.com/v_show/id_*
// @include          *://video.tudou.com/v/*
// @include          *://*.le.com/*
// @include          *://*tv.sohu.com/*.shtml*
// @include          https://www.panda.tv/*
// @exclude          https://www.panda.tv/
// @grant            none
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

let siteFn, v; //video element
const stepLen = 5, //快进快退5秒
skipLen = 21, //shift + 快进快退
u = location.hostname,

$ = id => document.getElementById(id),
q = css => document.querySelector(css),
$C = (name, attr) => {
	const el = document.createElement(name);
	if (attr) {
		for (var i in attr) {//用var修正TM的for-in循环BUG
			el.setAttribute(i, attr[i]);
		}
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
	v.oncanplay = null;
	console.log('oncanplay');
	document.addEventListener('keydown', hotKey, !1);
	siteFn && siteFn();
	//if (!totalTime) totalTime = v.duration;
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

if (u.endsWith('.qq.com'))
	fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:48.0) Gecko/20100101 Firefox/48.0');
else if (u === 'v.youku.com') {
    sessionStorage.P_l_h5 = 1;
	init();
}
else if (u.endsWith('.le.com')) {
	fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A');
	init();
}
else if (u.endsWith('tv.sohu.com')) {
	if (window.chrome && !u.startsWith('m.')) //火狐请用UA工具
		fakeUA('Mozilla/5.0 (Linux; U; Android 4.0.4) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30');
	init();
}
else if (u.endsWith('.tudou.com')) {
	//fakeUA('Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/55.0.10 Mobile Safari/535.19');
	siteFn = () => {
		//获取播放时长
		const cur = ~~v.duration +1,
		totalTime = getAllDuration('span.td-h5__player__console__time-total');
		//console.log(cur, totalTime);
		if (cur < totalTime) {
			//分段播放时，保持播放器原状
			q('#td-h5+div').remove();
			v.currentTime = 66;//跳过片头
		}
		else {
			document.body.innerHTML = `<video width="100%" height="100%" autoplay controls src="${v.src}"/>`;
			setTimeout(() => {
				v = q('video');
				if (cur > 666) v.currentTime = 66;
				v.oncanplay = onCanplay;
			}, 9);
		}
	};
	init();
}
else if (u === 'www.panda.tv')
    localStorage.setItem('panda.tv/user/player', {useH5player: true});