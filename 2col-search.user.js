// ==UserScript==
// @name       搜索结果双栏显示
// @description 双栏显示搜索结果
// @namespace  search.xinngsf
// @version    1.3
// @include    https://www.search.ask.com/web*
// @include    https://ipv6.baidu.com/*
// @include    https://www.baidu.com/*
// @include    https://www1.baidu.com/*
// @include    https://cn.bing.com/search*
// @include    https://www.bing.com/search*
// @include    https://www.dogedoge.com/result*
// @include    https://ddg0.bucm.cf/?q=*
// @include    https://*duckduckgo.com/*
// @include    https://goobe.io/search.aspx?*
// @include    https://www.google.*
// @include    https://search.iwiki.uk/search*
// @include    https://search.xn--u8jta9j.tw/search*
// @include    https://ipv6.google.*
// @exclude    https://*.google.*/sorry*
// @include    https://www.so.com/s?*
// @include    https://www.sogou.com/web?*
// @include    https://m.sm.cn/s*
// @include    https://startpage.com/*search*
// @include    https://www.startpage.com/*search*
// @run-at     document-start
// @updateURL  https://gitee.com/xinggsf/gm/raw/master/2col-search.user.js
// @grant      GM_addStyle
// ==/UserScript==

'use strict';
const getMainDomain = host => {
	const a = host.split('.');
	let i = a.length - 2;
	if (/^(com?|cc|tv|net|org|gov|edu)$/.test(a[i])) i--;
	return a[i];
};
const router = {
	ask: `#right-pane{display:none !important}#results-pane{max-width:100% !important;margin:0 15px !important;}#left-pane{width:100% !important}#algo-container{max-width:100% !important;}.algo-result{display:inline-flex;flex-wrap:wrap;width:49%;}`,
	baidu:`#content_right{display:none}.container_l,#content_left,.c-container .c-result-content,.c-container .c-container{width:auto !important}#content_left{display:flex;flex-wrap:wrap}.c-container{width:46% !important;padding-right:28px;}#rs_top_new, .hit_top_new{width:100% !important}`,
	bing:`#b_context{display:none}#b_content{padding:9px 15px !important} #b_results{display:flex;flex-wrap:wrap} #b_results>li{width:43%;margin-right:28px;}#b_results,.b_pag,.b_ans{width:100% !important}`,
	google: `.rhscol,#rhs,#rhscol{display:none !important;}#cnt #center_col,#rso>div{width:90vw !important;}#rso .g{display:inline-flex;flex-wrap:wrap;width:46%!important;padding-right:28px}.g>div{flex-wrap:wrap;width:90%!important}#cnt #foot{width:1px !important}.vk_c{border:0px solid #dfe1e5 !important;}`,
	dogedoge:`.js-sidebar-ads,#links_wrapper .results--sidebar,#organic-module,.pinned-to-bottom{display:none}.js-result-hidden-el{display:none!important}.site-wrapper #web_content_wrapper .cw{justify-content:center;display:flex;max-width:unset;margin-left:-150px}#header_wrapper #header,#web_content_wrapper #links_wrapper .search-filters-wrap,#web_content_wrapper #links_wrapper .results--message{justify-content:center;display:grid}#header_wrapper #header{max-width:unset}#header_wrapper #header .header__search-wrap{width:500px}#links_wrapper{display:inline-flex;justify-content:center}#links_wrapper .results--main{float:unset;max-width:unset}#links_wrapper .results--sidebar{min-width:unset;margin:unset}#links_wrapper .results--main #links{width:80vw;display:inline-grid;grid-template-columns:50% 50%;grid-template-areas:"xmain xmain"}#links_wrapper .results--main #links .results_links_deep{width:unset;margin-right:15px}#links .result--more,#links .result--sep{grid-column-start:1;grid-column-end:xmain-end;width:unset!important;padding:0;padding-right:15px}#links .result--sep{margin-bottom:2em}.body--serp .footer{display:flex;justify-content:center;padding-left:unset}`,
	duckduckgo:`.js-sidebar-ads,#links_wrapper .results--sidebar,#organic-module,.pinned-to-bottom{display:none} .js-result-hidden-el{display:none!important}.site-wrapper #web_content_wrapper .cw{justify-content:center;display:flex;max-width:unset;margin-left:-150px}#header_wrapper #header,#web_content_wrapper #links_wrapper .search-filters-wrap,#web_content_wrapper #links_wrapper .results--message{justify-content:center;display:grid}#header_wrapper #header{max-width:unset}#header_wrapper #header .header__search-wrap{width:500px}#links_wrapper{display:inline-flex;justify-content:center} #links_wrapper .results--main{float:unset;max-width:unset}#links_wrapper .results--sidebar{min-width:unset;margin:unset}#links_wrapper .results--main #links{width:80vw;display:inline-grid;grid-template-columns:50% 50%;grid-template-areas:"xmain xmain"}#links_wrapper .results--main #links .results_links_deep{width:unset;margin-right:15px}#links .result--more,#links .result--sep{grid-column-start:1;grid-column-end:xmain-end;width:unset!important;padding:0;padding-right:15px}#links .result--sep{margin-bottom:2em}.body--serp .footer{display:flex;justify-content:center;padding-left:unset}`,
	so:`#side{display:none}#main,.result{width:auto !important}.result{display:flex;flex-wrap:wrap}.res-list{width:46%;margin-right:28px;}`,
	sogou:`#right{display:none}.hintBox,.wrapper,#pagebar_container,.header,.wrap .cr > div{width:90vw !important;margin-left:115px !important;}.header .header-box{width:auto !important}#main,.results{min-width:90vw !important;padding-right:0 !important;display:flex;flex-wrap:wrap}.results>div{width:46% !important;padding-right:28px;}.search-info{position: absolute !important}`,
	sm: `.article.ali_row{display:inline-flex;flex-wrap:wrap;width:32%;}`,
	goobe:`.ContentItem{display:inline-flex;flex-wrap:wrap;width:45%;}.MainContent_Sub_Left_MainContent{max-width: 100%!important}`,
	startpage:
`.w-gl__result {
    max-width: 45%;
    margin:0 16px !important;
    display:inline-flex;flex-wrap:wrap;
}
.layout-web__body {
    padding: 0 !important;
    margin: 0 16px !important;
}
.layout-web__body, .layout-web__mainline, .mainline-results {
    max-width: 100% !important;
}
.layout-web__mainline {
    padding: 0 !important;
	flex: auto !important;
	width: 99vw;
}`
};
router.bucm = router.duckduckgo;
router.shuu = router.iwiki = router['google-fix'] = router['xn--u8jta9j'] = router.google;
const css = router[getMainDomain(location.hostname)];
css && GM_addStyle(css);