var fs = require('fs')
var imgType = require('image-type')
var imgDecode = require('./src/imageDecode')
var qrDecode = require('./src/')

/**
 * 通过Buffer识别二维码
 * @param {buufer} buffer 文件的Buffer
 */
function decodeByBuffer(buffer, options) {
	options || (options = {});
	var debug = options.debug;
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
				res(imgDecode.gif(buffer));
				break;
			default:
				if (type) {
					throw 'Support for this type! type as ' + type
				}
				throw 'not image!'
		}
	}).then(function (imageData) {
		//可能有多帧图片处理
		if (type == 'gif' || type == 'png') {
			return new Promise(function (res, rej) {
				var errList = [];
				var images = imageData;
				var onerr = function (e) {
					errList.push(e);
					if (errList.length < images.length) return;
					rej(errList);
				}
				debug && console.log('gif_length: ', imageData.length)
				if (imageData.length <= 0) {
					rej('解码失败!')
				} else if (imageData.length > 5 && !options.allFrames) {
					var l = 1, i = 0, sp;
					images = [];
					while (Math.pow(2, ++l) < imageData.length) {s}
					sp = (imageData.length - 1) / l;
					do {
						images.push(imageData[Math.floor(i * sp)])
					} while (i++ < l)
				}
				debug && console.log('gif_decode_length: ',images.length)
				images.forEach(function (v) {
					setTimeout(function () {
						try {
							res(qrDecode(v));
						} catch (e) {
							debug && console.log(e);
							onerr(e)
						}
					}, 0)
				})
			})
		}
		return qrDecode(imageData);
	})
}

/**
 * 识别二维码图片文件
 * @param {String} path 文件路径
 */
function decodeByPath(path,options) {
	return new Promise(function (res, rej) {
		fs.readFile(path, function (err, buffer) {
			if (err) { return rej(err) }
			res(decodeByBuffer(buffer,options));
		})
	})
}

qrDecode.decodeByBuffer = decodeByBuffer;
qrDecode.decodeByPath = decodeByPath;

module.exports = qrDecode;