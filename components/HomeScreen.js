import React from 'react';
import {
	View,
	Text,
	Button as NativeBtn
} from 'react-native';
import { Button } from 'react-native-elements';

export default class HomeScreen extends React.Component {
	static navigationOptions = ({ navigation }) => ({
		title: '訊息',
		headerRight: <NativeBtn title="New" onPress={() => {}} />,
		headerLeft: <NativeBtn title="設定" onPress={() => {}} />
	});

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
