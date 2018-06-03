import React from 'react';
import {
	View,
	Text,
	Alert,
	StyleSheet,
	NetInfo,
	PermissionsAndroid
} from 'react-native';
import {
	Button,
	List,
	ListItem
} from 'react-native-elements';
import BottomNavigation, { Tab } from 'react-native-material-bottom-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';

import UnreadCounter from './UnreadCounter.js';
import EmergencyModal from './EmergencyModal.js';

import GroupsTitle from './GroupsTitle.js';
import Storage from '../modules/Storage.js';
import Util from '../modules/util.js';

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			emergencyModalOpen: false,
			joinedGroups: '{}',
			currentNet: null,
			userCount: '...',
			lastMsg: '{}', // { groupID: { username: '', msg: '', time: 'ISO 8601' } }
			unreadCount: '{}', // { groupID: countNUm }
			unreadEmergency: false,
			geolocation: '{}', // { lat: 0, lng: 0 }
			personalInfo: null
		};

		global.UdpSocket.init();
		this.handleTabChange = this.handleTabChange.bind(this);
		this.handlePressGroup = this.handlePressGroup.bind(this);
		this.handleOpenEmergencyModal = this.handleOpenEmergencyModal.bind(this);
		this.handleSubmitEmergency = this.handleSubmitEmergency.bind(this);
		this.checkPersonalInfo = this.checkPersonalInfo.bind(this);
		this.renderGroups = this.renderGroups.bind(this);
		this.getUserCount = this.getUserCount.bind(this);
		this.getLastMsgAndCountUnread = this.getLastMsgAndCountUnread.bind(this);
		this.handleOnMsg = this.handleOnMsg.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		title: '訊息',
		headerRight: (
			<Icon
				size={24}
				color="#37474F"
				name="pencil-square-o"
				style={ styles.newGroupBtn }
				onPress={ () => navigation.navigate('CreateGroup') }
			/>
		),
		headerLeft: (
			<Icon
				size={24}
				color="#007aff"
				name="bullhorn"
				style={ styles.emergencyBtn }
				onPress={() => { navigation.state.params.handleOpenEmergencyModal() }}
			/>
		)
	});

	componentDidMount() {
		this.props.navigation.setParams({ handleOpenEmergencyModal: this.handleOpenEmergencyModal });
		this.props.navigation.addListener('didFocus', () => {
			this.checkPersonalInfo();
			this.renderGroups();
			this.getLastMsgAndCountUnread();
			this.handleOnMsg();
		});

		Util.parseAlive();
		Util.parseUserData();
		Util.parseMsg();
		Util.parseMsgSync();
		Util.checkConnection();
		Util.listenWiFiChanged();
		Util.sendAlive();
		Util.sendUserDataInterval();

		global.PubSub.on('wifi:disconnect', () => {
			this.props.navigation.navigate('LoginRegister');
		});

		global.PubSub.on('wifi:changed', ([ssid, bssid]) => {
			global.netUsers = {};
			!!this.renderGroups && this.renderGroups();
		});

		global.PubSub.on('tcp:connect', () => {
			setTimeout(this.getUserCount, 1000);
		});

		global.PubSub.on('tcp:disconnect', (ip) => {
			setTimeout(this.getUserCount, 1000);
			Util.handleTcpDisconnect(ip);
		});

		this.getUserCount();

		// PermissionsAndroid.check('ACCESS_FINE_LOCATION').then((granted) => {
		// 	console.warn(granted)
		// 	if (!granted) {
		// 		PermissionsAndroid.request(
		// 			'ACCESS_FINE_LOCATION',
		// 			{
		// 				'title': '需要取用位置權限',
		// 				'message': '傳送緊急訊息將會需要取用您的 GPS 位置'
		// 			}
		// 		)
		// 	}
		// });
	}

	handleTabChange(index) {
		switch (index) {
			case 0:
				this.props.navigation.navigate('Settings');
				break;
			case 1:
				this.renderGroups();
				break;
			case 2:
				this.props.navigation.navigate('QRScanner');
				break;
		}
	}

	async handlePressGroup(groupID, groupName, bssid) {
		const wifiInfo = await Util.getWifi();
		const currentBssid = wifiInfo[1];
		if (groupID === 'LOBBY') {
			const { ssid, bssid } = JSON.parse(this.state.currentNet);
			this.props.navigation.navigate('Chat', {
				groupID,
				groupName: 'LOBBY',
				bssid,
				ssid,
				currentBssid
			});

			return;
		}

		const joinedGroups = JSON.parse(this.state.joinedGroups);
		const groupInfo = JSON.stringify(joinedGroups[bssid][groupID]);
		this.props.navigation.navigate('Chat', {
			groupID,
			groupName,
			bssid,
			groupInfo,
			currentBssid
		});
	}

	handleOnMsg() {
		global.PubSub.on('receiveMsg', () => {
			setTimeout(() => {
				this.getLastMsgAndCountUnread();
			}, 150);
		});
	}

	async handleOpenEmergencyModal() {
		const personalInfo = await Storage.getPersonalInfo();
		const stateToSet = {
			emergencyModalOpen: true,
			personalInfo: JSON.stringify(personalInfo)
		};

		navigator.geolocation.getCurrentPosition((location) => {
			stateToSet.geolocation = JSON.stringify({
				lat: location.coords.latitude,
				lng: location.coords.longitude
			});

			this.setState(stateToSet);
		}, (err) => {
			console.warn(err);
			this.setState(stateToSet);
		}, {
			enableHighAccuracy: false,
			timeout: 15000
		});
	}

	handleSubmitEmergency() {
		Alert.alert('確定發送緊急訊息?', null, [
			{ text: '取消', onPress: () => { this.setState({ emergencyModalOpen: false }) } },
			{ text: '確定', onPress: () => {
				Util.sendEmergency(JSON.parse(this.state.geolocation));
				this.setState({ emergencyModalOpen: false });
			}}
		]);
	}

	async checkPersonalInfo() {
		const info = await Storage.getPersonalInfo();
		if (!info.normal.username) {
			Alert.alert('請先填寫個人資料', null, [{ text: 'OK', onPress: () => this.props.navigation.navigate('Settings') }]);
		}
	}

	async renderGroups() {
		const joinedGroups = await Storage.getJoinedGroups();
		// console.warn(JSON.stringify(joinedGroups, null, 4));
		const [ssid, bssid] = await Util.getWifi();
		this.setState({
			joinedGroups: JSON.stringify(joinedGroups),
			currentNet: JSON.stringify({
				ssid,
				bssid
			})
		});
	}

	async getUserCount() {
		this.setState({
			userCount: Object.keys(global.netUsers).length
		});
	}

	async getLastMsgAndCountUnread() {
		const [ssid, bssid] = await Util.getWifi();
		const messages = await Storage.getMsg();
		const users = await Storage.getUsers();
		const lastMsg = {};
		const unread = {};
		let unreadEmergency = false;
		Object.keys(messages).forEach((bssid) => {
			Object.keys(messages[bssid]).forEach((groupID) => {
				const last = Object.values(messages[bssid][groupID]).sort((a, b) => moment(a.timestamp).diff(moment(b.timestamp))).pop();
				const gid = groupID === 'LOBBY' ? `LOBBY-${bssid}` : groupID;
				if (last) {
					lastMsg[gid] = {
						username: users[last.sender].username,
						msg: last[last.type],
						time: last.timestamp
					}
				}

				// count unread
				unread[gid] = Object.values(messages[bssid][groupID]).reduce((sum, msgObj) => {
					if (groupID === 'LOBBY' && msgObj.type === 'emergency' && !msgObj.read) {
						unreadEmergency = true;
					}

					return sum + (msgObj.read ? 0 : 1);
				}, 0);
			});
		});

		this.setState({
			lastMsg: JSON.stringify(lastMsg),
			unreadCount: JSON.stringify(unread),
			unreadEmergency
		});
	}

	genSubtitle(bssid, groupID) {
		let gid = groupID;
		if (groupID === 'LOBBY') {
			if (!bssid) {
				return '';
			}

			gid = `LOBBY-${bssid}`
		}

		const lastMsg = JSON.parse(this.state.lastMsg);
		return lastMsg[gid] ? `${moment(lastMsg[gid].time).format('HH:mm')} | ${ lastMsg[gid].username }: ${ lastMsg[gid].msg.substring(0, 100) }` : '';
	}

	genUnreadCounter(bssid, groupID) {
		let gid = groupID;
		if (groupID === 'LOBBY') {
			if (!bssid) {
				return null;
			}

			gid = `LOBBY-${bssid}`;
		}

		const unreadCount = JSON.parse(this.state.unreadCount);
		if (!unreadCount[gid]) {
			return null;
		} else {
			let emergency = false;
			if (groupID === 'LOBBY' && this.state.unreadEmergency) {
				emergency = true;
			}

			return {
				element: <UnreadCounter count={ unreadCount[gid] } emergency={ emergency } />
			}
		}
	}

	render() {
		let joinedGroups = JSON.parse(this.state.joinedGroups);
		let currentNet = this.state.currentNet ? JSON.parse(this.state.currentNet) : null;
		const lastMsg = JSON.parse(this.state.lastMsg);
		return (
			<View style={ styles.container }>
				<List containerStyle={ styles.groupList }>
					<ListItem
						hideChevron
						title="LOBBY"
						subtitle={ this.genSubtitle((currentNet || {}).bssid, 'LOBBY') }
						underlayColor="#d3d3d3"
						leftIcon={{ name: 'home'}}
						titleStyle={ styles.groupTitle }
						badge={ this.genUnreadCounter((currentNet || {}).bssid, 'LOBBY') }
						onPress={() => { this.handlePressGroup('LOBBY') }}
					/>
				</List>
				<KeyboardAwareScrollView style={{ marginBottom: 50}}>
					{ currentNet &&
						<View>
							<GroupsTitle ssid={ `[連線中] ${currentNet.ssid}` } count={ this.state.userCount } />
							<List containerStyle={styles.groupList}>
								{ joinedGroups[currentNet.bssid] &&
									Object.keys(joinedGroups[currentNet.bssid])
										.sort((groupID1, groupID2) => {
											const time1 = lastMsg[groupID1] ? lastMsg[groupID1].time : 0;
											const time2 = lastMsg[groupID2] ? lastMsg[groupID2].time : 0;
											return moment(time2).diff(moment(time1));
										})
										.map((groupID) => (
											<ListItem
												key={ groupID }
												hideChevron
												title={ joinedGroups[currentNet.bssid][groupID].groupName }
												subtitle={ this.genSubtitle(currentNet.bssid, groupID) }
												underlayColor="#d3d3d3"
												titleStyle={styles.groupTitle}
												badge={ this.genUnreadCounter(currentNet.bssid, groupID) }
												onPress={() => { this.handlePressGroup(groupID, joinedGroups[currentNet.bssid][groupID].groupName, currentNet.bssid) }}
											/>
										))
								}
							</List>
						</View>
					}

					{ Object.keys(joinedGroups).filter((bssid) => !currentNet || bssid !== currentNet.bssid).map((bssid) => {
						const ssid = Object.values(joinedGroups[bssid])[0] ? Object.values(joinedGroups[bssid])[0].net.ssid : null;
						if (ssid === null) {
							return null;
						}

						return (
							<View key={ bssid }>
								<GroupsTitle ssid={ ssid } />
								<List containerStyle={styles.groupList}>
									{ Object.keys(joinedGroups[bssid])
										.sort((groupID1, groupID2) => {
											const time1 = lastMsg[groupID1] ? lastMsg[groupID1].time : 0;
											const time2 = lastMsg[groupID2] ? lastMsg[groupID2].time : 0;
											return moment(time2).diff(moment(time1));
										})
										.map((groupID) => (
											<ListItem
												key={ groupID }
												hideChevron
												title={ joinedGroups[bssid][groupID].groupName }
												subtitle={ this.genSubtitle(bssid, groupID) }
												underlayColor="#d3d3d3"
												titleStyle={styles.groupTitle}
												badge={ this.genUnreadCounter(bssid, groupID) }
												onPress={() => { this.handlePressGroup(groupID, joinedGroups[bssid][groupID].groupName, bssid) }}
											/>
										))
									}
								</List>
							</View>
						)
					}) }
				</KeyboardAwareScrollView>
				<BottomNavigation
					labelColor="white"
					rippleColor="white"
					activeTab={1}
					style={ styles.bottomNavigation }
					onTabChange={this.handleTabChange}
				>
					<Tab
						barBackgroundColor="#37474F"
						label="個人資訊"
						icon={<Icon size={24} color="white" name="user" />}
					/>
					<Tab
						barBackgroundColor="#37474F"
						label="訊息"
						icon={<MIcon size={24} color="white" name="message" />}
					/>
					<Tab
						barBackgroundColor="#37474F"
						label="加入群組"
						icon={<Icon size={24} color="white" name="qrcode" />}
					/>
				</BottomNavigation>
				<EmergencyModal
					location={ this.state.geolocation }
					personalInfo={ this.state.personalInfo }
					isOpen={ this.state.emergencyModalOpen }
					hide={() => { this.setState({ emergencyModalOpen: false }) }}
					onSubmit={ this.handleSubmitEmergency }
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		height: '100%'
	},
	bottomNavigation: {
		height: 50,
		elevation: 8,
		position: 'absolute',
		left: 0,
		bottom: 0,
		right: 0
	},
	emergencyBtn: {
		marginLeft: 10
	},
	newGroupBtn: {
		marginRight: 10
	},
	groupList: {
		marginTop: 0,
		marginBottom: 0,
		borderTopWidth: 0
	},
	groupTitle: {
		fontWeight: 'bold'
	}
});
