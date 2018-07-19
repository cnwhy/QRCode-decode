//https://github.com/shachaf/jsgif

// Generic functions
var bitsToNum = function (ba) {
	return ba.reduce(function (s, n) { return s * 2 + n; }, 0);
};

var byteToBitArr = function (bite) {
	var a = [];
	for (var i = 7; i >= 0; i--) {
		a.push(!!(bite & (1 << i)));
	}
	return a;
};

// Stream
/**
 * @constructor
 */ // Make compiler happy.
var Stream = function (data) {
	this.data = data;
	this.len = this.data.length;
	this.pos = 0;

	this.readByte = function () {
		if (this.pos >= this.data.length) {
			throw new Error('Attempted to read past end of stream.');
		}
		return data.charCodeAt(this.pos++) & 0xFF;
	};

	this.readBytes = function (n) {
		var bytes = [];
		for (var i = 0; i < n; i++) {
			bytes.push(this.readByte());
		}
		return bytes;
	};

	this.read = function (n) {
		var s = '';
		for (var i = 0; i < n; i++) {
			s += String.fromCharCode(this.readByte());
		}
		return s;
	};

	this.readUnsigned = function () { // Little-endian.
		var a = this.readBytes(2);
		return (a[1] << 8) + a[0];
	};
};

var lzwDecode = function (minCodeSize, data) {
	// TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
	var pos = 0; // Maybe this streaming thing should be merged with the Stream?

	var readCode = function (size) {
		var code = 0;
		for (var i = 0; i < size; i++) {
			if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
				code |= 1 << i;
			}
			pos++;
		}
		return code;
	};

	var output = [];

	var clearCode = 1 << minCodeSize;
	var eoiCode = clearCode + 1;

	var codeSize = minCodeSize + 1;

	var dict = [];

	var clear = function () {
		dict = [];
		codeSize = minCodeSize + 1;
		for (var i = 0; i < clearCode; i++) {
			dict[i] = [i];
		}
		dict[clearCode] = [];
		dict[eoiCode] = null;

	};

	var code;
	var last;

	while (true) {
		last = code;
		code = readCode(codeSize);

		if (code === clearCode) {
			clear();
			continue;
		}
		if (code === eoiCode) break;

		if (code < dict.length) {
			if (last !== clearCode) {
				dict.push(dict[last].concat(dict[code][0]));
			}
		} else {
			if (code !== dict.length) throw new Error('Invalid LZW code.');
			dict.push(dict[last].concat(dict[last][0]));
		}
		output.push.apply(output, dict[code]);

		if (dict.length === (1 << codeSize) && codeSize < 12) {
			// If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
			codeSize++;
		}
	}

	// I don't know if this is technically an error, but some GIFs do it.
	//if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
	return output;
};

