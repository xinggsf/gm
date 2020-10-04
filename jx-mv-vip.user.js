// ==UserScript==
// @name        VIP视频解析
// @namespace   mofiter.xinngsf
// @version     1.6.6
// @description 添加的解析按钮样式与原站一致，不会产生突兀感，支持多个解析接口切换，支持自定义接口，支持站内站外解析，支持 Tampermonkey、Violentmonkey、Greasemonkey
// @require     https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @match       https://v.qq.com/tv/*
// @match       https://v.qq.com/x/*
// @match       https://www.iqiyi.com/v*
// @match       https://v.youku.com/v_show/*
// @match       https://tv.sohu.com/*
// @match       https://film.sohu.com/album/*
// @match       https://www.mgtv.com/b/*
// @author   xinngsf   mofiter
// @match       http://v.pptv.com/show/*
// @match       https://v.pptv.com/show/*
// @match       http://www.le.com/ptv/vplay/*
// @match       https://www.le.com/ptv/vplay/*
// @grant       unsafeWindow
// @grant       GM_addStyle
// @grant       GM.addStyle
// @grant       GM_getValue
// @grant       GM.getValue
// @grant       GM_setValue
// @grant       GM.setValue
// @grant       GM_registerMenuCommand
// @updateURL   https://raw.githubusercontent.com/xinggsf/gm/master/jx-mv-vip.user.js
// ==/UserScript==

'use strict';
let { host, href: url } = location;
let l = url.indexOf('?',19);
if (l > 0) url = url.slice(0, l);
const vs = document.getElementsByTagName('video');
const videoPlayer =
`<div id="iframe-div" style="width:100%;height:100%;z-index:2147483647;">
	<iframe id="iframe-player" frameborder="0" allowfullscreen width="100%" height="100%"></iframe>
</div>`;
let playerCSS, posCSS, jiexiDIV, userIntfs;
const interfaces = [
	{name:"m1907",type:2,url:"https://z1.m1907.cn/?jx="},
	{name:"七彩云",type:3,url:"https://v.7cyd.com/vip/?url="},
	{name:"久播",type:3,url:"https://jx.jiubojx.com/vip.php?url="},
	{name:"思古",type:3,url:"https://api.sigujx.com/?url="},
	{name:"猪蹄",type:3,url:"https://jx.iztyy.com/svip/?url="},
	{name:"66",type:3,url:"https://vip.66parse.club/?url="},
	{name:"beac",type:3,url:"https://beaacc.com/api.php?url="},
	{name:"诺讯",type:3,url:"https://www.nxflv.com/?url="},
	{name:"菜鸟",type:3,url: "https://jiexi.bm6ig.cn/?url="},
	{name:"tv920",type:3,url:"https://api.tv920.com/jx/?url="},
	//{name:"明日",type:3,url:"https://jx.yingxiangbao.cn/vip.php?url="},
	{name:"盘古",type:3,url:"https://www.pangujiexi.cc/jiexi.php?url="},
	{name:"黑云",type:3,url: "https://jiexi.380k.com/?url="},
	{name:"ab33",type:1,url:"https://jx.ab33.top/vip/?url="},
	//{name:"义气猫",type:3,url: "https://jx.yqmao.cn/369/?url="},
	//{name:"9ki",type:3,url: "https://www.9ki.cc/jx.php?url="},
	{name:"rdhk",type:3,url: "https://api.rdhk.net/?url="},
	{name:"石头云",type:3,url:"https://jiexi.071811.cc/jx.php?url="},
	{name:"1717yun",type:3,url:"https://www.1717yun.com/jx/ty.php?url="},
	{name:"金桥",type:3,url:"https://www.jqaaa.com/jx.php?url="},
	{name:"618g",type:3,url:"https://jx.618g.com/?url="},
	{name:"大亨影院",type:2,url:"http://jx.oopw.top/?url="}
];

