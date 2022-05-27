// ==UserScript==
// @name         拦截Hls.js库调用以获取视频地址
// @namespace    hookHls.xinggsf
// @version      0.1
// @description  拦截Hls.loadSource调用以获取视频地址
// @author       xinggsf
// @include      http*
// @run-at       document-start
// ==/UserScript==

class Hooker {
	static _hookCall(cb) {
		const call = Function.prototype.call;
		Function.prototype.call = function(...args) {
			let ret = call.apply(this, args);
			try {
				if (args && cb(args)) {
					Function.prototype.call = call;
					cb = () => {};
					console.log('restored call');
				}
			} catch (err) {
				console.error(err.stack);
			}
			return ret;
		};
		this._hookCall = null;
	}

	static _isEsModule(obj) {
		return obj.__esModule;
	}

	static _isFuction(arg) {
		return 'function' === typeof arg;
	}

	static _isModuleCall(args) { // module.exports, module, module.exports, require
		return args.length === 4 && args[1] && Object.getPrototypeOf(args[1]) === Object.prototype && args[1].hasOwnProperty('exports');
	}

	static _hookModuleCall(cb, pred) {
		const callbacksMap = new Map([[pred, [cb]]]);
		this._hookCall((args) => {
			if (!this._isModuleCall(args)) return;
			const exports = args[1].exports;
			for (const [pred, callbacks] of callbacksMap) {
				if (!pred.apply(this, [exports])) continue;
				callbacks.forEach(cb => cb(exports, args));
				callbacksMap.delete(pred);
				!callbacksMap.size && (this._hookModuleCall = null);
				break;
			}
			return !callbacksMap.size;
		});

		this._hookModuleCall = (cb, pred) => {
			if (callbacksMap.has(pred)) {
				callbacksMap.get(pred).push(cb);
			} else {
				callbacksMap.set(pred, [cb]);
			}
		};
	}

	static _isUpsModuleCall(exports) {
		return this._isEsModule(exports) && this._isFuction(exports.default) &&
			   exports.default.prototype && exports.default.prototype.hasOwnProperty('getServieceUrl') &&
			   /\.id\s*=\s*"ups"/.test(exports.default.toString());
	}
}
/*
Hls.prototype.loadSource
ƒ(e){e=o.default.buildAbsoluteURL(window.location.href,e,{alwaysNormalize:!0}),k.logger.log("loadSource:"+e),this.url=e,this.trigger(u.default.MANIFEST_LOADING,{url:e})}

*/
const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) });
const isHls_lib = (exports) => !exports.default && exports.buildAbsoluteURL
	&& exports.buildURLFromParts && exports.parseURL;

self != top && Hooker._hookModuleCall(async(exports, args) => {
	/* console.log(exports);
	await sleep(0);
	const p = Hls.prototype.loadSource;
	Hls.prototype.loadSource = function(url) {
		console.log(url);
		return p.apply(this,[url])
	} */
	const p = exports.buildAbsoluteURL;
	exports.buildAbsoluteURL = function() {
		console.log(arguments[1]);
		exports.buildAbsoluteURL = p;
		return p.apply(exports,arguments)
	}
}, isHls_lib);