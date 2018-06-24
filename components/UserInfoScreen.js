import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import UserAvatar from 'react-native-user-avatar';

import MemberOnlineStatus from './MemberOnlineStatus.js';

import Storage from '../modules/Storage';

export default class UserInfoScreen extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			selfIntro: '',
			lastSeen: ''
		};

		this.getUser = this.getUser.bind(this);
	}
	
	static navigationOptions = {
		title: '個人資訊'
	}

	componentDidMount() {
		this.props.navigation.addListener('didFocus', () => {
			this.getUser(this.props.navigation.state.params.uid);
		});
	}

	async getUser(uid) {
		let users = {};
		if (this.props.navigation.state.params.groupID === 'LOBBY') {
			Object.values(global.netUsers).forEach((user) => {
				users[user.uid] = user;
			});
		} else {
			users = await Storage.getUsers();
		}

		this.setState({
			username: users[uid].username,
			selfIntro: users[uid].selfIntro,
			lastSeen: users[uid].lastSeen
		});
	}

	render() {
		return (
			<View>
				{ !!this.state.username &&
					<View style={ styles.titleContainer }>
						<UserAvatar size="55" name={ this.state.username } style={ styles.avatar } />
						<View style={ styles.textContainer }>
							<Text style={ styles.username }>{ this.state.username }</Text>
							<MemberOnlineStatus uid={ this.props.navigation.state.params.uid } />
						</View>
					</View>
				}
				<Text style={ styles.selfIntroTitle }>個人簡介</Text>
				<Text style={ styles.selfIntroContainer }>{ this.state.selfIntro || '-' }</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	titleContainer: {
		backgroundColor: '#fff',
		paddingTop: 35,
		paddingBottom: 35,
		paddingLeft: 25,
		paddingRight: 10,
		marginBottom: 10,
		flexDirection: 'row'
	},
	avatar: {
		width: 55,
		marginRight: 10
	},
	textContainer: {
		flex: 1
	},
	username: {
		color: '#111',
		fontSize: 30,
		fontWeight: 'bold',
		marginLeft: 10,
		marginBottom: 5
	},
	selfIntroTitle: {
		marginLeft: 10,
		fontSize: 16,
		color: '#6B7B83'
	},
	selfIntroContainer: {
		backgroundColor: '#fff',
		marginTop: 3,
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 25,
		paddingBottom: 25,
		borderColor: '#d3d3d3'
	}
});
