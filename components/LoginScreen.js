import React from 'react';
import {
	View,
	Text,
	TextInput,
	Alert,
	AsyncStorage,
	StyleSheet
} from 'react-native';
import { Button } from 'react-native-elements';
import sha256 from 'sha256';
import DeviceInfo from 'react-native-device-info';

export default class LoginScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pass: '',
			storedPass: null
		};

		this.handleLogin = this.handleLogin.bind(this);
		this.handleRegister = this.handleRegister.bind(this);
		this.getStoredPass = this.getStoredPass.bind(this);
		// AsyncStorage.removeItem('@LANChat:pass');
	}

	static navigationOptions = {
		title: '登入'
	}

	componentDidMount() {
		this.props.navigation.addListener('didFocus', this.getStoredPass);
		Alert.alert(DeviceInfo.getBrand());
	}

	handleLogin() {
		const pass = this.state.pass;
		if (sha256(pass) !== this.state.storedPass) {
			Alert.alert('密碼錯誤');
			return;
		}

		this.props.navigation.navigate('Main1');
	}

	handleRegister() {
		if (!!this.state.storedPass) {
			Alert.alert('此裝置已註冊');
			return;
		}

		this.props.navigation.navigate('Register');
	}

	async getStoredPass() {
		const pass = await AsyncStorage.getItem('@LANChat:pass');
		this.setState({
			storedPass: typeof pass === 'string' ? pass : null
		});
	}

	render() {
		return (
			<View style={ styles.container }>
				<TextInput
					style={ styles.password }
					placeholder="Password"
					maxLength={4}
					keyboardType="numeric"
					onChangeText={(text) => this.setState({ pass: text })}
				/>
				<Button
					title="登入"
					buttonStyle={ styles.loginBtn }
					onPress={ this.handleLogin }
				/>
				<Button
					title="註冊"
					buttonStyle={ styles.registerBtn }
					onPress={ this.handleRegister }
					color="#111"
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	password: {
		width: 300,
		height: 80,
		fontSize: 30,
		textAlign: 'center',
		backgroundColor: '#f3f3f3',
		borderColor: '#f3f3f3',
		borderWidth: 1,
		borderRadius: 10
	},
	loginBtn: {
		width: 300,
		backgroundColor: '#000',
		marginTop: 20,
		borderRadius: 5
	},
	registerBtn: {
		width: 300,
		borderRadius: 5,
		marginTop: 5,
		backgroundColor: '#d3d3d3'
	}
});