const rawPlay = HTMLVideoElement.prototype.play;
HTMLVideoElement.prototype.play = function() {
	return this.ownerDocument ? rawPlay() : new Promise((_, fail) => fail())
};
const hasDOM = css => $(css).length > 0;
const delayReload = () => {
	setTimeout(location.reload.bind(location), 1000);
};
const innerParse = function(li) {
	vs[0] && vs[0].pause();
	$(vs).remove();
	if (this instanceof Node) li = this;
	const e = $(playerCSS).empty().append(videoPlayer);
	const s = li.getAttribute('data-url') || interfaces[0].url + url;
	e.find("#iframe-player").attr("src", s);
};
const hideElements = el => {
	el.hide();
	return true;
};
class TaskPool { //简易任务池
	constructor(isFree) {
		const tasks = new Map();
		const timer = setInterval(() => {
			for (let [i, cb] of tasks) {
				let ret, a = i;
				if (typeof i == 'string') {
					a = $(i);
					ret = cb(a);
					if (i.split(',').length > a.length) continue;
				} else ret = cb($(i));
				if (!ret) tasks.delete(i);
			}
			if (isFree && !tasks.size) {
				clearInterval(timer);
				this._tasks = null;
			}
		}, 500);
		this._tasks = tasks;
	}
	//wait for do something. Key = css selector or element or number; cb = function($el) { return true: wait again }
	add(key, cb = hideElements) {
		if (!key) key = this._tasks.size + 1;
		this._tasks.set(key, cb);
	}
}
const tasks = new TaskPool(true);

const GMgetValue = (name, value) => typeof GM_getValue === "function" ?
	GM_getValue(name, value) : GM.getValue(name, value);
const GMsetValue = (name, value) => {
	typeof GM_setValue === "function" ? GM_setValue(name, value) : GM.setValue(name, value);
};

const GMaddStyle = s => {
	typeof GM_addStyle === "function" ? GM_addStyle(s) : GM.addStyle(s);
};

const showSetting = () => {
	if (!hasDOM('#jiexi-setting')) {
		GMaddStyle(`#jiexi-setting legend,table,table th,td{text-align:center;}`);
		const container = $(
`<div id="jiexi-setting" style="position:fixed;z-index:2147483647;width:100%;height:100%;top:0;left:0;background-color:rgba(0,0,0,0.5);">
<div style="position:absolute;width:500px;height:300px;top:50%;left:50%;margin-left:-250px;margin-top:-150px;padding:10px;background-color:#222;color:white;font-size:14px;">
	<div id="cancel-button" style="position:absolute;top:-15px;right:-8px;font-size:20px;cursor:pointer;">╳</div>
	<legend style="font-size:16px;color:#fff;margin:auto;">VIP 解析设置</legend>
	<table id="interface-table" style="line-height:30px;margin:0 auto;">
		<tr>
			<th>接口名称</th><th>接口地址</th><th>接口类型</th><th>操作</th>
		</tr>
		<tr>
			<td>
				<input type="text" id="interface-name" name="interface-name" placeholder="接口显示名称" style="border:0;width:100px;margin-right:10px;"></input>
			</td>
			<td>
				<input type="text" id="interface-url" name="interface-url" placeholder="接口地址必须包含 http 或 https" style="border:0;width:200px;margin-right:10px;"></input>
			</td>
			<td>
				<label title="站内" style="margin-right:5px;">
					<input id="interface-type-in" name="interface-type" value="1" type="radio" style="margin:0 5px;">
				</input>站内</label>
				<label title="站外" style="margin-right:5px;">
					<input id="interface-type-io" name="interface-type" value="2" type="radio" style="margin:0 5px;">
				</input>站外</label>
				<label title="站内外" style="margin-right:15px;"><input id="interface-type-out" name="interface-type" value="3" type="radio" style="margin:0 5px;" checked></input>站内外</label>
			</td>
			<td>
				<input type="button" value="增加" id="save_button" style="cursor:pointer;font-size:12px;background-color:#222;color:white;border:1px solid #ccc;border-radius:5px;padding:2px 6px;"></input>
			</td>
		</tr>
	</table>
</div></div>`);
		$('body').append(container);
		if (userIntfs.length > 0) {
			const trList = userIntfs.map(item => `
	<tr>
		<td>${item.name}</td>
		<td>${item.url}</td>
		<td>${item.type}</td>
		<td>
			<input type="button" value="删除" class="delete-button" style="cursor:pointer;font-size:12px;background-color:#222;color:white;border:1px solid #ccc;border-radius:5px;padding:2px 6px;"></input>
		</td>
	</tr>`).join('');
			container.find("#interface-table").append($(trList));
		}
	}
	$("#cancel-button").click(function () {
		this.closest("#jiexi-setting").remove();
	});
	$("#save_button").click(function () {
		const tr = $(this).closest('tr');
		var interface_name = tr.find("#interface-name").val().trim();
		var interface_url = tr.find("#interface-url").val().trim();
		var interface_type = tr.find('input[name="interface-type"]:checked').val() | 0;
		if (interface_name == "") {
			alert("请输入接口名称");
			return;
		}
		if (interface_url == "") {
			alert(" 请输入接口地址");
			return;
		}
		if (!interface_url.startsWith("http")) {
			alert(" 请输入以 http 或 https 开头的接口地址");
			return;
		}
		if ((interface_type & 1) && !interface_url.startsWith("https")) {
			alert("站内解析只支持以 https 开头的接口地址，请修改接口类型");
			return;
		}
		var canSave = !userIntfs.some(item => interface_name === item.name);
		if (canSave) {
			userIntfs.push({
				"name": interface_name,
				"url": interface_url,
				"type": interface_type
			});
			GMsetValue("user_interface", userIntfs);
			location.reload();
		} else {
			alert("已存在同名接口，请修改接口名称");
		}
	});
	$(".delete-button").click(function () {
		const pp = this.closest('tr');
		const del_name = pp.firstChild.innerHTML;
		userIntfs.forEach((k, i) => { // a.splice(a.findIndex(k => k.name == del_name), 1);
			if (del_name == k.name) userIntfs.splice(i, 1);
		});
		GMsetValue("user_interface", userIntfs);
		pp.remove();
		$(`#_gm__vipJX li:contains("${del_name}")`).remove();
	});
};

