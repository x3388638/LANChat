import React from 'react';
import {
	ScrollView,
	Text,
	StyleSheet
} from 'react-native';

export default class FileReaderScreen extends React.PureComponent {
	static navigationOptions = ({ navigation }) => ({
		title: navigation.state.params.fileName
	});

	render() {
		return (
			<ScrollView style={ styles.container }>
				<Text style={ styles.text }>{ this.props.navigation.state.params.file }</Text>
			</ScrollView>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		padding: 10
	},
	text: {
		color: '#111'
	}
});
