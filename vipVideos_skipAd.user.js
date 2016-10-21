// ==UserScript==
// @name           vipVideos_skipAd
// @namespace      vipVideos_skipAd-xinggsf
// @author         xinggsf
// @description    配合ABP去视频广告；开启GPU加速
// updateURL       https://greasyfork.org/scripts/8561.js
// @include        http*
// @exclude        https://www.youtube.com/*
// @exclude        http://*.dj92cc.com/*
//全面支持音悦台HTML5播放，详见 https://greasyfork.org/scripts/14593
// @exclude        http://*.yinyuetai.com/*
// @version        2016.10.21
// @encoding       utf-8
// @grant          unsafeWindow
// @grant          GM_registerMenuCommand
// ==/UserScript==

-function(doc, bd) {
	"use strict";
	let isEmbed, swfAddr, regYk = /VideoIDS=(\w+)/,
	onlyUseGpu = false,//仅使用脚本的GPU加速功能
	noAdPlayerPath = '',//可填写有效播放器地址路径(不包括文件名），如：'http://minggo.coding.io/swf/'  但这个已经失效了
	swfWhiteList = [
		'.pdim.gs/static/', //熊猫直播
		'http://v.6.cn/apple/player/',
		'.plures.net/pts/swfbin/player/live.swf', //龙珠直播
		'http://www.gaoxiaovod.com/ck/player.swf',
	];
	let Youku = {
		matchPlayer: function(url) {
			return /^http:\/\/static\.youku\.com\/v.*?(?:play|load)er/.test(url);
		},
		setPlayer: function(p, v) {
			let s = getPlayerUrl('player.swf');
			if (!s) {//用户设置播放器文件
				injectDOM('div.base_info+div');
				return;
			}

			if (document.domain.endsWith('youku.com')) {
				//unsafeWindow.scrollTo(0, 99);
				unsafeWindow._ssPlayer = p.outerHTML.replace('direct', 'gpu');
				unsafeWindow.document.querySelector("div.base_info+div").outerHTML =
					'<a style="font-size:20px;" onclick="$(\'#movie_player\')[0].outerHTML=_ssPlayer;delete _ssPlayer;$(this).remove();">换原播放器</a>';
			}
			let m = v.match(regYk);
			if (m && m[1]) {
				p.outerHTML = `<embed id="movie_player" wmode="gpu" width="100%" height="100%" src="${s}" allowfullscreen="true" allowscriptaccess="always" type="application/x-shockwave-flash" flashvars="isShowRelatedVideo=true&showAd=0&show_ce=0&showsearch=0&VideoIDS=${m[1]}&isAutoPlay=true">`;
				if (!s.endsWith('.swf'))
					setTimeout(() => URL.revokeObjectURL(s), 1000);
			}
		}
	};
	let YkOutsite = {
		matchPlayer: function(url) {
			return /^http:\/\/player\.youku\.com\/player\.php\/sid\/(\w+)/.test(url);
		},
		setPlayer: function(p, v) {
			let s = getPlayerUrl('player.swf');
			if (!s) {//用户设置播放器文件
				injectDOM();
				return;
			}

			let m = RegExp["$1"] || swfAddr.match(regYk)[1] || v.match(regYk)[1];
			if (m) {
				p.outerHTML = `<embed id="${p.id}" wmode="gpu" allowfullscreen="true" src="${noAdPlayerPath}player.swf" allowscriptaccess="always" type="application/x-shockwave-flash" width="${p.width}" height="${p.height}" flashvars="isShowRelatedVideo=false&showAd=0&show_ce=0&showsearch=0&VideoIDS=${m}">`;
				if (!s.endsWith('.swf'))
					setTimeout(() => URL.revokeObjectURL(s), 1000);
			}
		}
	};
	let AcfunYk = {
		//playerName: 'player.swf',//播放器默认文件名
		//playerUrl: getPlayerUrl(this.playerName),
		matchPlayer: function(url) {
			return url.startsWith('http://cdn.aixifan.com/player/cooperation/acfunxyouku.swf');
		},
		setPlayer: function(p, v) {
			let s = getPlayerUrl('player.swf');
			if (!s) {//用户设置播放器文件
				injectDOM();
				return;
			}

			let m = v.match(/vid=(\w+)/);
			if (m && m[1]) {
				p.outerHTML = `<embed id="movie_player" wmode="gpu" width="100%" height="100%" src="${s}" allowfullscreen="true" allowscriptaccess="always" type="application/x-shockwave-flash" flashvars="isShowRelatedVideo=true&showAd=0&show_ce=0&showsearch=0&VideoIDS=${m[1]}&isAutoPlay=true">`;
				if (!s.endsWith('.swf'))
					setTimeout(() => URL.revokeObjectURL(s), 1000);
			}
		}
	};
	let Iqiyi = {
		matchPlayer: function(url) {
			return url.startsWith('http://www.iqiyi.com/common/flashplayer/201');
		},
		setPlayer: function(p, v) {//cid: 100141,300089, &components=fefb1060e &vipuser=
			let s = v.replace(/&(?:cid|\w+?Time|cpn\w|exclusive\w*|adurl|webEventID|\w*loader)=[^&]*/g,'') +'&cid=qc_100001_300089';
			s = `<embed play="true" allowfullscreen="true" wmode="gpu" type="application/x-shockwave-flash" width="100%" height="100%" id="flash" allowscriptaccess="always" src="${swfAddr}" flashvars="${s}">`;
			p.outerHTML = s;
			/*
			let opts = {};
			opts.params = {
				'wMode' : 'gpu'
			};
			opts.vars = { cid: 'qc_100001_300089'};
			let vars = s.split('&');
			for (let k of vars) {
				s = k.split('=');
				opts.vars[s[0]] = s[1];
			}
			s = unsafeWindow.Q.player.create(p.id, opts); */
			//p.parentNode.replaceChild(s, p);
			//refreshElem(p);
		}
	};

	function injectDOM(replaceCss) {
		// if (!confirm('请选择下载的swf播放器文件。准备好了吗？'))
			// return;
		let s, c;
		if (replaceCss) {
			c = document.querySelector(replaceCss);
			if (!c) return;
		} else {
			c = $C('div');
			document.body.appendChild(c);
		}
		s = $C('script', {type:"text/javascript", 'class':"gmTemp"});
		s.textContent = `window.URL = window.URL || window.webkitURL;
		function handleSwf(file) {
			if (!/\.swf$/i.test(file.name) ) return false;

			//save data to localStorage
			blob2DataURL(file, r => {localStorage.swfPlayer = r});
			setTimeout(function() {
				alert('缓存完毕！刷新页面...');
				location.reload();
			}, 1000);
		}

		function blob2DataURL(blob, callback) {
			let fr = new FileReader();
			fr.onload = function (ev) {
				callback(ev.target.result);
			};
			fr.readAsDataURL(blob);
		}`;
		document.head.appendChild(s);
		c.outerHTML = `<div><input type="file" id="fileElem" onchange="handleSwf(this.files[0])" hidden>
		<a href="javascript:;" id="fileSelect" style="font-size:20px;" onclick="document.querySelector('input#fileElem').click();">设置去广告swf文件</a></div>`;
	}
	function getPlayerUrl(fileName) {
		if (noAdPlayerPath)
			return noAdPlayerPath + fileName;
		if (localStorage.swfPlayer) {
			let b = dataURL2Blob(localStorage.swfPlayer);
			return URL.createObjectURL(b);
		}
		return null;
	}
	function dataURL2Blob(dataurl) {
		let arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		a = new Uint8Array(n);
		while(n--){
			a[n] = bstr.charCodeAt(n);
		}
		return new Blob([a], {type:mime});
	}
/*
	function qyOutsiteFormat(p, v) {
		let tvid = v.match(/\btvId=(\w+)/i)[1],
		definitionID = v.match(/\b(?:definitionID|sourceId|vid)=(\w+)/)[1],
		s = `<embed width="100%" height="100%" allowscriptaccess="always" wmode="gpu" allowfullscreen="true" type="application/x-shockwave-flash" id="${p.id}" src="${noAdPlayerPath}iqiyi_out.swf" flashvars="vid=${definitionID}&tvid=${tvid}&autoPlay=1&showSearch=0&showSearchBox=0&autoHideControl=1&cid=qc_100001_300089&showDock=0">`;
		setPlayer(p, s);
	} */
	function openFlashGPU(p) {
		isEmbed ? p.setAttribute('wmode', 'gpu') :
		setFlashParam(p, {wmode: 'gpu'});
		//p.parentNode.replaceChild(p.cloneNode(true), p);
		refreshElem(p);
	}
	function refreshElem(o) {
		let s = o.style.display;
		o.style.display = 'none';
		setTimeout(() => {
			s ? o.style.display = s : o.style.removeProperty('display');
			if ('' === o.getAttribute('style'))
				o.removeAttribute('style');
		}, 9);
	}
	function isPlayer(p) {
		if (swfWhiteList.some(x => swfAddr.includes(x)))
			return !0;
		if (!p.width)
			return !1;
		if (p.width.endsWith('%'))
			return !0;
		if (parseInt(p.width) < 233 || parseInt(p.height) < 53)
			return !1;
		return isEmbed ? p.matches('[allowFullScreen]') :
		/"allowfullscreen"/i.test(p.innerHTML);
	}
	function setFlashParam(p, values) {
		let i, o,
		e = p.querySelector('embed');
		for (i in values) {
			if (e) e.setAttribute(i, values[i]);
			if (p.hasAttribute(i)) p.setAttribute(i, values[i]);
		}
		for (o of p.childNodes) if (o.name) {
			i = o.name.toLowerCase();
			if (i in values) {
				o.value = values[i];
				delete values[i];
			}
		}
		for (i in values) {
			e = doc.createElement('param');
			e.name = i;
			e.value = values[i];
			p.appendChild(e);
		}
	}
	function getFlashvars(p) {
		let s = 'flashvars';
		if (isEmbed)
			return p.getAttribute(s);
		if (!p.children[s])
			s = 'flashVars';
		return p.children[s].value;
	}
	function doPlayer(e) {
		if (!onlyUseGpu) {
			let player_pr = [Youku,YkOutsite,AcfunYk,Iqiyi];//处理队列
			for (let t of player_pr) {
				if (t.matchPlayer(swfAddr)) {
					t.setPlayer(e, getFlashvars(e));
					return;
				}
			}
		}
		openFlashGPU(e);
	}
	function $C(name, attr) {
		let el = document.createElement(name);
		if (attr) {
			for (var i in attr) {//用var修正TM的for-in循环BUG
				attr.hasOwnProperty(i) && el.setAttribute(i, attr[i]);
			}
		}
		return el;
	}
/*
 	function getPlayerURL(fileName) {
		let reqObj = {
			url: noAdPlayerPath + fileName,
			method: "GET",
			responseType = 'arraybuffer',
			headers: {},
			onload: function(res){
				if (res.status !== 200) {
					alert("Unexpected status code " + res.status + " for " + fileName);
					return false;
				}
				let file = new Blob([new Uint8Array(res.response)], {
					type : 'application/x-shockwave-flash'
				});
				this.playerUrl = URL.createObjectURL(file);
			}
		};
		GM_xmlhttpRequest(reqObj);
	} */
	if (window.chrome)
		NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	if ($C('a').click === undefined) {
		Element.prototype.click = function () {
			var e = document.createEvent('MouseEvents');
			e.initEvent('click', true, true);
			this.dispatchEvent(e);
		};
	}
	window.URL = window.URL || window.webkitURL;
	let parents = new WeakSet();

	new MutationObserver(function () {
		for (let k of doc.querySelectorAll('object,embed')) {
			isEmbed = k.matches('embed');
			if (isEmbed && k.parentNode.matches('object'))
				continue;
			swfAddr = isEmbed ? k.src : k.data || k.children.movie.value;
			swfAddr = swfAddr.toLowerCase();
			let p = k.parentNode;
			if (parents.has(p) || !/\.swf(?:$|\?)/.test(swfAddr))
				continue;
			parents.add(p);
			if (isPlayer(k)) {
				console.log(k, swfAddr, ' is player!');
				doPlayer(k);
			}
		}
	}).observe(bd, {
		childList : true,
		subtree : true
	});
	let div = $C('div');
	bd.appendChild(div);
	bd.removeChild(div);
}(document, document.body);
