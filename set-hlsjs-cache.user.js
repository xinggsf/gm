// ==UserScript==
// @name        优化使用hls.js库的视频站
// @description 设置缓存区大小
// @namespace   set-hls.js-cache
// @match       https://www.miguvideo.com/p/detail/*
// @match       https://vip.1905.com/play/*
// @match       https://www.1905.com/vod/play/*
// @match       https://www.olevod.com/player/vod/*
// @match       https://nnyy.in/*/*.html
// @match       https://www.btnull.nu/py/*
// @version     1.2
// @author      ray
// @license     MIT
// @run-at      document-start
// @grant       unsafeWindow
// ==/UserScript==

const buffSize = 80; // 可调节的视频缓存区大小，单位秒：10 － 800

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
	// Object.assign(Hls.DefaultConfig, { });
	console.log('成功设置Hls缓存区！');

	const v = document.getElementsByTagName('video')[0];
	v.muted = !1;
	if (location.hostname == 'nnyy.in') {
		const tip = document.createElement('span');
		document.querySelector('#e-tip').after(tip);
		v.addEventListener('loadedmetadata', () => {
			v.playbackRate = +localStorage.mvPlayRate || 1.4;
			tip.innerText = `　　　分辨率：${v.videoWidth}x${v.videoHeight}P`;
		});
	}
}