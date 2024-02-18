const msgInput = document.getElementById('message-input');
const msgOutput = document.getElementById('message-output');

const sendBtn = document.getElementById('send-btn');
const closeBtn = document.getElementById('close-btn');
const reconnectBtn = document.getElementById('reconnect-btn');

const socketStatus = document.querySelector('.socket-status');
const socketOutput = document.getElementById('socket-output');

const socket = new WebSocket(`ws://${window.location.hostname}:3001/socket`);

socket.addEventListener('open', () => {
	const clientId = '#' + Math.random().toString(32).substring(2, 10);
	sessionStorage.setItem('@clientid', clientId);

	const msg = {
		clientId,
		type: 'connecting',
		data: 'cliente conectando...',
	};

	socket.send(JSON.stringify(msg));

	socketStatus.setAttribute('title', 'conectado');
	socketStatus.classList.add('socket-status--connected');
});

socket.addEventListener('message', (e) => {
	const msg = JSON.parse(e.data);

	socketOutput.textContent = msg.data;
});

socket.addEventListener('error', (e) => {
	console.log('onerror:', e);

	socketStatus.setAttribute('title', 'desconectado');
	socketStatus.classList.remove('socket-status--connected');
});

socket.addEventListener('close', (e) => {
	console.log('onclose:', e);

	socketStatus.setAttribute('title', 'desconectado');
	socketStatus.classList.remove('socket-status--connected');
});

sendBtn.addEventListener('click', (e) => {
	e.preventDefault();

	const clientId = sessionStorage.getItem('@clientid');
	const inputValue = msgInput.value;

	if (inputValue.trim()) {
		const msg = {
			clientId,
			type: 'message',
			data: inputValue,
		};

		socket.send(JSON.stringify(msg));

		msgOutput.textContent = inputValue;
		msgInput.value = '';
	}
});

closeBtn.addEventListener('click', () => {
	socket.close(1000, 'Desconectar');

	socketStatus.setAttribute('title', 'desconectado');
	socketStatus.classList.remove('socket-status--connected');
});

reconnectBtn.addEventListener('click', () => {
	location.reload();
});
