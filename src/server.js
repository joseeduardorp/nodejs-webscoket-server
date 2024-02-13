const { createServer, IncomingMessage, ServerResponse } = require('node:http');
const { Socket } = require('node:net');
const { createHash } = require('node:crypto');
const { StringDecoder } = require('node:string_decoder');

const MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
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

const socketHandler = (socket = Socket.prototype) => {
	socket.on('data', (data) => {
		const bytes = Array.from(data);

		const msg = readFrame(bytes);
		socket.write(writeFrame(msg));
	});
};

const handler = (
	req = IncomingMessage.prototype,
	res = ServerResponse.prototype
) => {
	const { httpVersion, headers, socket } = req;

	const {
		host,
		upgrade,
		connection,
		wsKey = 'sec-websocket-key',
		wsVersion = 'sec-websocket-version',
		origin,
	} = headers;

	if (
		parseFloat(httpVersion) < 1.1 ||
		!host ||
		!upgrade ||
		!connection ||
		!headers[wsKey] ||
		!headers[wsVersion] ||
		!origin ||
		upgrade.toLowerCase() !== 'websocket' ||
		connection.toLowerCase() !== 'upgrade'
	) {
		res.writeHead(400, 'Bad Request');
		return res.end();
	}

	if (headers[wsVersion] !== '13') {
		res.writeHead(426, 'Upgrade Required', {
			'sec-websocket-version': 13,
		});
		return res.end();
	}

	const hash = createHash('sha1');
	const acceptKey = hash.update(headers[wsKey] + MAGIC_STRING).digest('base64');

	res.writeHead(101, 'Switching Protocols', {
		connection: 'upgrade',
		upgrade: 'websocket',
		'sec-websocket-accept': acceptKey,
	});
	res.end();

	socketHandler(socket);
};

const server = createServer(handler);

server.listen(3001, () => {
	console.log('Server is running on port 3001.\n');
});
