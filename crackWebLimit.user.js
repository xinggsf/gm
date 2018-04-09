// ==UserScript==
// @name         超简易解除网页限制
// @namespace    http://xhunter.org
// @version      1.1.8
// @description  解除网页的复制 、拖动 、选中 、右键  、粘贴等限制。没有多余的代码,仅16行,尽量做到不占资源.
// @author       hunter xinggsf
// @include      *
// @grant        unsafeWindow
// ==/UserScript==

var w = unsafeWindow, $ = w.jQuery,
events = ['contextmenu', 'dragstart', 'mouseup', 'mousedown', 'copy', 'beforecopy', 'selectstart', 'select', 'keydown'];
function unbind(ele) {
	events.forEach(function (evt) {
		ele['on' + evt] = null;
		if ($) $(ele).unbind(evt);
	});
}
function runScript() {
	[w, document, document.documentElement, document.body].forEach(unbind);
	events.forEach.call(document.querySelectorAll('div'), unbind);
}
w.onload = runScript;
w.onhashchange = function () {
	setTimeout(runScript, 300);
};