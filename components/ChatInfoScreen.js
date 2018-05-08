import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';

export default class ChatInfoScreen extends React.Component {
	static navigationOptions = {
		title: '群組資訊'
	};

	render() {
		return (
			<View>
				<Text>chat info</Text>
			</View>
		)
	}
}

const styles = StyleSheet.create({
});
