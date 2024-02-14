const validSocketHeaders = (headers) => {
	const {
		host,
		upgrade,
		connection,
		wsKey = 'sec-websocket-key',
		wsVersion = 'sec-websocket-version',
		origin,
	} = headers;

	if (
		!host ||
		!upgrade ||
		!connection ||
		!headers[wsKey] ||
		!headers[wsVersion] ||
		!origin ||
		upgrade.toLowerCase() !== 'websocket' ||
		connection.toLowerCase() !== 'upgrade'
	) {
		return true;
	}

	return false;
};

module.exports = validSocketHeaders;
