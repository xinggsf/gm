/* globals jQuery, $, Vue */
// ==UserScript==
// @name     解析VIP视频集合
// @namespace  https://greasyfork.org/zh-CN/users/104201
// @version    6.1.2
// @description  破解VIP或会员视频，原作者：黄盐
// @author     xinggsf
// @noframes
// @match    https://www.iqiyi.com/v_*
// @match    https://v.youku.com/v_show/id_*
// @match    https://www.le.com/ptv/vplay/*
// @match    https://v.qq.com/*
// @match    https://m.mgtv.com/b/*
// @match    https://www.mgtv.com/b/*
// @match    https://film.sohu.com/album/*
// @match    https://tv.sohu.com/v/*
// @match    https://www.acfun.cn/bangumi/*
// @match    https://www.bilibili.com/*
// @match    https://vip.1905.com/play/*
// @match    https://v.pptv.com/show/*
// @match    https://m.fun.tv/vplay/*
// @match    https://www.fun.tv/vplay/*
// @exclude  https://*.bilibili.com/blackboard/*
// @grant    window.onurlchange
// @grant    unsafeWindow
// @grant    GM_getValue
// @grant    GM_setValue
// @grant    GM_addStyle
// @grant    GM_openInTab
// @run-at   document-body
// @require    https://cdn.staticfile.org/vue/2.6.11/vue.min.js
// @require    https://cdn.staticfile.org/jquery/3.6.0/jquery.min.js
// @updateURL   https://raw.githubusercontent.com/xinggsf/gm/master/gf-27530.user.js
// ==/UserScript==

// 加上广告过滤规则~白名单： #@##intabPlayer > iframe
'use strict';

const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) });
if (window.onurlchange === void 0) {
	history.pushState = ( f => function pushState(){
		const ret = f.apply(this, arguments);
		window.dispatchEvent(new Event('pushstate'));
		window.dispatchEvent(new Event('urlchange'));
		return ret;
	})(history.pushState);

	history.replaceState = ( f => function replaceState(){
		const ret = f.apply(this, arguments);
		window.dispatchEvent(new Event('replacestate'));
		window.dispatchEvent(new Event('urlchange'));
		return ret;
	})(history.replaceState);

	window.addEventListener('popstate',()=>{
		window.dispatchEvent(new Event('urlchange'))
	});
};

const site = location.hostname.replace(/\W/g, ''); //[^_\W]数字字母集
// 把不同的集数据，以站点名为键，分开存储
function saveSet(name, value) {
	const thisSet = GM_getValue(name, {});
	thisSet[site] = value;
	GM_setValue(name, thisSet);
}

function getSet(name, defaultValue) {
	const thisSet = GM_getValue(name, {});
	return thisSet[site] || defaultValue;
}
// 解析引擎
const APIS = [
	{name:"七七", url:"https://jx.77flv.cc/?url=", title:"全网解析"},
	{name:"金牛", url:"https://yparse.jn1.cc/index.php?url="},
	{name:"金鹰", url:"https://jx.playerjy.com/?url="},
	{name:"m3u8TV", url:"https://jx.m3u8.tv/jiexi/?url="},
	{name:"XX云", url:"https://jx.2s0.cn/player/?url="},
	// 88看 必须修改请求头referer为 https://www.mgtvys.com/
	{name:"88看", url:"https://vip.sp-flv.com:8443/?url=", title:"全网解析"},
	// 金福 必须修改请求头referer为 https://www.88mv.org/
	{name: "金福", url: "https://vip.jsjinfu.com:8443/?url=", title: "全网解析"},
	// {name:"非凡资源", url:"https://svip.ffzyplay.com/?url="},
	// {name:"红牛", url:"https://www.hnjiexi.com/m3u8/?url="},
	// {name:"量子资源", url:"https://lziplayer.com/?url="},
	{name:"大米", url:"https://jx.dmflv.cc/?url="},
	{name:"咸鱼", url:"https://jx.xyflv.cc/?url="},
	{name:"虾米", url:"https://jx.xmflv.cc/?url="},
	{name:"虾米2", url:"https://jx.xmflv.com/?url="},
	{name:"诺讯", url:"https://jx.nnxv.cn/tv.php?url="},
	{name:"BL解析", url:"https://svip.bljiex.cc/?v="},
	{name:"醉仙", url:"https://jx.zui.cm/?url="},
	{name:"夜幕", url:"https://www.yemu.xyz/?url="},
	{name:"猪蹄", url:"https://jx.iztyy.com/svip/?url="},
	{name:"盘古", url:"https://www.pangujiexi.cc/jiexi.php?url="},
	{name:"黑云", url:"https://jiexi.380k.com/?url="}
];

