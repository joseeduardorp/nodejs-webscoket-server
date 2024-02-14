const { IncomingMessage, OutgoingMessage } = require('node:http');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');

const publicDir = join(__dirname, '..', 'public');

const staticFilesHandler = async (
	req = IncomingMessage.prototype,
	res = OutgoingMessage.prototype
) => {
	const requestedFile = req.url;
	const fileName = requestedFile === '/' ? 'index.html' : requestedFile;
	const filepath = join(publicDir, fileName);

	const file = await readFile(filepath);

	if (requestedFile === '/' || requestedFile === '') {
		res.appendHeader('Content-Type', 'text/html');
	} else if (requestedFile.includes('.css')) {
		res.appendHeader('Content-Type', 'text/css');
	} else if (requestedFile.includes('.js')) {
		res.appendHeader('Content-Type', 'text/javascript');
	}

	return res.end(file);
};

module.exports = staticFilesHandler;
