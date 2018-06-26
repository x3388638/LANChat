const net = require('net');
const { Readable } = require('stream');

import Util from './util.js';

export default (() => {
	/**
	 * private variable
	 */
	const _port = 20849;
	let _server;

	/**
	 * init
	 */
	_server = net.createServer((socket) => {
		const remoteAddr = socket._address.address;
		// console.warn(`tcp server on connect from: ${remoteAddr}`);
		const chunks = [];

		socket.on('close', () => {
			if (chunks.length === 0) {
				// 持續連線的 tcp connection 斷線，使用者離線
				_onClose(socket);
				return;
			}

			const dataBuffer = Buffer.concat(chunks);
			_onData(socket, dataBuffer);
		});

		socket.on('data', (data) => {
			chunks.push(data);
		});

		socket.on('error', _onError);
		// console.warn(`netUsers: ${JSON.stringify(Object.keys(global.netUsers), null, 4)}`);
		if (!Util.netUserExist(remoteAddr)) {
			// 第一次連線 (持續連線)
			Util.updateNetUsers(remoteAddr, { tcpSocket: socket });
			Util.sendUserData(remoteAddr);
			global.PubSub.emit('tcp:connect');
		}
	});

	_server.on('error', (err) => {
		console.warn(err);
	});
	
	// server listen
	Util.getIP().then((host) => {
		_server.listen(_port, host);
	});

	/**
	 * private method
	 */
	function _onData(socket, data) {
		const ip = socket._address.address;
		const dataString = data.toString();
		let parsedData;
		try {
			parsedData = JSON.parse(dataString);
			if (!parsedData.payload) {
				return;
			}

			parsedData.payload.ip = ip;
			switch (parsedData.type) {
				case 'userData':
					global.PubSub.emit('newMsg:userData', parsedData);
					Util.sendMsgSync(ip);
					break;
				case 'msg':
					global.PubSub.emit('newMsg:msg', parsedData);
					break;
				case 'msgSync':
					global.PubSub.emit('newMsg:msgSync', parsedData);
					break;
				case 'fileReq':
					global.PubSub.emit('newMsg:fileReq', parsedData);
					break;
				default:
					break;
			}
		} catch (err) {
			console.log('不該進來這裡ㄅ');
			console.log(dataString);
			console.log(dataString.length);
		}
	}

	function _onClose(socket) {
		// console.warn(`Disconnect from ${socket._address.address}`);
		global.PubSub.emit('tcp:disconnect', socket._address.address);
	}

	function _onError(err) {
		console.warn('tcp socket on error');
	}

	/**
	 * public method
	 */
	function keepConn(ip, callback) {
		if (!!Util.netUserExist(ip)) {
			return;
		}

		const socket = net.connect(_port, ip, () => {
			// console.warn(`tcp connect to ${ip}`);
			socket.on('close', () => _onClose(socket));
			socket.on('error', _onError);
			Util.updateNetUsers(ip, { tcpSocket: socket });
			!!callback && callback();
			// console.warn(`netUsers: ${JSON.stringify(Object.keys(global.netUsers), null, 4)}`);
			Util.sendUserData(ip);
			global.PubSub.emit('tcp:connect');
		});
	}

	function connectAndWrite(ip, dataBuffer) {
		const socket = net.connect(_port, ip, () => {
			socket.on('error', (err) => {
				console.warn(`TCP connect to ${ ip } error. ${ err }`);
			});

			// socket.write(dataBuffer);
			// socket.end();

			const stream = new Readable();
			const justANumber = 100000;
			for (let i = 0; i < Math.ceil(dataBuffer.byteLength / justANumber); i ++) {
				stream.push(dataBuffer.slice(i * justANumber, i * justANumber + justANumber));
			}

			stream.push(null);
			stream.pipe(socket);
		});
	}

	function close() {
		_server = null;
	}

	return {
		keepConn,
		connectAndWrite,
		close
	};
})();
