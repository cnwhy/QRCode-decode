var qrcodeDecode = require('../browser')
console.log(1111)
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
		qrcodeDecode.decodeByUrl(src,function(err,txt){
			var msg = document.createElement("div")
			if(err){
				console.log(err);
				msg.innerHTML = "err: <br>" + err;
			}else{
				msg.innerHTML = txt;
			}
			document.body.appendChild(msg);
		})

	});

	//el.outerHTML = el.outerHTML;
}
