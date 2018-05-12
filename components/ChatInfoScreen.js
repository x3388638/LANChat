import React from 'react';
import {
	View,
	Text,
	Alert,
	StyleSheet
} from 'react-native';
import {
	Button,
	List,
	ListItem,
	Divider
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

import QRCodeModal from './QRCodeModal.js';
import MemberOnlineStatus from './MemberOnlineStatus.js';
import Storage from '../modules/Storage.js';
import Util from '../modules/util.js';

export default class ChatInfoScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			qrcodeModalOpen: false,
			qrcodeModalLoading: false,
			members: '{}'
		};

		this.handleShowQRCode = this.handleShowQRCode.bind(this);
		this.handleLeave = this.handleLeave.bind(this);
		this.getMembers = this.getMembers.bind(this);
	}

	static navigationOptions = {
		title: '群組資訊'
	};

	componentDidMount () {
		this.props.navigation.addListener('didFocus', () => {
			this.getMembers();
		});
	}
	
	handleShowQRCode() {
		this.setState({ qrcodeModalLoading: true }, () => {
			setTimeout(() => {
				this.setState({
					qrcodeModalOpen: true
				});
			}, 100);
		})
	}

	handleLeave() {
		Alert.alert('確定退出?', null, [
			{ text: '取消', onPress: () => {} },
			{ text: '確定', onPress: () => {
				Storage.leaveGroup(
					JSON.parse(this.props.navigation.state.params.groupInfo).net.bssid,
					this.props.navigation.state.params.groupID,
					this.props.navigation.goBack
				)
			} }
		]);
	}

	async getMembers() {
		const groupID = this.props.navigation.state.params.groupID;
		const bssid = this.props.navigation.state.params.bssid;
		const members = await Util.getGroupMembers(bssid, groupID);

		this.setState({
			members: JSON.stringify(members)
		});
	}

	render() {
		const isLobby = this.props.navigation.state.params.groupID === 'LOBBY';
		const ssid = isLobby ? this.props.navigation.state.params.ssid : JSON.parse(this.props.navigation.state.params.groupInfo).net.ssid;
		const members = JSON.parse(this.state.members);
		const membersArrSorted = Object.keys(members).sort((uidA, uidB) => {
			return moment(members[uidB].lastSeen).diff(moment(members[uidA].lastSeen), 'seconds');
		});

		return (
			<KeyboardAwareScrollView>
				<View style={ styles.titleContainer }>
					<Text style={ styles.groupName }>{ this.props.navigation.state.params.groupName }</Text>
					<View style={ styles.subtitleContainer }>
						<MIcon
							size={14}
							color="#4E6068"
							name="wifi"
							style={ styles.subtitleIcon }
						/>
						<Text style={ styles.subtitle }>{ ssid }</Text>
					</View>
					{ !isLobby && 
					<View style={ styles.subtitleContainer }>
						<MIcon
							size={14}
							color="#4E6068"
							name="access-time"
							style={ styles.subtitleIcon }
						/>
						<Text style={ styles.subtitle }>{ moment(JSON.parse(this.props.navigation.state.params.groupInfo).createdTime).format('YYYY-MM-DD') }</Text>
					</View>
					}
				</View>
				{ !isLobby &&
				<View>
					<View style={ styles.descContainer }>
						<Text style={ styles.descTitle }>簡介</Text>
						<Text style={ styles.descText }>{ JSON.parse(this.props.navigation.state.params.groupInfo).groupDesc || '-' }</Text>
					</View>
					<View style={ styles.QRCodeBtnContainer }>
						<Button
							icon={{ name: 'qrcode', type: 'font-awesome' }}
							backgroundColor="#007dff"
							title='QR Code'
							loading={ this.state.qrcodeModalLoading }
							onPress={ this.handleShowQRCode }
						/>
					</View>
					<View style={styles.leaveBtnContainer}>
						<Button
							icon={{ name: 'warning' }}
							backgroundColor="#ff3b30"
							title='退出群組'
							onPress={ this.handleLeave }
						/>
					</View>
					<Divider style={ styles.divider } />
				</View>
				}
				<View style={ styles.memberContainer }>
					<Text style={ styles.memberTitle }>{ membersArrSorted.length } 成員</Text>
					<List containerStyle={{ marginTop: 0 }}>
						{
							membersArrSorted.map((uid) => (
								<ListItem
									key={ uid }
									title={ members[uid].username }
									titleStyle={ styles.memberItemTitle }
									underlayColor="#d3d3d3"
									subtitle={ <MemberOnlineStatus lastSeen={ members[uid].lastSeen } /> }
									onPress={() => { this.props.navigation.navigate('UserInfo', Object.assign({}, this.props.navigation.state.params, { uid })) }}
								/>
							))
						}
					</List>
				</View>
				{ !isLobby &&
				<QRCodeModal
					open={ this.state.qrcodeModalOpen }
					onShow={() => { this.setState({ qrcodeModalLoading: false }) }}
					onHide={() => { this.setState({qrcodeModalOpen: false}) }}
					groupInfo={ JSON.parse(this.props.navigation.state.params.groupInfo) }
				/>
				}
			</KeyboardAwareScrollView>
		)
	}
}

const styles = StyleSheet.create({
	titleContainer: {
		backgroundColor: '#fff',
		paddingLeft: 55,
		paddingRight: 20,
		paddingTop: 30,
		paddingBottom: 30,
		borderColor: '#d3d3d3',
		borderTopWidth: 1,
		borderBottomWidth: 1
	},
	groupName: {
		color: '#111',
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10
	},
	subtitleIcon: {
		width: 20
	},
	subtitleContainer: {
		flexDirection: 'row'
	},
	subtitle: {
		color: '#4E6068',
		flex: 1
	},
	descContainer: {
		marginTop: 20
	},
	descTitle: {
		marginLeft: 10,
		fontSize: 16,
		color: '#6B7B83'
	},
	descText: {
		backgroundColor: '#fff',
		marginTop: 3,
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 25,
		paddingBottom: 25,
		borderColor: '#d3d3d3'
	},
	QRCodeBtnContainer: {
		marginTop: 30
	},
	leaveBtnContainer: {
		marginTop: 15
	},
	divider: {
		marginTop: 30,
		marginBottom: 10
	},
	memberContainer: {
		marginTop: 20,
		marginBottom: 20
	},
	memberTitle: {
		marginLeft: 10,
		marginBottom: 3,
		fontSize: 16,
		color: '#6B7B83'
	},
	memberItemTitle: {
		fontWeight: 'bold'
	}
});
