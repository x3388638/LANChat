import React from 'react';
import {
	View,
	Text,
	Button as NativeBtn,
	StyleSheet
} from 'react-native';
import { Button } from 'react-native-elements';
import BottomNavigation, { Tab } from 'react-native-material-bottom-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props);
		this.handleTabChange = this.handleTabChange.bind(this);
		this.handlePressNewGroup = this.handlePressNewGroup.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		title: '訊息',
		headerRight: <Icon size={24} color="#37474F" name="pencil-square-o" style={ styles.newGroupBtn } onPress={this.handlePressNewGroup} />
	});

	handleTabChange(index) {
		switch (index) {
			case 0:
				alert('go to settings');
				break;
			case 2:
				this.props.navigation.navigate('QRScanner');
				break;
		}
	}

	handlePressNewGroup() {
		alert('to create group');
	}

	render() {
		return (
			<View style={ styles.container }>
				<Text>home screen</Text>
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
