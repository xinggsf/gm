// ==UserScript==
// @name         膜法小工具
// @version      0.7.1
// @description  方便生活，快乐分享
// @namespace    dolacmeo-xinggsf
// @supportURL   https://github.com/xinggsf/gm/issues
// @require      https://cdn.jsdelivr.net/npm/js-base64@2.4.3/base64.min.js
// @require      https://cdn.jsdelivr.net/npm/fingerprintjs2@1.8.0/dist/fingerprint2.min.js
// @resource     country_code https://gist.githubusercontent.com/dolaCmeo/f1810f8ceddf25880c6ae14e8dbc23d5/raw/cd3ab8280a2e6cb4decf3bab705d759e7c98deab/country_code.json
// @include      https://free-ss.*
// @include      https://www.youneed.win/free-ssr
// @grant        GM_registerMenuCommand
// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @connect      www.youneed.win
// @grant        GM_openInTab
// @grant        unsafeWindow
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/xinggsf/gm/master/ssr.user.js
// ==/UserScript==

const { encodeURI: enb64, decode: deb64 } = Base64;
const xfetch = (url) => new Promise((success, fail) => {
	GM_xmlhttpRequest({
		method: 'GET',
		url: url,
		onload: success,
		onerror: fail,
		ontimeout: fail
	});
});

//host文件添加  104.31.74.55  www.youneed.win youneed.win
GM_registerMenuCommand('读取www.youneed.win的ssr列表到剪贴板', async () => {
	// const resp = await xfetch('https://www.youneed.win/free-ssr');
	// const m = resp.responseText.match(/\bssr:\/\/\w+/g);
	const m = [].map.call(document.querySelectorAll('table:first-child a[data]'),
		e => e.getAttribute('data'));
	if (!m.length) alert('站点未提供ssr://链接列表！');
	else {
		GM_setClipboard(m.join('\n'));
		alert('ssr://链接列表已经拷贝到剪贴板');
	}
});
if (!location.host.startsWith('free-ss.')) return;

