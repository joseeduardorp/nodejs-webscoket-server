const { StringDecoder } = require('node:string_decoder');

const LENGHT_BYTES = {
	126: 2,
	127: 8,
};

const readFrame = (frameBytes = []) => {
	const decoder = new StringDecoder('utf-8');

	const [byte1] = frameBytes.splice(0, 1); // FIN + RSV1-3 + OPCODE
	const [byte2] = frameBytes.splice(0, 1); // MASK bit + Payload Length

	let payloadLength = byte2 - 128; // byte2 - MASK bit

	if (payloadLength >= 126) {
		payloadLength = frameBytes
			.splice(0, LENGHT_BYTES[payloadLength])
			.reduce((acc, cur) => acc * 256 + cur, 0);
	}

	const mask = frameBytes.splice(0, 4);
	const masked_msg = frameBytes;
	const unmasked_msg = Buffer.from(masked_msg).map((byte, i) => {
		return byte ^ mask[i % 4];
	});

	return byte1 === 129 ? decoder.write(unmasked_msg) : unmasked_msg;
};

const writeFrame = (data, opcode = 129) => {
	const header = Buffer.alloc(2);
	header[0] = opcode; // FIN + RSV1-3 + OPCODE
	header[1] = Buffer.byteLength(data); // Payload Length

	const payloadData = Buffer.from(data);

	return Buffer.concat([header, payloadData]);
};

module.exports = {
	readFrame,
	writeFrame,
};
