// ==UserScript==
// @name         free-ss.site 生成全部链接
// @version      0.3.6
// @description  将所有分享ss链接全部显示，方便统一复制使用
// @author       dolacmeo, xinggsf
// @match        https://free-ss.site/
// @match        https://free-ss.gq/
// @require      https://cdn.jsdelivr.net/npm/js-base64@2.4.3/base64.min.js
// @namespace    ss@rohankdd.com
// @grant        GM_setClipboard
// ==/UserScript==

'use strict';
var $table, ss_table, links_ss, links_ssr;
$("table:first, .main h2").remove();
$("table").each(function () { // 获取真实的数据table
    if (this.parentNode.clientHeight) $table = $(this);
});

var date_str = new Date().toISOString().slice(0, 10) + '_';
var gen = {
	// 将数据处理成链接
	datas() {
		var ssdatas = ss_table.rows('.selected').data();
		if (!ssdatas.length) ssdatas = ss_table.data();
		links_ss = links_ssr = "";
		$.each(ssdatas, (i, data) => {
			var ss = this.ss(data),
			ssr = this.ssr(data);
			$("#ss-links").append(ss + '<br>');
			$("#ssr-links").append(ssr + '<br>');
			links_ss += ss + '\n';
			links_ssr += ssr + '\n';
		});
		return ssdatas;
	},
	// 生成ss链接
	ss(data) {
		const url = Base64.encodeURI(`${data[4]}:${data[3]}@${data[1]}:${data[2]}`);
		return `ss://${url}#${data[6]}(${date_str}${data[5]})`;
	},
	// 生成ssr链接
	ssr(data) {
		const plain = Base64.encodeURI(data[3]);
		const remarks = Base64.encodeURI(`${data[6]}(${date_str}${data[5]})`);
		return 'ssr://'+ Base64.encodeURI(`${data[1]}:${data[2]}:origin:${data[4]}:plain:${plain}/?remarks=${remarks}&group=ZnJlZS1zcy5zaXRl`);
	}
};

// 载入HTML
function init_html() {
	$(".main").append(`
		<textarea id="input" style="position: absolute;top: 0;left: 0;opacity: 0;z-index: -10;"> </textarea>
		<p id="ss-links" style="border-style:double;text-align:left;display:none"></p>
		<p id="ssr-links" style="border-style:double;text-align:left;display:none"></p>
	`);
	$(".main").prepend(`
		<ul><li class="aff"><button id="btn_ssr">复制SSR链接</button></li>
		<li class="aff"><button id="btn_ss">复制SS链接</button></li>
		<li class="aff"><p style="margin:0;" id="link_num">数据加载中... <span id="sel"></span></p></li></ul>
	`);
}

function ready_ss() {
	$table.on('click', 'tbody tr', function () {
		$(this).toggleClass('selected');
		$("#sel").html(ss_table.rows('.selected').data().length);
	});
	function copy(isSSR) {
		gen.datas();
        GM_setClipboard(isSSR ? links_ssr : links_ss, "text");
		alert("链接复制成功");
	}
	$("#link_num").html("可批量导入到剪贴板 (点击可选,当前已选择 <span id='sel'>0</span> 条),共" + ss_table.data().length + "条");
	$('#btn_ss').click(() => copy(!1));
	$('#btn_ssr').click(() => copy(true));
}

init_html();
$table.on('init.dt', function () {
	ss_table = $table.DataTable();
	ready_ss();
	$('.fa-globe').click();
});