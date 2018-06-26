import {
	AsyncStorage
} from 'react-native';
import moment from 'moment';

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
		// delete from joinedGroups
		const joinedGroups = await getJoinedGroups();
		delete joinedGroups[bssid][groupID];
		if (Object.keys(joinedGroups[bssid]) === 0) {
			delete joinedGroups[bssid];
		}

		// delete from messages
		const messages = await getMsg();
		delete messages[bssid][groupID];
		if (Object.keys(messages[bssid]).length === 0) {
			delete messages[bssid];
		}

		Promise.all([
			AsyncStorage.setItem('@LANChat:joinedGroups', JSON.stringify(joinedGroups)),
			AsyncStorage.setItem('@LANChat:messages', JSON.stringify(messages))
		]).then(callback);
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
		if (!messages[bssid] || !messages[bssid][groupID]) {
			return;
		}

		Object.values(messages[bssid][groupID]).forEach((msgObj) => {
			processedMsg[msgObj.key] = Object.assign({}, msgObj, { read: true });
		});

		messages[bssid][groupID] = processedMsg;
		AsyncStorage.setItem('@LANChat:messages', JSON.stringify(messages));
	}

	async function msgSync(bssid, pendingMsg, callback) {
		/*
		pendingMsg = {
			[groupID]: [
				{ msgObj }
			]
		}
		*/
		const messages = await getMsg();
		Object.keys(pendingMsg).forEach((groupID) => {
			messages[bssid] = messages[bssid] || {};
			messages[bssid][groupID] = messages[bssid][groupID] || {};
			pendingMsg[groupID].forEach((msg) => {
				messages[bssid][groupID][msg.key] = Object.assign({}, msg, { read: false });
			});
		});

		AsyncStorage.setItem('@LANChat:messages', JSON.stringify(messages), callback);
	}

	async function getPoll(pollID) {
		let polls = await AsyncStorage.getItem('@LANChat:poll');
		polls = polls ? JSON.parse(polls) : {};
		if (!pollID) {
			return polls;
		} else {
			return polls[pollID] || {};
		}
	}

	async function addPoll({ bssid, groupID, pollID, creater, timestamp, data }) {
		const polls = await getPoll();
		polls[pollID] = {
			bssid,
			groupID,
			creater,
			timestamp,
			title: data.title,
			desc: data.desc,
			options: data.options
		};

		AsyncStorage.setItem('@LANChat:poll', JSON.stringify(polls));
	}

    async function addPolls(pollArr) {
		const polls = await getPoll();
		pollArr.forEach((poll) => {
            polls[poll.pollID] = {
                bssid: poll.bssid,
                groupID: poll.groupID,
                creater: poll.creater,
                timestamp: poll.timestamp,
                title: poll.data.title,
                desc: poll.data.desc,
                options: poll.data.options
            };
		});

        AsyncStorage.setItem('@LANChat:poll', JSON.stringify(polls));
	}

	async function deletePollsByGroup(bssid, groupID) {
		const polls = await getPoll();
		Object.keys(polls).forEach((pollID) => {
			if (polls[pollID].bssid === bssid &&
				polls[pollID].groupID === groupID) {
				delete polls[pollID];
			}
		});

		AsyncStorage.setItem('@LANChat:poll', JSON.stringify(polls));
	}

	async function getVote(voteID) {
		let votes = await AsyncStorage.getItem('@LANChat:vote');
		votes = votes ? JSON.parse(votes) : {};
		if (!voteID) {
			return votes;
		} else {
			return votes[voteID];
		}
	}

	async function addVote({ bssid, groupID, voteID, voter, timestamp, data }) {
		const votes = await getVote();
		if (votes[voteID] &&
			moment(votes[voteID].timestamp).diff(moment(timestamp)) > 0) {
			return;
		}

		votes[voteID] = {
            bssid,
            groupID,
            voter,
            timestamp,
            pollID: data.pollID,
            optionID: data.optionID,
		};

		AsyncStorage.setItem('@LANChat:vote', JSON.stringify(votes));
	}

	async function addVotes(voteArr) {
		const votes = await getVote();
		voteArr.forEach((vote) => {
            if (votes[vote.voteID] &&
                moment(votes[vote.voteID].timestamp).diff(moment(vote.timestamp)) > 0) {
                return;
            }

            votes[vote.voteID] = {
                bssid: vote.bssid,
                groupID: vote.groupID,
                voter: vote.voter,
                timestamp: vote.timestamp,
                pollID: vote.data.pollID,
                optionID: vote.data.optionID,
            };
		});

        AsyncStorage.setItem('@LANChat:vote', JSON.stringify(votes));
	}

	async function deleteVotesByGroup(bssid, groupID) {
		const votes = await getVote();
		Object.keys(votes).forEach((voteID) => {
			if (votes[voteID].bssid === bssid &&
				votes[voteID].groupID === groupID) {
				delete votes[voteID];
			}
		});

		AsyncStorage.setItem('@LANChat:vote', JSON.stringify(votes));
	}

	async function getFile(fileID) {
		let files = await AsyncStorage.getItem('@LANChat:file');
		files = files ? JSON.parse(files) : {};
		if (fileID) {
			let file;
			Object.values(files).some((groupObj) => {
				return Object.values(groupObj).some((fileObj) => {
					return Object.keys(fileObj).some((id) => {
						if (id === fileID) {
							file = fileObj[id];
							return true;
						}
					});
				});
			});

			return file;
		}

		return files;
	}

	async function addFile({ bssid, groupID, fileID, fileName, filePath }) {
		let files = await getFile();
		files[bssid] = files[bssid] || {};
		files[bssid][groupID] = files[bssid][groupID] || {};
		files[bssid][groupID][fileID] = {
			fileID,
			filePath,
			fileName
		};

		AsyncStorage.setItem('@LANChat:file', JSON.stringify(files));
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
		setMsgRead,
		msgSync,
		getPoll,
		addPoll,
		addPolls,
		deletePollsByGroup,
		getVote,
		addVote,
		addVotes,
		deleteVotesByGroup,
		getFile,
		addFile,
	};
})();
