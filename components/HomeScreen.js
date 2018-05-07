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
	ListItem
} from 'react-native-elements';
import BottomNavigation, { Tab } from 'react-native-material-bottom-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import GroupsTitle from './GroupsTitle.js';
import Storage from '../modules/Storage.js';

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			joinedGroups: {}
		};

		this.handleTabChange = this.handleTabChange.bind(this);
		this.checkPersonalInfo = this.checkPersonalInfo.bind(this);
		this.renderGroups = this.renderGroups.bind(this);
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
		)
	});

	componentDidMount() {
		this.props.navigation.setParams({ handlePressNewGroup: this.handlePressNewGroup });
		this.props.navigation.addListener('didFocus', () => {
			this.checkPersonalInfo();
			this.renderGroups();
		});
	}

	handleTabChange(index) {
		switch (index) {
			case 0:
				this.props.navigation.navigate('Settings');
				break;
			case 2:
				this.props.navigation.navigate('QRScanner');
				break;
		}
	}

	async checkPersonalInfo() {
		const info = await Storage.getPersonalInfo();
		if (!info.normal.username) {
			Alert.alert('請先填寫個人資料', null, [{ text: 'OK', onPress: () => this.props.navigation.navigate('Settings') }]);
		}
	}

	async renderGroups() {
		const joinedGroups = await Storage.getJoinedGroups();
		console.warn(JSON.stringify(joinedGroups, null, 4));
	}

	render() {
		return (
			<View style={ styles.container }>
				<List containerStyle={{ marginTop: 0, marginBottom: 0, borderTopWidth: 0 }}>
					<ListItem
						title="LOBBY"
						subtitle="23:19  |  Y.y.: 安安你好..."
						leftIcon={{ name: 'wifi-tethering'}}
						hideChevron
						titleStyle={{ fontWeight: 'bold' }}
						badge={{ value: 3, textStyle: { color: '#fff' }, containerStyle: { backgroundColor: '#ff3b30' } }}
					/>
				</List>
				<KeyboardAwareScrollView style={{ marginBottom: 50}}>
					<GroupsTitle ssid="CNC Lab" />
					<List containerStyle={{ marginTop: 0, marginBottom: 0, borderTopWidth: 0 }}>
						<ListItem
							title="B11 小角落"
							subtitle="23:19  |  Y.y.: 安安你好..."
							hideChevron
							titleStyle={{ fontWeight: 'bold' }}
							badge={{ value: 3, textStyle: { color: '#fff' }, containerStyle: { backgroundColor: '#ff3b30' } }}
						/>
					</List>
					<List containerStyle={{ marginTop: 0, marginBottom: 0, borderTopWidth: 0 }}>
						<ListItem
							title="中山路三段383巷"
							subtitle="23:19  |  Y.y.: 安安你好..."
							hideChevron
							titleStyle={{ fontWeight: 'bold' }}
							badge={{ value: 3, textStyle: { color: '#fff' }, containerStyle: { backgroundColor: '#ff3b30' } }}
						/>
					</List>
					<GroupsTitle ssid="NCNU" />
					<List containerStyle={{ marginTop: 0, marginBottom: 0, borderTopWidth: 0 }}>
						<ListItem
							title="moli"
							subtitle="23:19  |  Y.y.: 安安你好..."
							hideChevron
							titleStyle={{ fontWeight: 'bold' }}
							badge={{ value: 3, textStyle: { color: '#fff' }, containerStyle: { backgroundColor: '#ff3b30' } }}
						/>
					</List>
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
	newGroupBtn: {
		marginRight: 10
	}
});
