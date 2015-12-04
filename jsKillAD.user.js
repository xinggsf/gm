// ==UserScript==
// @name        jsKillAD
// @namespace   jsKillAD
// @description 查杀页面浮动广告
// @author	    xinggsf~gmail。com
// @homepageURL https://greasyfork.org/scripts/7410
// updateURL    https://greasyfork.org/scripts/7410.js
// @encoding    utf-8
// @license     GPL version 3
// @include     http://*
// @include     https://*
// @exclude     http://*.mail.*/*
// @exclude     http://mail.*
// @exclude     https://mail.*
// @exclude     http://*mimg.127.net/*
// @exclude     http://*.csdn.net/postedit/*
// @exclude     http://www.google.*/search?*
// @exclude     https://www.google.*/search?*
// @exclude     http://www.google.*/webhp*
// @exclude     https://www.google.*/webhp*
// @exclude     http://www.baidu.com/s?*
// @exclude     http://play.baidu.com/*
// @exclude     http://115.com/*
// @exclude     http://*.115.com/*
// @exclude     http://*.1ting.com/*
// @exclude     http://www.360doc.com/*
// @exclude     http://www.cnblogs.com/*
// @exclude     http://www.iqiyi.com/v_*
// @exclude     http://*.qq.com/*
// @exclude     http://video.sina.com.cn/*
// @exclude     http://www.yatu.tv/m*/play*.html
// @grant       none
// @version     2015.9.1
// ==/UserScript==
-function (doc) {
  var bc = Array.prototype.forEach;

  function getStyle(o, s) {
    if (o.style[s]) return o.style[s];
    if (doc.defaultView && doc.defaultView.getComputedStyle) {//DOM
      var x = doc.defaultView.getComputedStyle(o, '');
      //s = s.replace(/([A-Z])/g,'-$1').toLowerCase();
      return x && x.getPropertyValue(s);
    }
  }
  function testStyle(o) {
    var s = getStyle(o, 'position');
    return s === 'fixed' || s === 'absolute';
  }
  function isFloatLay(o) {
    var x = o.offsetParent;
    return !x || x.tagName === 'BODY' || x.tagName === 'HTML';
  }
  -function(el) {
    ['iframe','img','object','embed','video'].forEach(function (s){
      bc.call(el.getElementsByTagName(s), function (x){
        while (x) {
          if (isFloatLay(x)) {
            testStyle(x) && x.parentNode.removeChild(x);
            break;
          }
          x = x.offsetParent;
        }
      });
    });
  }(doc);
}(document);