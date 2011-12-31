// ==UserScript==
// @name         BaiduPan Explorer
// @namespace    https://github.com/gxvv/EX-BaiduPan-Explorer
// @version      1.1.1
// @description  [下载大文件] [批量下载] [文件夹下载]
// @author       gxvv luochenzhimu.com xinggsf
// @license      MIT
// @supportURL   https://github.com/gxvv/ex-baiduyunpan/issues
// @modified     2018.4.2
// @match        *://pan.baidu.com/disk/home*
// @match        *://yun.baidu.com/disk/home*
// @match        *://pan.baidu.com/s/*
// @match        *://yun.baidu.com/s/*
// @match        *://pan.baidu.com/share/link?*
// @match        *://yun.baidu.com/share/link?*
// @match        *://eyun.baidu.com/s/*
// @match        *://eyun.baidu.com/enterprise/*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_setClipboard
// ==/UserScript==

if (!String.prototype.includes) {
	String.prototype.includes = function(s, pos) {
		return !!~this.indexOf(s, pos);
	};
}
if (!Array.prototype.includes) {
	Array.prototype.includes = function(s, pos) {
		return this.indexOf(s, pos)> -1;
	};
}

let $, w = unsafeWindow;
(function(require, define, Promise) {
	'use strict';
	const PAN_TYPES = ['pan', 'share', 'enterprise'];

	function showError(msg) {
		GM_addStyle('#errorDialog{position: fixed;top: 76.5px; bottom: auto; left: 423px; right: auto;background: #fff;border: 1px solid #ced1d9;border-radius: 4px;box-shadow: 0 0 3px #ced1d9;color: black;word-break: break-all;display: block;width: 520px;padding: 10px 20px;z-index: 9999;}#errorDialog h3{border-bottom: 1px solid #ced1d9;font-size: 1.5em;font-weight: bold;}');
		try {
			$ = $ || require('base:widget/libs/jquerypacket.js');
		} catch (e) {
			var div = document.createElement('div');
			$ = function(str) {
				div.innerHTML = str;
				div.onclick = function() { this.remove(); };
				return $;
			};
			$.on = function() {
				return { appendTo: function() { document.body.appendChild(div); } };
			};
		}
		var $dialog = $('<div id="errorDialog">' +
						'<h3>EX-baiduyunpan:程序异常</h3>' +
						'<div class="dialog-body"><p>请尝试更新脚本或复制以下信息<a href="https://github.com/luochenzhimu/EX-BaiduPan-Explorer/issues" target="_blank">提交issue</a></p>' +
						'<p>Exception: ' + msg + '</p>' +
						'<p>Script Ver: ' + GM_info.script.version + '</p>' +
						'<p>TemperMonkey Ver: ' + GM_info.version + '</p>' +
						'<p>UA: ' + navigator.userAgent + '</p>' +
						'</div><hr><a class="close" href="javascript:;">关闭</a></div>');
		$dialog.on('click', '.close', function(event) {
			$dialog.remove();
		}).appendTo(document.body);
	}
	define('ex-yunpan:pageInfo', function(require) {
		$ = $ || require('base:widget/libs/jquerypacket.js');
		var url = location.href;
		var currentPage = 'pan';
		var matchs = {
			'://pan.baidu.com/disk/home': 'pan',
			'://yun.baidu.com/disk/home': 'pan',
			'://pan.baidu.com/s/': 'share',
			'://yun.baidu.com/s/': 'share',
			'://pan.baidu.com/share/link?': 'share',
			'://yun.baidu.com/share/link?': 'share',
			'://eyun.baidu.com/s/': 'enterprise',
			'://eyun.baidu.com/enterprise/': 'enterprise'
		};
		var PAGE_CONFIG = {
			pan: {
				prefix: 'function-widget-1:',
				containers: ['.g-button:has(.icon-download):visible'],
				style: function() { }
			},
			share: {
				prefix: 'function-widget-1:',
				containers: [
					'.KKtwaH .x-button-box>.g-button:has(.icon-download)',
					'.module-share-top-bar .x-button-box>.g-button:has(.icon-download)'
				],
				style: function() {
					var styleList = [
						'.KPDwCE .QxJxtg{z-index: 2;}',
						'.module-share-header .slide-show-right{width: auto;}',
						'.ex-yunpan-dropdown-button.g-dropdown-button.button-open .menu{z-index:41;}',
						'.module-share-header .slide-show-header h2{width:230px;}',
						'.KPDwCE .xGLMIab .g-dropdown-button.ex-yunpan-dropdown-button{margin: 0 5px;}'
					];
					GM_addStyle(styleList.join(''));
				}
			},
			enterprise: {
				prefix: 'business-function:',
				containers: ['.button-box-container>.g-button:has(:contains("下载"))'],
				style: function() {
					var styleList = [
						'.ex-yunpan-dropdown-button .icon-download{background-image: url(/box-static/business-function/infos/icons_z.png?t=1476004014313);}',
						'.ex-yunpan-dropdown-button .g-button:hover .icon-download{background-position: 0px -34px;}'
					];
					GM_addStyle(styleList.join(''));
				}
			}
		};
		for (var match in matchs) {
			if (url.includes(match)) {
				currentPage = matchs[match];
				break;
			}
		}
		return PAGE_CONFIG[currentPage];
	});

	define('ex-yunpan:downloadBtnInit', function(require) {
		var ctx = require('system-core:context/context.js').instanceForSystem;
		var pageInfo = require('ex-yunpan:pageInfo');
		var prefix = pageInfo.prefix + 'download/';
		var dServ = null;
		require.async(prefix + 'service/dlinkService.js', function(dlinkService) {
			dServ = dlinkService;
		});

		var menu = [{
			title: '普通下载',
			'click': function() {
				var start = require(prefix + 'start.js');
				start.start(ctx);
			},
			availableProduct: PAN_TYPES
		}, {
			title: '复制链接',
			'click': function() {
				var fetchDownLinks = require('ex-yunpan:fetchDownLinks.js');
				fetchDownLinks.start(ctx, dServ);
			},
			availableProduct: PAN_TYPES
		}, {
			title: '获取压缩链接',
			'click': function() {
				var fetchDownLinks = require('ex-yunpan:fetchDownLinks.js');
				fetchDownLinks.start(ctx, dServ, true);
			},
			availableProduct: PAN_TYPES
		}];

		var exDlBtnConfig = {
			type: 'dropdown',
			title: 'EX-下载',
			resize: true,
			menu: menu.filter(function (btn) {
				var currentProduct = ctx.pageInfo.currentProduct;
				return btn.availableProduct.includes(currentProduct);
			}),
			icon: 'icon-download'
		};
		var selector = pageInfo.containers.join();
		$(selector).each(function(i, e) {
			var exDlBtn = ctx.ui.button(exDlBtnConfig);
			$(e).after(exDlBtn.dom.addClass('ex-yunpan-dropdown-button'));
			exDlBtn.resizeButtonWidth();
		});
		pageInfo.style();
	});

	define('ex-yunpan:fetchDownLinks.js', function (require, exports, module) {
		function start(ctx, dServ, allZip) {
			var selectedList = ctx.list.getSelected();
			if (!selectedList.length) return ctx.ui.tip({ mode: 'caution', msg: '您还没有选择下载的文件' });
			ctx.ui.tip({ mode: 'loading', msg: '开始请求链接...' });

			var foldersList = selectedList.filter(e => e.isdir === 1);
			var filesList = selectedList.filter(e => e.isdir === 0);

			var currentProduct = ctx.pageInfo.currentProduct;

			if (!PAN_TYPES.includes(currentProduct)) {
				return ctx.ui.tip({ mode: 'caution', msg: '复制链接当前页面不可用', hasClose: true, autoClose: false });
			}

			if (filesList.length > 0 && currentProduct !== 'enterprise' && !allZip) {
				foldersList.unshift(filesList);
			} else {
				[].push.apply(foldersList, filesList);
			}

			var requestMethod;
			if (currentProduct === 'pan') {
				requestMethod = function(e, cb) {
					dServ.getDlinkPan(
						dServ.getFsidListData(e),
						(allZip || e.isdir === 1) ? 'batch' : 'nolimit',
						cb,
						void 0,
						void 0,
						'POST'
					);
				};
			} else if (currentProduct === 'share') {
				var yunData = require('disk-share:widget/data/yunData.js').get();
				requestMethod = function(e, cb) {
					dServ.getDlinkShare({
						share_id: yunData.shareid,
						share_uk: yunData.uk,
						sign: yunData.sign,
						timestamp: yunData.timestamp,
						list: e,
						type: (allZip || e.isdir === 1) ? 'batch' : 'nolimit'
					}, cb);
				};
			} else {
				var yunData = require('page-common:widget/data/yunData.js').get();
				requestMethod = function(e, cb) {
					dServ.getDlinkShare({
						share_id: yunData.shareid,
						share_uk: yunData.uk,
						sign: yunData.sign,
						timestamp: yunData.timestamp,
						list: [e],
						isForBatch: allZip
					}, cb);
				};
			}
			var timeout = foldersList.length === 1 ? 3e4 : 3e3;
			var promises = foldersList.map(function(e) {
				return new Promise(function(resolve, reject) {
					var timer = setTimeout(function() {
						resolve($.extend({}, e));
					}, timeout);
					requestMethod(e, function(result) {
						resolve($.extend({}, e, result));
					});
				});
			});
			Promise.all(promises).then(function(result) {
				ctx.ui.hideTip();
				var dlinks = [];
				var needToRetry = result.filter(e => e.errno !== 0);
				if (needToRetry.length > 0) {
					try {
						dServ.dialog.hide();
					} catch (ex) { }
					ctx.ui.tip({ mode: 'caution', msg: needToRetry.length + '个文件请求链接失败' });
				}
				result.forEach(function(e) {
					if (e.errno !== 0) return;
					if (typeof e.dlink === 'string') {
						var dlink = e.dlink + "&zipname=" + encodeURIComponent((e.isdir ? '【文件夹】' : '【文件】') + e.server_filename + '.zip');
						dlinks.push(e.dlink && dlink);
					} else {
						[].push.apply(dlinks, (e.dlink || e.list || []).map(e => e.dlink.replace('250528', '266719')));
					}
				});
				if (!dlinks.length) return ctx.ui.tip({ mode: 'caution', msg: '复制失败：未获取到链接' });
				// if (dlinks.length === 1) dlinks = dlinks.map(function(link){
					// 高速通道：yqall02.baidupcs.com 普速下载：nj02all01 nj02all02 allall01
					// return link.replace('//d.pcs.baidu.com','//bjbgp01.baidupcs.com');
				// });
				GM_setClipboard(dlinks.join('\n'), 'text');
				ctx.ui.tip({ mode: 'success', msg: '复制成功' + dlinks.length + '个链接' });
			})
			.catch(function(e) {
				showError(e);
			});
		}
		module.exports = { start: start };
	});

	define('ex-yunpan:pluginInit.js', function(require) {
		var ctx = require('system-core:context/context.js').instanceForSystem;
		var pageInfo = require('ex-yunpan:pageInfo');
		var prefix = pageInfo.prefix + 'download/';
		require.async(prefix + 'util/context.js', function(e) {
			e.getContext = () => ctx;
		});
		prefix += 'service/';
		var dmPromise = new Promise(function(resolve, reject) {
			$(w).on('load', function() {
				reject('downloadManager.js');
			});
			require.async(prefix + 'downloadManager.js', function(dm) {
				dm.MODE_PRE_INSTALL = dm.MODE_PRE_DOWNLOAD;
				resolve();
			});
		});
		var gjcPromise = new Promise(function(resolve, reject) {
			$(w).on('load', function() {
				reject('guanjiaConnector.js');
			});
			require.async(prefix + 'guanjiaConnector.js', function(gjC) {
				gjC.init = function() {
					setTimeout(function() {
						ctx.ui.tip({
							mode: 'caution',
							msg: '检测到正在调用云管家，若脚本失效，请检查更新或提交issue',
							hasClose: true,
							autoClose: false
						});
					}, 5e3);
				};
				resolve();
			});
		});
		var ddsPromise = new Promise(function(resolve, reject) {
			$(w).on('load', function() {
				reject('downloadDirectService.js');
			});
			require.async(prefix + 'downloadDirectService.js', function(dDS) {
				var $preDlFrame = null;
				var _ = dDS.straightforwardDownload;
				if (typeof _ !== 'function') return;
				dDS.straightforwardDownload = function() {
					ctx.ui.tip({ mode: 'loading', msg: '正在开始下载...' });
					if ($preDlFrame === null) {
						setTimeout(function() {
							var $frame = $('#pcsdownloadiframe');
							if ($frame.length === 0) return;
							$frame.ready(function(event) { ctx.ui.hideTip(); });
							$preDlFrame = $frame;
						}, 1e3);
					}
					_.apply(dDS, arguments);
				};
				resolve();
			});
		});
		Promise.all([dmPromise, gjcPromise, ddsPromise]).then(function() {
			try {
				require('ex-yunpan:downloadBtnInit');
			} catch (e) {
				ctx.ui.tip({
					mode: 'caution',
					msg: 'BaiduPan Explorer: 插件加载成功，按钮初始化失败',
					autoClose: false,
					hasClose: true
				});
			}
		}).catch(function(msg) {
			if (!$('#share_nofound_des').length) showError(msg + '加载失败');
		});
	});

	try {
		require('ex-yunpan:pluginInit.js');
	} catch (ex) {
		showError(ex);
	}


	function execDownload(link){
		$('#helperdownloadiframe').attr('src',link);
	}

	function createIframe(){
		var $div = $('<div class="helper-hide" style="padding:0;margin:0;display:block"></div>');
		var $iframe = $('<iframe src="javascript:void(0)" id="helperdownloadiframe" style="display:none"></iframe>');
		$div.append($iframe);
		$('body').append($div);
	}
})(w.require, w.define, w.Promise);