// The actual parsing; returns an object with properties.
var parseGIF = function (st, handler) {
	handler || (handler = {});

	// LZW (GIF-specific)
	var parseCT = function (entries) { // Each entry is 3 bytes, for RGB.
		var ct = [];
		for (var i = 0; i < entries; i++) {
			ct.push(st.readBytes(3));
		}
		return ct;
	};

	var readSubBlocks = function () {
		var size, data;
		data = '';
		do {
			size = st.readByte();
			data += st.read(size);
		} while (size !== 0);
		return data;
	};

	var parseHeader = function () {
		var hdr = {};
		hdr.sig = st.read(3);
		hdr.ver = st.read(3);
		if (hdr.sig !== 'GIF') throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.

		hdr.width = st.readUnsigned();
		hdr.height = st.readUnsigned();

		var bits = byteToBitArr(st.readByte());
		hdr.gctFlag = bits.shift();
		hdr.colorRes = bitsToNum(bits.splice(0, 3));
		hdr.sorted = bits.shift();
		hdr.gctSize = bitsToNum(bits.splice(0, 3));

		hdr.bgColor = st.readByte();
		hdr.pixelAspectRatio = st.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64

		if (hdr.gctFlag) {
			hdr.gct = parseCT(1 << (hdr.gctSize + 1));
		}
		handler.hdr && handler.hdr(hdr);
	};

	var parseExt = function (block) {
		var parseGCExt = function (block) {
			var blockSize = st.readByte(); // Always 4

			var bits = byteToBitArr(st.readByte());
			block.reserved = bits.splice(0, 3); // Reserved; should be 000.
			block.disposalMethod = bitsToNum(bits.splice(0, 3));
			block.userInput = bits.shift();
			block.transparencyGiven = bits.shift();

			block.delayTime = st.readUnsigned();

			block.transparencyIndex = st.readByte();

			block.terminator = st.readByte();

			handler.gce && handler.gce(block);
		};

		var parseComExt = function (block) {
			block.comment = readSubBlocks();
			handler.com && handler.com(block);
		};

		var parsePTExt = function (block) {
			// No one *ever* uses this. If you use it, deal with parsing it yourself.
			var blockSize = st.readByte(); // Always 12
			block.ptHeader = st.readBytes(12);
			block.ptData = readSubBlocks();
			handler.pte && handler.pte(block);
		};

		var parseAppExt = function (block) {
			var parseNetscapeExt = function (block) {
				var blockSize = st.readByte(); // Always 3
				block.unknown = st.readByte(); // ??? Always 1? What is this?
				block.iterations = st.readUnsigned();
				block.terminator = st.readByte();
				handler.app && handler.app.NETSCAPE && handler.app.NETSCAPE(block);
			};

			var parseUnknownAppExt = function (block) {
				block.appData = readSubBlocks();
				// FIXME: This won't work if a handler wants to match on any identifier.
				handler.app && handler.app[block.identifier] && handler.app[block.identifier](block);
			};

			var blockSize = st.readByte(); // Always 11
			block.identifier = st.read(8);
			block.authCode = st.read(3);
			switch (block.identifier) {
				case 'NETSCAPE':
					parseNetscapeExt(block);
					break;
				default:
					parseUnknownAppExt(block);
					break;
			}
		};

		var parseUnknownExt = function (block) {
			block.data = readSubBlocks();
			handler.unknown && handler.unknown(block);
		};

		block.label = st.readByte();
		switch (block.label) {
			case 0xF9:
				block.extType = 'gce';
				parseGCExt(block);
				break;
			case 0xFE:
				block.extType = 'com';
				parseComExt(block);
				break;
			case 0x01:
				block.extType = 'pte';
				parsePTExt(block);
				break;
			case 0xFF:
				block.extType = 'app';
				parseAppExt(block);
				break;
			default:
				block.extType = 'unknown';
				parseUnknownExt(block);
				break;
		}
	};

	var parseImg = function (img) {
		var deinterlace = function (pixels, width) {
			// Of course this defeats the purpose of interlacing. And it's *probably*
			// the least efficient way it's ever been implemented. But nevertheless...

			var newPixels = new Array(pixels.length);
			var rows = pixels.length / width;
			var cpRow = function (toRow, fromRow) {
				var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
				newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
			};

			// See appendix E.
			var offsets = [0, 4, 2, 1];
			var steps = [8, 8, 4, 2];

			var fromRow = 0;
			for (var pass = 0; pass < 4; pass++) {
				for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
					cpRow(toRow, fromRow)
					fromRow++;
				}
			}

			return newPixels;
		};

		img.leftPos = st.readUnsigned();
		img.topPos = st.readUnsigned();
		img.width = st.readUnsigned();
		img.height = st.readUnsigned();

		var bits = byteToBitArr(st.readByte());
		img.lctFlag = bits.shift();
		img.interlaced = bits.shift();
		img.sorted = bits.shift();
		img.reserved = bits.splice(0, 2);
		img.lctSize = bitsToNum(bits.splice(0, 3));

		if (img.lctFlag) {
			img.lct = parseCT(1 << (img.lctSize + 1));
		}

		img.lzwMinCodeSize = st.readByte();

		var lzwData = readSubBlocks();

		img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData);

		if (img.interlaced) { // Move
			img.pixels = deinterlace(img.pixels, img.width);
		}

		handler.img && handler.img(img);
	};

	var parseBlock = function () {
		var block = {};
		block.sentinel = st.readByte();

		switch (String.fromCharCode(block.sentinel)) { // For ease of matching
			case '!':
				block.type = 'ext';
				parseExt(block);
				break;
			case ',':
				block.type = 'img';
				parseImg(block);
				break;
			case ';':
				block.type = 'eof';
				handler.eof && handler.eof(block);
				break;
			default:
				throw new Error('Unknown block: 0x' + block.sentinel.toString(16)); // TODO: Pad this with a 0.
		}

		// if (block.type !== 'eof') setTimeout(parseBlock,0);
		if (block.type !== 'eof') parseBlock();
	};

	var parse = function () {
		parseHeader();
		parseBlock();
		// setTimeout(parseBlock, 0);
	};

	parse();
};

