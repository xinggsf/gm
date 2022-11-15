// ==UserScript==
// @name         disable qq.com beacon
// @namespace    xinggsf.eif-hill
// @version      1.2
// @description  disable qq.com beacon which will cause the CPU is under high load due to continuous reporting of incorrect data
// @author       xinggsf   eif-hill
// @license      MIT
// @include      https://*.qq.com/*
// @exclude      https://new.qq.com/rain/*
// @compatiable  chrome; just test on chrome 80+
// @noframes
// @run-at       document-start
// @grant      unsafeWindow
// ==/UserScript==

"use strict";
const w = unsafeWindow;

class App {
	constructor() {
		this.anti_image();
		//this.anti_xmlHTTP(); 和anti_fecth 都由广告过滤规则实现了，故注释掉
		if (location.host !== 'v.qq.com') {
			this.antiObserver(); // anti Observer 代替anti Beacon
			this.anti_xmlHTTP();
			this.anti_fecth();
			this.anti_interval();
		}
	}
	anti_image() {
		Reflect.defineProperty(
			HTMLImageElement.prototype, '_rawSrc',
			Reflect.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
		);
		Reflect.defineProperty(HTMLImageElement.prototype, 'src', {
			get() {
				return this._rawSrc;
			},
			set(val) {
				if (val.slice(0, 19).includes('trace.')) this.remove();
				else this._rawSrc = val;
			}
		});
	}
	anti_interval() {
		w.setInterval = new Proxy(w.setInterval, {
			apply(target, thisArg, args) {
				if (args[1] < 110) { // && !String(args[0]).includes('[native code]')
					args[0] = function(){};
				}
				return target.apply(thisArg, args);
			}
		});
	}
	anti_fecth() {
		const fetch = w.fetch;
		w.fetch = (...args) => (async(args) => {
			const url = args[0];
			const ad_list = ["trace.", "beacon."];
			if (ad_list.some((e) => url.includes(e))) throw "fuck tencent";
			return await fetch(...args);
		})(args);
	}
	anti_xmlHTTP() {
		w.XMLHttpRequest = class extends w.XMLHttpRequest {
			open(...args) {
				const url = args[1];
				const ad_list = ["trace.", "beacon."];
				if (ad_list.some((e) => url.includes(e))) throw "fuck tencent";
				return super.open(...args);
			}
		};
	}
	antiObserver() {
		const p = w.MutationObserver.prototype;
		const observe = p.observe;
		const disconnect = p.disconnect;
		p.observe = function(...a) {
			a[1] = {attributes: true};
			observe.apply(this, a);
			setTimeout(_ => {
				console.log('fuck QQ');
				this.takeRecords();
				disconnect.call(this);
			}, 2e3);
		};
	}
}

new App();