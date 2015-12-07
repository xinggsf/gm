// ==UserScript==
// @name           yytAutoHtml5
// @namespace      yytAutoHtml5.yinyuetai.com
// @author	       xinggsf~gmail。com
// @description    音悦台强制跳转Html5播放，去广告不再黑屏
// @homepageURL    https://greasyfork.org/zh-CN/scripts/14593
// updateURL       https://greasyfork.org/scripts/14593.js
// @license        GPL version 3
// @include        http://v.yinyuetai.com/video/*
// include        /^http://v\.yinyuetai\.com/video/\d+/
// include        /^http://v\.yinyuetai\.com/video/h5/\d+/
// @version        2015.12.6
// @encoding       utf-8
// @run-at         document-start
// @grant          unsafeWindow
// grant          GM_openInTab
// ==/UserScript==

/*
//自jQuery.cookie.js改写 http://blog.wpjam.com/m/jquery-cookies/
var cookie = function (name, value, options) {
if (typeof value != 'undefined') {
options = options || {};
if (value === null) {
value = '';
options.expires = -1;
}
var k, s = name + '=' + encodeURIComponent(value);
if (options.expires && (typeof options.expires == 'number' ||
options.expires.toUTCString)) {
var date;
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
for (k in options)
s += '; ' + k + '=' + options.k;
document.cookie = s;
} else {
var cookieValue = null;
if (document.cookie && document.cookie != '') {
var k, s, cookies = document.cookie.split(';');
for (k of cookies) {
s = k.trim();
if (s.substring(0, name.length + 1) == (name + '=')) {
cookieValue = decodeURIComponent(s.substring(name.length + 1));
break;
}
}
}
return cookieValue;
}
};

if (!cookie('yyt_pref')) {
cookie('yyt_pref', '2', {
expires : 333,
domain : '.yinyuetai.com',
path : '/'
});
} */

var s = 'http://v.yinyuetai.com/video/h5/';
if (location.href.startsWith(s)) {
	var r = /^http:\/\/hc\.yinyuetai\.com\/uploads\/videos\/.+\.flv\?/,
	timer = setInterval(function () {
		var $ = unsafeWindow.$;
		if (!$) return;
		$('object').remove();
		var e = $('video');
		if (!e.length) return;
		console.log(e);
		s = e.attr('src');
		if (!r.test(s)) return;
		clearInterval(timer);
		if (window.chrome) {
			e.removeClass()
				.addClass('video-stream')
				.attr('style', 'display: block; left: 0px; top: 0px; width: 1024px; height: 576px;')
				.show()
				.nextAll().remove();
				//.css('visibility', 'visible');
				//.parent().remove(':gt(0)');
			//$('video~*').remove();
		} else {//firefox
			e = e.parent();
			e.html('<video class="video-stream" src="' + s + '" controls="controls" autoplay style="width:100%; height:100%"></video>');
			e.nextAll().remove();
		}
	}, 500);
} else {
	console.log('goto html5 play page!');
	unsafeWindow.location.assign(s + location.href.slice(29));
}