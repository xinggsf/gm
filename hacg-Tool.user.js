// ==UserScript==
// @name         hacg-Tool
// @namespace    hacg.xing
// @version      1.0
// @description  琉璃神社显示下载链接
// @author       红领巾
// @include      *://hacg.*
// @include      *://*.hacg.*/*
// @grant        none
// ==/UserScript==

"use strict";
if (window.chrome)
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
let i, j, f, m,
c = document.querySelector('.entry-content').childNodes,
regText = /\w{40}|[A-Za-z0-9]{2,39} ?[\u4e00-\u9fa5 ]{2,} *\w{2,37}\b/g,
regLink = /(?:\s|[\u4e00-\u9fa5])+/g;
for (i of c) // 复杂度: O(n)
	if (m = i.textContent.match(regText))
	for (j of m) { // O(1)
		console.log(j);
		f = j.toString().replace(regLink, '').trim();//hash
		if (f.length >= 40) {
			f = `<a href="magnet:?xt=urn:btih:${f}">老司机链接</a>`;
			i.innerHTML = i.innerHTML.replace(j, f);
		}
	}