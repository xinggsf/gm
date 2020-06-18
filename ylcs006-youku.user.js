// ==UserScript==
// @name         Youku视频去广告 by ylcs006
// @namespace    ylcs006.Youku.com
// @version      0.1
// @description  Youku视频去广告及其黑屏倒计时
// @match        https://v.youku.com/v_show/*
// @run-at       document-start
// ==/UserScript==

'use strict';

const r1 = (regp, s) => regp.test(s) && RegExp.$1;
const runScript = (text) => {
	const e = document.createElement('script');
	e.textContent = text;
	document.head.appendChild(e);
	e.remove();
};

const rules = [{
		//去广告及其倒计时
		rule: '//acs.youku.com/h5/mtop.youku.play.ups.appinfo.get/',
		async callback(url) {
			const resp = await fetch(url, { credentials: 'include' });
			const val = await resp.text();
			const cb = r1(/(mtopjsonp\d*)/, url);
			if (!cb) return;
			const i = val.indexOf(cb);
			if (i < 2) {
				const json = JSON.parse(val.slice(i + cb.length + 1, -1));
				delete json.data.data.ad;
				runScript(`${cb}(${JSON.stringify(json)})`);
			}
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
Reflect.setPrototypeOf(HTMLScriptElement, new Proxy(HTMLScriptElement.prototype, {
	appendChild(txt) {
		const s = txt.toString();
		const isHandle = rule instanceof RegExp ? rule.test(s) : s.includes(rule);
		if (!isHandle) return rawAppend(txt);
		if (cb) {
			txt.textContent = cb(s);
			//return rawAppend(txt);
		}
	},
	set(target, key, value, receiver) {
		if (key == 'src') {
			const rule = rules.find(r => value.includes(r.rule));
			if (rule) return rule.callback(value);
		}
		Reflect.set(target, key, value, receiver);
	}
})); */