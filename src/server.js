const { createServer, IncomingMessage, ServerResponse } = require('node:http');
const { createHash } = require('node:crypto');

const MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const handler = (
	req = IncomingMessage.prototype,
	res = ServerResponse.prototype
) => {
	const { httpVersion, headers } = req;

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
};

const server = createServer(handler);

server.listen(3001, () => {
	console.log('Server is running on port 3001.\n');
});
