var imgDecode = require('../server')


imgDecode.decodeQRFile('./img/out.bmp').then(console.log)
imgDecode.decodeQRFile('./img/out.jpg').then(console.log,console.error)
imgDecode.decodeQRFile('./img/out.png').then(console.log,console.error)
imgDecode.decodeQRFile('./img/out.gif').then(console.log,console.error)
imgDecode.decodeQRFile('./img/dt.gif').then(console.log,console.error)
imgDecode.decodeQRFile('./img/dt1.gif').then(console.log,console.error)

//动态img

