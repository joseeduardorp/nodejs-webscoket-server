const { IncomingMessage, OutgoingMessage } = require('node:http');
const { createHash } = require('node:crypto');

const { readFrame, writeFrame } = require('../utils/frameUtils');
const validSocketHeaders = require('../utils/validSocketHeaders');

const MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const socketHandler = (
	req = IncomingMessage.prototype,
	res = OutgoingMessage.prototype
) => {
	const { headers, httpVersion, socket } = req;

	if (parseFloat(httpVersion) < 1.1 || validSocketHeaders(headers)) {
		res.writeHead(400, 'Bad Request');
		return res.end();
	}

	if (headers['sec-websocket-version'] !== '13') {
		res.writeHead(426, 'Upgrade Required', {
			'sec-websocket-version': 13,
		});
		return res.end();
	}

	const hash = createHash('sha1');
	const acceptKey = hash
		.update(headers['sec-websocket-key'] + MAGIC_STRING)
		.digest('base64');

	res.writeHead(101, 'Switching Protocols', {
		connection: 'upgrade',
		upgrade: 'websocket',
		'sec-websocket-accept': acceptKey,
	});
	res.end();

	socket.on('data', (data) => {
		const bytes = Array.from(data);

		const msg = readFrame(bytes);
		socket.write(writeFrame(msg));
	});
};

module.exports = socketHandler;