const router = {
	["www.iqiyi.com"]() {
		playerCSS = "#flashbox";
		posCSS = ".qy-flash-func:first";
		GMaddStyle(
		`.fn-iqiyi-jiexi li {
			color: #ccc; text-align: center; width: 60px; cursor: pointer;
			line-height: 20px; float:left; border:1px solid gray;
			border-radius:8px; padding:0 4px; margin:4px 2px;
		}
		#_gm__vipJX a {color: #ccc}
		.fn-iqiyi-jiexi > .qy-popup-box {
			background-color:#2e2e2e; border:1px solid gray;
		}
		#flashbox { z-index: 400 !important }
		.func-item.fn-jiexi-main:hover > div { display: block }
		.fn-iqiyi-jiexi {
			display:none;position:absolute;left:-50px;
			text-align:center;z-index:2147483647;
		}
		.iqiyi_JX:hover {color: #6ba430}
		#_gm__vipJX li:hover, #_gm__vipJX a:hover {color: #01be07}`);
		const iqiyi_jiexi = $(
		`<div class="func-item fn-jiexi-main">
			<span class="func-inner fn-iqiyi-jiexi-text" style="height:40px;">
				<span class="func-name">解析</span>
			</span>
			<div class="fn-iqiyi-jiexi">
				<div class="qy-popup-box">${jiexiDIV}</div>
			</div>
		</div>`);
		this.wait = el => {
			$(posCSS).append(iqiyi_jiexi)
			.find("li[data-url], .fn-iqiyi-jiexi-text").click(innerParse);
		};
		tasks.add(".qy-player-vippay-popup, .black-screen");
		// if ($(".cupid-public-time")[0]) $(".skippable-after").show().click();
	},
	["v.qq.com"]() {
		playerCSS = "#mod_player";
		posCSS = ".action_wrap";
		GMaddStyle(
		`.fn-qq-jiexi {
			background-color:#2e2e2e; width:auto; left:-50px; border:1px solid gray;
		}
		.fn-qq-jiexi li {
			text-align:center; width:60px; line-height:20px; float:left;
			border:1px solid gray; border-radius:8px; padding:0 4px;
			color:#999; cursor: pointer; margin:4px 2px;
		}
		.fn-qq-jiexi a { color:#999; }
		#_gm__vipJX li:hover {color:#fe6527}`
		);
		const qq_jiexi = $(
		`<div class="action_item action_jiexi" style="position:relative;">
			<a class="action_title fn-qq-jiexi-text"><span>解析</span></a>
			<div class="mod_pop_action fn-qq-jiexi">${jiexiDIV}</div>
		</div>`);
		this.wait = el => {
			const { type_name, vipPage } = unsafeWindow.COVER_INFO;
			if (type_name === "电影") {
				$(".mod_figure_list .list_item").click(delayReload);
			} else if (type_name === "电视剧" || type_name === "动漫") {
				$('.mod_episode .item').click(delayReload);
				$(".mod_episode_filter").click(() => {
					$('.mod_episode .item').click(delayReload);
				});
			}
			$(".action_gift, .action_more").remove();
			el.filter(posCSS).append(qq_jiexi)
			.on("mouseover mouseout", () => {
				qq_jiexi.toggleClass("open");
			})
			.find(".fn-qq-jiexi-text, li[data-url]").click(ev => {
				unsafeWindow.fetch = x => new Promise((_, fail) => fail());
				innerParse(ev.target);
			});
		};
		tasks.add(".mod_vip_popup,.tvip_layer,#mask_layer");
	},
	["v.youku.com"]() {
		playerCSS = '#ykPlayer';
		posCSS = "ul.play-fn";
		GMaddStyle(
		`.fn-youku-jiexi li {
			text-align:center;width:60px;line-height:20px;
			float:left;border:1px solid gray;border-radius:5px;
			padding:0 4px;margin:4px 2px; cursor: pointer;
		}
		#_gm__vipJX a {color:#ccc}
		.fn-youku-jiexi > .fn-panel {
			border:1px solid gray; min-width:190px;
		}
		#_gm__vipJX li:hover, #_gm__vipJX a:hover {color:#2592ff}`
		);
		const youku_jiexi = $(
		`<li class="play-fn-li fn-youku-jiexi">
			<span class="text fn-youku-jiexi-text">解析</span>
			<div class="fn-panel">${jiexiDIV}</div>
		</li>`);
		this.wait = el => {
			el.filter(posCSS).append(youku_jiexi)
			.find(".fn-youku-jiexi-text, li[data-url]").click(innerParse);
		};
	},
	["www.mgtv.com"]() {
		playerCSS ="#mgtv-player-wrap";
		posCSS = ".v-panel-box";
		GMaddStyle(
		`.fn-mgtv-jiexi:hover > .extend { display: block }
		.fn-mgtv-jiexi li {
			color:#ccc;text-align:center;width:60px;line-height:20px;float:left;
			border:1px solid gray;border-radius:8px;padding:0 4px;margin:4px 2px; cursor: pointer;
		}
		#_gm__vipJX a {color:#ccc}
		.fn-mgtv-jiexi > .extend {
			display:none;top:-5px;left:-50px;text-align:center;position:relative;
		}
		#_gm__vipJX li:hover {color:#ff6f00}
		#_gm__vipJX a:hover {color:#ff6f00 !important}
		.v-panel-extend > .fn-panel {
			background-color:#2e2e2e;width:auto;border:1px solid gray;
		}`);
		const mgtv_jiexi = $(
		`<div class="v-panel-mod fn-mgtv-jiexi" style="cursor:pointer;">
			<a class="v-panel-submod fn-mgtv-jiexi-text">解析</a>
			<div class="extend">
				<div class="v-panel-extend">
					<div class="fn-panel">${jiexiDIV}</div>
				</div>
			</div>
		</div>`);
		this.wait = el => {
			$(".aside-tabbox li").click(delayReload);
			el.filter(posCSS).append(mgtv_jiexi)
			.find(".fn-mgtv-jiexi-text, li[data-url]").click(innerParse);
		};
	},
	["tv.sohu.com"]() {
		playerCSS = '#player';
		posCSS = ".vBox-tb.cfix";
		GMaddStyle(
		`.fn-sohu-jiexi li{
			color:#333; text-align:center; width:60px; line-height:20px;
			float:left; border:1px solid gray; border-radius:8px;
			padding:0 4px; margin:4px 2px; cursor: pointer;
		}
		/* .vBox.vBox-play:hover > div {display: block} */
		.fn-sohu-jiexi {
			display: none;background-color:#2e2e2e;border:1px solid gray;
			padding:0;margin:0 0 0 0;line-height:25px;min-width:180px important;
		}
		#_gm__vipJX li:hover {color:#e33c30}`
		);
		const sohu_jiexi = $(
		`<div class="vBox vBox-play">
			<a class="vbtn">解析</a>
			<div class="vCont fn-sohu-jiexi">${jiexiDIV}</div>
		</div>`);
		sohu_jiexi.click(() => {
			sohu_jiexi.children(".fn-sohu-jiexi").toggle();
		});
		this.wait = el => {
			playerCSS = el.filter(playerCSS);
			el.filter(posCSS).prepend(sohu_jiexi)
			.find("li[data-url]").click(innerParse);
		};
		tasks.add(".x-video-adv,.x-player-mask,#player_vipTips");
	},
	["film.sohu.com"]() {
		playerCSS = "#playerWrap";
		posCSS = ".player-content-info";
		GMaddStyle(
		`.fn-sohu-jiexi li {
			color:#ccc; text-align:center; width:60px; cursor: pointer;
			line-height:20px; float:left; border:1px solid gray;
			border-radius:8px; padding:0 4px; margin:4px 2px;
		}
		#_gm__vipJX a {color:#ccc}
		.action-item.jiexi:hover > div {display: block}
		.fn-sohu-jiexi {
			display:none;background-color:#2e2e2e;border:1px solid gray;
			width:auto;text-align:center;margin-left:-61px;
		}
		#_gm__vipJX li:hover, #_gm__vipJX a:hover {color:#ee3c3a}`
		);
		const sohu_film_jiexi = $(
		`<div class="action-item jiexi">
			<a class="action-title fn-sohu-jiexi-text">
				<span class="ico-text">解析</span>
				<i class="ico-down"></i>
			</a>
			<div class="hover-content fn-sohu-jiexi">${jiexiDIV}</div>
		</div>`);
		this.wait = el => {
			el.filter(posCSS).prepend(sohu_film_jiexi)
			.find(".fn-sohu-jiexi-text, li[data-url]").click(innerParse);
		};
	},
	["www.le.com"]() {
		playerCSS = "#le_playbox";
		posCSS = ".interact_area";
		GMaddStyle(
		`.fn-le-jiexi {
			display:none;background-color:#2e2e2e;border:1px solid gray;
			width:auto;position:absolute;top:45px;border-top:2px solid #E42112;
			box-shadow:0 2px 6px 0 rgba(0,0,0,.1);left:-40px;
		}
		.fn-le-jiexi li {
			color:#ccc;text-align:center;width:60px;line-height:20px;
			float:left;border:1px solid gray;border-radius:8px;
			padding:0 5px;margin:4px 2px; height:25px;
		}
		.le-jiexi-main:hover > div {display: block}
		#_gm__vipJX li:hover {color:#e42013}`
		);
		const le_jiexi = $(
		`<li class="le-jiexi-main">
			<a class="fn-le-jiexi-text"><span>解析</span></a>
			<div class="fn-le-jiexi">${jiexiDIV}</div>
		</li>`);
		this.wait = el => {
			el.filter(posCSS).prepend(le_jiexi)
			.find(".fn-le-jiexi-text, li[data-url]").click(innerParse);
		};
	},
	["v.pptv.com"]() {
		playerCSS = "#pptv_playpage_box";
		posCSS = ".module-video2016-ops ul";
		GMaddStyle(
		`#fn-pptv-jiexi li {
			color:#ccc;text-align:center;
			width:60px;line-height:20px;float:left;border:1px solid gray;
			border-radius:8px;padding:0 4px;margin:4px 2px;
		}
		#_gm__vipJX li:hover, #_gm__vipJX a:hover {color:#39f}
		#_gm__vipJX a {color:#ccc;display:inline;padding:0 4px;}
		#pptv-jiexi-btn:hover>div {display: block}
		#fn-pptv-jiexi {
			display:none; position:absolute; top:50px;
			background-color:#444; border:1px solid gray;
		}`);
		const pptv_jiexi = $(
		`<li id="pptv-jiexi-btn" style="cursor:pointer;">
			<a class="pptv_jiexi-text"><i class="ic4"></i>解析</a>
			<div id="fn-pptv-jiexi">${jiexiDIV}</div>
		</li>`
		);
		this.wait = el => {
			el.filter(posCSS).prepend(pptv_jiexi)
			.find(".pptv_jiexi-text, li[data-url]").click(innerParse);
		};
	}
};

const init = () => {
	GM_registerMenuCommand("自定义 VIP 视频解析接口", showSetting);
	userIntfs = GMgetValue("user_interface", []);
	userIntfs.length && interfaces.push.apply(interfaces, userIntfs);
	let outLi = '', inLi = '';
	for (const k of interfaces) {
		const addr = k.url.trim() + url;
		if (k.type & 1) inLi += `<li data-url="${addr}">${k.name}</li>`;
		if (k.type & 2) outLi += `<li><a target="_blank" href="${addr}">${k.name}</a></li>`;
	}
	jiexiDIV = `<div style="display:flex;">
		<div style="width:188px;padding:10px 0;" id="_gm__vipJX">
			<div style="text-align:center;line-height:20px;">站内解析</div>
			<ul style="margin:0 10px;">${inLi}<div style="clear:both;"></div></ul>
			<div style="text-align:center;line-height:20px;">站外解析</div>
			<ul style="margin:0 10px;">${outLi}<div style="clear:both;"></div></ul>
		</div>
	</div>`;
	router[host] && router[host]();
	tasks.add(`${playerCSS},${posCSS}`, router.wait);
};

init();