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

export default class RegisterScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pass: ''
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	static navigationOptions = {
		title: '註冊'
	}

	handleSubmit() {
		const pass = this.state.pass;
		if (pass.length !== 4 || isNaN(pass) ) {
			Alert.alert('請設定 4 位數密碼');
			return;
		}

		if (this.isRegistered()) {
			Alert.alert('已設定過密碼!', null, [{ text: '返回', onPress: () => this.props.navigation.goBack() }]);
			return;
		}

		this.savePass(pass, (err) => {
			if (err) {
				alert(err);
				return;
			}

			Alert.alert('註冊成功!', null, [{ text: 'OK', onPress: () => this.props.navigation.goBack() }]);
		});
	}

	savePass(pass, callback) {
		AsyncStorage.setItem('@LANChat:pass', sha256(pass), callback);
	}

	async isRegistered() {
		const pass = await AsyncStorage.getItem('@LANChat:pass');
		return !!pass;
	}

	render() {
		return (
			<View style={ styles.container }>
				<Text style={ styles.title }>請設定 4 位數密碼</Text>
				<TextInput
					style={ styles.password }
					placeholder="Password"
					maxLength={4}
					keyboardType="numeric"
					onChangeText={(text) => this.setState({ pass: text })}
				/>
				<Button
					title="確定"
					buttonStyle={ styles.submitBtn }
					onPress={ this.handleSubmit }
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
	title: {
		marginBottom: 20,
		fontSize: 25,
		fontWeight: 'bold'
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
	submitBtn: {
		width: 300,
		backgroundColor: '#000',
		marginTop: 20,
		borderRadius: 5
	}
});
