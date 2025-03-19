// ==UserScript==
// @name        优化使用hls.js库的视频站
// @description 设置缓存区大小
// @namespace   set-hls.js-cache
// @match       https://www.miguvideo.com/p/detail/*
// @match       https://vip.1905.com/play/*
// @match       https://www.1905.com/vod/play/*
// @match       https://www.olevod.com/player/vod/*
// @match       https://nnyy.in/*/*.html
// @match       https://www.nunuyy5.com/vod/*
// @match       https://www.dandanzan.me/vod/*
// @match       https://dandanzan.net/*.html
// @match       https://www.iyf.tv/play/*
// @match       https://www.iyf.tv/watch?v=*
// @version     1.3
// @author      ray
// @license     MIT
// @run-at      document-start
// @grant       unsafeWindow
// ==/UserScript==

const buffSize = 80; // 视频缓存区大小：20 － 800秒

(function() {
	const fn = MediaSource.isTypeSupported;
	unsafeWindow.MediaSource.isTypeSupported = function(...args) {
		if (unsafeWindow.Hls) {
			unsafeWindow.MediaSource.isTypeSupported = fn;
			unsafeWindow.Hls = new Proxy(Hls, {
				construct(target, args, newTarget) {
					const opts = {
						maxBufferSize: 36 << 20, // 36MB
						maxBufferLength: buffSize,
						maxMaxBufferLength: buffSize + 9,
						backBufferLength: 9
					};
					args[0] = Object.assign(args[0] || {}, opts);
					return new target(...args);
				}
			});
			setTimeout(after,99);
		}
		return fn(args);
	};
})();

function after() {
	console.log('成功设置Hls缓存区！');
	const v = document.getElementsByTagName('video')[0];
	v.muted = !1;

	let tip = document.createElement('span');
	if (location.hostname == 'nnyy.in') {
		document.querySelector('#e-tip').after(tip);
	}
	else if (location.hostname == 'dandanzan.net') {
		tip = document.querySelector('#mytip');
	}
	else if (location.hostname.endsWith('nunuyy5.com')||location.hostname.endsWith('dandanzan.me')) {
		document.querySelector('span.current-route').after(tip);
	}
	else return;

	v.addEventListener('loadedmetadata', () => {
		v.playbackRate = +localStorage.mvPlayRate || 1.4;
		tip.innerText = `　　　分辨率：${v.videoWidth}x${v.videoHeight}P`;
	});
}