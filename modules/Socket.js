const dgram = require('dgram');

export default (() => {
	/**
	 * private variable
	 */
	let _socketOpened = false;
	let _port = 12321;
	let _multicastAddress = '225.225.225.225';
	let _serverSocket;

	/**
	 * private method
	 */
	function _genPort(bssid) {
		const base = 10001;
		const section = bssid.split(':');
		const sum = section.reduce((total, hex) => total + parseInt(hex, 16), 0);
		return base + sum;
	}

	function _genAddress(bssid) {
		const base = [225, 11, 12, 13];
		const range = [11, 200, 200, 200];
		const section = bssid.split(':');
		const incress = range.map((n, i) => (parseInt(section[i], 16) * (i + 1)) % n);

		return base.map((num, i) => num + incress[i]).join('.');
	}

	/**
	 * public method
	 */
	function init(bssid) {
		if (!!_socketOpened) {
			return;
		}

		if (bssid) {
			_port = _genPort(bssid);
			_multicastAddress = _genAddress(bssid);
		}

		_serverSocket = dgram.createSocket('udp4');
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

	function close(callback) {
		_serverSocket.close(() => {
			_socketOpened = false;
			callback();
		});
	}

	function reCreate(bssid) {
		close(init);
	}

	return {
		init,
		send,
		close,
		reCreate
	}
})();
