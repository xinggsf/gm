// ==UserScript==
// @name        我只想好好观影
// @namespace   liuser.betterworld.love
// @match       https://movie.douban.com/subject/*
// @match       https://m.douban.com/movie/*
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// @connect     *
// @run-at      document-end
// @require     https://cdn.jsdelivr.net/npm/xy-ui/+esm
// @require     https://cdn.staticfile.org/mux.js/6.3.0/mux.min.js
// @require     https://cdn.staticfile.org/shaka-player/4.3.5/shaka-player.compiled.js
// @require     https://cdn.staticfile.org/artplayer/4.6.2/artplayer.min.js
// @version     1.16
// @author      liuser, modify by ray
// @description 想看就看
// @license MIT
// ==/UserScript==

(function () {
    const _debug = !1;
    let videoName = "";
    let art = {}; //播放器
    let seriesNum = 0;
    const isMobi = /Mobi|Android|iPhone/i.test(navigator.userAgent);

    function addScript() {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://cdn.jsdelivr.net/npm/xy-ui/index.min.js';
        document.head.appendChild(script);
    }

    //将html转为element
    function htmlToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    const css = `
.TalionNav{
        z-index:10;
    }

.liu-playContainer{
        width:100%;
        height:100%;
        background-color:#121212;
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
    margin:0em 1em 0em 0em;
    height:1.5em;
    cursor:pointer;
  }
  .playSpace{
    display: grid;
    height:500px;
    grid-template-rows: 1fr;
    grid-template-columns: 70% 30%;
    grid-row-gap:0px;
    grid-column-gap:0px;
  }
  .series-select-space::-webkit-scrollbar {display:none}
  .series-select-space{
    height:500px;
  }
  .artplayer-app{
  height:500px;
  }
  @media screen and (max-width: 1025px) {
  .playSpace{
    display: grid;
    height:700px;
    grid-template-rows: 1fr 1fr;
    grid-template-columns:1fr;
    grid-row-gap:0px;
    grid-column-gap:0px;
  }
  .series-select-space{
    height:200px;
  }
  .artplayer-app{
    height:400px;
  }
}`;

    //搜索源
    const searchSource = [
        // {"name":"闪电资源","searchUrl":"https://sdzyapi.com/api.php/provide/vod/"},//不太好，格式经常有错
        // { "name": "卧龙资源", "searchUrl": "https://collect.wolongzyw.com/api.php/provide/vod/" }, 非常恶心的广告
        { "name": "量子资源", "searchUrl": "https://cj.lziapi.com/api.php/provide/vod/" },
        { "name": "非凡资源", "searchUrl": "http://cj.ffzyapi.com/api.php/provide/vod/" },
        { "name": "ikun资源", "searchUrl": "https://ikunzyapi.com/api.php/provide/vod/from/ikm3u8/at/json/" },
        { "name": "光速资源", "searchUrl": "https://api.guangsuapi.com/api.php/provide/vod/from/gsm3u8/" },
        { "name": "高清资源", "searchUrl": "https://api.1080zyku.com/inc/apijson.php/" },
        // { "name": "飞速资源", "searchUrl": "https://www.feisuzyapi.com/api.php/provide/vod/" },//经常作妖或者没有资源
        { "name": "红牛资源", "searchUrl": "https://www.hongniuzy2.com/api.php/provide/vod/from/hnm3u8/" },
        // {"name":"天空资源","searchUrl":"https://m3u8.tiankongapi.com/api.php/provide/vod/from/tkm3u8/"},//有防火墙，垃圾
        // { "name": "8090资源", "searchUrl": "https://api.yparse.com/api/json/m3u8/" },垃圾 可能有墙
        { "name": "百度云资源", "searchUrl": "https://api.apibdzy.com/api.php/provide/vod/" },
        // { "name": "酷点资源", "searchUrl": "https://kudian10.com/api.php/provide/vod/" },
        // { "name": "淘片资源", "searchUrl": "https://taopianapi.com/home/cjapi/as/mc10/vod/json/" },
        { "name": "ck资源", "searchUrl": "https://ckzy.me/api.php/provide/vod/" },
        { "name": "快播资源", "searchUrl": "https://caiji.kczyapi.com/api.php/provide/vod/" },
        { "name": "海外看资源", "searchUrl": "http://api.haiwaikan.com/v1/vod/" }, // 说是屏蔽了所有中国的IP，所以如果你有外国的ip可能比较好
        { "name": "68资源", "searchUrl": "https://caiji.68zyapi.com/api.php/provide/vod/" },
        { "name": "188资源", "searchUrl": "https://www.188zy.org/api.php/provide/vod/" }

        // https://caiji.kczyapi.com/api.php/provide/vod/
        // {"name":"鱼乐资源","searchUrl":"https://api.yulecj.com/api.php/provide/vod/"},//速度太慢
        // {"name":"无尽资源","searchUrl":"https://api.wujinapi.me/api.php/provide/vod/"},//资源少

    ];

    const log = (function() {
        if (_debug) return console.log.bind(console);
        return function() {};
    })();

    function tip(message) {
        XyMessage.info(message)
    }

    //播放按钮
    class PlayBtn {
        constructor() {
            this.element = htmlToElement(`<xy-button type="primary">一键播放</xy-button>`);
            this.element.onclick = async () => {
                this.element.loading = true;
                tip("正在搜索");
                for (let item of searchSource) {
                    let playList = await search(item.searchUrl, getVideoNamev2());
                    if (playList != 0) {
                        this.element.loading = false;
                        let ui = new UI(playList);
                        ui.init();
                        break
                    }
                }
            };
        }

        mount() {
            document.querySelector(isMobi ? ".sub-original-title" : "h1").appendChild(this.element);
        }

    }

    //影视源选择按钮
    class SourceButton {
        constructor(item) {
            this.element = htmlToElement(`<xy-button style="color:#a3a3a3" type="dashed">${item.name}</xy-button>`);
            this.element.onclick = () => {
                switchUrl(item.playList[seriesNum].url);
                document.querySelector(".series-select-space").remove();
                new SeriesContainer(item.playList).init();
            };
        }
        //sources 是[{name:"..资源",playList:[{name:"第一集",url:""}]}]
    }

    //资源列表的container
    class SourceListContainer {
        constructor(sources) {
            this.element = document.querySelector(".sourceButtonList");
            this.sources = sources;
        }

        //渲染资源列表
        async renderList() {
            let videoName = getVideoNamev2();

            let filteredList = await this.filter(videoName);
            this.initList(filteredList);
            /* tip("正在对资源进行测速");
            let sortedList = await this.sort(filteredList);
            this.element.innerHTML = "";
            for (let item of sortedList) {
                let button = new SourceButton(item);
                this.element.appendChild(button.element);
            }
            XyMessage.success("测速完成，排序由快到慢") */
        }

        initList(sources) {
            for (let item of sources) {
                this.element.appendChild(new SourceButton(item).element);
            }
        }

        //搜索后对列表进行过滤
        async filter(name) {
            const r = [];
            for (let item of this.sources) {
                let playList = await search(item.searchUrl, name);
                if (playList !== 0) r.push({ name: item.name, playList });
            }
            return r;
        }

        //对列表添加速度
        async sort(sources) {
            let sortedSource = [];
            for (let item of sources) {
                let tsList = await downloadM3u8(item.playList[0].url);
                let speed = 0;
                if (tsList.length == 0) {
                    log(`没有找到下载链接，请检查`);
                } else {
                    speed = await testSpeed(tsList);
                }
                sortedSource.push({...item, speed});
            }
			sortedSource.sort((a, b) => b.speed > a.speed );
            log("排序完成...");
            log(sortedSource);

            return sortedSource;
        }

    }

    //剧集选择器
    class SeriesButton {
        constructor(name, url, index) {
            this.element = htmlToElement(`<xy-button style="color:#a3a3a3" type="flat">${name}</xy-button>`);
            this.element.onclick = () => {
                seriesNum = index;
                switchUrl(url);
                document.querySelector(".show-series").innerText = `正在播放第${index + 1}集`;
            };
        }
    }

    //剧集选择器的container
    class SeriesContainer {
        constructor(playList) {
            this.element = htmlToElement(`<div class="series-select-space" style="display:flex;flex-wrap:wrap;overflow:scroll;align-content: start;"></div>`);
            this.playList = playList;
        }

        init() {
            for (let [index, item] of this.playList.entries()) {
                let button = new SeriesButton(item.name, item.url, index);
                this.element.appendChild(button.element);
            }
            document.querySelector(".playSpace").appendChild(this.element);
        }
    }

    class UI {
        constructor(playList) {
            this.element = htmlToElement(`
            <div class="liu-playContainer">
                <a class="liu-closePlayer">关闭界面</a>
                <div class="sourceButtonList"></div>
				  <div class="playSpace" style="margin-top:1em;width:100%">
					<div class="artplayer-app"></div>
				  </div>
                <div class="show-series" style="color:#a3a3a3"></div>
                <p style="color:#a3a3a3">默认会播放第一个搜索到的资源，如果无法播放请尝试切换其他资源，与此同时脚本正在疯狂测速，测速完成后排序第一的资源即为最快。</p>
                <p style="color:#a3a3a3" >部分影片选集后会出现卡顿，点击播放按钮或拖动一下进度条即可恢复。</p>
                <a href="http://memos.babelgo.cn/m/1" target="_blank" style="color:#4aa150">🥹支持开发者</a>
            </div>
			`);
            this.playList = playList;
        }

        init() {
            document.body.appendChild(this.element)
            .querySelector(".liu-closePlayer").onclick = () => {
                this.element.remove();
            };
            //第n集开始播放
            log(this.playList[seriesNum].url);
            initArt(this.playList[seriesNum].url);
            new SeriesContainer(this.playList).init();
            new SourceListContainer(searchSource).renderList();
        }
    }

    //初始化播放器
    function initArt(url) {
        art = new Artplayer({
            container: ".artplayer-app",
            url, setting: true,
            fullscreen: true,
            airplay: true,
            playbackRate: true,
            autoSize: true,
            customType: {
                m3u8(e, url) {
					if (!this.shaka) this.shaka = new shaka.Player(e);
					this.shaka.load(url);
					log(this, 'load:\n'+ url);
                }
            }
        });
		art.controls.add({
			name: "resolution",
			html: "分辨率",
			position: "right",
		});
		art.once('destroy', () => art.shaka.destroy());
        art.on("video:loadedmetadata", () => {
            art.controls["resolution"].innerText = art.video.videoHeight + "P";
        });
        log(art)
    }

    function switchUrl(url) {
        art.switchUrl(url);
    }

    //获取豆瓣影片名称
    function getVideoNamev2() {
        videoName = isMobi ? document.querySelector(".sub-title").innerText : document.title.slice(0, -5);
        return videoName;
    }

    function getVideoYear(outYear) {
        try {
            return document.querySelector(isMobi ? ".sub-original-title" : ".year").innerText.includes(outYear);
        } catch (e) {
            log("获取年份失败，请检查！");
        }
        return 0;
    }

    //到电影网站搜索电影
    function search(url, videoName) {
        log(`正在搜索${videoName}`)
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: encodeURI(`${url}?ac=detail&wd=${videoName}`),
                timeout: 3000,
				responseType: 'json',
                onload(r) {
                    try {
                        resolve(handleResponse(r.response, videoName));
                    } catch (e) {
                        log("垃圾资源，解析失败了，可能有防火墙");
                        log(e);
                        resolve(0)
                    }

                },
                onerror(error) {
                    resolve(0)
                },
                ontimeout(out) {
                    resolve(0)
                }
            });
        });
    }

    //处理搜索到的结果:从返回结果中找到对应片子
    function handleResponse(r) {
        if (!r || r.list.length == 0) {
            log("未搜索到结果");
            return 0
        }
        let video, found = false;
        for (let item of r.list) {
            log("正在对比剧集年份");
            let yearEqual = getVideoYear(item.vod_year);
            if (yearEqual === 0) return 0;
            if (yearEqual) {
                video = { ...item };
                found = true;
                break
            }
        }
        if (found == false) {
            log("没有找到匹配剧集的影片，怎么回事哟！");
            return 0
        }

        let videoName = video.vod_name;
        let playList = video.vod_play_url.split("$$$").filter(str => str.includes("m3u8"));
        if (playList.length == 0) {
            log("没有m3u8资源，无法测速，无法播放");
            return 0
        }
        playList = playList[0].split("#");
        playList = playList.map(str => {
            let index = str.indexOf("$");
            return { "name": str.slice(0, index), "url": str.slice(index + 1) }
        })

        return playList
    }

    //获取下载的内容
    function gm_download(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: encodeURI(url),
                timeout: 3000,
                onload(r) {
                    resolve(r.response)
                },
                onerror(e) {
                    resolve("html")
                },
                ontimeout(o) {
                    resolve("html")
                }
            })
        })
    }

    //下载m3u8的内容，返回片段列表
    async function downloadM3u8(url) {
        let domain = url.split("/")[0];
        let baseUrl = url.split("/")[2];
        let downLoadList = [];
        log(`正在获取index.m3u8 ${url}`);
        let downloadContent = await gm_download(url);

        if (downloadContent.includes("html")) {
            log(`下载失败，被反爬虫了`);
            return []
        }

        if (downloadContent.includes("index.m3u8")) { //如果是m3u8地址
            let lines = downloadContent.split("\n");
            for (let item of lines) {
                if (/^[#\s]/.test(item)) continue; //跳过注释和空白行
                if (/^\//.test(item)) {
                    downLoadList = await downloadM3u8(domain + "//" + baseUrl + item)
                } else if (/^(http)/.test(item)) {
                    downLoadList = await downloadM3u8(item)
                } else {
                    downLoadList = await downloadM3u8(url.replace("index.m3u8", item))
                }
            }
        } else {//如果是ts地址
            let lines = downloadContent.split("\n");
            for (let item of lines) {
                if (/^[#\s]/.test(item)) continue;
                if (/^(http)/.test(item)) {//如果是http直链
                    downLoadList.push(item)
                } else if (/^\//.test(item)) { //如果是绝对链接
                    downLoadList.push(domain + "//" + baseUrl + item)
                } else {
                    downLoadList.push(url.replace("index.m3u8", item))
                }
            }
        }
        log(`测试列表为${downLoadList}`);
        return downLoadList
    }

    //测试下载速度
    async function testSpeed(list) {
        const downloadList = list.slice(-4);
        let downloadSize = 0;
        const startTime = Date.now();

        for (const item of downloadList) {
            log("正在下载" + item);
            const r = await makeGetRequest(item);
            log(r);
            downloadSize += r.byteLength >> 10;
        }

        let duration = (Date.now() - startTime) / 1000;
        let speed = downloadSize / duration;
        if (speed == NaN) speed = 0;
        log(`速度为${speed}KB/s`);
        return speed
    }

    //将GM_xmlhttpRequest改造为Promise
    function makeGetRequest(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                timeout: 5000,
                url: encodeURI(url),
                responseType: "arraybuffer",
                onload(r) {
                    resolve(r.response);
                },
                onerror(error) {
                    resolve({ "byteLength": 0 })
                },
                ontimeout(out) {
                    log("不行啊，速度太慢了")
                    resolve({ "byteLength": 0 })
                }
            });
        });
    }

    function main() {
		// addScript();
        GM_addStyle(css);
        new PlayBtn().mount();
    }

    main();
})();