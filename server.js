var fs = require('fs')
var imgDecode = require('./src/imageDecode')
var imgType = require('image-type')
var qrDecode = require('./')
// var jpg = require('./src/imageDecode/jpg');


function decode(buffer) {
	var type;
	return new Promise(function (res, rej) {
		type = (imgType(buffer) || {}).ext;
		switch (type) {
			case 'bmp':
				res(imgDecode.bmp(buffer));
				break;
			case 'jpg':
				res(imgDecode.jpg(buffer));
				break;
			case 'png':
				res(imgDecode.png(buffer));
				break;
			case 'gif':
				// var t1 = Date.now();
				res(imgDecode.gif1(buffer));
				// console.log('gif: ',Date.now() - t1);
				break;
			default:
				if (type) {
					throw 'Support for this type! type as ' + type
				}
				throw 'not image!'
		}
	}).then(function (imageData) {
		if (type == 'gif') {
			return new Promise(function (res, rej) {
				var errList = [];
				var images = imageData;
				var onerr = function (e) {
					errList.push(e);
					if (errList.length < images.length) return;
					rej('解码失败!')
				}
				// console.log('length',imageData.length)
				if (imageData.length <= 0) {
					rej('解码失败!')
				} else if (imageData.length > 3) {
					images = [];
					var l = 1;
					var i = 0;
					while ( Math.pow(2,++l) < imageData.length){
					}
					// console.log('l:',l)
					var sp = (imageData.length-1)/l;
					// console.log('sp:',sp)
					do{
						// console.log(Math.floor(i*sp));
						images.push(imageData[Math.floor(i*sp)])
					}while(i++<l)
				}
				// console.log(images.length)
				images.forEach(function (v) {
					setTimeout(function () {
						try {
							res(qrDecode(v));
						} catch (e) {
							console.log(e);
							onerr(e)
						}
					}, 0)
				})
			})
		}
		return qrDecode(imageData);
	})
}
exports.decodeQRFile = function (path) {
	return new Promise(function (res, rej) {
		fs.readFile(path, function (err, buffer) {
			if (err) { return rej(err) }
			res(decode(buffer));
		})
	})
}

exports.decode = decode;