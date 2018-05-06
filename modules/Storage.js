import {
	AsyncStorage
} from 'react-native';
import { NetworkInfo } from 'react-native-network-info';

import Util from './util.js';

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

	async function setPersonalInfo(data = { normal: {}, emergency: {} }) {
		let personalInfo = await getPersonalInfo();

		personalInfo = personalInfo || {
			normal: {},
			emergency: {}
		};

		personalInfo = {
			normal: Object.assign({}, personalInfo.normal || {}, data.normal || {}, { uid: Util.getUid() }),
			emergency: Object.assign({}, personalInfo.emergency || {}, data.emergency || {})
		};

		AsyncStorage.setItem('@LANChat:personalInfo', JSON.stringify(personalInfo));
	}

	async function getPersonalInfo() {
		const info = await AsyncStorage.getItem('@LANChat:personalInfo')
		return info ? JSON.parse(info) : undefined;
	}

	async function addGroup(groupInfo = {}, callback) {
		const { groupName, createdTime, groupID, key } = groupInfo;
		if (!groupName || !createdTime || !groupID || !key) {
			callback('missing param');
			return;
		}

		new Promise((resolve, reject) => {
			NetworkInfo.getSSID(resolve);
		}).then((ssid) => {
			return new Promise((resolve, reject) => {
				NetworkInfo.getBSSID(bssid => {
					resolve({ ssid, bssid });
				});
			})
		}).then(async (net) => {
			const joinedGroups = await getJoinedGroups();
			AsyncStorage.setItem('@LANChat:joinedGroups', JSON.stringify(Object.assign({}, joinedGroups, {
				[groupID]: {
					groupID,
					groupName,
					key,
					createdTime,
					net
				}
			})), () => {
				callback(null);
			});
		}).catch((err) => {
			callback(err);
		});
	}

	async function getJoinedGroups() {
		const groups = await AsyncStorage.getItem('@LANChat:joinedGroups');
		return groups ? JSON.parse(groups) : {};
	}

	function removeItem(key) {
		AsyncStorage.removeItem(`@LANChat:${key}`);
	}
	
	return {
		setLastLogin,
		getLastLogin,
		setPass,
		getPass,
		setPersonalInfo,
		getPersonalInfo,
		addGroup,
		getJoinedGroups,
		removeItem
	};
})();
