var imgDecode = require('../server')
var path = require('path');
var dir = __dirname;
// console.log(path);
var P = function (p) {
	return path.join(__dirname, p);
}

var _test = function (path, mark) {
	return imgDecode.decodeByPath(P(path))
}

var max = 100
async function test_time(path, mark) {
	var t = Date.now();
	for (var i = 0; i < max; i++) {
		await _test(path, mark);
	}
	console.log(mark + ' 100次 : ', Date.now() - t,' ms');
}

// var test = test_time;

var test = function (path, mark) {
	return _test(path, mark)
		.then(console.log.bind(console, mark + ': '))
		.then(function () {
			return test_time(path, mark);
		},console.error.bind(console, mark + ':'))
};

Promise.resolve()
	.then(function () { return test('./img/16.bmp', 'bmp16 ') })
	.then(function () { return test('./img/24.bmp', 'bmp24 ') })
	.then(function () { return test('./img/32.bmp', 'bmp32 ') })
	.then(function () { return test('/img/lx.jpg', 'jpg_lx') }) //jpg 连续
	.then(function () { return test('/img/yh.jpg', 'jpg_yh') }) //jpg 优化
	.then(function () { return test('./img/8.png', 'png8  ') })
	.then(function () { return test('./img/24.png', 'png24 ') })
	.then(function () { return test('./img/jt.gif', 'gif_jt') }) //单帧
	.then(function () { return test('./img/dt.gif', 'gif_dt') }) //多帧

