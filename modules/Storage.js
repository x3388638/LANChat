import {
	AsyncStorage
} from 'react-native';

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
		const { groupName, groupDesc, createdTime, groupID, key, net } = groupInfo;
		if (!groupName || !createdTime || !groupID || !key) {
			callback('missing param');
			return;
		}

		let ssid;
		let bssid;
		if (net && net.ssid && net.bssid) {
			ssid = net.ssid;
			bssid = net.bssid
		} else {
			let wifi = await Util.getWifi();
			ssid = wifi[0];
			bssid = wifi[1];
		}

		const joinedGroups = await getJoinedGroups();
		joinedGroups[bssid] = Object.assign({}, joinedGroups[bssid] || {}, {
			[groupID]: {
				groupID,
				groupName,
				groupDesc,
				key,
				createdTime,
				net: {
					ssid,
					bssid
				}
			}
		});

		AsyncStorage.setItem('@LANChat:joinedGroups', JSON.stringify(joinedGroups), () => {
			callback(null);
		});
	}

	async function leaveGroup(bssid, groupID, callback) {
		const joinedGroups = await getJoinedGroups();
		delete joinedGroups[bssid][groupID];
		if (Object.keys(joinedGroups[bssid]) === 0) {
			delete joinedGroups[bssid];
		}

		AsyncStorage.setItem('@LANChat:joinedGroups', JSON.stringify(joinedGroups), callback);
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
		leaveGroup,
		getJoinedGroups,
		removeItem
	};
})();
