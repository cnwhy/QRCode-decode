var jpg = require('./jpg');
var jpgDecode = new jpg.JpegDecoder();
var pngDecode = require('./png').decode;
var bmpDecode = require('./bmp');
var gifDecode = require('./gif').decode;
var gif1Decode = require('./gif.1').decode;

exports.bmp = function (buffer) {
	// return new Promise(function (res, rej) {
	// 	res(bmpDecode(buffer));
	// })
	return bmpDecode(buffer);
};

exports.jpg = function (buffer) {
	// return new Promise(function (res, rej) {
	// 	jpgDecode.parse(buffer);
	// 	res(jpgDecode.getImageData());
	// })
	jpgDecode.parse(buffer);
	return jpgDecode.getImageData();
}

exports.png = function (buffer) {
	// return new Promise(function (res, rej) {
	// 	var png = pngDecode(buffer);
	// 	res({
	// 		data: png.data,
	// 		width: png.width,
	// 		height: png.height
	// 	});
	// })
	var png = pngDecode(buffer);
	return {
		data: png.data,
		width: png.width,
		height: png.height
	};
}

exports.gif = function (data) {
	// return new Promise(function (res, rej) {
	// 	var gif = gifDecode(data);
	// 	res(gif.images);
	// })
	var gif = gifDecode(data);
	return gif.images;

}

exports.gif1 = function (data) {
	// return new Promise(function (res, rej) {
	// 	var gif = gifDecode(data);
	// 	res(gif.images);
	// })
	var gif = gif1Decode(data);
	return gif.images;

}