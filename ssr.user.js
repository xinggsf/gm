// ==UserScript==
// @name         膜法小工具
// @version      0.6.3
// @description  方便生活，快乐分享
// @namespace    dolacmeo-xinggsf
// @supportURL   https://github.com/xinggsf/gm/issues
// @require      https://cdn.jsdelivr.net/npm/js-base64@2.4.3/base64.min.js
// @require      https://cdn.jsdelivr.net/npm/fingerprintjs2@1.8.0/dist/fingerprint2.min.js
// @resource     userip http://ip.taobao.com/service/getIpInfo.php?ip=myip
// @resource     country_code https://gist.githubusercontent.com/dolaCmeo/f1810f8ceddf25880c6ae14e8dbc23d5/raw/cd3ab8280a2e6cb4decf3bab705d759e7c98deab/country_code.json
// @include      http*
// @grant        GM_registerMenuCommand
// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        unsafeWindow
// @updateURL    https://raw.githubusercontent.com/xinggsf/gm/master/ssr.user.js
// ==/UserScript==

const enb64 = Base64.encodeURI, deb64 = Base64.decode,
ss2ssr = ([all, ip, port, password, method, time, state]) => {
	const remarks = enb64(`${state}|更新时间 ${time}`);
	// group: "Z2l0aHViLmNvbQ" == btoa('github.com')
	return 'ssr://' + enb64(`${ip}:${port}:origin:${method}:plain:${enb64(password)}/?remarks=${remarks}&group=Z2l0aHViLmNvbQ`);
},
// |账号|端口|密码|加密方式|更新时间|国家|
// |45.33.80.198|13871|f55.fun-63357070|aes-256-cfb|10:17:06|US|
parseSS_List = (txt) => {
	let m, a = [],
	r = /\n\|([-\.\w]+)\|(\d+)\|([-\.\w]+)\|([-\w]+)\|(\d+:\d+:\d+)\|(\w{2,6})\|/g;
	while (m = r.exec(txt)) a.push(ss2ssr(m));
	return !a.length ? null : a;
};
GM_registerMenuCommand('读取github.com的ssr://链接到剪贴板', async () => {
	const resp = await fetch('https://raw.githubusercontent.com/dxxzst/Free-SS-SSR/master/README.md');
	const txt = await resp.text();
	const m = txt.match(/\bssr:\/\/\w{9,}/g) || parseSS_List(txt);
	if (!m) alert('站点未提供ssr://链接列表！');
	else {
		GM_setClipboard(m.join('\n'));
		alert('ssr://链接列表已经拷贝到剪贴板');
	}
});

