const net = require('net');

import Util from './util.js';

export default (() => {
	/**
	 * private variable
	 */
	const _port = 20838;
	let _server;

	/**
	 * init
	 */
	_server = net.createServer((socket) => {
		const remoteAddr = socket._address.address
		console.warn(`1 connect to ${remoteAddr}`);
		socket.on('data', (data) => {
		});

		socket.on('close', () => {
			console.warn(`tcp disconnect from ${remoteAddr}`);
		});

		// TODO: send userData

		Util.updateNetUsers(remoteAddr, { tcpSocket: socket });
	});

	_server.listen(_port)

	/**
	 * public method
	 */
	function connect(ip, callback) {
		if (!!Util.netUserExist(ip)) {
			return;
		}

		const socket = net.connect(_port, ip, () => {
			console.warn(`2 connect to ${ip}`);
			socket.on('data', (data) => {
			});

			socket.on('close', () => {
				console.warn(`disconnect from ${socket._address.address}`);
			});

			Util.updateNetUsers(ip, { tcpSocket: socket });
			!!callback && callback();
			// TODO: send userData
		});
	}

	return {
		connect
	};
})();
