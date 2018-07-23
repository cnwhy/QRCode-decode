
var decode = require('./src/QRCodeDecode');
var decodeByDom = function (dom) {
	var canvas = document.createElement("canvas")
	var ctx = canvas.getContext('2d')
	canvas.width = dom.width;
	canvas.height = dom.height;
	ctx.drawImage(dom, 0, 0, canvas.width, canvas.height);
	var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	return decode(data)
}

var decodeByUrl = (src, cb) => {
	var img = new Image();
	img.crossOrigin="anonymous";
	img.src = src;
	img.onload = function () {
		try {
			cb(null, decodeByDom(img));
		} catch (e) {
			cb(e);
		}
	}
	img.onerror = cb;
}

module.exports = {
	decodeByImageDate: decode,
	decodeByDom: decodeByDom,
	decodeByUrl: decodeByUrl
}