if (location.host.startsWith('free-ss.')) {
	const t = setInterval(() => {
		'use strict';
		const $ = unsafeWindow.$, layer = unsafeWindow.layer;
		if (!$ || !layer) return;
		clearInterval(t);
		$(".affdiv, .banner").remove(); // 去广告

		const ssTable = $("table:last"),
		date_str = new Date().toISOString().slice(0, 10) + '_',
		country_code = JSON.parse("" + GM_getResourceText('country_code')),
		ok_method = ['aes-128-cfb', 'aes-128-ctr', 'aes-192-cfb', 'aes-192-ctr', 'aes-256-cfb', 'aes-256-ctr',
			'bf-cfb', 'camellia-128-cfb', 'camellia-192-cfb', 'camellia-256-cfb', 'chacha20', 'chacha20-ietf', 'rc4-md5', 'salsa20'];

		let dataTable, ss_links_str = "", ssr_links_str = "",
		link_count = 0, areas = [], xyz = "http://" + deb64("c3NyLjEyMzQ1NjYueHl6"),
		order = {
			point: 0,
			address: 1,
			port: 2,
			password: 3,
			method: 4,
			clock: 5,
			globe: 6,
			qrcode: 7
		};
		layer.load(0, {
			shade: false,
			time: 1000
		});
		ssTable.before("<ul id='tools'></ul>");
		$('#qrcode').after('<div style="display:none" id="qrcode0"></div>');
		GM_addStyle(`body{margin:0;}
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
		`);

		// 终端信息
		$('#qrcode').after('<div style="display:none" id="client"></div>');

		function client_table() {
			let ip_info = JSON.parse("" + GM_getResourceText('userip')),
			fp = new Fingerprint2();
			ip_info = ip_info.data;
			let client_infos = '<tr><td>IP</td><td>' + ip_info.ip + '</td></tr>';
			client_infos += '<tr><td>ISP</td><td>' + ip_info.isp + ' | ' + ip_info.isp_id + '</td></tr>';
			client_infos += '<tr><td>Country</td><td>' + ip_info.country + ' | ' + ip_info.country_id + '</td></tr>';
			client_infos += '<tr><td>Region</td><td>' + ip_info.region + ' | ' + ip_info.region_id + '</td></tr>';
			client_infos += '<tr><td>City</td><td>' + ip_info.city + ' | ' + ip_info.city_id + '</td></tr>';
			client_infos += '<tr><td>County</td><td>' + ip_info.county + ' | ' + ip_info.county_id + '</td></tr>';
			client_infos += '<tr><td>Area</td><td>' + ip_info.area + ' | ' + ip_info.area_id + '</td></tr>';
			fp.get(function (result, components) {
				let datas = {};
				for (let x = 0; x < components.length; x++) {
					datas[components[x].key] = components[x].value;
				}
				client_infos += '<tr><td>User Agent</td><td>' + datas.user_agent.replace(')', ')<br>') + '</td></tr>';
				client_infos += '<tr><td>Language</td><td>' + datas.language + '</td></tr>';
				client_infos += '<tr><td>Color Depth</td><td>' + datas.color_depth + '</td></tr>';
				client_infos += '<tr><td>Processors</td><td>' + datas.hardware_concurrency + '</td></tr>';
				client_infos += '<tr><td>Resolution</td><td>' + datas.resolution.join(' x ') + '</td></tr>';
				client_infos += '<tr><td>Timezone</td><td>' + datas.timezone_offset / 60 + '</td></tr>';
				client_infos += '<tr><td>Platform</td><td>' + datas.navigator_platform + '</td></tr>';
				client_infos += '<tr><td>Canvas FP</td><td><img src="' + datas.canvas.replace('canvas winding:yes~canvas fp:', '') + '"></td></tr>';
				client_infos += '<tr><td>WebGL FP</td><td><img src="' + datas.webgl.split('~extensions')[0] + '"></td></tr>';
				client_infos += '<tr><td>WebGL Vendor</td><td>' + datas.webgl_vendor + '</td></tr>';
				$("#client").append('<h4>' + result + '</h4><small>以下信息只做展示不收集，IP信息来自淘宝IP</small><hr>' +
					"<table id='client-info'>" + client_infos + "</table>");
			});
			GM_addStyle(
				`#client h4 {margin: 0;}
				#client small {color: red;}
				table#client-info {width:480px;margin:0 auto;}
				table#client-info img{width:100%;max-height:38px;}
				table#client-info tr td:first-child {text-align: center;}
				table#client-info tr td{border-bottom: black solid thin;}`
			);
		}

		client_table();

		// 工具对象
		let tools = {
			// 查询当前页面次序
			order: function () {
				let o = [], v, d = {};
				ssTable.find('th').each(function() {
					v = $(this).html();
					if (v.split("/").length >= 3) {
						o.push("point");
					} else if (v.includes("clock")) {
						o.push("clock");
					} else if (v.includes("globe")) {
						o.push("globe");
					} else if (v.includes("qrcode")) {
						o.push("qrcode");
					} else {
						o.push(v.toLowerCase());
					}
				});
				for (let [i, k] of o.entries()) d[k] = i;
				return d;
			},
			// 整理链接区域
			area: function () {
				let column = 6, l = [], ssdatas = dataTable.data();
				if (order != undefined) {
					column = order.globe;
				}
				$.each(ssdatas, function (i, data) {
					if ($.inArray(data[column], l) == -1) {
						if (data[column][0] != '*') {
							l.push(data[column]);
						}
					}
				});
				areas = l;
				return l;
			},
			// ss://method:password@server:port
			ss: function (data) {
				let method = data[order.method],
				password = data[order.password],
				server = data[order.address],
				port = data[order.port],
				remark = data[order.globe] + '[' + data[order.point] + ']' + '(' + date_str + data[order.clock] + ')';
				return 'ss://' + enb64(method + ':' + password + '@' + server + ':' + port) + '#' + remark;
			},
			// ssr://server:port:protocol:method:obfs:password_base64/?params_base64
			ssr: function (data) {
				let server = data[order.address],
				port = data[order.port],
				protocol = "origin",
				method = data[order.method],
				obfs = "plain",
				password = data[order.password],
				remarks = data[order.globe] + '[' + data[order.point] + ']' + '(' + date_str + data[order.clock] + ')',
				group = "ZnJlZS1zcw";
				return 'ssr://' + enb64(server + ':' + port + ':' + protocol + ':' + method + ':' + obfs + ':' + enb64(password) + '/?remarks=' + enb64(remarks) + '&group=' + group);
			},
			// 将数据处理成链接
			datas: function () {
				let ssdatas;
				if (dataTable.rows('.selected').data().length > 0) {
					ssdatas = dataTable.rows('.selected').data();
				} else {
					ssdatas = dataTable.data();
				}
				ss_links_str = ssr_links_str = "";
				$.each(ssdatas, function (i, data) {
					ss_links_str += tools.ss(data) + '\n';
					ssr_links_str += tools.ssr(data) + '\n';
				});
				return ssdatas;
			},
			upload: function (URL) {
				if (!URL) return;
				GM_xmlhttpRequest({
					method: 'POST',
					url: URL,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					data: 'ssr=' + enb64(ssr_links_str) + 'ver=' + GM_info.script.version.replace('.', '_'),
					onloadstart: function () {
						layer.load(2, {
							time: 10000
						});
					},
					onload: function (response) {
						layer.closeAll();
						layer.msg('POST:' + URL + '<br>' + response.status + ':' + response.statusText);
					},
					onerror: onload,
					ontimeout: onload
				});
			}
		};

		document.onkeydown = function (e) {
			if (e.ctrlKey && 81 == e.keyCode) { // Ctrl+q
				tools.upload(prompt("POST-URL:", xyz));
			}
		};

		function make_area() {
			tools.area();
			const el = $("#ss_area").empty();
			el.append("<option value=''></option>");
			for (let x of areas) {
				el.append("<option value='" + x + "'>" + country_code[x] + "</option>");
			}
		}

		function check_method() {
			dataTable.$('tr.selected').removeClass('selected');
			ssTable.find('tbody tr').each(function() {
				let m = $(this).find('td').eq(order.method).text();
				if (!ok_method.includes(m)) {
					$(this).toggleClass('selected');
				}
			});
			if (dataTable.rows('.selected').data().length > 0) {
				layer.msg("已移除不兼容SSR的协议(" + dataTable.rows('.selected').data().length + "条)", {
					time: 1500
				});
				dataTable.rows('.selected').remove().draw();
			} else {
				layer.msg("所有链接协议可用", {
					time: 1000
				});
			}
			$("#total").html("共 " + dataTable.data().length + " 条");
		}

		function start() {
			layer.closeAll();
			$(".fa-info-circle").remove();
			site_info();
			unsafeWindow.dataTable = dataTable = ssTable.DataTable({
				retrieve: true
			});
			order = tools.order();
			tools.datas();
			dataTable.order([0, 'asc']).draw();
			link_count = tools.datas().length;
			$("h2").eq(-1).append(
				"<small> <a title='" + GM_info.script.name + "' target='_blank' href='" + GM_info.script.supportURL + "'><i class='fa fa-bolt'></i> " + GM_info.script.version + "</a></small><small style='float:right'>" +
				"<button id='site_info' style='float:right;background-color:initial;'><i class='fa fa-question-circle'></i></button>" +
				"<button id='user_info' style='float:right;background-color:initial;'><i class='fa fa-info-circle'></i></button></small>"
			);
			$("title").append("⚡");
			$('#site_info').click(site_info);
			$('#user_info').click(client_info);
			$("#tools").html(
				"<li class='txt'>" +
				"<p id='link_num'><span id='total'>共 " + dataTable.data().length + " 条</span><span id='sel'></span></p></li>" +
				"<li class='btn'>" +
				"<button id='btn_clear' title='移除评分6以下'>移除不稳定</button>" +
				"<button id='btn_ss'>复制 SS</button>" +
				"<button id='btn_ssr'>复制SSR</button>" +
				"<select id='ss_area'></select></li>"
			);
			make_area();
			$('#ss_area').on('change', function () {
				ssTable.find('tbody tr').each(function () {
					if ($('#ss_area').val() == '') {
						$(this).removeClass('selected');
						$("#sel").empty();
					} else {
						if ($(this).find('td').eq(order.globe).text().includes($('#ss_area').val())) {
							$(this).toggleClass('selected');
						} else {
							$(this).removeClass('selected');
						}
						layer.msg("已选中 " + country_code[$('#ss_area').val()] + " 区域", {
							time: 1000
						});
						$("#sel").html("，已选 " + dataTable.rows('.selected').data().length + " 条");
						dataTable.order([order.globe, 'asc']).draw();
					}
				});
			});
			$('#btn_ss').click(function () {
				layer.msg("SS 链接复制成功(" + tools.datas().length + "条)", {
					time: 1000
				});
				GM_setClipboard(ss_links_str);
			});
			$('#btn_ssr').click(function () {
				layer.msg("SSR链接复制成功(" + tools.datas().length + "条)", {
					time: 1000
				});
				GM_setClipboard(ssr_links_str);
			});
			$('#btn_clear').click(function () {
				dataTable.$('tr.selected').removeClass('selected');
				ssTable.find('tbody tr').each(function () {
					let point_str = $(this).find('td').eq(0).text();
					let ping = point_str.split('/');
					if (point_str.match(/[a-zA-Z]/g)) {
						$(this).toggleClass('selected');
					} else if (ping.length) {
						for (let x in ping) {
							if (Number(ping[x]) <= 5) {
								$(this).toggleClass('selected');
								break;
							}
						}
					}
				});
				if (dataTable.rows('.selected').data().length > 0) {
					layer.msg("已移除不稳定链接(" + dataTable.rows('.selected').data().length + "条)", {
						time: 1000
					});
					$('#btn_clear').before("<small> (已移除" + dataTable.rows('.selected').data().length + "条) </small>");
					dataTable.rows('.selected').remove().draw();
				} else {
					layer.msg("所有链接较为稳定(＞5)", {
						time: 1000
					});
				}
				dataTable.order([0, 'asc']).draw();
				$("#total").html("共 " + dataTable.data().length + " 条");
				$('#btn_clear').remove();
				make_area();
				method_clear();
			});
			dataTable.$('tr').click(function () {
				$(this).toggleClass('selected');
				if (dataTable.rows('.selected').data().length) {
					$("#sel").html("，已选 " + dataTable.rows('.selected').data().length + " 条");
				} else {
					$("#sel").empty();
				}
			});
		}

		function client_info() {
			$('#client').show();
			layer.open({
				type: 1,
				title: false,
				closeBtn: 0,
				shade: 0.7,
				area: '500px',
				shadeClose: true,
				content: $('#client'),
				end: function () {
					$('#client').hide();
				}
			});
		}

		function site_info() {
			$('div.footer').show();
			layer.open({
				type: 1,
				title: false,
				closeBtn: 0,
				shade: 0.7,
				area: '500px',
				shadeClose: true,
				content: $('div.footer'),
				end: function () {
					$('div.footer').hide();
				}
			});
		}

		function failed() {
			if (link_count === 0) {
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

		unsafeWindow.tools = tools;
		unsafeWindow.start = start;

		ssTable.on('init.dt', start).on('error.dt', failed);
	}, 300);
}