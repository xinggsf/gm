// ==UserScript==
// @name        2ccc
// @namespace   xinggsf~2ccc.com
// @description 2ccc取消下载等待
// @include     http://www.2ccc.com/*down.asp?*
// @author	    xinggsf~gmail。com
// @version     1.1
// @grant       none
// @run-at      document-end
// ==/UserScript==

doUpdate(0);
var x=document.getElementById("ShowDiv");
if (x) x.parentNode.removeChild(x);
document.querySelector('#getcode form').submit();