const siteCfg = {
	'wwwbilibilicom': {
		VIPFlag: '.player-limit-mask.pay, .ep-item.cursor.badge',
		// nextFlag: ''
	},
	'wwwmgtvcom': {
		VIPFlag: '.episode-item.focus > .vip, .vip-button-box > .vip-button'
	},
	'vpptvcom': {
		VIPFlag: '.pay-btn'
	},
	'wwwwasucn': {
		VIPFlag: '#vip_information'
	},
	'wwwacfuncn': {
		VIPFlag: _ => !!unsafeWindow.player.videoInfo
	},
	'vip1905com': {
		VIPFlag: _ => 1
	},
	'vqqcom': {
		VIPFlag: _ => unsafeWindow.VIDEO_INFO?.drm !== '0'
	},
	'wwwiqiyicom': {
		VIPFlag: '[data-player-hook=videoLoadingVip]:visible'
	},
	'vyoukucom': {
		// VIPFlag: _ => 'drmType' in videoPlayer.context.drm
		VIPFlag() {
			const s = `a[href^="https://v.youku.com${location.pathname}"]:first span.mark-text`;
			return $(s).text() === 'VIP';
		}
	}
};
// 通讯总线
const bus = new Vue();

// 页内播放器 intabPlayer.vue
const comIntabPlayer = {
	template: `<div id="intabPlayer" v-if="isShow" :style="intabPlayerStyle">
	<div id="bar" @mousedown="move">
		<button @click="sizeCode='small'">40%</button>
		<button @click="sizeCode='medium'">65%</button>
		<button @click="sizeCode='large'">90%</button>
		<button @click="sizeCode='fill'">全屏</button>
		<button @click="closePlayer">X</button>
	</div>
	<div class="wrap">
	<iframe v-if="src.length" :src="src" ref="ifr" allowFullScreen></iframe></div>
	</div>`,
	data() {
		return {
			src: '',
			isShow: 0,
			position: { left: 100, top: 100 },
			sizeCode: 'medium',
			size: {small:40, medium:65, large:90, fill:100}
		}
	},
	methods: {
		move(e) {
			const disX = e.clientX - this.$el.offsetLeft;
			const disY = e.clientY - this.$el.offsetTop;
			document.onmousemove = (e) => {
				this.position.left = Math.max(e.clientX - disX, -150);
				this.position.top = Math.max(e.clientY - disY, 0);
			};
			document.onmouseup = (e) => {
				saveSet('intabPosition', this.position);
				document.onmousemove = null;
				document.onmouseup = null;
			};
		},
		closePlayer() {
			this.src = '';
			this.isShow = 0;
		}
	},
	computed: {
		intabPlayerStyle() {
			const override = this.sizeCode == 'fill' ? "left:0;top:0;" : '';
			const per = this.size[this.sizeCode];
			return `left:${this.position.left}px;top:${this.position.top}px;width:${per}vw;height:${per}vh;${override}`;
		}
	},
	mounted() {
		bus.$on('updateSrc', async src => {
			// && $(this.$el).find('.wrap>iframe:visible').length == 0
			if (this.src && !this.$refs.ifr.offsetWidth) {
				this.isShow = 0; // this.$forceUpdate()
				await sleep(99);
			}
			this.src = src;
			this.isShow = 1;
		});
		this.position = getSet('intabPosition', { left: 100, top: 100 });
	}
};

