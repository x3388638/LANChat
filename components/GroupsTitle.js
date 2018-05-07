import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';

export default class GroupsTitle extends React.Component {
	render() {
		return (
			<View style={ styles.container }>
				<Text style={ styles.text }>{ this.props.ssid }</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#132731',
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 10
	},
	text: {
		color: '#6b7b83',
		fontWeight: 'bold',
		fontSize: 16
	}
});
