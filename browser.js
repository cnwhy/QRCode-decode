var qrDecode = require('./')

var decode =
	exports.decode = function (bom) {
		var canvas = document.createElement("canvas")
		var ctx = canvas.getContext('2d')
		canvas.width = bom.width;
		canvas.height = bom.height;
		ctx.drawImage(bom, 0, 0, canvas.width, canvas.height);
		var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		return qrDecode(data)
	}

exports.decodeByUrl = function (src, cb) {
	var img = new Image();
	img.src = src;
	img.onload = function () {
		try {
			cb(null,decode(img));
		} catch (e) {
			cb(e);
		}
	}
	img.onerror = cb;
}