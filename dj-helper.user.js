// ==UserScript==
// @name           DJ轮回网助手
// @namespace      xinggsf.DJ
// @author	       xinggsf
// @description    一键点赞；一键留言板或回复；群发私信；全站广告拦截；美化DJ轮回网歌曲播放页面
// @license        GPL version 3
// @include        https://www.dj96.com/*
// @homepageURL    https://greasyfork.org/scripts/6562
// @updateURL      https://raw.githubusercontent.com/xinggsf/gm/master/dj-helper.user.js
// require        http://static92cc.db-cache.com/js/jquery/jquery.min.js
// @version        2.0.1
// @grant          none
// ==/UserScript==

/*
http://www.dj92cc.net/index.php/ajax/dance_user?&did=17795&keyHash=&type=0
$.JSON {file_path}
http://mp4db.dj92cc.net/m4a/${file_path}.m4a
http://2.news.idophoto.com.cn/m4a/${file_path}.m4a
*/
const utils = function () {
	let frList = [],
	page = 1,
	frCount = 0,
	failGetList = false,
	timer = null,
	queue = [],

	argQueue = [],//带参数定时执行的post,也是参数数组
	tempTimes = 100;
	wallTalks = ['顶！',
		'嗨曲得赞！',
		'飘过！',
		'一个好字都不能形容！',
		'过来打酱油！',
		'真嗨！',
		'天籁之音！',
		'太好听了！',
		'你的DJ打制得太好了！',
		'赞！赞！赞！',
		'赞不绝口！',
		'不得不赞！',
		'不得不顶！',
		'听得太投入了，不知说什么！',
		'此曲只应天上有！',
		'听觉享受的极致！',
		'美不胜听！',
		'神曲！',
		'乐陶陶！',
		'收藏了！',
		'听得陶醉了！',
		'飘洋过海来听曲。'
	],
	publicUtils = {
		praiseAllFriend: () => {
			if ($.cookie('praiseAll')) {
				$.tipMessage('今天已点赞！', 1, 3000);
				return;
			}
			getFriendList();
            post(doPraise,{timer: 500});
			$.tipMessage('正在点赞！请不要离开或刷新本页面......', 0, 3000);
		},
		sendAllInfo: () => {
			try {
				if ($.cookie('smsAll'))
					throw new Error('每天只能群发一次！');
				var s = $("div[contenteditable='true']:visible");
				if (!s.length)
					throw new Error('请到留言框或发信框输入内容！');
				s = $.trim(s.emotEditor("content"));
				if (!s.length)
					throw new Error('信件必须有内容！');
			} catch (e) {
				$.tipMessage(e.message, 1, 2000);
				return;
			}
			if (!confirm('你要发出的信件内容如下，确定则发送\n' + s))
				return;

			//s = '嗨友必备眩酷神器\n﻿﻿ https://greasyfork.org/zh-CN/scripts/6562\n' + s;
			getFriendList();
			$.cookie('smsAll', true);
			s = post(doSendInfo, {content: s}) ?
				'正在发送私信！请不要离开或刷新本页面...' :
				'还有私信未发送完，请稍候再发';
			$.tipMessage(s, 0, 3000);
		},
		wallAllFriend: () => {
			try {
				if ($.cookie('wallAll'))
					throw new Error('每天只能群发一次留言！');
				var x, s = null;
				if (confirm('自己发言请到留言框或发信框输入内容，点“确定”。\n' +
							'点“取消”则每个发言都随机使用21组赞美词！'))
				{
					s = $("div[contenteditable='true']:visible");
					if (!s.length)
						throw new Error('请到留言框或发信框输入内容！');
					s = $.trim(s.emotEditor("content"));
					if (!s.length)
						throw new Error('留言不能为空！');
					if (s.length > 300)
						throw new Error('留言长度不能超过300！');
				}
			} catch (e) {
				$.tipMessage(e.message, 1, 2000);
				return;
			}
			getFriendList();
			$.cookie('wallAll', true);
			post(doWall, {content: s, timer: 15000});
			$.tipMessage('正在留言！因网站计时，故延时留言！请不要离开或刷新本页面...', 0, 3000);
		},
		replyAllWall: () => {
			var r, c, uid, s = '/wall?a=wall';
			if (location.pathname.indexOf(s) === -1) {
				confirm('必须导航到留言板，确定吗？') && (location.href = s);
				return;
			}
			try {
				c = $(".wallItem + div:empty");
				if (!c.length)
					throw new Error('没有要回复的留言！');
				s = $("div[contenteditable='true']:visible");
				if (!s.length)
					throw new Error('请在回复框输入统一回复的内容！');
				s = $.trim(s.emotEditor("content"));
				if (!s.length)
					throw new Error('回复不能为空！');
			} catch (e) {
				$.tipMessage(e.message, 1, 2000);
				return;
			}
			//取自身uid,href属性为/32424/样式，slice函数去除头尾斜杠
			uid = $('#userInfo').parent().attr('href').slice(1, -1);
			c.each(function(i, t){
			//t: this,$(this),$(t)
				//console.dir(t);
				//r = $(t).find('#wallcontSubmit');
				//r = r.attr('onclick');
				//r = t.innerHTML.match(/wallLib\.confirmWall\((\d+), (\d+)\)/);
				r = t.id.substring(11);//[id^='wallComment']
				r && postArgs("/wall?a=doWallCommentAdd", {
					"wid": r, "content": s, "uid": uid //"replayUser": x,
				}, "text");
				return i < 5;//每天五条
			});
		},
		replyWall_Del() {
			var r, c, uid, wid, s = '/wall?a=wall';
			if (location.pathname.indexOf(s) === -1) {
				confirm('必须导航到留言板，确定吗？') && (location.href = s);
				return;
			}
			try {
				s = $("div[contenteditable='true']:visible");
				if (!s.length)
					throw new Error('请在回复框输入一齐回复的内容！');
				s = $.trim(s.emotEditor("content"));
				if (!s.length)
					throw new Error('回复不能为空！');
			} catch (e) {
				$.tipMessage(e.message, 1, 2000);
				return;
			}
			uid = $('#userInfo').parent().attr('href').slice(1, -1);
 			c = $(".wallItem + div");
			c.each(function(i, t){
				wid = t.id.substring(11);
				r = t.innerHTML.match(/wallLib\.doDelWall\(0, \d+, (\d+),/);
				r && $.post("/wall?a=doWallDel&currPage=1", {
					'wid': wid, 'cid': r[1], showType: 0
				}, "text");
				$.post("/wall?a=doWallCommentAdd", {
					"wid": wid, "content": s, "uid": uid
				}, "text");
				return i < 5;//每天五条
			});
		},
		praiseInpage() {
			var s, tm, a = [], n=0;
			getFriendList();
/* 			c = $.cookie('viewUids').split('_');
			a = $('body').html.match(/uid="(\d+)"/g);
			a = $('a.user_card').map(function(){
				return this.getAttribute('href').slice(1, -1);
			}).get();//get转化为基础数组
			a = unique(a); */
			$('a.user_card').each(function(){
				s = this.href.slice(1, -1);
				a.indexOf(s) === -1 && //c.indexOf(s) === -1 &&
				a.push(s);
			});
			if (!a.length) return;
			tm = setInterval(function() {
				if (failGetList || !a.length) {
					clearInterval(tm);
					if (n) $.tipMessage('共点赞 '+ n +' 人！', 0, 3000);
					return;
				}
				if (frCount > frList.length) return;//等待取完列表
				while (s = a.pop()) {
					if (frList.indexOf(s) === -1) {
						$.post("/user?a=doUserPraiseUpdate&uid="+s);
						n++;
						break;
					}
				}
			}, 200);
			//console.log(a.join());
		},
		init() {
			timer && unInit();
			timer = setInterval(this.onRunQueue.bind(this), 100);
		},
		unInit() {
			clearInterval(timer);
			timer = null;
		}
	};

	function unique(a) {
		var o = {}, r = [];
		a.forEach(function (t) {
			if (!o[t]) {
				o[t] = true;
				r.push(t);
			}
		});
		return r;
	}
	//随机返回数组中的一项值
	function randomArr(a) {
		//var n = Math.floor(Math.random() * a.length);
		var n = Math.random() * a.length;
		return a[~~n];
	}
	function post(fn, data) {
		//不允许重复任务
		//typeof(fn) === 'string' && (fn = this[fn]);
		if (queue.some(e => e.run === fn ) return !1;
		data = data || {};
		data.run = fn;
		data.timer && (data.timerc = data.timer);
		data.index = data.index || 0;
		queue.unshift(data);//方便后面倒序遍历
		//console.dir(data);
		return true;
	}
	function postArgs() {
		//argQueue.push(Array.prototype.slice.call(arguments));
		var a = (tempTimes && tempTimes > 100) ? [tempTimes] : [];
		a.push.apply(a, arguments);
		argQueue.push(a);
	}
	function makeTask(times) {
		tempTimes = times || null;
	}
	function onRunQueue() {
		var data, i = queue.length - 1;
		for (; i >= 0; i--) {
			data = queue[i];
			if (data.timer) {
				data.timerc += 100;
				if (data.timerc < data.timer)
					continue;
				data.timerc = 0;
			}
			//console.dir(data);
			//args = data.args || null;
			try {
				if (data.run.call(this, data)) {
					//data.onSuccess && data.onSuccess.call(this);
					queue.splice(i, 1);
					continue;
				}
				//data.onEvery && data.onEvery.call(this);
			} catch(e) {
				//data.onError && data.onError.call(this);
			}
		}
		if (argQueue.length) {
			data = argQueue[0];
			i = data[0];
			if (i.length < 6) {//是数字，须计时
				i -= 100;
				if (i > 0) {
					data[0] = i;
					return;
				}
				data.shift();//去除加的计时器
			}
			$.post.apply(this, data);
			argQueue.shift();//argQueue.splice(0,1);
		}
	}
	//解析HTML
	function parseHtml(resp) {
		var s;
		failGetList = false;
		try {
			if (!frCount) {
				s = resp.match(/<em title=\"总数量\" ?>(\d+)<\/em>/);
				if (!s) throw new Error('网络错误或解析失败！');
				frCount = 0 | s[1];
				//console.log(frCount);
				if (!frCount) throw new Error('你没有加关注的朋友！');
			}
			s = resp.match(/\d+(?=\/" +?class="user_card">)/g);
			//s = resp.split(/class="user_card" uid="(\d+)">/g);
			if (!s) throw new Error('网络错误或解析失败！');
		} catch (e) {
			failGetList = true;
			$.tipMessage(e.message, 2, 3000);
			return;
		}
		frList.length? s.push.apply(frList, s) : frList = s;// 第一页则覆盖
		page ++;
		frCount > frList.length ?
			setTimeout($.proxy(getFriendList, this), 1000):
			$.cookie('allFriends', frList.join('_'));
	}
	function getFriendList() {//取关注列表
		var s = $.cookie('allFriends');
		if (s) {
			frList = s.split('_');
			frCount = frList.length;
			return;
		}
		if (!frCount || frCount > frList.length) {
			s = "/relation?a=following";
			page > 1 && (s += "&currPage=" + page);
			//$.get(s, parseHtml.bind(this), "html");
			$.get(s, $.proxy(parseHtml, this), "html");
		}
	}
	function ajaxTemple(data, url, tip, pack) {
		var i = data.index;
		if (i < frList.length) {//发数据
			if (url) {
				$.post(url, pack);
				data.index++;
			}
			return true;
		}
		if (failGetList || (i && i === frCount)) {//读列表没失败则必须处理完列表
			queue.splice(queue.indexOf(data), 1);//退出计时
			i && $.tipMessage(tip, 0, 3000);
		}
	}
	function doPraise(data) {
		ajaxTemple(data,
			"/user?a=doUserPraiseUpdate&uid="+ frList[data.index],
			'已点赞了你 '+ data.index +' 个朋友！'
		);
	}
	function doSendInfo(data) {
		ajaxTemple(data, "/message?a=doMsgAdd",
			data.index +' 条私信已发出！', {
				"uid": frList[data.index],
				"note": data.content
			}
		);
	}
	function doWall(data) {
		var s, i = data.index;
		if (!ajaxTemple(data,null,i+' 条留言已经贴出！'))
			return;
		s = '/' + frList[i] + '/wall/1/';
		$.get(s, function(resp) {//callback,取uidkey
			var nick, ukey,
			x = resp.match(/wallLib\.wallAddInit\(\d+,\s*'([^']+)'\)\}/);
			ukey = x && x[1];
			if (!ukey) return;
			x = resp.match(/<title>(.+?)的DJ留言空间/);
			nick = x && x[1];
			resp = null;
			x = data.content || randomArr(wallTalks);
			$.cookie('_refer', s);
			$.post("/wall?a=doWallAdd&currPage=1", {
				'wallContent': x,
				'uidkey': ukey
			}, function(d) {
				if (d == 100061 || d == 20015) {
					queue.splice(queue.indexOf(data), 1);
					$.tipMessage('留言受限！操作中断', 2, 5000);
					return;
				}
				x = '给 '+nick+' 留言';
				x += d.length > 9 ? '成功！' : '失败！';
				$.tipMessage(x, 0, 1000);
			}, "text");
		}, "html");
		data.index ++;
	}

	return publicUtils;
}();

-function (doc) {
	let s, x;
	//要删除的元素列表，填入css选择器
	$('.g300,.play_banner,.gg300,.banner').remove();
/* 	x = $('script[src*="/new/recommend/player"]');
	if (x.length) {
		//删除低效的内容生成JS，和可能已经生成的内容
		addr = x.attr('src');
		x = x.parent();//.empty();
		$.get(addr, function (res) {
			s = res.replace(/document\.writeln\("(.+?)"\);/g, '$1')
				.replace(/\\"/g, '\"');
			x.html(s); //替换内容生成JS
			x = null;
			//重新绑定事件
			mPlayer.addList();
			mPlayer.selectDanceAll();
		}, 'text');
	}
 */
	if (/\d+\.html$/.test(location.pathname)) {
		x = $(".play_content > .right_bot");
		$(".play_content > .right").replaceWith(x);
		x.css({
			'right' : '0',
			'float' : 'right'
		});
		x.children(':gt(0)').css('margin-top', '-12px');
		x = null;
		$(".header").css('height', '55px');
		$(".content").css('top', '-15px');
		$(".play_content").css('top', '-9px');
		$(".banner").empty().css('height', '3px');
	}
	if (location.host !== 'i.dj92cc.net') return;

	s = ['.overBtns {background: url("' + _config['domainStatic']
		,'site/images/label.png") no-repeat scroll transparent;\n'
		,'display:block;'
		,'position: fixed;'
		,'z-Index: 9999;'
		,'right: 10px;'
		,'height: 33px;'
		,'width: 33px;}'
	].join('');
	$("<style>").prop("type", "text/css")
		.html(s).appendTo("head");
	//等待登录
	setTimeout(function(){
		if ($.cookie('loginKey').length > 11) {
			$('<a class="overBtns" id="praiseAll" title="一键点赞" href="#" style="top:100px;background-position:-89px 13px;"/>')
				.click(utils.praiseAllFriend).appendTo("body");
			$('<a class="overBtns" id="smsAll" title="群发私信" href="#" style="top:150px;background-position:-89px -36px;"/>')
				.click(utils.sendAllInfo).appendTo("body");
			$('<a class="overBtns" id="wallAll" title="一键留言" href="#" style="top:200px;background-position:-89px -134px;"/>')
				.click(utils.wallAllFriend).appendTo("body");
			$('<a class="overBtns" id="replyAll" title="一键回复留言" href="#" style="top:250px;background-position:-89px -85px;"/>')
				.click(utils.replyAllWall).appendTo("body");
			utils.init();
		}
	}, 300);
}(document);