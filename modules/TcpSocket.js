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
	});

	_server.listen(_port)

	/**
	 * private method
	 */
	function _onData(socket, data) {
		console.warn(`receive data ${data.toString()} from ${socket._address.address}`);
	}

	function _onClose(socket) {
		console.warn(`Disconnect from ${socket._address.address}`);
		Util.removeNetUsers(socket._address.address);
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
		});
	}

	return {
		connect
	};
})();
