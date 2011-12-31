// ==UserScript==
// @name           yytAutoHtml5
// @namespace      yytAutoHtml5.yinyuetai.com
// @author	       xinggsf~gmail。com
// @description    音悦台自动跳转Html5播放，去广告不再黑屏
// @homepageURL    https://greasyfork.org/zh-CN/scripts/14593
// updateURL       https://greasyfork.org/scripts/14593.js
// @include        http://v.yinyuetai.com/video/*
// @include        http://v.yinyuetai.com/playlist/*
// @version        2015.12.27
// @encoding       utf-8
// @run-at         document-start
// @grant          unsafeWindow
// grant          GM_openInTab
// ==/UserScript==
"use strict";
//由jQuery.cookie.js改写 http://blog.wpjam.com/m/jquery-cookies/
function cookie(name, value, options) {
	let k, s;
	if (typeof value != 'undefined') {
		options = options || {};
		if (value == null) {
			value = '';
			options.expires = -1;
		}
		s = name + '=' + encodeURIComponent(value);
		if (options.expires && (typeof options.expires == 'number' ||
			options.expires.toUTCString))
		{
			let date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			s += '; expires=' + date.toUTCString();
		}
		//options: expires,path,domain,secure
		delete options.expires;
		for (k in options) s += '; ' + k + '=' + options.k;
		document.cookie = s;
	} else {
		let cookieValue = null;
		if (document.cookie && document.cookie != '') {
			let cookies = document.cookie.split(';');
			for (k of cookies) {
				s = k.trim();
				if (s.startsWith(name + '=')) {
					cookieValue = decodeURIComponent(s.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
}
const cVp = {'sh': '1080','he': '超清','hd': '高清','hc': '流畅'};
let $, s, songUrls = {'hc': ''},//当前歌曲下载地址列表
dip = cookie('myDIP');
if (!dip) {
	dip = 'hc';
	cookie('myDIP', dip, {
		expires : 33,
		domain : '.yinyuetai.com',
		path : '/'
	});
}

if (!cookie('yyt_pref')) {
	cookie('yyt_pref', '2', {
		expires : 333,
		domain : '.yinyuetai.com',
		path : '/'
	});
}

if (location.pathname.startsWith('/video/h5/')) {
	timer = setInterval(function () {
		$ = unsafeWindow.$;
		if (!$) return;
		$('object').remove();
		let e = $('video');
		if (!e.length) return;
		console.log(e[0]);
		s = e.attr('src');
		let r = /^https?:\/\/(?:hc|hd|he|sh)\.yinyuetai\.com\/uploads\/videos\/common/;
		if (!r.test(s)) return;
		clearInterval(timer);
		if (window.chrome) {
			e.removeClass()
			.addClass('video-stream')
			//.css('visibility', 'visible')
			.attr('style', 'display:block; left:0; top:0; width:100%; height: 100%;')
			.show()
			//.parent().remove(':gt(0)')
			.nextAll().remove(); //删广告
			//$('video~*').remove();
		} else { //firefox
			e = e.parent();
			e.html(`<video class="video-stream" src="${s}" controls="controls" autoplay style="width:100%; height:100%"></video>`); //隐含动作：删广告
			e.nextAll().remove(); //删原有的播放控制栏
		}
	}, 300);
} else {
	location.assign('/video/h5/' + location.pathname.slice(7));
}