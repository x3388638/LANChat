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
		console.warn(`tcp connection: [remote ip] ${socket.remoteAddress}`);
		socket.on('end', () => {
			console.warn(`tcp disconnect from ${socket.remoteAddress}`);
		});

		socket.on('data', () => {});
		// TODO: send userData

		Util.updateNetUsers(ip, { tcpSocket: socket });
	});

	_server.listen(_port)

	/**
	 * public method
	 */
	function connect(ip) {
		if (!Util.netUserExist[ip]) {
			const socket = net.connect(_port, ip, () => {
				socket.on('data', () => {});
				socket.on('end', () => {});
				// TODO: send userData
				Util.updateNetUsers(ip, { tcpSocket: socket });
			});
		}
	}

	return {
		connect
	};
})();
