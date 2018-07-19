var BmpDecode = require('bmp-js/lib/decoder');

module.exports = function(buff){
	var bmp = BmpDecode(buff);
	var abgr = bmp.data;
	var data = [];
	var max = abgr.length/4;
	for(var i = 0; i<max; i++){
		var s = i*4;
		data.push(abgr[s+3],abgr[s+2],abgr[s+1],255)
	}
	return {
		width: bmp.width,
		height: bmp.height,
		data : data
	}
}