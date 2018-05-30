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

	async function setPersonalInfo(data = { normal: {}, emergency: {} }, callback) {
		let personalInfo = await getPersonalInfo();

		personalInfo = personalInfo || {
			normal: {},
			emergency: {}
		};

		personalInfo = {
			normal: Object.assign({}, personalInfo.normal || {}, data.normal || {}, { uid: Util.getUid() }),
			emergency: Object.assign({}, personalInfo.emergency || {}, data.emergency || {})
		};

		AsyncStorage.setItem('@LANChat:personalInfo', JSON.stringify(personalInfo), callback);
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

	async function getUsers() {
		const users = await AsyncStorage.getItem('@LANChat:users');
		return users ? JSON.parse(users) : {};
	}

	async function saveUser(uid, data) {
		const users = await getUsers();
		users[uid] = data;
		AsyncStorage.setItem('@LANChat:users', JSON.stringify(users));
	}

	async function updateUser(uid, data) {
		const users = await getUsers();
		const updated = Object.assign({}, users[uid] || {}, data);
		saveUser(uid, updated);
	}

	async function getUsersByNet(bssid = null) {
		let users = await AsyncStorage.getItem('@LANChat:usersByNet');
		users = users ? JSON.parse(users) : {};
		if (bssid) {
			return users[bssid] || {};
		}

		return users;
	}

	async function saveNetUser(bssid, uid) {
		let users = await getUsersByNet();
		users[bssid] = users[bssid] || {};
		users[bssid][uid] = 1;
		AsyncStorage.setItem('@LANChat:usersByNet', JSON.stringify(users));
	}

	function removeItem(key) {
		AsyncStorage.removeItem(`@LANChat:${key}`);
	}

	async function storeMsg(bssid, groupID, msgData, callback) {
		const msg = await getMsg();
		msg[bssid] = msg[bssid] || {};
		msg[bssid][groupID] = msg[bssid][groupID] || {};
		msg[bssid][groupID][msgData.key] = Object.assign({}, msgData, { read: false });
		AsyncStorage.setItem('@LANChat:messages', JSON.stringify(msg), callback);
	}

	async function getMsg(bssid = '', groupID = '', msgID = '') {
		let msg = await AsyncStorage.getItem('@LANChat:messages');
		msg = msg ? JSON.parse(msg) : {};
		if (!bssid) {
			return msg;
		}

		if (!groupID) {
			return msg[bssid] || {}
		}

		if (!msgID) {
			return msg[bssid] ? msg[bssid][groupID] ? msg[bssid][groupID] : {} : {};
		}

		return msg[bssid] ? msg[bssid][groupID] ? msg[bssid][groupID][msgID] ? msg[bssid][groupID][msgID] : {} : {} : {};
	}

	async function setMsgRead(bssid, groupID) {
		const messages = await getMsg();
		const processedMsg = {};
		Object.values(messages[bssid][groupID] || {}).forEach((msgObj) => {
			processedMsg[msgObj.key] = Object.assign({}, msgObj, { read: true });
		});

		messages[bssid][groupID] = processedMsg;
		AsyncStorage.setItem('@LANChat:messages', JSON.stringify(messages));
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
		getUsers,
		saveUser,
		updateUser,
		getUsersByNet,
		saveNetUser,
		removeItem,
		storeMsg,
		getMsg,
		setMsgRead
	};
})();