const t = setInterval(() => {
	'use strict';
	const { $, layer } = unsafeWindow;
	if (!$ || !layer) return;
	clearInterval(t);

	const ssTable = $("table:last"),
	date_str = new Date().toISOString().slice(0, 10) + '_',
	country_code = JSON.parse("" + GM_getResourceText('country_code')),
	areas = new Set(),
	order = {
		point: 0,
		address: 1,
		port: 2,
		password: 3,
		method: 4,
		clock: 5,
		globe: 6,
		qrcode: 7
	},
	xyz = "http://" + deb64("c3NyLjEyMzQ1NjYueHl6"),
	ok_method = [
		'aes-128-cfb', 'aes-128-ctr', 'aes-192-cfb', 'aes-192-ctr', 'aes-256-cfb', 'aes-256-ctr',
		'camellia-128-cfb', 'camellia-192-cfb', 'camellia-256-cfb',
		'bf-cfb', 'chacha20', 'chacha20-ietf', 'rc4-md5', 'salsa20'
	];

	let dataTable;
	layer.load(0, { shade: false, time: 900 });
	ssTable.before("<ul id='tools'></ul>");
	$('#qrcode').after('<div style="display:none" id="qrcode0"></div>');
	GM_addStyle(
		`body{margin:0;}
		h2 small a{font-weight:bold;color:#4CAF50;font-size:10px;text-decoration:none;}
		h2 small button{padding:2px 5px;border:none;font-size:1em;cursor:pointer;}
		li.a {padding:0 40px;}li.q {padding:0 20px;}
		li.aff {float:none;display:inline-block;}
		#tools {margin:0;padding-left:10px;}
		#tools p{margin:0;height:23px;}
		#sel{color:#000080}
		#tools button{cursor:pointer;margin-left:3px;height:23px;border: 0;}
		#tools p,#tools span,#tools small{cursor:default;}
		#tools .txt{display:inline-block;float:left;font-weight:bold;color:#f66;}
		#tools .btn{display:inline-block;float:right;}
		#tools .btn small{color:#e91e63;font-weight: bold;}
		.showup {opacity: 1;} .showoff {opacity: 0;}
		#ss_area {display:inline-block;float:right;margin-left:3px;padding:1px 6px;height:23px;cursor:pointer;color:blue;}
		#client h4 {margin: 0;}
		#client small {color: red;}
		table#client-info {width:480px;margin:0 auto;}
		table#client-info img{width:100%;max-height:38px;}
		table#client-info tr td:first-child {text-align: center;}
		table#client-info tr td{border-bottom: black solid thin;}`
	);

	// 工具对象
	const tools = {
		// 查询当前数据列次序
		order(d) {
			ssTable.find('th').each((i, e) => {
				const v = $(e).text();
				if (v.includes("qrcode")) d.qrcode = i;
				else if (v.includes("clock")) d.clock = i;
				else if (v.includes("globe")) d.globe = i;
				else if (v.split("/").length > 2) d.point = i;
				else d[v.toLowerCase()] = i;
			});
		},
		// 整理链接地区
		area() {
			const column = order.globe;
			areas.clear();
			for (const k of Array.from(dataTable.data())) {
				k[column][0] != '*' && areas.add(k[column]);
			}
		},
		// ss://method:password@server:port
		_ss(data) {
			const method = data[order.method],
			password = data[order.password],
			server = data[order.address],
			port = data[order.port],
			globe = data[order.globe],
			point = data[order.point],
			clock = data[order.clock],
			remarks = `${globe}[${point}](${date_str}${clock})`,
			ssBody = enb64(`${method}:${password}@${server}:${port}`);
			return `ss://${ssBody}#${remarks}`;
		},
		// ssr://server:port:protocol:method:obfs:password_base64/?params_base64
		_ssr(data) {
			const server = data[order.address],
			port = data[order.port],
			method = data[order.method],
			globe = data[order.globe],
			point = data[order.point],
			clock = data[order.clock],
			password = enb64(data[order.password]),
			remarks = enb64(`${globe}[${point}](${date_str}${clock})`);
			return 'ssr://'+ enb64(`${server}:${port}:origin:${method}:plain:${password}/?remarks=${remarks}&group=ZnJlZS1zcw`);
		},
		datas() {
			let ssdatas = dataTable.rows('.selected').data();
			if (!ssdatas.length) ssdatas = dataTable.data();
			return Array.from(ssdatas);
		},
		ss() {
			return this.datas().map(data => this._ss(data));
		},
		ssr() {
			return this.datas().map(data => this._ssr(data));
		},
		upload(URL) {
			if (URL) GM_xmlhttpRequest({
				method: 'POST',
				url: URL,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				data: 'ssr=' + enb64(this.ssr().join('\n')) + 'ver=' + GM_info.script.version.replace('.', '_'),
				onloadstart: function () {
					layer.load(2, { time: 9999 });
				},
				onload: function (r) {
					layer.closeAll();
					layer.msg(`POST:${URL}<br>${r.status}:${r.statusText}`);
				},
				onerror: onload,
				ontimeout: onload
			});
		}
	};

	const onSelectRow = num => {
		$("#sel").html(num ? `，已选 ${num} 条` : '');
	};

	document.onkeydown = ev => {
		if (ev.ctrlKey && 81 == ev.keyCode) { // Ctrl+q
			tools.upload(prompt("POST-URL:", xyz));
		}
	};

	function make_area() {
		tools.area();
		const el = $("#ss_area").empty();
		el.append('<option value="">全部</option>');
		for (const x of areas) {
			el.append(`<option value="${x}">${country_code[x]}</option>`);
		}
	}

	function check_method() {
		let n = 0, len = 0, td = `td:eq(${order.method})`;
		dataTable.$('tr').each(function() {
			const s = $(this).find(td).text(); //加密协议名
			if (!ok_method.includes(s)) {
				$(this).addClass('delete');
				n++;
			} else len++;
		});
		if (!n) layer.msg("所有链接协议可用", { time: 900 });
		else {
			layer.msg(`已移除不兼容SSR的协议(${n}条)`, { time: 900 });
			dataTable.rows('.delete').remove().draw();
		}
		$("#total").html(`共 ${len} 条`);
	}

	function start() {
		layer.closeAll();
		$(".fa-info-circle, .affdiv, .banner").remove();
		showInfo('div.footer');
		unsafeWindow.dataTable = dataTable = ssTable.DataTable({ retrieve: true });
		tools.order(order);
		dataTable.order([0, 'asc']).draw();
		//console.log(dataTable.data(), dataTable.rows());
		$("h2:last").append(
			`<small>
				<a title="${GM_info.script.name}" target="_blank" href="${GM_info.script.supportURL}">
					<i class="fa fa-bolt"></i>${GM_info.script.version}
				</a>
			</small>
			<small style="float:right">
				<button id="site_info" style="float:right;background-color:initial;">
					<i class="fa fa-question-circle"></i>
				</button>
				<button id="user_info" style="float:right;background-color:initial;">
					<i class="fa fa-info-circle"></i>
				</button>
			</small>`.replace(/[\r\n\t]/g, '')
		);
		$("title").append("⚡");
		$('#site_info').click(ev => showInfo('div.footer'));
		$('#user_info').click(ev => showInfo('#client'));
		const rowCount = dataTable.rows().length;
		$("#tools").html(
			`<li class="txt">
				<p id="link_num">
					<span id="total">共 ${rowCount} 条</span>
					<span id="sel"></span>
				</p>
			</li>
			<li class="btn">
				<button id="btn_clear" title="移除评分6以下">移除不稳定</button>
				<button id="btn_ss">复制 SS</button>
				<button id="btn_ssr">复制SSR</button>
				<button id="btn-convertSel">反选</button>
				<select id="ss_area"></select>
			</li>`.replace(/[\r\n\t]/g, '')
		);

		make_area();
		$('#ss_area').on('change', function () {
			const area = $('#ss_area').val();
			if (area == '') {
				dataTable.$('tr.selected').removeClass('selected');
				$("#sel").empty();
				return;
			}
			let n = 0, td = `td:eq(${order.globe})`;
			dataTable.$('tr').each(function () {
				if ($(this).find(td).text().includes(area)) {
					$(this).addClass('selected');
					n++;
				} else {
					$(this).removeClass('selected');
				}
			});
			layer.msg(`已选中 ${country_code[area]} 区域`, { time: 900 });
			onSelectRow(n);
			dataTable.order([order.globe, 'asc']).draw();
		});

		$('#btn-convertSel').click(ev => {
			const n = dataTable.$('tr').toggleClass('selected').filter('.selected').length;
			onSelectRow(n);
		});
		$('#btn_ss').click(ev => {
			const a = tools.ss();
			layer.msg(`SS链接复制成功(${a.length}条)`, { time: 900 });
			GM_setClipboard(a.join('\n'));
		});
		$('#btn_ssr').click(ev => {
			const a = tools.ssr();
			layer.msg(`SSR链接复制成功(${a.length}条)`, { time: 900 });
			GM_setClipboard(a.join('\n'));
		});
		$('#btn_clear').click(function () {
			let n = 0, len = 0;
			dataTable.$('tr').each(function () {
				let s = $(this).find('td:first').text();
				if (/[a-z]/i.test(s) || s.split('/').some(x => parseInt(x) < 6)) {
					$(this).addClass('delete');
					n++;
				} else len++;
			});
			if (n == 0) {
				layer.msg("所有链接较为稳定(＞5)", { time: 900 });
			} else {
				layer.msg(`已移除不稳定链接(${n}条)`, { time: 900 });
				$(this).before(`<small> (已移除${n}条) </small>`);
				dataTable.rows('.delete').remove();
			}
			dataTable.order([0, 'asc']).draw();
			$("#total").html(`共 ${len} 条`);
			this.remove();
			make_area();
			method_clear();
		});
		dataTable.$('tr').click(function () {
			$(this).toggleClass('selected');
			onSelectRow(dataTable.rows('.selected').length);
		});
	}

	function showInfo(css) {
		const el = $(css).show();
		layer.open({
			type: 1,
			title: false,
			closeBtn: 0,
			shade: 0.7,
			area: '500px',
			shadeClose: true,
			content: el,
			end: function () {
				el.hide();
			}
		});
	}


	function failed() {
		if (!dataTable.rows().length) {
			layer.confirm('貌似脚本加载失败了！？', {
				title: GM_info.script.name + " " + GM_info.script.version,
				closeBtn: 0,
				shade: 0.5,
				shadeClose: true,
				resize: false,
				btn: ['刷新', '反馈']
			}, function () {
				location.reload();
			}, function () {
				GM_openInTab(GM_info.script.supportURL);
			});
		}
	}

	function method_clear() {
		layer.confirm('是否移除不兼容SSR的协议？', {
			title: false,
			closeBtn: 0,
			shade: 0.5,
			shadeClose: true,
			resize: false,
			btn: ['确定', '取消']
		}, function (index) {
			check_method();
			layer.close(index);
		}, function (index) {
			layer.close(index);
		});
	}

	if (ssTable.find('tr.even')[0]) start();
	else {
		unsafeWindow.tools = tools;
		unsafeWindow.start = start;
		ssTable.on('init.dt', start).on('error.dt', failed);
	}
}, 300);