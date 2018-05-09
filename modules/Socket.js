const dgram = require('dgram');

export default (() => {
	/**
	 * private variable
	 */
	const _serverSocket = dgram.createSocket('udp4');
	const _port = 12321;
	const _multicastAddress = '225.225.225.225';

	/**
	 * public method
	 */
	function init() {
		_serverSocket.bind(_port);
		_serverSocket.on('listening', () => {
			console.warn('socket on listening.');
			_serverSocket.addMembership(_multicastAddress);
		});

		_serverSocket.on('message', function (msg, rinfo) {
			console.warn(`Msg received: ${msg}`);
			// global.PubSub.emit('message');
			console.warn(typeof global.PubSub.emit);
		});
	}

	function send(msg) {
		_serverSocket.send(msg, 0, msg.length, _port, _multicastAddress, (err) => {
			if (err) {
				console.error(err);
				return;
			}

			console.warn(`Send multicast to port ${_port}`);
		});
	}

	return {
		init,
		send
	}
})();
