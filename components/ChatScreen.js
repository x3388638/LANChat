import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class ChatScreen extends React.Component {
	static navigationOptions = ({ navigation }) => ({
		title: navigation.state.params.groupName,
		headerBackTitle: 'Back',
		headerRight: (
			<Icon
				size={24}
				color="#007dff"
				name="info-circle"
				style={ styles.settingsBtn }
				onPress={ () => navigation.navigate('ChatInfo', navigation.state.params) }
			/>
		)
	});

	render() {
		return (
			<View>
				<Text>chat screen</Text>
				<Text>{ JSON.stringify(this.props.navigation.state.params, null, 4) }</Text>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	settingsBtn: {
		marginRight: 10
	}
});
