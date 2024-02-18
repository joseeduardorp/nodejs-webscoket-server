const { IncomingMessage, OutgoingMessage } = require('node:http');
const { createHash } = require('node:crypto');

const fu = require('../utils/frameUtils');
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
		const msg = fu.readFrame(bytes);

		console.log('msg:', msg.data, '\n');

		switch (msg.type) {
			case 'close':
				const { code, reason } = msg.data;

				socket.write(fu.writeCloseFrame(code, reason));
				socket.end();
				break;
			default:
				socket.write(fu.writeFrame(msg.data));
				break;
		}
	});

	socket.on('error', (err) => {
		console.log('='.repeat(50));
		console.log('Ocorreu um erro:', err.message);
		console.log('='.repeat(50));
	});

	socket.on('close', (hasErr) => {
		if (hasErr) {
			console.log('\nConexão fechada por causa de um erro');
		} else {
			console.log('\nConexão fechada');
		}
	});
};

module.exports = socketHandler;
