const net = require('net');

import Util from './util.js';

export default (() => {
	/**
	 * private variable
	 */
	const _port = 14432;
	let _server;

	/**
	 * init
	 */
	_server = net.createServer((socket) => {
		const remoteAddr = socket._address.address;
		console.warn(`tcp server on connect from: ${remoteAddr}`);
		socket.on('data', (data) => _onData(socket, data));
		socket.on('close', () => _onClose(socket));
		socket.on('error', _onError);

		Util.updateNetUsers(remoteAddr, { tcpSocket: socket });
		console.warn(`netUsers: ${JSON.stringify(Object.keys(global.netUsers), null, 4)}`);

		// TODO: send userData
		Util.sendUserData(remoteAddr);

		global.PubSub.emit('tcp:connect');
	});

	_server.listen(_port)

	/**
	 * private method
	 */
	function _onData(socket, data) {
		const ip = socket._address.address;
		const dataString = data.toString();
		let parsedData;
		let error = false;
		console.log(dataString);
		try {
			parsedData = JSON.parse(dataString);
		} catch (err) {
			console.warn('Tcp receive data error, try to send `resendReq`.');
			error = true;
			const match = dataString.match(/"packetID":"([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})"/);
			if (!!match && match[1]) {
				const packetID = match[1];
				Util.resendReq(ip, packetID);
			}
		}

		if (error) {
			return;
		}

		parsedData.payload.ip = ip;
		switch (parsedData.type) {
			case 'userData':
				global.PubSub.emit('newMsg:userData', parsedData);
				break;
			case 'resendReq':
				console.warn('receive resendReq');
				break;
			default:
				break;
		}
	}

	function _onClose(socket) {
		console.warn(`Disconnect from ${socket._address.address}`);
		global.PubSub.emit('tcp:disconnect', socket._address.address);
	}

	function _onError(err) {
		console.warn('tcp socket on error');
	}

	/**
	 * public method
	 */
	function connect(ip, callback) {
		if (!!Util.netUserExist(ip)) {
			return;
		}

		const socket = net.connect(_port, ip, () => {
			console.warn(`tcp connect to ${ip}`);
			socket.on('data', (data) => _onData(socket, data));
			socket.on('close', () => _onClose(socket));
			socket.on('error', _onError);

			Util.updateNetUsers(ip, { tcpSocket: socket });
			!!callback && callback();
			console.warn(`netUsers: ${JSON.stringify(Object.keys(global.netUsers), null, 4)}`);

			// TODO: send userData
			Util.sendUserData(ip);

			global.PubSub.emit('tcp:connect');
		});
	}

	return {
		connect
	};
})();
