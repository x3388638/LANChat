import {
	AsyncStorage
} from 'react-native';

export default (() => {
	function setLastLogin(time) {
		AsyncStorage.setItem('@LANChat:lastLogin', time);
	}

	async function getLastLogin() {
		return await AsyncStorage.getItem('@LANChat:lastLogin');
	}

	function setPass(pass, callback) {
		AsyncStorage.setItem('@LANChat:pass', pass, callback);
	}

	async function getPass() {
		return await AsyncStorage.getItem('@LANChat:pass');
	}

	function removeItem(key) {
		AsyncStorage.removeItem(`@LANChat:${key}`);
	}
	
	return {
		setLastLogin,
		getLastLogin,
		setPass,
		getPass,
		removeItem
	};
})();
