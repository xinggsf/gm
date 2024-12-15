/* globals Artplayer, XyMessage, Hls, artplayerPluginHlsControl */
// ==UserScript==
// @name        我只想好好观影
// @namespace   liuser.betterworld.love
// @match       https://movie.douban.com/subject/*
// @match       https://m.douban.com/movie/*
// @exclude     https://movie.douban.com/subject/*/episode/*
// @grant       GM_addStyle
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest
// @grant       GM_download
// @grant       GM_setClipboard
// @connect     *
// @run-at      document-end
// @require     https://cdn.jsdelivr.net/npm/xy-ui@1.10.7/+esm
// @require     https://cdn.staticfile.net/hls.js/1.5.1/hls.min.js
// @require     https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js
// @version     4.5
// @author      liuser, modify by ray
// @description 想看就看
// @license     MIT
// ==/UserScript==

//  https://artplayer.org/uncompiled/artplayer-plugin-hls-control/index.js
// ver4.2 更新量子云API；新增功能：导出potplayer播放列表
// ver4.0 新增魔都云,修正可能出现的重复添加播放按钮
// ver3.9 修正播放列表的样式，以匹配长片名
// ver3.8 新增木耳、极速、豪华云，对空格分隔的片名进行处理~并校正名字二次搜索资源
// ver3.7 更新暴风云、量子、樱花、新浪、索尼、无尽、鱼乐云
// ver3.6 新增U酷云，更新非凡云API
// ver3.4 fix UI bug: 集数过多时撑大播放列表；新增飘花、樱花2个资源搜索
// ver3.3 过滤掉量子云的电影解说；新增暴风云、快帆云、索尼云、天空云4个资源搜索；更新淘片云API地址
(function () {
	const buffSize = GM_getValue('buffSize', 80);
	const _debug = 0;
	const isSafari = !self.chrome && navigator.userAgent.includes('Safari');
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

	//将html转为element
	function htmlToElement(html) {
		const template = document.createElement('template');
		template.innerHTML = html.trim();
		return template.content.firstChild;
	}

	//搜索源
	const searchSource = [
		{ name: "非凡云", searchUrl: "http://api.ffzyapi.com/api.php/provide/vod/" }, // www.ffzy.tv
		{ name: "量子云", searchUrl: "https://cj.lziapi.com/api.php/provide/vod/" },
		{ name: "神马云", searchUrl: "https://api.1080zyku.com/inc/apijson.php" },
		{ name: "木耳云", searchUrl: "https://www.heimuer.tv/api.php/provide/vod/"},
		// { name: "豪华云", searchUrl: "https://hhzyapi.com/api.php/provide/vod/"},
		// { name: "极速云", searchUrl: "https://8.218.111.47/api.php/provide/vod/"},
		// { name: "飞速云", searchUrl: "https://www.feisuzyapi.com/api.php/provide/vod/" },
		{ name: "艾昆云", searchUrl: "https://ikunzyapi.com/api.php/provide/vod/from/ikm3u8/at/json/" },
		{ name: "U酷云", searchUrl: "https://api.ukuapi.com/api.php/provide/vod/" },
		{ name: "光速云", searchUrl: "https://api.guangsuapi.com/api.php/provide/vod/from/gsm3u8/" },
		// { name: "红牛云", searchUrl: "https://www.hongniuzy2.com/api.php/provide/vod/josn/" }, //https://www.hongniuzy2.com/api.php/provide/vod/from/hnm3u8/
		{ name: "暴风云", searchUrl: "https://app.bfzyapi.com/api.php/provide/vod/"},
		{ name: "快车云", searchUrl: "https://caiji.kczyapi.com/api.php/provide/vod/"},
		{ name: "新浪云", searchUrl: "https://api.xinlangapi.com/xinlangapi.php/provide/vod/"},
		{ name: "魔都云", searchUrl: "https://caiji.moduapi.cc/api.php/provide/vod/"},//须用hls.js解码播放 ?ac=list
		// { name: "快帆云", searchUrl: "https://api.kuaifan.tv/api.php/provide/vod/"},
		// { name: "索尼云", searchUrl: "https://suonizy.com/api.php/provide/vod/"},
		{ name: "淘片云", searchUrl: "https://taopianapi.com/cjapi/mc/vod/json/m3u8.html" },
		{ name: "樱花云", searchUrl: "https://m3u8.apiyhzy.com/api.php/provide/vod/"},
		{ name: "天空云", searchUrl: "https://m3u8.tiankongapi.com/api.php/provide/vod/from/tkm3u8/"},
		// { name: "闪电云", searchUrl: "https://sdzyapi.com/api.php/provide/vod/"},//不太好，格式经常有错
		// { name: "百度云", searchUrl: "https://api.apibdzy.com/api.php/provide/vod/" },
		// { name: "乐视云", searchUrl: "https://leshiapi.com/api.php/provide/vod/at/json/" },
		// { name: "丫丫云", searchUrl: "https://cj.yayazy.net/api.php/provide/vod/" },
		{ name: "金鹰云", searchUrl: "https://jyzyapi.com/provide/vod/from/jinyingm3u8/at/json" },
		// { name: "酷点云", searchUrl: "https://kudian10.com/api.php/provide/vod/" },
		{ name: "卧龙云", searchUrl: "https://collect.wolongzyw.com/api.php/provide/vod/" }, //非常恶心的广告
		// { name: "ck云", searchUrl: "https://ckzy.me/api.php/provide/vod/" },
		{ name: "海外看", searchUrl: "http://api.haiwaikan.com/v1/vod/" }, // 说是屏蔽了所有中国的IP，所以如果你有外国的ip可能比较好
		// { name: "68资源", searchUrl: "https://caiji.68zyapi.com/api.php/provide/vod/" },
		// { name:"鱼乐云", searchUrl:"https://api.ylzy.me/api.php/provide/vod/" },
		{ name:"无尽云", searchUrl:"https://api.wujinapi.me/api.php/provide/vod/" }
	];

	//处理搜索到的结果:从返回结果中找到对应片子
	function handleResponse(r) {
		if (!r?.list?.length) {
			log("未搜索到结果\n", r);
			return 0
		}
		log("正在对比剧集年份");
		const video = r.list.find(k => k.type_name != '电影解说' && k.vod_year == videoYear && k.vod_play_url);
		if (!video) {
			log("没有找到匹配剧集的影片，怎么回事哟！");
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
			timeout: 3000,
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
		const e = htmlToElement(`<xy-button type="primary">一键播放</xy-button>`);
		const eInfo = htmlToElement(`<xy-button type="primary">重设片名和年份</xy-button>`);
		$(isMobile ? ".sub-original-title" : "h1").appendChild(e);
		e.after(eInfo);
		eInfo.onclick = function() {
			const s = prompt(
				'纠正片名和年份，二者用 | 号隔开。可以只输入片名，如片名有上下集~试着删掉空格及其后的字',
				`${vName}|${videoYear}`);
			if (s) {
				([vName, videoYear = videoYear] = s.split('|'));
				document.title = vName;
			}
		};
		e.onclick = async function() {
			// 二次搜索资源控制2变量
			const secName = vName.includes(' ') ? vName.replace(' ', vName.includes(' 第') ?'':'：') : null;
			const sources = secName ? [] : null;
			const render = async (item) => {
				const playList = await search(item.searchUrl);
				if (playList == 0) {
					log(item.name +"获取或解析失败，可能有防火墙");
					if (secName && !sources.includes(item)) sources.push(item);
					return;
				}
				if (e.loading) {
					e.loading = false;
					new UI(playList);
				}
				//渲染资源列表
				$(".sourceButtonList").appendChild(sourceButton({ name: item.name, playList }));
			};
			e.loading = true;
			tip("正在获取影视URL");
			await Promise.allSettled(searchSource.map(render));
			if (sources?.length) {
				vName = secName;
				await sleep(5000); // 防IP被封
				await Promise.allSettled(sources.map(render));
			}
			if (!$('body > .liu-playContainer')) {
				e.loading = !1;
				tip("未能获取影视URL");
			}
		};
	}

	//影视源选择按钮 参数item 是 {name:"..云",playList:[{name:"第一集",url:""}]}
	function sourceButton(item) {
		potList = potList || item.playList;
		const btn = htmlToElement(`<xy-button style="color:#a3a3a3" type="dashed">${item.name}</xy-button>`);
		btn.onclick = () => {
			potList = item.playList;
			const list = item.playList[seriesNum];
			if (!list) return;
			const time = art.currentTime;
			time && art.once("video:loadedmetadata", async () => {
				await sleep(500);
				if (art.duration > time) art.currentTime = time;
			});
			art.switchUrl(list.url);
			$(".series-select-space").remove();
			new SeriesContainer(item.playList);
		};
		return btn;
	}

	//剧集选择器
	class SeriesButton {
		constructor(pNode, name, url, index) {
			const e = pNode.appendChild(htmlToElement(
				`<xy-button type="flat">${name}</xy-button>`
			));
			e.onclick = function() {
				if (this.matches('.play')) return;
				seriesNum = index;
				art.switchUrl(url);
				$('.play', this.parentNode)?.classList.remove('play');
				this.classList.add('play');
			};
			if (seriesNum == index) e.classList.add('play');
		}
	}

	//剧集选择的容器
	class SeriesContainer {
		constructor(playList) {
			const e = htmlToElement(`<div class="series-select-space"></div>`);
			for (const [index, item] of playList.entries()) {
				new SeriesButton(e, item.name, item.url, index);
			}
			$(".playSpace").appendChild(e);
			$(".next-series").hidden = $(".pot-playList").hidden = playList.length < 2;
		}
	}

	class UI {
		constructor(playList) {
			const e = document.body.appendChild(htmlToElement(
			`<div class="liu-playContainer">
				<a class="liu-closePlayer">关闭界面</a>
				<div class="sourceButtonList"></div>
				<div class="playSpace" style="width:100%">
					<div class="artplayer-app"></div>
				</div>
				<div>
					<a href="http://memos.babelgo.cn/m/1" target="_blank" style="color:#4aa150">❤️支持开发者</a>
					<span style="display:inline-block;color:#aaa">　　不要相信视频中的广告！！！默认播放第一个搜索到的资源，若无法播放请切换其他资源。 部分影片选集后会出现卡顿，点击播放按钮或拖动一下进度条即可恢复。　　</span>
					<a class="pot-playList" title="复制并下载DPL文件" style="color:#4aa150;">PotPlayer播放列表</a>
					<span>　　　</span>
					<a class="next-series" style="color:#4aa150;">下一集</a>
				</div>
			</div>`
			));
			e.querySelector(".pot-playList").onclick = () => {
				const a = potList.map((k,i) => `${i+1}*file*${k.url}\n${i+1}*title*${k.name}\n`);
				const time = art.currentTime*1000 || 500;
				a[seriesNum] += `${seriesNum+1}*start*${~~time}\n`;
				// 插入DPL文件头
				a[0] = `DAUMPLAYLIST
					playname=${potList[seriesNum].url}
					topindex=0
					saveplaypos=1
				`.replace(/\t|\r| /g,'') + a[0];
				GM_setClipboard(a.join(''));
				const blob = new Blob(a, {'type': 'text/plain'});
				const dataURL = URL.createObjectURL(blob);
				GM_download({
					url: dataURL,
					name: vName +'.dpl',
					onloadend: _ => {URL.revokeObjectURL(dataURL);}
				});
			};
			e.querySelector(".liu-closePlayer").onclick = function() {
				art.destroy();
				e.remove();
				document.body.style.overflow = 'auto';
			};
			document.body.style.overflow = 'hidden';
			e.querySelector(".next-series").onclick = function() {
				$('.play + xy-button',e).click();
			};
			log(playList[seriesNum].url);
			initArt(playList[seriesNum].url);
			new SeriesContainer(playList);
		}
	}

	const artPlus = (option) => (art) => {
		Object.assign(art.icons, {
			forward: '<svg fill="#fff" viewBox="-9 -9 40 40"><path d="M7.875 7.171L0 1v16l7.875-6.171V17L18 9 7.875 1z"></path></svg>',
			rewind: '<svg fill="#fff" viewBox="-9 -9 40 40"><path d="M10.125 1L0 9l10.125 8v-6.171L18 17V1l-7.875 6.171z"></path></svg>',
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
	}

	GM_addStyle(
`.liu-playContainer{
	width:100%;
	height:100%;
	background-color:#222;
	position:fixed;
	top:0;
	z-index:11;
}

.liu-closePlayer{
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
}

.liu-btn:hover {
	color: #41ac52;
}

.liu-btn:after {
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

.liu-btn:hover:after {
	transform: skewX(-45deg) scale(1, 1);
	-webkit-transition: all 0.5s;
	transition: all 0.5s;
}
xy-button{
	height:1.5em;
	cursor:pointer;
}

.series-select-space xy-button.play{
	color:purple;
}
.series-select-space xy-button{
	color:#aaa;
}
.playSpace{
	display: grid;
	height: calc(100vh - 3em);
	grid-template-rows: 1fr;
	grid-template-columns: calc(100vw - 28em) 28em;
	grid-gap: 0;
}
.series-select-space{
	overflow-y: auto;
	display: flex;
	flex-flow: row wrap;
	align-items: flex-start;
	align-content: flex-start;
	/* grid-gap: 0;
	grid-auto-rows: 1.8em;
	grid-template-columns: auto auto auto auto auto; */
}
@media screen and (max-width: 1025px) {
	.playSpace{
		grid-template-rows: 1fr 1fr;
		grid-template-columns:1fr;
	}
}`
	);

	playBtn();
	GM_registerMenuCommand('设定视频缓存区大小', () => {
		const n = +prompt('请输入视频缓存区大小，区间：15 － 800整数秒',''+ buffSize);
		if (n > 14 && n < 801) GM_setValue('buffSize', n|0);
	});
})();