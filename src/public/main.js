const socket = new WebSocket(`ws://${window.location.hostname}:3001`);

socket.addEventListener('open', (e) => {
	console.log('onopen:', e);
});

socket.addEventListener('message', (e) => {
	console.log('onmessage:', e);
	socket.send('mensagem do cliente');
});

socket.addEventListener('error', (e) => {
	console.log('onerror:', e);
});

socket.addEventListener('close', (e) => {
	console.log('onclose:', e);
});
