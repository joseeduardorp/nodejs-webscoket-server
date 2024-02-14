const { createServer } = require('node:http');

const socketHandler = require('./handlers/socketHandler');
const staticFilesHandler = require('./handlers/staticFilesHandler');

const server = createServer((req, res) => {
	try {
		const { url } = req;

		if (url === '/socket') {
			socketHandler(req, res);
		} else {
			staticFilesHandler(req, res);
		}
	} catch (error) {
		console.log('error:', error);
		res.end();
	}
});

server.listen(3001, () => {
	console.log('Server is running on port 3001.\n');
});