// BEGIN_NON_BOOKMARKLET_CODE
exports.Stream = Stream;
exports.parseGIF = parseGIF;
exports.decode = function (buffer) {
	var gifData = { images: [] };
	var gct;
	var GCE;
	var log = console.log;

	// var showBool = function (b) {
	// 	return b ? 'yes' : 'no';
	// };

	// var showColor = function (rgb) {
	// 	// FIXME When I have an Internet connection.
	// 	var showHex = function (n) { // Two-digit code.
	// 		var hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
	// 		return hexChars[(n >>> 4) & 0xF] + hexChars[n & 0xF];
	// 	};
	// 	return '#' + showHex(rgb[0]) + showHex(rgb[1]) + showHex(rgb[2]);
	// };

	// var showDisposalMethod = function (dm) {
	// 	var map = {
	// 		0: 'None',
	// 		1: 'Do not dispose',
	// 		2: 'Restore to background',
	// 		3: 'Restore to previous'
	// 	};
	// 	return map[dm] || 'Unknown';
	// }

	//尺寸 背景色 调色板 等
	var doHdr = function (hdr) {
		// log('Header:');
		// log('  Version: %s', hdr.ver);
		// log('  Size: %dx%d', hdr.width, hdr.height);
		// log('  GCT? %s%s', showBool(hdr.gctFlag), hdr.gctFlag ? ' (' + hdr.gct.length + ' entries)' : '');
		// log('  Color resolution: %d', hdr.colorRes);
		// log('  Sorted? %s', showBool(hdr.sorted));
		// log('  Background color: %s (%d)', hdr.gctFlag ? showColor(hdr.bgColor) : 'no GCT', hdr.bgColor);
		// log('  Pixel aspect ratio: %d FIXME', hdr.pixelAspectRatio);
		gct = hdr.gct;
		gifData.width = hdr.width;
		gifData.height = hdr.height;
	};
	//当前帧的非颜色信息 (透明色,延时 等))
	var doGCE = function (gce) {
		// log('GCE:');
		// log('  Disposal method: %d (%s)', gce.disposalMethod, showDisposalMethod(gce.disposalMethod));
		// log('  User input expected? %s', showBool(gce.userInput));
		// log('  Transparency given? %s%s', showBool(gce.transparencyGiven),
		// 	gce.transparencyGiven ? ' (index: ' + gce.transparencyIndex + ')' : '');
		// log('  Delay time: %d', gce.delayTime);
		GCE = gce;
	};
	//当前帧的图片图像信息
	var doImg = function (img) {
		// log('Image descriptor:');
		// log(Object.assign({},img,{'pixels':Math.max.apply(Math,img.pixels)}));
		// log('  Geometry: %dx%d+%d+%d', img.width, img.height, img.leftPos, img.topPos);
		// log('  LCT? %s%s', showBool(img.lctFlag), img.lctFlag ? ' (' + img.lct.length + ' entries)' : '');
		// log('  Interlaced? %s', showBool(img.interlaced));
		// log('  %d pixels', img.pixels.length);
		var data = [];
		var imageData = {
			left: img.leftPos,
			top: img.topPos,
			width: img.width,
			height: img.height,
			data: data
		}
		img.pixels.forEach(function (v) {
			var color = gct[v];
			data.push.apply(data, color.concat(GCE.transparencyIndex == v ? 0 : 255));
		})
		gifData.images.push(imageData);
	};

	var doNetscape = function (block) {
		// log('Netscape application extension:');
		// log('  Iterations: %d%s', block.iterations, block.iterations === 0 ? ' (infinite)' : '');
	};

	var doCom = function (com) {
		// log('Comment extension:');
		// log('  Comment: [31m%s[0m', com.comment);
	};

	var doEOF = function (eof) {
		// log('EOF:');
		// log(eof);
	};

	var doUnknownApp = function (block) {
		// log(block)
	};

	var doUnknownExt = function (block) {
		// log(block)
	}

	var handler = {
		hdr: doHdr,
		img: doImg,
		gce: doGCE,
		com: doCom,
		app: {
			NETSCAPE: doNetscape,
			unknown: doUnknownApp
		},
		eof: doEOF
	};

	var st = new Stream(buffer.toString('binary'));
	parseGIF(st, handler);
	return gifData;
}