// ==UserScript==
// @name         Youku视频去广告、黑屏
// @namespace    ylcs006.Youku.com
// @version      0.3.0
// @description  Youku视频去广告及其黑屏倒计时
// @match        https://v.youku.com/v_show/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

'use strict';
const runScript = (text) => {
	const e = document.createElement('script');
	e.textContent = text;
	document.head.appendChild(e);
	e.remove();
};

const rules = [
	{
		// 去广告及其倒计时
		rule: '//acs.youku.com/h5/mtop.youku.play.ups.appinfo.get/',
		async callback(url) {
			const resp = await fetch(url, {credentials:'include'});
			const val = await resp.text();
			const i = val.indexOf('(')+1;
			const ro = JSON.parse(val.slice(i, -1));
			// console.dir(ro);
			ro.data.data.ad = {BFSTREAM:[],BFVAL:[],VAL:[]};
			runScript(val.slice(0, i)+ JSON.stringify(ro)+ ')');
		}
	}
];

Reflect.defineProperty(
	HTMLScriptElement.prototype, '_rawSrc',
	Reflect.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')
);
Reflect.defineProperty(HTMLScriptElement.prototype, 'src', {
	get() {
		return this._rawSrc;
	},
	set(val) {
		const rule = rules.find(r => val.includes(r.rule));
		if (rule) rule.callback(val);
		else this._rawSrc = val;
	}
});
/*
const makeQualitys = (a) => a.map(k => {
	return {
		url: k.m3u8_url,
		type: 'hls',
		name: `${k.width}×${k.height}`
	};
});
ah.proxy({
    async onResponse(response, handler){
        let isSkip = response.config.url.includes('//acs.youku.com/h5/mtop.youku.play.ups.appinfo.get/');
		if (isSkip) {
			const val = response.response;
			const i = val.indexOf('(')+1; // ({ })
			const ro = JSON.parse(val.slice(i, -1));
			console.dir(ro);
			ro.data.data.ad = {BFSTREAM:[],BFVAL:[],VAL:[]};
			response.response = val.slice(0, i)+ JSON.stringify(ro)+ ')';

			if (useDplayer) {
				const vList = ro.data.data.stream;
				if (!vList?.[0].m3u8_url) return;
				const p = createContainer(); // q('#player')
				createPlayer(makeQualitys(vList), p);
				await sleep(1800);
				const v = q('.video-layer video');
				// v.src = '';
				v.pause();
				v.hidden = true;
			}
        }
		handler.next(response);
    }
}); */