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
			new Promise((resolve) => NetworkInfo.getBSSID(resolve))
		]);
	}

	function sendAlive() {
		const period = 10 * 1000;
		const uid = getUid();
		setInterval(async () => {
			const personalInfo = await Storage.getPersonalInfo();
			const joinedGroups = await Storage.getJoinedGroups();
			const [ssid, bssid] = await getWifi();
			let groups = {};
			Object.keys(joinedGroups[bssid]).forEach((groupID) => {
				groups[groupID] = encrypt(groupID, joinedGroups[bssid][groupID].key);
			});

			global.Socket.send(new Buffer(JSON.stringify({
				type: 'alive',
				paylaod: {
					uid,
					data: personalInfo.normal,
					joinedGroups: groups
				}
			})));
		}, period);
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
		decrypt
	}
})();
