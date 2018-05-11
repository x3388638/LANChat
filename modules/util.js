import sha256 from 'sha256';
import sha1 from 'sha1';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import '../shim.js';
import crypto from 'crypto';
import UUID from 'uuid/v4';
import { NetworkInfo } from 'react-native-network-info';

import Storage from './Storage.js';

export default (() => {
	const _expireTime = 5;

	async function _sendAlive() {
		const uid = getUid();
		const personalInfo = await Storage.getPersonalInfo();
		const joinedGroups = await Storage.getJoinedGroups();
		const [ssid, bssid] = await getWifi();
		let groups = {};
		Object.keys(joinedGroups[bssid] || {}).forEach((groupID) => {
			groups[groupID] = encrypt(groupID, joinedGroups[bssid][groupID].key);
		});

		global.Socket.send(new Buffer(JSON.stringify({
			type: 'alive',
			payload: {
				uid,
				data: personalInfo.normal,
				joinedGroups: groups
			}
		})));
	}

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

	function sendAlive() {
		const period = 40 * 1000;
		setTimeout(_sendAlive, 3 * 1000);
		setInterval(_sendAlive, period);
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
			const payload = data.payload;
			const [ssid, bssid] = await getWifi();
			const targetGroups = Object.keys(payload.joinedGroups); // 收到的使用者所加入的 groupID array
			// 將使用者存進記憶體
			global.netUsers[payload.uid] = Object.assign({}, payload.data, { lastSeen: moment().format() });

			// 檢查此使用者是否有加入本身已加入群組
			const joinedGroups = await Storage.getJoinedGroups();
			const conGroups = Object.keys(joinedGroups[bssid] || {}).filter((groupID) => targetGroups.includes(groupID)); // 共同群組 groupID array
			if (conGroups.length === 0) {
				return;
			}

			// 檢查封包正確性
			const validData =  conGroups.every((groupID) => {
				const key = joinedGroups[bssid][groupID].key;
				return groupID === decrypt(payload.joinedGroups[groupID], key);
			});

			if (!validData) {
				return;
			}

			// save user info
			Storage.saveUser(payload.uid, Object.assign({}, payload.data, { lastSeen: moment().format() }));
			Storage.saveNetUser(bssid, payload.uid);
		});
	}

	function getOnlineStatus(timestamp) {
		const diff = moment().diff(moment(timestamp), 'seconds');
		let online = 0;
		let text;
		if (diff <= 60 * 3) {
			online = 1;
			text = '上線中';
		} else if (diff <= 60 * 60) {
			text = '1 小時內';
		} else if (diff <= 60 * 60 * 24) {
			text = '1 天內';
		} else if (diff <= 60 * 60 * 24 * 30) {
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
	
	return {
		genPass,
		login,
		checkLogin,
		getDeviceID,
		getUid,
		genGroupKey,
		genUUID,
		getWifi,
		sendAlive,
		encrypt,
		decrypt,
		parseAlive,
		getOnlineStatus
	}
})();
