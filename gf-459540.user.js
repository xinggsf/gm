/* globals Artplayer, XyMessage, Hls, artplayerPluginHlsControl */
// ==UserScript==
// @name        我只想好好观影
// @namespace   liuser.betterworld.love
// @homepage    https://bbs.kafan.cn/thread-2253400-1-1.html
// @match       https://movie.douban.com/subject/*
// @match       https://m.douban.com/movie/*
// @exclude     https://movie.douban.com/subject/*/episode/*
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest
// @connect     *
// @run-at      document-end
// @require     https://cdn.jsdelivr.net/npm/xy-ui@1.10.7/+esm
// @require     https://cdn.jsdelivr.net/gh/xinggsf/extFilter@master/lib/hls.min.js?t=18
// @require     https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js
// @version     5.0
// @author      liuser, modify by ray
// @description 想看就看
// @license     MIT
// ==/UserScript==

/* https://ghproxy.net/https://raw.github.com/xinggsf/extFilter/master/lib/hls.min.js  https://artplayer.org/uncompiled/artplayer-plugin-hls-control/index.js

v5.0 修正artplayer v5.3下不能显示前进后退按钮；更新、新增多个视频资源接口
ver4.6 修正下载DPL文件的BUG；更新神马源；在hls.js库中加入去广告功能
ver4.5 更换播放库hls.js，以适应：魔都云、闪电云、无尽云、樱花云
ver4.2 更新量子源；新增功能：导出potplayer播放列表
ver4.0 新增魔都云,修正可能出现的重复添加播放按钮
ver3.9 修正播放列表的样式，以匹配长片名
ver3.8 新增木耳、极速、豪华云，对空格分隔的片名进行处理~并校正名字二次搜索资源
ver3.7 更新暴风源、量子、樱花、新浪、索尼、无尽、鱼乐源
ver3.6 新增U酷源，更新非凡源
ver3.4 fix UI bug: 集数过多时撑大播放列表；新增飘花、樱花2个资源搜索
ver3.3 过滤掉量子云的电影解说；新增暴风源、快帆源、索尼源、天空源4个资源搜索；更新淘片源
*/
(function () {
	const buffSize = GM_getValue('buffSize', 80);
	const _debug = 0;
	let art; //播放器
	let seriesNum = 0;
	let potList = null; // 暂存剧集地址列表，用于导出potplayer播放列表
	const {query: $, queryAll: $$, isMobile} = Artplayer.utils;
	const tip = (message) => XyMessage.info(message);
	const noopFn = function() {};
	const log = _debug ? console.log.bind(console) : noopFn;
	const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) });
	//豆瓣影片名及其年份
	let vName = isMobile ? $(".sub-title").innerText : document.title.slice(0, -5);
	let videoYear = $(isMobile ? ".sub-original-title" : ".year").innerText.slice(1, -1);

	function html2DOM(html, pNode) {
		const e = document.createElement('template');
		e.innerHTML = html.trim().replace(/[\r\n\t]/g,'');
		const r = e.content.firstChild;
		pNode?.append(e.content);
		return r;
	}

	//搜索源
	const searchSource = [
		//以下域名多数被污染！！必须修改hosts文件： 23.225.147.243 api.ffzyapi.com
		{ name: "非凡云", searchUrl: "http://api.ffzyapi.com/api.php/provide/vod/" }, // ffzy5.tv
		{ name: "量子云", searchUrl: "https://cj.lziapi.com/api.php/provide/vod/" },
		{ name: "神马云", searchUrl: "https://api.yzzy-api.com/inc/apijson.php" },
		{ name: "暴风云", searchUrl: "https://bfzyapi.com/api.php/provide/vod/"},
		// { name: "木耳云", searchUrl: "https://www.heimuer.tv/api.php/provide/vod/"},
		{ name: "如意云", searchUrl: "https://cj.rycjapi.com/api.php/provide/vod/"},
		{ name: "魔都云", searchUrl: "https://caiji.moduapi.cc/api.php/provide/vod/"},
		{ name: "红牛云", searchUrl: "https://www.hongniuzy3.com/api.php/provide/vod/"},
		{ name: "茅台云", searchUrl: "https://caiji.maotaizy.cc/api.php/provide/vod/at/josn/"},
		// { name: "豪华云", searchUrl: "https://hhzyapi.com/api.php/provide/vod/"},
		// { name: "极速云", searchUrl: "https://8.218.111.47/api.php/provide/vod/"},
		{ name: "光速云", searchUrl: "https://api.guangsuapi.com/api.php/provide/vod/"},
		// { name: "淘片云", searchUrl: "https://taopianapi.com/cjapi/mc/vod/json/m3u8.html"},
		{ name: "艾昆云", searchUrl: "https://ikunzyapi.com/api.php/provide/vod/from/ikm3u8/at/json/"}, //www.ikunzy.com
		{ name: "速播云", searchUrl: "https://subocj.com/api.php/provide/vod"},
		// { name: "U酷云", searchUrl: "https://api.ukuapi.com/api.php/provide/vod/"},
		// { name: "快车云", searchUrl: "https://caiji.kczyapi.com/api.php/provide/vod/"},
		{ name: "新浪云", searchUrl: "https://api.xinlangapi.com/xinlangapi.php/provide/vod"},
		// { name: "樱花云", searchUrl: "https://m3u8.apiyhzy.com/api.php/provide/vod/"},
		// { name: "天空云", searchUrl: "https://m3u8.tiankongapi.com/api.php/provide/vod/from/tkm3u8/"},
		// { name: "闪电云", searchUrl: "https://sdzyapi.com/api.php/provide/vod/"},//不太好，格式经常有错
		// { name: "百度云", searchUrl: "https://api.apibdzy.com/api.php/provide/vod/" },
		{ name: "金鹰云", searchUrl: "https://jyzyapi.com/provide/vod/from/jinyingm3u8/at/json"},
		// { name: "酷点云", searchUrl: "https://kudian10.com/api.php/provide/vod/" },
		{ name: "卧龙云", searchUrl: "https://collect.wolongzyw.com/api.php/provide/vod/"}, //非常恶心的广告
		// { name: "ck云", searchUrl: "https://ckzy.me/api.php/provide/vod/" },
		// { name: "海外看", searchUrl: "http://api.haiwaikan.com/v1/vod/" }, // 说是屏蔽了所有中国的IP，所以如果你有外国的ip可能比较好
		{ name:"无尽云", searchUrl:"https://api.wujinapi.me/api.php/provide/vod/" }
	];

	//处理搜索到的结果:从返回结果中找到对应片子
	function handleResponse(r) {
		if (!r?.list?.length) {
			log("未搜索到结果\n", r);
			return 0
		}
		log("正在对比剧集年份");
		const video = r.list.find(k => k.type_name != '电影解说' && k.vod_year == videoYear && k.vod_play_url)
			|| r.list[0];
		if (!video) {
			log("没有找到匹配剧集的影片！");
			return 0
		}

		const a = video.vod_play_url.split("$$$").filter(str => str.includes(".m3u8"));
		if (!a.length) {
			log("没有m3u8资源，无法播放");
			return 0
		}
		return a[0].split("#").map(s => {
			let index = s.indexOf("$");
			return { name: s.slice(0,index), url: s.slice(index + 1)}
		});
	}

	//到电影网站搜索电影
	const search = (url) => new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method: "GET",
			url: encodeURI(`${url}?ac=detail&wd=${vName}`),
			timeout: 9000,
			responseType: 'json',
			onload(r) {
				resolve(handleResponse(r.response));
			},
			onerror() {resolve(0)},
			ontimeout() {resolve(0)}
		});
	});

	//播放按钮
	function playBtn() {
		const e = html2DOM(`<xy-button type="primary">一键播放</xy-button><xy-button type="primary">重设片名和年份</xy-button>`,
			$(isMobile ? ".sub-original-title" : "h1"));
		e.nextSibling.onclick = function() {
			const s = prompt(
				'纠正片名和年份，二者用 | 号隔开。可以只输入片名，如片名有上下集~试着删掉空格及其后的字',
				`${vName}|${videoYear}`);
			if (s) {
				([vName, videoYear = videoYear] = s.split('|'));
				document.title = vName;
			}
		};
		e.onclick = async function() {
			// 第二次搜索的2个控制变量
			const secName = vName.includes(' ') ? vName.replace(' ', vName.includes(' 第') ?'':'：') : null;
			const sources = secName ? [] : null;
			const render = async (item) => {
				const playList = await search(item.searchUrl);
				if (playList == 0) {
					log(item.name +"获取或解析失败，可能有防火墙");
					if (secName && !sources.includes(item)) sources.push(item);
					return;
				}
				if (this.loading) {
					this.loading = false;
					new UI(playList);
				}
				//渲染源列表
				$(".sourceButtonList").appendChild(sourceButton({ name: item.name, playList }));
			};
			this.loading = true;
			tip("正在获取影视URL");
			await Promise.allSettled(searchSource.map(render));
			if (sources?.length) {
				vName = secName;
				await sleep(5000); // 防IP被封
				await Promise.allSettled(sources.map(render));
			}
			if (!$('body > .liu-playContainer')) {
				this.loading = !1;
				tip("未能获取影视URL");
			}
		};
	}

	//影视源选择按钮 参数item 是 {name:"..云",playList:[{name:"第一集",url:""}]}
	function sourceButton(item) {
		potList = potList || item.playList;
		const btn = html2DOM(`<xy-button style="color:#a3a3a3" type="dashed">${item.name}</xy-button>`);
		btn.onclick = function(){
			this.blur();
			potList = item.playList;
			const pInfo = item.playList[seriesNum];
			if (!pInfo) return;
			const time = art.currentTime;
			time && art.once("video:durationchange", () => {
				art.video.currentTime = time;
			});
			art.url = pInfo.url;
			$(".series-select-space").innerHTML = '';
			seriesContainer(item.playList);
		};
		return btn;
	}

	//剧集选择器
	function seriesButton(name, url, index) {
		const e = html2DOM(`<xy-button type="flat">${name}</xy-button>`);
		e.onclick = function() {
			this.blur();
			if (this.matches('.play')) return;
			seriesNum = index;
			art.switchUrl(url);
			$('.play', this.parentNode)?.classList.remove('play');
			this.classList.add('play');
		};
		if (seriesNum == index) e.classList.add('play');
		return e;
	}

	//剧集选择的容器
	function seriesContainer(playList) {
		const df = document.createDocumentFragment();
		playList.forEach((k,i) => df.append(seriesButton(k.name, k.url, i)));
		$(".series-select-space").append(df);
		$(".next-series").hidden = $(".pot-playList").hidden = playList.length < 2;
	}

	class UI {
		constructor(playList) {
			const e = html2DOM(
			`<div class="liu-playContainer">
				<a class="liu-closePlayer">关闭界面</a>
				<div class="sourceButtonList"></div>
				<div class="playSpace" style="width:100%">
					<div class="artplayer-app"></div>
					<div class="series-select-space"></div>
				</div>
				<div>
					<span style="display:inline-block;color:#aaa">不要相信视频中的广告！！解决影视卡顿：快进几秒；或切换影视源，可点击之前选择的影视源</span>
					<div style="float:right;color:#4aa150;">
						<a target="_blank" title="提示不安全，请允许浏览器继续访问" href="https://taopianapi.com/cjapi/mc/vod/json/m3u8.html">解决淘片云不能访问　</a>
						<a class="next-series">下一集　</a>
						<a class="pot-playList" title="下载DPL文件">PotPlayer播放列表　</a>
						<a class="cacheSize" title="设定视频缓存大小">⚙ 缓存　</a>
						<a target="_blank" title="微信打赏" href="https://cdn.jsdelivr.net/gh/xinggsf/extFilter@master/vx.png">请我喝杯☕</a>
					</div>
				</div>
			</div>`, document.body);
			e.querySelector(".cacheSize").onclick = function() {
				const n = +prompt('请输入视频缓存区大小，区间：15 － 800整数秒',''+ buffSize);
				if (n > 14 && n < 801) GM_setValue('buffSize', n|0);
			};
			e.querySelector(".pot-playList").onclick = async function(ev){
				ev.stopPropagation();
				const a = potList.map((k,i) => `${i+1}*file*${k.url}\n${i+1}*title*${k.name}\n`);
				const time = art.currentTime*1000 || 500;
				a[seriesNum] += `${seriesNum+1}*start*${~~time}\n`;// 插入当前剧集播放进度。 pot列表索引从1开始，故+1
				// 插入DPL文件头
				a[0] = `DAUMPLAYLIST
					playname=${potList[seriesNum].url}
					topindex=0
					saveplaypos=1
				`.replace(/\t|\r| /g,'') + a[0];
				this.download = vName + '.dpl';
				this.href = URL.createObjectURL(new Blob(a));
				await sleep(900);
				URL.revokeObjectURL(this.href);
			};
			e.children[0].onclick = function() {
				art.destroy();
				e.remove();
				document.body.style.overflow = 'auto';
			};
			document.body.style.overflow = 'hidden';
			e.querySelector(".next-series").onclick = function() {
				e.querySelector('.play + xy-button')?.click();
			};
			log(playList[seriesNum].url);
			initArt(playList[seriesNum].url);
			seriesContainer(playList);
		}
	}

	const artPlus = (option) => (art) => {
		Object.assign(art.icons, {
			forward: '<svg fill="#fff" height="22" width="22"><path d="M7.875 7.171L0 1v16l7.875-6.171V17L18 9 7.875 1z"></path></svg>',
			rewind: '<svg fill="#fff" height="22" width="22"><path d="M10.125 1L0 9l10.125 8v-6.171L18 17V1l-7.875 6.171z"></path></svg>',
		});
		const preventEvent = ev => {
			if (!ev.target.closest('.art-control')) return;
			ev.stopPropagation();
			ev.preventDefault();
		};
		art.controls.add({
			name: "forward",
			html: art.icons.forward,
			position: "left",
			tooltip: "三键快进",
			mounted(el) {
				art.proxy(art.template.$controls,['contextmenu','mousedown','dblclick'],preventEvent);
				art.controls.playAndPause.after(el);
				art.proxy(el, 'mousedown', ev => {
					if (art.duration && ev.button>0) art.currentTime += ev.button == 1 ? 1 : 20;
				});
			},
			click(controls, ev) {
				if (art.duration) art.currentTime += 5;
			}
		});
		art.controls.add({
			name: "rewind",
			html: art.icons.rewind,
			position: "left",
			tooltip: "三键快退",
			mounted(el) {
				art.controls.playAndPause.before(el);
				art.proxy(el, 'mousedown', ev => {
					if (art.duration && ev.button>0) art.currentTime -= ev.button == 1 ? 1 : 20;
				});
			},
			click(controls, ev) {
				if (art.duration) art.currentTime -= 5;
			}
		});

		art.controls.add({
			name: "resolution",
			html: "分辨率",
			position: "right",
			click(controls, ev) {
				art.info.show = !art.info.show;
			}
		});

		// art.on('dblclick', preventEvent);
		art.on("video:loadedmetadata", () => {
			art.controls.resolution.innerText = art.video.videoHeight + "P";
		});

		return {name: 'artPlus'};
	};

	function loadM3u8(video, url) {
		if (Hls.isSupported()) {
			this.hls?.destroy();
			this.hls = new Hls({
				maxBufferSize: 36 << 20, // 36MB
				maxBufferLength: buffSize,
				maxMaxBufferLength: buffSize + 9,
				backBufferLength: 9
			});
			this.hls.loadSource(url);
			this.hls.attachMedia(video);
			this.on('destroy', () => this.hls.destroy());
		} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = url;
		} else {
			this.notice.show = '不支持的m3u8格式！';
		}
	}
	//初始化播放器
	function initArt(url) {
		art = new Artplayer({
			container: ".artplayer-app",
			theme: 'green',
			url, pip: true,
			fullscreen: true,
			fullscreenWeb: true,
			screenshot: true,
			hotkey: true,
			airplay: true,
			playbackRate: true,
			plugins: [artPlus()],
			customType: {m3u8:loadM3u8}
		});
		art.once("ready", () => {
			art.video.playbackRate = +localStorage.mvPlayRate || 1;
		});
	}

	GM_addStyle(
`.liu-playContainer {
	width:100%;
	height:100%;
	background-color:#222;
	position:fixed;
	top:0;
	z-index:11;
}

.liu-closePlayer {
	float:right;
	margin-inline:10px;
	color:white;
}

.liu-btn {
	width: 6.5em;
	height: 2em;
	margin: 0.5em;
	background: #41ac52;
	color: white;
	border: none;
	border-radius: 0.625em;
	font-size: 20px;
	font-weight: bold;
	cursor: pointer;
	position: relative;
	z-index: 1;
	overflow: hidden;

	&:hover {
		color: #41ac52;
	}
	&:after {
		content: '';
		background: white;
		position: absolute;
		z-index: -1;
		left: -20%;
		right: -20%;
		top: 0;
		bottom: 0;
		transform: skewX(-45deg) scale(0, 1);
		transition: all 0.5s;
	}
	&:hover:after {
		transform: skewX(-45deg) scale(1, 1);
		-webkit-transition: all 0.5s;
		transition: all 0.5s;
	}
}

xy-button {
	height:1.5em;
	cursor:pointer;
}

.playSpace {
	display: grid;
	height: calc(100vh - 3em);
	grid-template-rows: 1fr;
	grid-template-columns: calc(100vw - 25em) 25em;
	grid-gap: 0;
}
.series-select-space {
	overflow-y: auto;
	display: flex;
	flex-flow: row wrap;
	align-items: flex-start;
	align-content: flex-start;
	/* grid-gap: 0;
	grid-auto-rows: 1.8em;
	grid-template-columns: auto auto auto auto auto; */

	& xy-button.play {
		color:purple;
	}
	& xy-button {
		color:#aaa;
	}
}
@media screen and (max-width: 1025px) {
	.playSpace{
		grid-template-rows: 1fr 1fr;
		grid-template-columns:1fr;
	}
}`
	);

	playBtn();
})();