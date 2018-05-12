const dgram = require('dgram');

export default (() => {
	/**
	 * private variable
	 */
	const _port = 12321;
	const _multicastAddress = '225.225.225.225';
	const _serverSocket = dgram.createSocket('udp4');

	/**
	 * private method
	 */
	/*
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
	*/

	/**
	 * public method
	 */
	function init() {
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

		_serverSocket.bind(_port);
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
