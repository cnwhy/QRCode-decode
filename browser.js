
var qrDecode = require('./src/QRDecode');
var decodeByDom = function (dom) {
	var canvas = document.createElement("canvas")
	var ctx = canvas.getContext('2d')
	var isVideo = dom.tagName == 'VIDEO'
	canvas.width = isVideo ? dom.videoWidth : dom.width;
	canvas.height = isVideo ? dom.videoHeight : dom.height;
	ctx.drawImage(dom, 0, 0, canvas.width, canvas.height);
	var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	return qrDecode(data)
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

qrDecode.decodeByDom = decodeByDom;
qrDecode.decodeByUrl = decodeByUrl;
module.exports = qrDecode;