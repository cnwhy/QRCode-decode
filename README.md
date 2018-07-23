# qrcode-decode
解密/识别 QRCode码

说明: 主要的二维码识别代码整理自 [jsqrcode](https://github.com/LazarSoft/jsqrcode);

**修改点:**  
1. 模块化
2. 剥离识别函数,改成适合服务端使用,但入参数还是保留为[ImageData](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData)

**关于 `ImageData`** 
> `Canvas` 中可以用 `ctx.getImageData` 方法得到;  

如果你不想亲自把图片转为 `ImageData`, 根据你你的项目, 请使用这两个JS:
- `browser.js` 浏览器项目 有两个API `decodeByUrl`, `decodeByDom`
- `server.js` 服务端项目 提供两个API `decodeByPath`, `decodeByBuffer` 
> 服务端当前支持 `bmp` , `jpg` , `png` , `gif` 格式;

## install
```
npm i qrcode-decode
```

## import 
```js
var qrDecode = require('qrcode-decode');
//web
var qr_web = require('qrcode-decode/browser')
//node
var qr_node = require('qrcode-decode/server')

var text = qrDecode(dataImage);
```
> 浏览器直接引用请使用 `./dist` 目录下的文件

## demo
### web
> web端最终是利用`Canvas`获取`ImageData`, 注意兼容及跨域问题 
```js
var qrcodeDecode = require('qrcode-decode/browser');
// 传入二维码图片URL/dataURL
qrcodeDecode.decodeByUrl(src, function (err, txt) {
	if (err) { return console.log(err);}	
	alert(txt);
})

// 传入DOM可以画到canvas的dom都可以 `img` `canvas` 'video' 等
var img = document.getElementById('img1');
qrcodeDecode.decodeByDom(img, function (err, txt) {
	if (err) { return console.log(err);}	
	alert(txt);
})
```

### nodejs
> 注意: 服务器端API是以 `promise` 返回结果, 你注意你的`node`版本;
```js
//解析文件
var qrcodeDecode = require('qrcode-decode/server');
qrcodeDecode.decodeByPath('xx/code.jpg').then(function(val){
	console.log(val);
},console.error.bind(console))

//解析Buffer
fs.readFile(path, function (err, buffer) {
	if (err) { return rej(err) }
	resqrcodeDecode.decodeByBuffer(buffer);
})

```
