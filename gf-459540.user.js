// ==UserScript==
// @name        我只想好好观影
// @namespace   liuser.betterworld.love
// @match       https://movie.douban.com/subject/*
// @match       https://m.douban.com/movie/*
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @connect     *
// @run-at      document-end
// @require     https://cdn.jsdelivr.net/npm/xy-ui@1.10.7/+esm
// @require     https://cdn.staticfile.org/mux.js/6.3.0/mux.min.js
// @require     https://cdn.staticfile.org/shaka-player/4.3.5/shaka-player.compiled.js
// @require     https://cdn.staticfile.org/artplayer/4.6.2/artplayer.min.js
// @version     2.9
// @author      liuser, modify by ray
// @description 想看就看
// @license MIT
// ==/UserScript==

(function () {
	const _debug = !1;
	const skBuffSize = 80; // 视频缓存区大小，单位秒
	let art = {}; //播放器
	let seriesNum = 0;
	const {query: $, queryAll: $$, isMobile} = Artplayer.utils;
	const tip = (message) => XyMessage.info(message);
	const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) });
	//获取豆瓣影片名称
	const videoName = isMobile ? $(".sub-title").innerText : document.title.slice(0, -5);
	const videoYear = $(isMobile ? ".sub-original-title" : ".year").innerText.slice(1, -1);

	const log = (function() {
		if (_debug) return console.log.bind(console);
		return function() {};
	})();

	//将html转为element
	function htmlToElement(html) {
		const template = document.createElement('template');
		template.innerHTML = html.trim();
		return template.content.firstChild;
	}

	//搜索源
	const searchSource = [
		// {"name":"闪电资源","searchUrl":"https://sdzyapi.com/api.php/provide/vod/"},//不太好，格式经常有错
		// { "name": "卧龙资源", "searchUrl": "https://collect.wolongzyw.com/api.php/provide/vod/" }, 非常恶心的广告
		{ "name": "非凡资源", "searchUrl": "http://cj.ffzyapi.com/api.php/provide/vod/" },
		{ "name": "量子资源", "searchUrl": "https://cj.lziapi.com/api.php/provide/vod/" },
		{ "name": "ikun资源", "searchUrl": "https://ikunzyapi.com/api.php/provide/vod/from/ikm3u8/at/json/" },
		{ "name": "光速资源", "searchUrl": "https://api.guangsuapi.com/api.php/provide/vod/from/gsm3u8/" },
		{ "name": "高清资源", "searchUrl": "https://api.1080zyku.com/inc/apijson.php/" },
		{ "name": "188资源", "searchUrl": "https://www.188zy.org/api.php/provide/vod/" },
		// { "name": "飞速资源", "searchUrl": "https://www.feisuzyapi.com/api.php/provide/vod/" },//经常作妖或者没有资源
		{ "name": "红牛资源", "searchUrl": "https://www.hongniuzy2.com/api.php/provide/vod/from/hnm3u8/" },
		// {"name":"天空资源","searchUrl":"https://m3u8.tiankongapi.com/api.php/provide/vod/from/tkm3u8/"},//有防火墙，垃圾
		// { "name": "8090资源", "searchUrl": "https://api.yparse.com/api/json/m3u8/" },垃圾 可能有墙
		{ "name": "百度云资源", "searchUrl": "https://api.apibdzy.com/api.php/provide/vod/" },
		// { "name": "酷点资源", "searchUrl": "https://kudian10.com/api.php/provide/vod/" },
		// { "name": "淘片资源", "searchUrl": "https://taopianapi.com/home/cjapi/as/mc10/vod/json/" },
		// { "name": "ck资源", "searchUrl": "https://ckzy.me/api.php/provide/vod/" },
		// { "name": "快播资源", "searchUrl": "https://caiji.kczyapi.com/api.php/provide/vod/" },
		// { "name": "海外看资源", "searchUrl": "http://api.haiwaikan.com/v1/vod/" }, // 说是屏蔽了所有中国的IP，所以如果你有外国的ip可能比较好
		// { "name": "68资源", "searchUrl": "https://caiji.68zyapi.com/api.php/provide/vod/" },

		// https://caiji.kczyapi.com/api.php/provide/vod/
		// {"name":"鱼乐资源","searchUrl":"https://api.yulecj.com/api.php/provide/vod/"},//速度太慢
		// {"name":"无尽资源","searchUrl":"https://api.wujinapi.me/api.php/provide/vod/"},//资源少

	];

	//处理搜索到的结果:从返回结果中找到对应片子
	function handleResponse(r) {
		if (!r?.list?.length) {
			log("未搜索到结果");
			return 0
		}
		log("正在对比剧集年份");
		const video = r.list.find(k => k.vod_year == videoYear && k.vod_play_url);
		if (!video) {
			log("没有找到匹配剧集的影片，怎么回事哟！");
			return 0
		}

		const a = video.vod_play_url.split("$$$").filter(str => str.includes(".m3u8"));
		if (!a.length) {
			log("没有m3u8资源，无法播放");
			return 0
		}
		return a[0].split("#").map(str => {
			let index = str.indexOf("$");
			return { "name": str.slice(0, index), "url": str.slice(index + 1) }
		});
	}

	//到电影网站搜索电影
	const search = (url) => new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method: "GET",
			url: encodeURI(`${url}?ac=detail&wd=${videoName}`),
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
	class PlayBtn {
		constructor() {
			const e = htmlToElement(`<xy-button type="primary">一键播放</xy-button>`);
			$(isMobile ? ".sub-original-title" : "h1").appendChild(e);
			const render = async (item) => {
				const playList = await search(item.searchUrl);
				if (playList == 0) {
					log(item.name +"获取或解析失败，可能有防火墙");
					return;
				}
				if (e.loading) {
					e.loading = false;
					new UI(playList);
				}
				//渲染资源列表
				const btn = new SourceButton({ name: item.name, playList }).element;
				$(".sourceButtonList").appendChild(btn);
			};
			e.onclick = async function() {
				e.loading = true;
				tip("正在获取影视URL");
				await Promise.allSettled(searchSource.map(render));
				if (!$('body > .liu-playContainer')) {
					e.loading = !1;
					tip("未能获取影视URL");
				}
			};
		}
	}

	//影视源选择按钮
	class SourceButton {
		constructor(item) {
			this.element = htmlToElement(`<xy-button style="color:#a3a3a3" type="dashed">${item.name}</xy-button>`);
			this.element.onclick = () => {
				art.switchUrl(item.playList[seriesNum].url);
				$(".series-select-space").remove();
				new SeriesContainer(item.playList);
			};
		}
		//sources 是[{name:"..资源",playList:[{name:"第一集",url:""}]}]
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

	//剧集选择器的container
	class SeriesContainer {
		constructor(playList) {
			const e = htmlToElement(`<div class="series-select-space"></div>`);
			for (let [index, item] of playList.entries()) {
				new SeriesButton(e, item.name, item.url, index);
			}
			$(".playSpace").appendChild(e);
			$(".next-series").hidden = playList.length < 2;
		}
	}

	class UI {
		constructor(playList) {
			const e = document.body.appendChild(htmlToElement(
			`<div class="liu-playContainer">
				<a class="liu-closePlayer">关闭界面</a>
				<div class="sourceButtonList"></div>
				<div class="playSpace" style="margin-top:1em;width:100%">
					<div class="artplayer-app"></div>
				</div>
				<div>
					<a href="http://memos.babelgo.cn/m/1" target="_blank" style="color:#4aa150">❤️支持开发者</a>
					<span style="width:58vw; display:inline-block;"></span>
					<a class="next-series" style="color:#4aa150">下一集</a>
				</div>
				<p style="color:#aaa;margin-block:0;">默认播放第一个搜索到的资源，若无法播放请切换其他资源。 部分影片选集后会出现卡顿，点击播放按钮或拖动一下进度条即可恢复。</p>
			</div>`
			));
			$(".liu-closePlayer",e).onclick = function() {
				this.parentNode.remove();
				document.body.style.overflow = 'auto';
			};
			document.body.style.overflow = 'hidden';
			$(".next-series",e).onclick = function() {
				$('.play + xy-button',e).click();
				// art.switchUrl(playList[++seriesNum].url);
			};
			//第n集开始播放
			log(playList[seriesNum].url);
			initArt(playList[seriesNum].url);
			new SeriesContainer(playList);
		}
	}

	const artPlus = (option) => (art) => {
		// 阻止右键菜单
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
				art.template.$controls.addEventListener('contextmenu', preventEvent);
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

	//初始化播放器
	function initArt(url) {
		let playRate;
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
			customType: {
				m3u8(v, url) {
					if (!this.shaka) {
						this.shaka = new shaka.Player(v);
						this.shaka.configure({
							streaming: {
								bufferingGoal: skBuffSize +9,
								// rebufferingGoal: 15,
								bufferBehind: skBuffSize,
							}
						});
					}
					playRate = +localStorage.mvPlayRate || 1;
					this.shaka.load(url);
					log(this, 'load:\n'+ url);
				}
			},
			icons: {
				forward: '<svg viewBox="-4 -4 28 28"><path d="M7.875 7.171L0 1v16l7.875-6.171V17L18 9 7.875 1z"></path></svg>',
				rewind: '<svg viewBox="-4 -4 28 28"><path d="M10.125 1L0 9l10.125 8v-6.171L18 17V1l-7.875 6.171z"></path></svg>'
			}
		});
		art.once('destroy', () => art.shaka.destroy());
		art.once("video:canplaythrough", () => {
			art.playbackRate = playRate;
		});
	}

	GM_addStyle(
`.TalionNav{
	z-index:10;
}

.liu-playContainer{
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

.video-selector{
	display:flex;
	flex-wrap:wrap;
	margin-top:1rem;
}

.liu-selector:hover{
	color:#aed0ee;
	background-color:none;
}

.liu-selector{
	color:black;
	cursor:pointer;
	padding:3px;
	margin:5px;
	border-radius:2px;
}
.liu-sourceButton{
	margin-inline:5px;
}
.liu-rapidPlay{
	color: #007722;
}

.liu-light{
	background-color:#7bed9f;
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
	height:90vh;
	grid-template-rows: 1fr;
	grid-template-columns: calc(100vw - 28em) 28em;
	grid-gap:0;
}
.series-select-space{
	display: grid;
	grid-gap: 0;
	grid-auto-rows: 1.8em;
	grid-template-columns: auto auto auto auto auto;
}
@media screen and (max-width: 1025px) {
	.playSpace{
		grid-template-rows: 1fr 1fr;
		grid-template-columns:1fr;
	}
}`
	);
	new PlayBtn();
})();