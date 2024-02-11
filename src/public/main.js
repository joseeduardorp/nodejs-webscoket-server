const msgInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const msgOutput = document.getElementById('message-output');

const socketStatus = document.querySelector('.socket-status');
const socketOutput = document.getElementById('socket-output');

const socket = new WebSocket(`ws://${window.location.hostname}:3001`);

socket.addEventListener('open', () => {
	socket.send('cliente conectando...');

	socketStatus.setAttribute('title', 'conectado');
	socketStatus.classList.add('socket-status--connected');
});

socket.addEventListener('message', (e) => {
	console.log('onmessage:', e);
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

	const inputValue = msgInput.value;

	if (inputValue.trim()) {
		socket.send(inputValue);
		msgOutput.textContent = inputValue;
		msgInput.value = '';
	}
});
