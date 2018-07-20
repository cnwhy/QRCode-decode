var imgDecode = require('../server')
var path = require('path');
var dir = __dirname;
// console.log(path);
var P = function (p) {
	return path.join(__dirname, p);
}

var test = function (path, mark) {
	return imgDecode.decodeByPath(P(path))
		.then(console.log.bind(console, mark + ': '), console.error.bind(console, mark + ':'))
}
Promise.resolve()
	.then(function () { test('./img/16.bmp', 'bmp16 ') })
	.then(function () { return test('./img/24.bmp', 'bmp24 ') })
	.then(function () { return test('./img/32.bmp', 'bmp32 ') })
	.then(function () { return test('/img/lx.jpg', 'jpg_lx') }) //jpg 连续
	.then(function () { return test('/img/yh.jpg', 'jpg_yh') }) //jpg 优化
	.then(function () { return test('./img/8.png', 'png8  ') })
	.then(function () { return test('./img/24.png', 'png24 ') })
	.then(function () { return test('./img/jt.gif', 'gif_jt') }) //单帧
	.then(function () { return test('./img/dt.gif', 'gif_dt') }) //多帧

