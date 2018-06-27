import sha256 from 'sha256';
import sha1 from 'sha1';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import '../shim.js';
import crypto from 'crypto';
import UUID from 'uuid/v4';
import { NetworkInfo } from 'react-native-network-info';
import {
	Alert,
	NetInfo
} from 'react-native';

import Storage from './Storage.js';

const RNFS = require('react-native-fs');

export default (() => {
	/**
	 * private variable
	 */
	const _expireTime = 5;
	const _alivePeriod = 9;
	const _userDataPeriod = Math.ceil(Math.random() * 10) + 33;

	/**
	 * private method
	 */
	async function _sendAlive() {
		const ip = await getIP();
		global.UdpSocket.send(new Buffer(JSON.stringify({
			type: 'alive',
			payload: {
				ip
			}
		})));
	}

	/**
	 * public method
	 */
	function genPass(pass) {
		const salt = DeviceInfo.getBrand().toLocaleLowerCase();
		const n = ([...pass].reduce((sum, curr) => sum + (+curr), 0)) % 5;
		let newPass = [...pass];
		newPass.splice(n, 0, salt);
		const result = sha256(newPass.join(''));
		return result;
	}

	function login() {
		Storage.setLastLogin(moment().format('YYYY-MM-DD HH:mm:ss'));
	}

	async function checkLogin() {
		let lastLogin = await Storage.getLastLogin();
		lastLogin = typeof lastLogin === 'string' ? lastLogin : null;
		if (!lastLogin) {
			return false;
		}

		if (!moment(lastLogin).isValid() ||
			moment().diff(moment(lastLogin), 'minutes') > _expireTime) {
			Storage.removeItem('lastLogin');
			return false;
		}

		return true;
	}

	function getDeviceID() {
		return DeviceInfo.getUniqueID();
	}

	function getUid() {
		const deviceID = getDeviceID();
		return sha1(deviceID);
	}

	function genGroupKey(groupName, pass) {
		const key = crypto.pbkdf2Sync(pass, groupName, 4096, 256, 'sha1').toString('hex');
		return key;
	}

	function genUUID() {
		return UUID();
	}

	function getWifi() {
		return Promise.all([
			new Promise((resolve) => NetworkInfo.getSSID(resolve)),
			new Promise((resolve) =>{
				NetworkInfo.getBSSID((bssid) => {
					if (!bssid) {
						resolve(bssid);
						return;
					}

					bssid = bssid
						.split(':')
						.map((hex) => {
							if (hex.length === 1) {
								return `0${hex}`;
							}

							return hex;
						})
						.join(':');

					resolve(bssid);
				});
			})
		]);
	}

	function getIP() {
		return new Promise((resolve, reject) => {
			NetworkInfo.getIPV4Address(resolve);
		});
	}

	function sendAlive() {
		_sendAlive();
		setInterval(_sendAlive, _alivePeriod * 1000);
	}

	function encrypt(text, key) {
		if (!key) {
			return text;
		}

		const cipher = crypto.createCipher('aes192', key);
		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return encrypted;
	}

	function decrypt(encrypted, key) {
		if (!key) {
			return encrypted;
		}

		const decipher = crypto.createDecipher('aes192', key);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}

	function parseAlive() {
		global.PubSub.on('newMsg:alive', async (data) => {
			// tcp 連線已建立
			if (netUserExist(data.payload.ip)) {
				return;
			}

			// tcp connect
			global.TcpSocket.keepConn(data.payload.ip);
		});
	}

	async function getOnlineStatus(uid) {
		let online = 1;
		let text = '上線中';
		// check is online (tcp connecting)
		if (Object.values(global.netUsers).some((user) => user.uid === uid)) {
			return {
				online,
				text
			}
		}

		online = 0;
		text = '1 天以上';
		const users = await Storage.getUsers();
		const lastSeen = users[uid].lastSeen;
		if (!lastSeen) {
			return {
				online,
				text
			}
		}

		const diff = moment().diff(moment(lastSeen), 'seconds');
		if (diff <= 60 * 5) {
			text = '5 分鐘內';
		} else if (diff <= 60 * 60) {
			text = '1 小時內';
		} else if (diff <= 60 * 60 * 24) {
			text = '1 天內';
		} else if (diff <= 60 * 60 * 24 * 15) {
			text = '1 天以上';
		} else {
			online = -1;
		}

		return {
			online,
			text,
			diff
		};
	}

	async function getGroupMembers(bssid = '', groupID = '') {
		let members = {};
		if (groupID === 'LOBBY') {
			const parsedMembers = {};
			// remove tcpSocket, or the object cannot be JSON.stringify
			Object.keys(global.netUsers).forEach((ip) => {
				parsedMembers[global.netUsers[ip].uid] = Object.assign({}, global.netUsers[ip], { tcpSocket: null });
			});

			members = parsedMembers;
		} else {
			const usersByNet = await Storage.getUsersByNet(bssid);
			const users = await Storage.getUsers();
			const joinedGroups = await Storage.getJoinedGroups();
			Object.keys(usersByNet).forEach((uid) => {
				if (users[uid].joinedGroups.includes(groupID)) {
					members[uid] = users[uid];
				}
			});
		}

		return members;
	}

	function checkConnection() {
		NetInfo.addEventListener('connectionChange', async (data) => {
			const netType = data.type.toLocaleLowerCase();
			if (netType === 'wifi') {
				// PubSub.emit('wifi:changed');
			} else if (netType === 'none') {
				const [ssid, bssid] = await getWifi();
				if (bssid === null || bssid === 'error') {
					Alert.alert('WiFi 連線中斷');
					PubSub.emit('wifi:disconnect');
					return;
				}

				// PubSub.emit('wifi:changed');
			} else {
				Alert.alert('WiFi 連線中斷');
				PubSub.emit('wifi:disconnect');
			}
		});
	}

	async function isWiFiConnected() {
		const [ssid, bssid] = await getWifi();
		if (bssid === null || bssid === 'error') {
			return false;
		}

		return true;
	}

	function listenWiFiChanged() {
		let lastBssid = null;
		setInterval(async () => {
			const connected = await isWiFiConnected();
			if (connected) {
				const [ssid, bssid] = await getWifi();
				if (!!bssid && !!lastBssid && bssid !== lastBssid) {
					PubSub.emit('wifi:changed', [ssid, bssid]);
				}

				lastBssid = bssid;
			}
		}, 5000);
	}

	function updateNetUsers(ip, userInfo = {}) {
		global.netUsers[ip] = Object.assign({}, global.netUsers[ip] || {}, userInfo, { ip });
	}

	function netUserExist(ip) {
		return !!global.netUsers[ip];
	}

	async function sendUserData(ip = 'ALL') {
		const uid = getUid();
		const personalInfo = await Storage.getPersonalInfo();
		const joinedGroups = await Storage.getJoinedGroups();
		const groups = {};
		Object.values(joinedGroups).forEach((groupsObj) => {
			Object.values(groupsObj).forEach((group) => {
				const key = group.key;
				groups[group.groupID] = encrypt(group.groupID, key);
			});
		});

		const data = JSON.stringify({
			type: 'userData',
			payload: {
				uid,
				data: personalInfo.normal,
				joinedGroups: groups
			}
		});

		if (ip === 'ALL') {
			Object.keys(global.netUsers).forEach((userIP) => {
				global.TcpSocket.connectAndWrite(userIP, new Buffer(data));
			});
		} else {
			global.TcpSocket.connectAndWrite(ip, new Buffer(data));
		}
	}

	function sendUserDataInterval() {
		setInterval(sendUserData, _userDataPeriod * 1000);
	}

	function parseUserData() {
		global.PubSub.on('newMsg:userData', async (data) => {
			const payload = data.payload;
			const [ssid, bssid] = await getWifi();
			const targetGroups = Object.keys(payload.joinedGroups); // 收到的使用者所加入的 groupID array
			// 更新 global.netUsers 資料
			updateNetUsers(payload.ip, Object.assign({}, payload.data, { lastSeen: moment().format() }));

			// 檢查此使用者是否有加入本身已加入群組
			const joinedGroups = await Storage.getJoinedGroups();
			const totalGroups = {};
			Object.values(joinedGroups).forEach((netGroups) => {
				Object.values(netGroups).forEach((group) => {
					totalGroups[group.groupID] = group;
				});
			});

			const conGroups = Object.keys(totalGroups).filter((groupID) => targetGroups.includes(groupID)); // 共同群組 groupID array

			// 檢查封包正確性
			const validData = conGroups.every((groupID) => {
				const key = totalGroups[groupID].key;
				return groupID === decrypt(payload.joinedGroups[groupID], key);
			});

			if (!validData) {
				return;
			}

			// save user info
			Storage.saveUser(payload.uid, Object.assign({}, payload.data, {
				lastSeen: moment().format(),
				joinedGroups: conGroups
			}));

			Storage.saveNetUser(bssid, payload.uid);
		});
	}

	function handleTcpDisconnect(ip) {
		const uid = global.netUsers[ip] ? global.netUsers[ip].uid : null;

		if (!!uid) {
			// clear socket
			global.netUsers[ip].tcpSocket.end();

			// set lastSeen
			const timestamp = moment().format();
			Storage.updateUser(uid, { lastSeen: timestamp });
		}

		// remove user from netUsers
		delete global.netUsers[ip];
	}

	async function sendMsg({ type, bssid, groupID, msg }) {
		let joinedGroups;
		let key;
		if (groupID !== 'LOBBY') {
			joinedGroups = await Storage.getJoinedGroups();
			key = joinedGroups[bssid][groupID].key;
		}

		const data = JSON.stringify({
			type: 'msg',
			payload: {
				groupID,
				encryptedID: key ? encrypt(groupID, key) : null,
				data: encrypt(JSON.stringify({
					key: genUUID(),
					sender: getUid(),
					timestamp: moment().format(),
					type: type,
					[type]: msg
				}), key)
			}
		});

		if (groupID === 'LOBBY') {
			Object.keys(global.netUsers).forEach((ip) => {
				global.TcpSocket.connectAndWrite(ip, new Buffer(data));
			});
		} else {
			const groupMembers = await getGroupMembers(bssid, groupID);
			Object.values(global.netUsers).forEach((user) => {
				if (groupMembers[user.uid]) {
					global.TcpSocket.connectAndWrite(user.ip, new Buffer(data));
				}
			});
		}
	}

	function parseMsg() {
		global.PubSub.on('newMsg:msg', async (data) => {
			const payload = data.payload;
			let msgData;
			const [ssid, bssid] = await getWifi();
			if (payload.groupID !== 'LOBBY') {
				const joinedGroups = await Storage.getJoinedGroups();
				if (!joinedGroups[bssid][payload.groupID]) {
					// 這個封包跟我無關
					return;
				}

				if (decrypt(payload.encryptedID, joinedGroups[bssid][payload.groupID].key) !== payload.groupID) {
					// 封包不正確
					return;
				}

				msgData = JSON.parse(decrypt(payload.data, joinedGroups[bssid][payload.groupID].key));
			} else {
				msgData = JSON.parse(payload.data);
			}

			// 存入訊息至 @LANChat:messages
			Storage.storeMsg(bssid, payload.groupID, msgData, () => {
				const data = {
					bssid,
					msgData,
					groupID: payload.groupID
				};

				global.PubSub.emit('receiveMsg', data);
				global.PubSub.emit('msgInChat', data);
				// Storage.getMsg().then((msg) => {
				// 	console.warn(JSON.stringify(msg, null, 4))
				// })
			});

			// if type is `poll`, store to @LANChat:poll
			if (msgData.type === 'poll') {
				Storage.addPoll({
					bssid,
					groupID: payload.groupID,
					pollID: msgData.poll.pollID,
					creater: msgData.sender,
					timestamp: msgData.timestamp,
					data: msgData.poll
				});
			}

			// if type is `vote`, store to @LANChat:vote
			if (msgData.type === 'vote') {
				Storage.addVote({
					bssid,
					groupID: payload.groupID,
					voteID: msgData.vote.voteID,
					voter: msgData.sender,
					timestamp: msgData.timestamp,
					data: msgData.vote
				});
			}
		});
	}

	async function sendMsgSync(ip) {
		const currentIP = await getIP();
		if (currentIP === ip) {
			return;
		}

		const [ssid, bssid] = await getWifi();
		const messages = await Storage.getMsg(bssid);
		const joinedGroups = await Storage.getJoinedGroups();
		const payload = {}; // { [groupID]: { ENCRYPTEDID, MESSAGES } }
		Object.keys(messages).forEach((groupID) => {
			const msgArr = Object.values(messages[groupID]).sort((b, a) => moment(a.timestamp).diff(moment(b.timestamp))).slice(0, 100);
			let key = '';
			if (groupID !== 'LOBBY') {
				key = joinedGroups[bssid][groupID].key;
			}

			payload[groupID] = {
				encryptedID: groupID === 'LOBBY' ? null : encrypt(groupID, key),
				messages: encrypt(JSON.stringify(msgArr), key)
			}
		});

		const data = JSON.stringify({
			type: 'msgSync',
			payload
		});

		global.TcpSocket.connectAndWrite(ip, new Buffer(data));
	}

	function parseMsgSync() {
		global.PubSub.on('newMsg:msgSync', async (data) => {
			const [ssid, bssid] = await getWifi();
			const joinedGroups = await Storage.getJoinedGroups();
			const messages = await Storage.getMsg(bssid);
			const pendingMsg = {}; // { [groupID]: [msgObj, ...] }
			const pendingPoll = []; // [{ bssid, groupID, pollID, creater, timestamp, data }]
			const pendingVote = []; // [{ bssid, groupID, voteID, voter, timestamp, data }]
			Object.keys(data.payload).forEach((groupID) => {
				if (groupID === 'LOBBY' || (joinedGroups[bssid] && joinedGroups[bssid][groupID])) {
					// 自己有加入的群組或是當前 bssid 的 LOBBY
					if (groupID === 'LOBBY' || data.payload[groupID].encryptedID === encrypt(groupID, joinedGroups[bssid][groupID].key)) {
						let msgToSync = [];
						if (groupID === 'LOBBY') {
							msgToSync = JSON.parse(data.payload[groupID].messages);
						} else {
							msgToSync = JSON.parse(decrypt(data.payload[groupID].messages, joinedGroups[bssid][groupID].key));
						}

						msgToSync.forEach((msg) => {
							if (!messages[groupID] || !messages[groupID][msg.key]) {
								// store this msg
								pendingMsg[groupID] = pendingMsg[groupID] || [];
								pendingMsg[groupID].push(msg);

                                // if type is poll, store to poll
                                if (msg.type === 'poll') {
                                    pendingPoll.push({
										bssid,
										groupID,
										pollID: msg.poll.pollID,
										creater: msg.sender,
										timestamp: msg.timestamp,
										data: msg.poll
									});
								}

								// if type is vote, store to vote
								if (msg.type === 'vote') {
									pendingVote.push({
										bssid,
										groupID,
										voteID: msg.vote.voteID,
										voter: msg.sender,
										timestamp: msg.timestamp,
										data: msg.vote
									});
								}
							}
						});
					}
				}
			});

			if (!!Object.keys(pendingMsg).length) {
				Storage.msgSync(bssid, pendingMsg, () => {
					global.PubSub.emit('receiveMsg');
				});
			}

			if (!!pendingPoll.length) {
				Storage.addPolls(pendingPoll);
			}

            if (!!pendingVote.length) {
                Storage.addVotes(pendingVote);
            }
		});
	}

	async function sendEmergency({ lat, lng }) {
		const [ssid, bssid] = await getWifi();
		const personalInfo = await Storage.getPersonalInfo();
		const normal = personalInfo.normal || {};
		const emergency = personalInfo.emergency || {};
		const msg = `[求助訊息]\n` +
			`姓名: ${ emergency.name || normal.username }\n` +
			`性別: ${ emergency.gender === 'M' ? '男' : emergency.gender === 'F' ? '女' : '' }\n` +
			`生日: ${ emergency.birth }\n` +
			`電話: ${ emergency.phone }\n` +
			`血型: ${ emergency.bloodType ? emergency.bloodType + '型' : '' }\n` +
			`住址: ${ emergency.address }\n` +
			`補充資訊: ${ emergency.memo }\n` +
			`GPS 經度: ${ lng }\n` +
			`GPS 緯度: ${ lat }`;

		sendMsg({
			bssid,
			msg,
			type: 'emergency',
			groupID: 'LOBBY'
		});
	}

	async function sendFileReq(ip, bssid, groupID, fileID, reqID) {
		let key;
		if (groupID !== 'LOBBY') {
			const joinedGroups = await Storage.getJoinedGroups();
			key = joinedGroups[bssid][groupID].key;
		}

		const data = JSON.stringify({
			type: 'fileReq',
			payload: {
				groupID,
				data: encrypt(JSON.stringify({
					fileID,
					reqID
				}), key)
			}
		});

		global.TcpSocket.connectAndWrite(ip, new Buffer(data));
	}

	function parseFileReq() {
		global.PubSub.on('newMsg:fileReq', async (parsedData) => {
			const [ssid, bssid] = await getWifi();
			let { ip, groupID, data } = parsedData.payload;
			let key;
			if (groupID !== 'LOBBY') {
				const joinedGroups = await Storage.getJoinedGroups();
				key = joinedGroups[bssid][groupID].key;
			}

			const { fileID, reqID } = JSON.parse(decrypt(data, key));
			const fileData = await Storage.getFile(fileID);

			new Promise((resolve, reject) => {
				if (!fileData) {
					reject('檔案不存在');
					return;
				}

				resolve()
			}).then(() => {
				return RNFS.exists(fileData.filePath);
			}).then((exist) => {
				if (!exist) {
					return Promise.reject('檔案已失傳');
				}

				return Promise.resolve();
			}).then(() => {
				return new Promise((resolve, reject) => {
					RNFS.readFile(fileData.filePath).then((data) => {
						resolve(data);
					}).catch((err) => {
						reject('不支援此檔案格式或編碼');
					});
				});
			}).then((content) => {
				// send fileRes
				const data = JSON.stringify({
					type: 'fileRes',
					payload: {
						groupID,
						data: encrypt(JSON.stringify({
							reqID,
							error: null,
							fileName: fileData.fileName,
							file: content
						}), key)
					}
				});

				global.TcpSocket.connectAndWrite(ip, new Buffer(data));
			}).catch((error) => {
				const data = JSON.stringify({
					type: 'fileRes',
					payload: {
						groupID,
						data: encrypt(JSON.stringify({
							reqID,
							error,
							fileName: fileData.fileName,
							file: null
						}), key)
					}
				});

				global.TcpSocket.connectAndWrite(ip, new Buffer(data));
			});
		});
	}

	function parseFileRes() {
		global.PubSub.on('newMsg:fileRes', async (data) => {
			const [ssid, bssid] = await getWifi();
			const groupID = data.payload.groupID;
			let key;
			if (groupID !== 'LOBBY') {
				const joinedGroups = await Storage.getJoinedGroups();
				key = joinedGroups[bssid][groupID];
			}

			const { reqID, error, fileName, file } = JSON.parse(decrypt(data.payload.data, key));
			global.PubSub.emit(`file:${ reqID }`, {
				error,
				fileName,
				file
			});
		});
	}

	return {
		genPass,
		login,
		checkLogin,
		getDeviceID,
		getUid,
		genGroupKey,
		genUUID,
		getWifi,
		getIP,
		sendAlive,
		encrypt,
		decrypt,
		parseAlive,
		getOnlineStatus,
		getGroupMembers,
		checkConnection,
		isWiFiConnected,
		listenWiFiChanged,
		updateNetUsers,
		netUserExist,
		sendUserData,
		sendUserDataInterval,
		parseUserData,
		handleTcpDisconnect,
		sendMsg,
		parseMsg,
		sendMsgSync,
		parseMsgSync,
		sendEmergency,
		sendFileReq,
		parseFileReq,
		parseFileRes
	}
})();
