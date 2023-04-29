// ==UserScript==
// @name        ray-dandanzan.cf
// @description 设置缓存区大小
// @namespace   set-dandanzan-buffSize
// @match       http://nunuyy.cf/movie/*
// @match       http://nunuyingyuan.tk/movie/*
// @match       https://nunuyy.cf/movie/*
// @match       https://nunuyingyuan.tk/movie/*
// @grant       unsafeWindow
// @run-at      document-end
// @version     1.1
// @author      ray
// ==/UserScript==

const buffSize = 80; // 缓存区大小，单位秒
const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) });

(async function exec() {
	await sleep(100);
	if ( !unsafeWindow.player ) {
		exec();
		return;
	}

	unsafeWindow.player.configure({
		streaming: {
			bufferingGoal: buffSize + 10,
			// rebufferingGoal: 15,
			bufferBehind: buffSize,
		}
	});
	const p = document.querySelector('.w-full.pb-5.mb-5');
	p.style.marginBottom = p.style.paddingBottom = 0;
	const lbl = p.querySelector('div.text-xs').cloneNode(true);
	lbl.firstElementChild.innerText = '分辨率：';
	p.appendChild(lbl);
	const v = document.getElementsByTagName('video')[0];
	const getMVResolution = () => {
		v.muted = !1;
		v.playbackRate = +localStorage.mvPlayRate || 1.4;
		lbl.lastElementChild.innerText = `${v.videoWidth}x${v.videoHeight}P`;
	};
	v.addEventListener('loadedmetadata', getMVResolution);
	v.duration && getMVResolution();
})();