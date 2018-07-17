识别 QR码 图片  
> 整理自 [jsqrcode](https://github.com/LazarSoft/jsqrcode)

**修改点:**  
1. 模块化
2. 剥离识别函数,改成适合服务端使用 
3. 需要用其它方法把图片转为 `ImageData` 提供给解码函数

**demo web**
```html
<input id="file" type="file">
```

js: 
```js
var qrcodeDecode = require('qrcode-decode');

document.getElementById('file').onchange = function (event) {
	var file = event.target.files[0];
	new Promise(function (ok, no) {
		var reader = new FileReader();
		reader.onload = evt => {
			ok(evt.target.result);
		};
		reader.readAsDataURL(file);
	}).then((src)=>{
		return new Promise(function(ok){
			var img = new Image();
			img.src = src;
			img.onload = function(){
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext('2d');
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img,0,0,canvas.width,canvas.height)
				var imageData = ctx.getImageData(0,0,canvas.width,canvas.height)
				ok(imageData);
			}
		})
	}).then(data => {
		return qrcodeDecode(data);
	}).then(alert);
}
```
