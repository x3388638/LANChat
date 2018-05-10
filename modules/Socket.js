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
			_serverSocket.addMembership(_multicastAddress);
		});

		_serverSocket.on('message', function (data, rinfo) {
			try {
				const msg = JSON.parse(data.toString());
				const type = msg.type;
				switch (type) {
					case 'alive':
						global.PubSub.emit('newMsg:alive', msg);
						break;
					default:
						break;
				}
			} catch (err) {
				console.warn(err);
			}
		});
	}

	function send(msg) {
		_serverSocket.send(msg, 0, msg.length, _port, _multicastAddress, (err) => {
			if (err) {
				console.warn(err);
				return;
			}
		});
	}

	return {
		init,
		send
	}
})();
