import React from 'react';
import {
	View,
	Text,
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

export default class ChatInfoScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			qrcodeModalOpen: false
		};
	}

	static navigationOptions = {
		title: '群組資訊'
	};

	render() {
		const isLobby = this.props.navigation.state.params.groupID === 'LOBBY';
		const ssid = isLobby ? this.props.navigation.state.params.ssid : JSON.parse(this.props.navigation.state.params.groupInfo).net.ssid;
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
							onPress={() => { this.setState({ qrcodeModalOpen: true }) }}
						/>
					</View>
					<View style={styles.leaveBtnContainer}>
						<Button
							icon={{ name: 'warning' }}
							backgroundColor="#ff3b30"
							title='退出群組'
						/>
					</View>
					<Divider style={ styles.divider } />
				</View>
				}
				<View style={ styles.memberContainer }>
					<Text style={ styles.memberTitle }>30 成員</Text>
					<List containerStyle={{ marginTop: 0 }}>
						{
							list.map((item, i) => (
								<ListItem
									key={i}
									title={item.title}
									leftIcon={{ name: item.icon }}
								/>
							))
						}
					</List>
				</View>
				{ !isLobby &&
				<QRCodeModal
					open={ this.state.qrcodeModalOpen }
					onHide={() => { this.setState({qrcodeModalOpen: false}) }}
					groupInfo={ JSON.parse(this.props.navigation.state.params.groupInfo) }
				/>
				}
			</KeyboardAwareScrollView>
		)
	}
}

const list = [
	{
		title: 'Appointments',
		icon: 'av-timer'
	},
	{
		title: 'Trips',
		icon: 'flight-takeoff'
	},
]

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
		marginTop: 20
	},
	memberTitle: {
		marginLeft: 10,
		marginBottom: 3,
		fontSize: 16,
		color: '#6B7B83'
	}
});
