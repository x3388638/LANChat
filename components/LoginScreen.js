import React from 'react';
import {
	View,
	Text,
	TextInput,
	Alert,
	StyleSheet
} from 'react-native';
import {
	Button
} from 'react-native-elements';
import sha256 from 'sha256';
import Util from '../modules/util.js';
import Storage from '../modules/Storage.js';

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
		// Storage.removeItem('pass');
		Storage.removeItem('lastLogin');
		// Storage.removeItem('personalInfo');
		// Storage.removeItem('joinedGroups');
		// Storage.removeItem('users');
		// Storage.removeItem('usersByNet');
		// global.netUsers = {};
	}

	static navigationOptions = {
		title: '登入'
	}

	componentDidMount() {
		Util.checkLogin().then((isLogin) => {
			if (isLogin) {
				setTimeout(() => {
					Util.login();
					this.props.navigation.navigate('Main1');
				}, 300);
			}
		});

		this.props.navigation.addListener('didFocus', this.getStoredPass);
	}

	async handleLogin() {
		const pass = this.state.pass;
		if (Util.genPass(pass) !== this.state.storedPass) {
			Alert.alert('密碼錯誤');
			return;
		}

		const [ssid, bssid] = await Util.getWifi();
		if (bssid === null || bssid === 'error') {
			Alert.alert('尚未連接 WiFi');
			return;
		}

		Util.login();
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
		const pass = await Storage.getPass();
		this.setState({
			storedPass: typeof pass === 'string' ? pass : null
		}, () => {
			if (!this.state.storedPass) {
				this.props.navigation.navigate('Register');
			}
		});
	}

	render() {
		const registered = !!this.state.storedPass;
		return (
			<View style={ styles.container }>
				{ !!registered ?
				[
					<TextInput
						key="password"
						style={styles.password}
						placeholder="Password"
						maxLength={4}
						keyboardType="numeric"
						onChangeText={(text) => this.setState({ pass: text })}
					/>,
					<Button
						key="loginBtn"
						title="登入"
						buttonStyle={styles.loginBtn}
						onPress={this.handleLogin}
					/>
				] : [
					<Text key="registerAlert" style={ styles.registerAlert }>請設定密碼</Text>,
					<Button
						key="registerBtn"
						title="設定"
						buttonStyle={styles.registerBtn}
						onPress={this.handleRegister}
						color="#111"
					/>
				]
				}
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
	registerAlert: {
		marginBottom: 20,
		fontSize: 25,
		fontWeight: 'bold',
		color: '#111'
	},
	registerBtn: {
		width: 300,
		borderRadius: 5,
		marginTop: 5,
		backgroundColor: '#d3d3d3'
	}
});