//  intabPlayer CSS
GM_addStyle(`
	button{cursor:pointer}
	.dplayer-web-fullscreen-fix #intabPlayer{resize:none!important;}
	#intabPlayer{z-index:999999;position:fixed;display:block;overflow:hidden;resize:both;box-shadow:0 0 2px 2px #f3c;color:#333!important;}
	#intabPlayer #bar{visibility:hidden;position:absolute;width:366px;top:0;left:calc(50% - 180px);}
	#intabPlayer:hover #bar{visibility:visible;z-index:999999;cursor:move}
	#intabPlayer #bar button{background:yellow;padding:0px 10px;font-size:20px;line-height:30px;border:1px solid #3a3a3a}
	#intabPlayer #bar button:hover{background:red}
	#intabPlayer > .wrap, #intabPlayer iframe{padding:0;width:100%;height:100%;border:0}
`);


// 编辑API组件 editApis.vue
const comEditApis = {
	template: `<div v-if="isShow" id="editApis">
	<div>
		<button @click="saveApis" class="bigger">保存</button>
		<button @click="closeEdit" class="bigger">关闭</button>
	</div>
	<li v-for="(api,index) in defaultApis.apis" :key="'default'+index">
		<input v-model="api.name" class="short" placeholder="名称" @change="isChanged=1">
		<input v-model="api.url" class="long" placeholder="API地址" @change="isChanged=1">
		<input v-model="api.title" class="short" placeholder="备注" @change="isChanged=1">
		<button @click="testApi(index, 1)">测试</button>
		<button @click="addApi(index, 1)">增加</button>
		<button @click="deleteApi(index, 1)">删除</button>
	</li>
	<hr>
	<li v-for="(api,index) in myApis.apis" :key="'my'+index">
		<input v-model="api.name" class="short" placeholder="名称" @change="isChanged=1">
		<input v-model="api.url" class="long" placeholder="API地址" @change="isChanged=1">
		<input v-model="api.title" class="short" placeholder="备注" @change="isChanged=1">
		<button @click="testApi(index, 0)">测试</button>
		<button @click="addApi(index, 0)">增加</button>
		<button @click="deleteApi(index, 0)">删除</button>
	</li>
	</div>`,
	data() {
		return {
			isShow: 0,
			isChanged: 0,
			defaultApis: { apis: [] },
			myApis: { apis: [] }
		}
	},
	methods: {
		async saveApis() {
			const defaultApis = this.defaultApis.apis.filter(item => item.url);
			const myApis = this.myApis.apis.filter(item => item.url);
			// console.log(defaultApis,myApis);
			GM_setValue("defaultApis", defaultApis);
			GM_setValue("myApis", myApis);
			bus.$emit("updateApis");
			await sleep(500);
			this.isShow = 0;
			this.isChanged = 0;
		},
		closeEdit() {
			if (this.isChanged && !confirm("有改动，未保存就关闭吗?")) return !1;
			this.isShow = 0;
			this.isChanged = 0;
		},
		testApi(index, isDefault) {
			const api = isDefault ? this.defaultApis.apis[index].url : this.myApis.apis[index].url;
			GM_openInTab(api + location.href, !1);
		},
		addApi(index, isDefault) {
			const blankItem = {name: '', url: '', title: ''};
			if (isDefault) {
				this.defaultApis.apis.splice(index + 1, 0, blankItem);
			} else {
				this.myApis.apis.splice(index + 1, 0, blankItem)
			}
		},
		deleteApi(index, isDefault) {
			if (isDefault) {
				this.defaultApis.apis.splice(index, 1)
			} else {
				this.myApis.apis.splice(index, 1)
			}
		}
	},
	mounted() {
		bus.$on("editApis", (defaultApis) => {
			this.defaultApis.apis = GM_getValue('defaultApis', defaultApis);
			const myApis = GM_getValue('myApis', []);
			this.myApis.apis = myApis.length ? myApis : [{ name: '', url: '', title: ''}];
			this.isShow = 1;
		})
	}
};


