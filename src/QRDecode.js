var Detector = require('./lib/Detector');
var Decoder = require('./lib/Decoder');
var debug = false;


/**
 * 返回获取指定位置的灰度的函数
 * @param {ImageData} data 
 * @param {Object} base 一个有width,height信息
 */
var Pixel = function (data,base) {
	return function(x,y){
		if (base.width < x || base.height < y) {
			throw "point error";
		}
		var point = (x * 4) + (y * base.width * 4)
		return (data[point] * 33.33 + data[point + 1] * 33.33 + data[point + 2] * 33.33) / 100;
	}
}

var binarize = function(data,base,th){
	var ret = new Array(base.width * base.height);
	var getPixel = Pixel(data,base); //
    for (var y = 0; y < base.height; y++) {
        for (var x = 0; x < base.width; x++) {
            var gray = getPixel(x, y);
            ret[x + y * base.width] = gray <= th ? true : false;
        }
    }
    return ret;
}

var grayscale = function(data,base) {
    var buff = new ArrayBuffer(base.width * base.height);
    var ret = new Uint8Array(buff);
    //var ret = new Array(base.width*base.height);
	var getPixel = Pixel(data,base);
    for (var y = 0; y < base.height; y++) {
        for (var x = 0; x < base.width; x++) {
            var gray = getPixel(x, y);
            ret[x + y * base.width] = gray;
        }
    }
    return ret;
}

var getMiddleBrightnessPerArea = function (image,base) {
    var numSqrtArea = 4;
    //obtain middle brightness((min + max) / 2) per area
    var areaWidth = Math.floor(base.width / numSqrtArea);
    var areaHeight = Math.floor(base.height / numSqrtArea);
    var minmax = new Array(numSqrtArea);
    for (var i = 0; i < numSqrtArea; i++) {
        minmax[i] = new Array(numSqrtArea);
        for (var i2 = 0; i2 < numSqrtArea; i2++) {
            minmax[i][i2] = new Array(0, 0);
        }
    }
    for (var ay = 0; ay < numSqrtArea; ay++) {
        for (var ax = 0; ax < numSqrtArea; ax++) {
            minmax[ax][ay][0] = 0xFF;
            for (var dy = 0; dy < areaHeight; dy++) {
                for (var dx = 0; dx < areaWidth; dx++) {
                    var target = image[areaWidth * ax + dx + (areaHeight * ay + dy) * base.width];
                    if (target < minmax[ax][ay][0])
                        minmax[ax][ay][0] = target;
                    if (target > minmax[ax][ay][1])
                        minmax[ax][ay][1] = target;
                }
            }
            //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
        }
    }
    var middle = new Array(numSqrtArea);
    for (var i3 = 0; i3 < numSqrtArea; i3++) {
        middle[i3] = new Array(numSqrtArea);
    }
    for (var ay = 0; ay < numSqrtArea; ay++) {
        for (var ax = 0; ax < numSqrtArea; ax++) {
            middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
            //Console.out.print(middle[ax][ay] + ",");
        }
        //Console.out.println("");
    }
    //Console.out.println("");

    return middle;
}

var grayScaleToBitmap = function (image,base) {
    var middle = getMiddleBrightnessPerArea(image,base);
    var sqrtNumArea = middle.length;
    var areaWidth = Math.floor(base.width / sqrtNumArea);
    var areaHeight = Math.floor(base.height / sqrtNumArea);

    var buff = new ArrayBuffer(base.width * base.height);
    var bitmap = new Uint8Array(buff);

    //var bitmap = new Array(base.height*base.width);

    for (var ay = 0; ay < sqrtNumArea; ay++) {
        for (var ax = 0; ax < sqrtNumArea; ax++) {
            for (var dy = 0; dy < areaHeight; dy++) {
                for (var dx = 0; dx < areaWidth; dx++) {
                    bitmap[areaWidth * ax + dx + (areaHeight * ay + dy) * base.width] = (image[areaWidth * ax + dx + (areaHeight * ay + dy) * base.width] < middle[ax][ay]) ? true : false;
                }
            }
        }
    }
    return bitmap;
}

function decode(imageDate,debugfn){
	var base = {
		width: imageDate.width,
		height: imageDate.height,
		debugfn: debugfn
	}
	return process(imageDate.data,base)
}

var process = function (data,base) {
    // var start = new Date().getTime();
    // var image = grayScaleToBitmap(grayscale(),base);
    // var image = binarize(128);
	var image = binarize(data,base,153); //转为位图;
	
	debug &&  base.debugfn && base.debugfn(image,base.width);

	// 位图转为QR矩阵
    var detector = new Detector(image,base);
    var qRCodeMatrix = detector.detect();

    if (debug, base.debugfn) {
		var _imgdata = [];
        for (var y = 0; y < qRCodeMatrix.bits.Height; y++) {
            for (var x = 0; x < qRCodeMatrix.bits.Width; x++) {
				_imgdata.push(qRCodeMatrix.bits.get_Renamed(x, y) ? true : 0)
            }
		}
		debugfn(_imgdata,qRCodeMatrix.bits.Width);
    }

	// 解析QR矩阵
    var reader = Decoder.decode(qRCodeMatrix.bits);
    // console.log(reader);
    var data = reader.DataByte;
    var str = "";
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++)
            str += String.fromCharCode(data[i][j]);
    }

    // var end = new Date().getTime();
    // var time = end - start;
    // console.log("Time:" + time + " Code: "+str);
    return str;
}

module.exports = decode;