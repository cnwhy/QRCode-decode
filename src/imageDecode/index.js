var jpg = require('./jpg');
var jpgDecode = new jpg.JpegDecoder();
var upng = require('./png');
var bmpDecode = require('./bmp');
var gifDecode = require('./gif').decode;


exports.bmp = function (buffer) {
	return bmpDecode(buffer);
};

exports.jpg = function (buffer) {
	jpgDecode.parse(buffer);
	return jpgDecode.getImageData();
}

exports.png = function (buffer) {
	var png = upng.decode(buffer);
	var datas = upng.toRGBA8(png);
	var images = [];
	datas.forEach(function(v){
		images.push({
			width:png.width,
			height:png.height,
			data:new Uint8Array(v),
		})
	})
	return images;
}

exports.gif = function (data) {
	var gif = gifDecode(data);
	return gif.images;

}