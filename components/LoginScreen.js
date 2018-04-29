import React from 'react';
import {
	View,
	Text,
	TextInput,
	StyleSheet
} from 'react-native';
import { Button } from 'react-native-elements';

export default class LoginScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pass: ''
		}
	}

	static navigationOptions = {
		title: '登入'
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
					onPress={() => { this.props.navigation.navigate('Home') }}
				/>
				<Button
					title="註冊"
					buttonStyle={styles.registerBtn}
					onPress={() => { this.props.navigation.navigate('Register') }}
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
