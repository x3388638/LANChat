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
	NetInfo,
	Platform
} from 'react-native';

import Storage from './Storage.js';

export default (() => {
	/**
	 * private variable
	 */
	const _expireTime = 5;
	const _alivePeriod = 9;

	/**
	 * private method
	 */
	async function _sendAlive() {
		const ip = await getIP();
		const os = Platform.OS;
		global.UdpSocket.send(new Buffer(JSON.stringify({
			type: 'alive',
			payload: {
				ip,
				os
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
		const cipher = crypto.createCipher('aes192', key);
		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return encrypted;
	}

	function decrypt(encrypted, key) {
		const decipher = crypto.createDecipher('aes192', key);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}

	function parseAlive() {
		global.PubSub.on('newMsg:alive', async (data) => {
			const currentIP = await getIP();
			const currentOS = Platform.OS;

			// 收到自己的 alive，略過
			if (data.payload.ip === currentIP) {
				return;
			}

			// tcp 連線已建立
			if (netUserExist(data.payload.ip)) {
				return;
			}

			// 如果本身是 Android, 收到 ios 的 alive 則不理他並反送 alive
			if (currentOS !== 'ios' && data.payload.os === 'ios') {
				_sendAlive();
				return;
			}

			// 如果兩端都是 ios，那先放置不理，不然應該會壞掉
			if (currentOS === 'ios' && data.payload.os === 'ios') {
				return;
			}

			// tcp connect
			global.TcpSocket.connect(data.payload.ip);
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
			Object.values(global.netUsers).forEach((user) => {
				user.tcpSocket.write(new Buffer(data));
			});
		} else {
			global.netUsers[ip].tcpSocket.write(new Buffer(data));
		}
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
			if (conGroups.length === 0) {
				return;
			}

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
			typeof global.netUsers[ip].tcpSocket.close === 'function' && global.netUsers[ip].tcpSocket.close();
			typeof global.netUsers[ip].tcpSocket.destory === 'function' && global.netUsers[ip].tcpSocket.destory();

			// set lastSeen
			const timestamp = moment().format();
			Storage.updateUser(uid, { lastSeen: timestamp });
		}

		// remove user from netUsers
		delete global.netUsers[ip];
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
		parseUserData,
		handleTcpDisconnect
	}
})();
