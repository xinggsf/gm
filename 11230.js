-function() {
function Overload(fn_objs) {
	var is_match = function (x, y) {
		if (x == y) return !0;
		if (x.indexOf("*") == -1) return !1;

		var x_arr = x.split(","),
		y_arr = y.split(",");
		if (x_arr.length != y_arr.length) return !1;
		while (x_arr.length) {
			var x_first = x_arr.shift(),
			y_first = y_arr.shift();
			if (x_first != "*" && x_first != y_first) return !1;
		}
		return !0;
	};
	var ret = function () {
		var args = arguments,
		args_len = args.length,
		args_types = [],
		args_type,
		fn_objs = args.callee._fn_objs,
		match_fn = function () {};

		for (var i = 0; i < args_len; i++) {
			var type = typeof args[i];
			type == "object" && (args[i].length > -1) && (type = "array");
			args_types.push(type);
		}
		args_type = args_types.join(",");
		for (var k in fn_objs) {
			if (is_match(k, args_type)) {
				match_fn = fn_objs[k];
				break;
			}
		}
		return match_fn.apply(this, args);
	};
	ret._fn_objs = fn_objs;
	return ret;
}
String.prototype.format = Overload({
	"array" : function (params) {
		var reg = /{(\d+)}/gm;
		return this.replace(reg, function (match, key) {
			return params[~~key];
		});
	},
	"object" : function (param) {
		var reg = /{([^{}]+)}/gm;
		return this.replace(reg, function (match, key) {
			return param[key];
		});
	}
});
if (typeof String.prototype.startsWith !== 'function') {
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) === str;
	};
	String.prototype.endsWith = function (str){
		return this.slice(-str.length) === str;
	};
}
/*
Object.prototype.extend = function(obj){
	for (var i in obj) {
		//obj.hasOwnProperty(i) &&
		(this[i] = obj[i]);
	}
};*/
}();