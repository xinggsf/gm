// ==UserScript==
// @name        ray-dandanzan.cf
// @description 设置缓存区大小
// @namespace   set-dandanzan-buffSize
// @match       https://dandanzan.cf/movie/*
// @match       https://nunuyingyuan.com/movie/*
// @grant       unsafeWindow
// @run-at      document-end
// @version     1.0
// @author      ray
// ==/UserScript==

const buffSize = 80; // 缓存区大小，单位秒
const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) });
(async function exec() {
    if ( !unsafeWindow.player ) {
		await sleep(100);
		exec();
	}
	else unsafeWindow.player.configure({
		streaming: {
			bufferingGoal: buffSize + 10,
			// rebufferingGoal: 15,
			bufferBehind: buffSize,
		}
	});
})();