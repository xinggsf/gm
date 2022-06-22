// ==UserScript==
// @name         去pcbeta.com的防广告提示
// @namespace    pcbeta.xinggsf
// @version      1.3
// @description  去pcbeta.com的防广告提示
// @author       xinggsf
// @match        https://*.pcbeta.com/*
// ==/UserScript==

'use strict';
document.querySelector('.adsbygoogle').closest('#wp>div').remove();