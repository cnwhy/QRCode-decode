var qrcodeDecode = require('../browser')

document.getElementById('file').onchange = function (event) {
	var el = event.target;
	if (!el.files.length) return;
	var file = el.files[0];
	new Promise(function (ok, no) {
		if (window.URL && window.URL.createObjectURL) {
			ok(window.URL.createObjectURL(file));
		} else if (typeof FileReader) {
			var reader = new FileReader();
			reader.onload = evt => {
				ok(evt.target.result);
			};
			reader.readAsDataURL(file);
		} else {
			no('浏览器不支持');
		}
	}).then((src) => {
		qrcodeDecode.decodeByUrl(src, function (err, txt) {
			var msg = document.createElement("div")
			if (err) {
				console.log(err);
				msg.innerHTML = "err: <br>" + err;
			} else {
				msg.innerHTML = txt;
			}
			document.body.appendChild(msg);
		})

	});
}
