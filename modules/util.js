import {
	AsyncStorage
} from 'react-native';
import sha256 from 'sha256';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';

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
		AsyncStorage.setItem('@LANChat:lastLogin', moment().format('YYYY-MM-DD HH:mm:ss'));
	}

	async function checkLogin() {
		let lastLogin = await AsyncStorage.getItem('@LANChat:lastLogin');
		lastLogin = typeof lastLogin === 'string' ? lastLogin : null;
		if (!lastLogin) {
			return false;
		}

		if (!moment(lastLogin).isValid() ||
			moment().diff(moment(lastLogin), 'minutes') > _expireTime) {
			AsyncStorage.removeItem('@LANChat:lastLogin');
			return false;
		}

		return true;
	}
	
	return {
		genPass,
		login,
		checkLogin
	}
})();
