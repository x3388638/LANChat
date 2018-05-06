import sha256 from 'sha256';
import sha1 from 'sha1';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
const crypto = require('crypto');

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
		console.warn(key);
	}
	
	return {
		genPass,
		login,
		checkLogin,
		getDeviceID,
		getUid,
		genGroupKey
	}
})();
