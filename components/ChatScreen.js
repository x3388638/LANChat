import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import QRCodeModal from './QRCodeModal.js';
import InputBar from './InputBar.js';
import MsgList from './MsgList.js';

import Storage from '../modules/Storage';
import Util from '../modules/util';

export default class ChatScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			qrcodeModalOpen: false
		};

		this.handleShowQRCode = this.handleShowQRCode.bind(this);
		this.checkGroup = this.checkGroup.bind(this);
		this.getOnlineCount = this.getOnlineCount.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		title: navigation.state.params.title || navigation.state.params.groupName,
		headerBackTitle: 'Back',
		headerRight: (
			<View style={ styles.headerRightContainer }>
				{ navigation.state.params.groupID !== 'LOBBY' &&
				<Icon
					size={24}
					color="#132731"
					name="qrcode"
					underlayColor="#d3d3d3"
					style={ styles.qrcodeBtn }
					onPress={ navigation.state.params.handleShowQRCode }
				/>
				}
				<Icon
					size={24}
					color="#007dff"
					name="info-circle"
					underlayColor="#d3d3d3"
					style={styles.settingsBtn}
					onPress={() => navigation.navigate('ChatInfo', navigation.state.params)}
				/>
			</View>
		)
	});

	componentDidMount() {
		this.props.navigation.addListener('didFocus', () => {
			this.checkGroup();
			this.getOnlineCount();
			setInterval(this.getOnlineCount, 9 * 1000);
		});

		this.props.navigation.setParams({ handleShowQRCode: this.handleShowQRCode });
	}

	handleShowQRCode() {
		this.setState({
			qrcodeModalOpen: true
		});
	}

	async checkGroup() {
		const joinedGroups = await Storage.getJoinedGroups();
		const { bssid, groupID } = this.props.navigation.state.params;
		if (groupID !== 'LOBBY' && (!joinedGroups[bssid] || !joinedGroups[bssid][groupID])) {
			this.props.navigation.goBack();
		}
	}

	async getOnlineCount() {
		const groupID = this.props.navigation.state.params.groupID;
		if (groupID === 'LOBBY') {
			this.props.navigation.setParams({
				title: `${this.props.navigation.state.params.groupName} (${ Object.keys(global.netUsers).length })`
			});

			return;
		}

		const bssid = this.props.navigation.state.params.bssid;
		const members = await Util.getGroupMembers(bssid, groupID);

		let onlineMemberCount = 0;
		Promise
			.all(Object.keys(members).map((uid) => Util.getOnlineStatus(uid)))
			.then((onlineStatusArr) => {
				onlineMemberCount = onlineStatusArr.filter((onlineStatus) => !!onlineStatus.online).length
				this.props.navigation.setParams({
					title: `${this.props.navigation.state.params.groupName} (${ onlineMemberCount })`
				});
			});
	}

	render() {
		const isLobby = this.props.navigation.state.params.groupID === 'LOBBY'
		return (
			<View style={ styles.container }>
				<MsgList />
				<InputBar />
				{ Platform.OS === 'ios' && <KeyboardSpacer /> }
				{ !isLobby &&
				<QRCodeModal
					open={ this.state.qrcodeModalOpen }
					onHide={() => { this.setState({ qrcodeModalOpen: false }) }}
					groupInfo={ JSON.parse(this.props.navigation.state.params.groupInfo) }
				/>
				}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		height: '100%',
		backgroundColor: '#D5D6CB'
	},
	settingsBtn: {
		marginRight: 10
	},
	qrcodeBtn: {
		marginRight: 10
	},
	headerRightContainer: {
		flexDirection: 'row'
	}
});
