import React from 'react';
import {
	View,
	Text
} from 'react-native';
import { Button } from 'react-native-elements';

export default class HomeScreen extends React.Component {
	static navigationOptions = {
		title: '～～～ＨＯＭＥ'
	}

	render() {
		return (
			<View>
				<Text>home screen</Text>
				<Button
					title="Scanner"
					onPress={() => { this.props.navigation.navigate('QRScanner') }}
				/>
			</View>
		)
	}
}