// editApis.vue CSS
GM_addStyle(`
	#editApis{z-index:999998;position:fixed;top:0;width:100%;height:100%;background:#3a3a3acc; color:white;text-align:center;overflow:auto}
	#editApis li{list-style-type:none;display:block;margin-bottom:3px}
	#editApis input{border:1px solid #999;padding:3px;margin-right:5px;border-radius:3px}
	#editApis .short{width:100px}
	#editApis .long{width:250px}
	#editApis button{display:inline-block;padding:3px;margin:2px;color:#3a3a3a;background:#ff0;border:0}
	#editApis .bigger{font-size:20px;padding:5px 10px}
`);

// 主界面 组件
const comMain = {
	template: `<div id="crackVIPSet" :style="styleTop">
	<div id="nav">
	<button @mouseover="nav='apis'" @click="quickJump" @mousedown.prevent="moveY" name="quickJump">▶</button>
	<button @mouseover="nav='settings'"><img style="width:16px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABwklEQVRIibVVzWrCQBAeQk/bdk+bm0aWDQEPHtwVahdavLU9aw6KAQ+SQ86Sa19Aqu0T9NafSw8ttOgr1CewUB9CBL3Yy26x1qRp0A8GhsnO9yUzmxmAhKjX68cAMAeAufK3C875FQAsAWCp/O3CsqyhFlB+Oti2/cAYewrD8FDHarXahWEYUy1gGMbUdd1z/TwMw0PG2JNt2/ex5IyxR02CEJpIKbuEkJGOrRshZCSl7CKEJjrGGHuIFMjlcs9RZElNcWxGEAQHGONxWnKM8TgIgoPYMkkpL9MKqNx4xNX8LyOEvMeSq5uxMZlz3vN9v+D7foFz3os6V61Wz36QNhqNUyHENaV0CACLTUnFYvF6/WVUbJPIglI6FELctFqtMiT59Ha7TdcFVCxJ6XYs0Gw2T1SJBlsq0ZxSOhBC3Hied/QjSTUoqsn9lSb3o879avI61FXbzTUFACiXy7v70Tqdzj7G+COtwJ+jIpPJvKYl12ZZ1kucwJs+iBD6lFJ2TdOMHB2mab7/a1xXKpW9fD5/6zjO3erCcV33PMnCcRwnfuHEYXVlZrPZQWqiKJRKpe8Bt5Ol73leCQBmADBTfiJ8AebTYCRbI3BUAAAAAElFTkSuQmCC"></button>
	</div>
	<div id="list" style="display:block">
		<div v-if="nav=='apis'">
		<b v-for="(api,index) in apis"
			@click="jump(index)"
			:key="index" :title="api.title||''"
			:data-icon="'🗖'">{{api.name||'未命名'}}</b>
		</div>
		<div v-else-if="nav=='settings'" style="position:relative;top:50px;">
		<b v-for="(key,index) in Object.keys(settings)" :key="index">
			<label>
			<input v-model="settings[key].value" @change="changeSetting(key)" type="checkbox">
			<span>{{settings[key].name}}</span>
			</label>
		</b>
		</div>
	</div>
	<edit-apis></edit-apis>
	</div>`,
	data() {
		return {
			apis: [],
			defaultApis: [],
			myApis: [],
			settings: {
				openIntab: { value: 1, name: "页内播放" },
				autoEpisodeIntab: { value: 1, name: "选集自动解析" },
				myApisFirst: { value: 1, name: "我的API优先" },
				editApis: { value: 0, name: "管理API" },
			},
			nav: 'apis',
			topOffset: 50,
			selAPIName: ''
		}
	},
	components: {
		'edit-apis': comEditApis
	},
	methods: {
		moveY(e) {
			const disY = e.clientY - this.$el.offsetTop;
			document.onmousemove = (e) => {
				this.topOffset = Math.max(e.clientY - disY, 0);
			};
			document.onmouseup = (e) => {
				saveSet("topSet", this.topOffset);
				document.onmousemove = null;
				document.onmouseup = null;
			};
		},
		quickJump() {
			let i = this.apis.findIndex(k => k.name === this.selAPIName);
			if (i == -1) ++i;
			this.jump(i);
		},
		jump(index) {
			this.selAPIName = this.apis[index].name;
			saveSet("selAPIName", this.selAPIName);
			const link = this.apis[index].url + location.href;
			if (this.settings.openIntab.value) {
				bus.$emit('updateSrc', link);
			} else {
				GM_openInTab(link, !1);
			}
		},
		changeSetting(name) {
			GM_setValue("Settings", this.settings);
			if (name == 'editApis') {
				bus.$emit('editApis', this.defaultApis)
			} else if (name == 'myApisFirst') {
				this.updateApis();
			}
		},
		updateApis() {
			this.defaultApis = GM_getValue('defaultApis', APIS);
			this.myApis = GM_getValue("myApis", []);
			const settings = GM_getValue("Settings", {});
			if (this.settings.myApisFirst.value) {
				this.apis = this.myApis.concat(this.defaultApis);
			} else {
				this.apis = this.defaultApis.concat(this.myApis);
			}
		},
		testVIP() {
			let isVIP = siteCfg[site]?.VIPFlag;
			if (!isVIP) return !1;
			if (typeof isVIP == 'function') isVIP = isVIP();
			else isVIP = $(isVIP)[0];
			isVIP && this.quickJump();
			return isVIP;
		}
	},
	computed: {
		styleTop() {
			return `top:${this.topOffset}px;`;
		}
	},
	mounted() {
		bus.$on('updateApis', () => { this.updateApis() });
		window.addEventListener('urlchange', async (info) => {
			await sleep(330);
			if (this.testVIP()) return;
			if (this.settings.openIntab.value && this.settings.autoEpisodeIntab.value && $('#intabPlayer:visible')[0]) this.quickJump();
		});
		$(async () => {
			await sleep(550);
			this.testVIP();
		});
		this.$nextTick(() => {
			this.topOffset = getSet('topSet', 50);
			this.selAPIName = getSet('selAPIName', '');
			Object.assign(this.settings, GM_getValue("Settings", {}));
			this.updateApis();
		});
	}
};

