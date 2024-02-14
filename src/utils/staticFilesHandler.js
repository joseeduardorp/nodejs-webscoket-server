const { readFile } = require('node:fs/promises');
const { join } = require('node:path');

const publicDir = join(__dirname, '..', 'public');

const staticFilesHandler = async (req, res) => {
	try {
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

		res.end(file);
	} catch (error) {
		console.log('error:', error);

		res.writeHead(404);
		res.end();
	}
};

module.exports = staticFilesHandler;
