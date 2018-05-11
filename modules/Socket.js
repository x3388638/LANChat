const dgram = require('dgram');

export default (() => {
	/**
	 * private variable
	 */
	let _socketOpened = false;
	const _serverSocket = dgram.createSocket('udp4');
	const _port = 12321;
	const _multicastAddress = '225.225.225.225';

	/**
	 * public method
	 */
	function init() {
		if (!!_socketOpened) {
			return;
		}

		_serverSocket.bind(_port);
		_serverSocket.on('listening', () => {
			_serverSocket.addMembership(_multicastAddress);
			_socketOpened = true;
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

	function close() {
		_serverSocket.close();
		_socketOpened = false;
	}

	return {
		init,
		send,
		close
	}
})();
