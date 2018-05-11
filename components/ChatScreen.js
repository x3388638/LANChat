import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import Storage from '../modules/Storage';
import Util from '../modules/util';

export default class ChatScreen extends React.Component {
	constructor(props) {
		super(props);
		this.checkGroup = this.checkGroup.bind(this);
		this.getOnlineCount = this.getOnlineCount.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		title: navigation.state.params.title || navigation.state.params.groupName,
		headerBackTitle: 'Back',
		headerRight: (
			<Icon
				size={24}
				color="#007dff"
				name="info-circle"
				style={ styles.settingsBtn }
				onPress={ () => navigation.navigate('ChatInfo', navigation.state.params) }
			/>
		)
	});

	componentDidMount() {
		this.props.navigation.addListener('didFocus', () => {
			this.checkGroup();
			this.getOnlineCount();
			setInterval(this.getOnlineCount, 30 * 1000);
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
		const bssid = this.props.navigation.state.params.bssid;
		const groupID = this.props.navigation.state.params.groupID;
		const members = await Util.getGroupMembers(bssid, groupID);
		const onlineMembers = Object.keys(members).filter((uid) => !!Util.getOnlineStatus(members[uid].lastSeen).online);
		this.props.navigation.setParams({
			title: `${this.props.navigation.state.params.groupName} (${onlineMembers.length})`
		});
	}

	render() {
		return (
			<View>
				<Text>chat screen</Text>
				<Text>{ JSON.stringify(this.props.navigation.state.params, null, 4) }</Text>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	settingsBtn: {
		marginRight: 10
	}
});
