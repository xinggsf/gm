// ==UserScript==
// @namespace         https://www.github.com/Cat7373/remove-web-limits/
// @name              网页限制解除（精简优化版）
// @description       解除大部分网站禁止复制、剪切、选择文本、右键菜单的限制。
// @homepageURL       https://github.com/xinggsf/gm/
// @author            Cat73  xinggsf
// @version           1.5.6
// @license           LGPLv3
// @include           https://www.zhihu.com/*
// @include           https://www.bilibili.com/read/*
// @include           *://imac.hk/*
// @include           https://life.tw/*

// @include           *://b.faloo.com/*
// @include           *://bbs.coocaa.com/*
// @include           *://book.hjsm.tom.com/*
// @include           *://book.zhulang.com/*
// @include           *://book.zongheng.com/*
// @include           *://book.hjsm.tom.com/*
// @include           *://chokstick.com/*
// @include           *://chuangshi.qq.com/*
// @include           *://yunqi.qq.com/*
// @include           *://city.udn.com/*
// @include           *://cutelisa55.pixnet.net/*
// @include           *://huayu.baidu.com/*
// @include           *://tiyu.baidu.com/*
// @include           *://yd.baidu.com/*
// @include           *://yuedu.baidu.com/*
// @include           *://luxmuscles.com/*
// @include           *://read.qidian.com/*
// @include           *://www.15yan.com/*
// @include           *://www.17k.com/*
// @include           *://www.18183.com/*
// @include           *://www.360doc.com/*
// @include           *://www.eyu.com/*
// @include           *://www.hongshu.com/*
// @include           *://www.coco01.com/*
// @include           *://news.missevan.com/*
// @include           *://www.hongxiu.com/*
// @include           *://www.imooc.com/*
// @include           *://www.readnovel.com/*
// @include           *://www.tadu.com/*
// @include           *://www.jjwxc.net/*
// @include           *://www.xxsy.net/*
// @include           *://www.z3z4.com/*
// @include           *://yuedu.163.com/*
// @grant             GM_addStyle
// @run-at            document-start
// @updateUrl    https://raw.githubusercontent.com/xinggsf/gm/master/Remove%20web%20limits.user.js
// ==/UserScript==

"use strict";
// 域名规则列表
const rules = {
	plus: {
		hook_eventNames: "contextmenu|select|selectstart|copy|cut|dragstart",
		unhook_eventNames: "mousedown|mouseup|keydown|keyup",
		dom0: true,
		hook_addEventListener: true,
		hook_preventDefault: true,
		add_css: true
	}
};

const returnTrue = e => true;
// 获取目标域名应该使用的规则
const getRule = (host) => rules[host] || rules.plus;
const dontHook = e => !!e.closest('form');
// 储存被 Hook 的函数
const EventTarget_addEventListener = EventTarget.prototype.addEventListener;
const document_addEventListener = document.addEventListener;
const Event_preventDefault = Event.prototype.preventDefault;
// 要处理的 event 列表
let hook_eventNames, unhook_eventNames, eventNames;

// Hook addEventListener proc
function addEventListener(type, func, useCapture) {
	const _addEventListener = this === document ? document_addEventListener : EventTarget_addEventListener;
	const a = hook_eventNames.includes(type) ? [type, returnTrue, useCapture] : arguments;
	_addEventListener.apply(this, a);
}

// 清理或还原DOM节点的onxxx属性
function clearLoop() {
	let type, prop,
	c = [document,document.body, ...document.getElementsByTagName('div')],
	// https://life.tw/?app=view&no=746862
	e = document.querySelector('iframe[src="about:blank"]');
	if (e && e.clientWidth>99 && e.clientHeight>11) {
		e = e.contentWindow.document;
		c.push(e, e.body);
	}

	for (e of c) {
		if (!e) continue;
		e = e.wrappedJSObject || e;
		for (type of eventNames) {
			prop = 'on' + type;
			e[prop] = null;
		}
	}
}

function init() {
	// 获取当前域名的规则
	let rule = getRule(location.host);
	// 设置 event 列表
	hook_eventNames = rule.hook_eventNames.split("|");
	// Allowed to return value
	unhook_eventNames = rule.unhook_eventNames.split("|");
	eventNames = hook_eventNames.concat(unhook_eventNames);

	if (rule.dom0) {
		setInterval(clearLoop, 9e3);
		setTimeout(clearLoop, 1e3);
		window.addEventListener('load', clearLoop, true);
	}

	if (rule.hook_addEventListener) {
		EventTarget.prototype.addEventListener = addEventListener;
		document.addEventListener = addEventListener;
	}

	if (rule.hook_preventDefault) {
		Event.prototype.preventDefault = function () {
			if (dontHook(this.target) || !eventNames.includes(this.type)) {
				Event_preventDefault.apply(this, arguments);
			}
		};
	}

	if (rule.add_css) GM_addStyle(
		`html, * {
			-webkit-user-select:text !important;
			-moz-user-select:text !important;
			user-select:text !important;
		}
		::-moz-selection {color:#111 !important; background:#05D3F9 !important;}
		::selection {color:#111 !important; background:#05D3F9 !important;}`
	);
}

init();