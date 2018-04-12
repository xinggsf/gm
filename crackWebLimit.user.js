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
function unbind(e) {
	e = e.wrappedJSObject || e;
	events.forEach(function (evt) {
		e['on' + evt] = null;
		if ($) $(e).unbind(evt);
	});
}
function runScript() {
	[document, document.body].forEach(unbind);
	events.forEach.call(document.querySelectorAll('div'), unbind);
}
w.onload = runScript;
w.onhashchange = function () {
	setTimeout(runScript, 300);
};