// 主界面 CSS
GM_addStyle(`
	body{padding:0;margin:0}
	#crackVIPSet input[type=checkbox],#editApis input[type=checkbox]{display:none}
	#crackVIPSet input[type=checkbox] + span:before,#editApis input[type=checkbox] + span:before{content:'☒';margin-right:5px}
	#crackVIPSet input[type=checkbox]:checked + span:before,#editApis input[type=checkbox]:checked + span:before{content:'☑';margin-right:5px}
	#crackVIPSet,#editApis,#intabPlayer{user-select:none;font-family:"微软雅黑"}
	#crackVIPSet{z-index:999998;position:fixed;display:grid;grid-template-columns:30px 150px;width:30px;height:50px;overflow:hidden;padding:5px 0 5px 0;opacity:0.4;font-size:12px}
	#crackVIPSet button{cursor:pointer}
	#crackVIPSet:hover{width:180px;height:450px;padding:5px 5px 5px 0;opacity:1}
	#crackVIPSet #nav{display:grid;grid-auto-rows:50px 50px 200px;grid-row-gap:5px}
	#crackVIPSet #nav [name=quickJump]:active{cursor:move}
	#crackVIPSet #nav button{background:yellow;color:red;font-size:20px;padding:0;border:0;cursor:pointer;border-radius:0 5px 5px 0}
	#crackVIPSet #list{overflow:auto;margin-left:2px}
	#crackVIPSet #list b{display:block;cursor:pointer;color:#3a3a3a;font-weight:normal;font-size:14px;padding:5px;background-color:#ffff00cc;border-bottom:1px dashed #3a3a3a}
	#crackVIPSet #list b:before{content:attr(data-icon);padding-right:5px}
	#crackVIPSet #list b:first-child{border-radius:5px 5px 0 0}
	#crackVIPSet #list b:last-child{border-radius:0 0 5px 5px}
	#crackVIPSet #list b:hover{background-color:#3a3a3a;color:white}
`);

// 在文档之外渲染并且随后挂载
const player = new Vue({
	render: h => h(comIntabPlayer)
}).$mount();
document.body.appendChild(player.$el);
const vm = new Vue({
	render: h => h(comMain)
}).$mount();
document.body.appendChild(vm.$el);