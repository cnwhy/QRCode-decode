var qrcodeDecode = require('../')

document.getElementById('file').onchange = function (event) {
	var el = event.target;
	if (!el.files.length) return;
	// console.log(el.files[0]);
	var file = el.files[0];
	new Promise(function (ok, no) {
			/* if(window.URL && window.URL.createObjectURL){ //缓存预览
				ok(window.URL.createObjectURL(file));
			}else  */ 
		if (typeof FileReader) {
			//urldata预览
			var reader = new FileReader();
			reader.onload = evt => {
				ok(evt.target.result);
			};
			reader.readAsDataURL(file);
		} else {
			ok();
		}
	}).then((src)=>{
		var img = new Image();
		img.src = src;
		img.onload = function(){
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext('2d');
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img,0,0,canvas.width,canvas.height)
			//inputimg.src = src;
			//qrcode.decode(src);
			var imageData = ctx.getImageData(0,0,canvas.width,canvas.height)
			alert(qrcodeDecode(imageData));
		}

	});

	//el.outerHTML = el.outerHTML;
}
