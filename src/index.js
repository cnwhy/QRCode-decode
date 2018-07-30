var jsqr = require('jsqr');
module.exports = function(imageData){
	return jsqr(imageData.data,imageData.width,imageData.height).data;
}