// ==UserScript==
// @name        2ccc
// @namespace   xinggsf~2ccc.com
// @description 2ccc取消下载等待
// @include     http://www.2ccc.com/*down.asp?*
// @author	    xinggsf~gmail。com
// @version     1.2
// @grant       none
// @run-at      document-end
// ==/UserScript==

doUpdate(0);
const e = document.getElementById("ShowDiv");
e && e.remove();
document.querySelector('#getcode form').submit();