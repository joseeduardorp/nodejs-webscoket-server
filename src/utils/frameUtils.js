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

	switch (byte1) {
		case 129:
			return {
				type: 'text',
				data: decoder.write(unmasked_msg),
			};
		case 130:
			return {
				type: 'binary',
				data: unmasked_msg,
			};
		case 136:
			const dataBytes = {
				code: unmasked_msg.subarray(0, 2),
				reason: unmasked_msg.subarray(2),
			};

			const code = Buffer.from(dataBytes.code).readUInt16BE();
			const reason = decoder.write(dataBytes.reason);

			return {
				type: 'close',
				data: {
					code,
					reason,
				},
			};
	}
};

const writeFrame = (data, opcode = 129) => {
	if (typeof data !== 'string') {
		data = JSON.stringify(data);
	}

	const header = Buffer.alloc(2);
	header[0] = opcode; // FIN + RSV1-3 + OPCODE
	header[1] = Buffer.byteLength(data); // Payload Length

	const payloadData = Buffer.from(data);

	return Buffer.concat([header, payloadData]);
};

const writeCloseFrame = (code = 1000, reason = '') => {
	const header = Buffer.alloc(2);
	header[0] = 136; // FIN + RSV1-3 + OPCODE
	header[1] = 2 + Buffer.byteLength(reason); // code (2 bytes) + reason length

	const statusCode = Buffer.alloc(2);
	statusCode.writeUInt16BE(code, 0);

	const reasonData = Buffer.from(reason);

	return Buffer.concat([header, statusCode, reasonData]);
};

module.exports = {
	readFrame,
	writeFrame,
	writeCloseFrame,
};
