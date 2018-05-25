import React from 'react';
import {
	View,
	TextInput,
	StyleSheet
} from 'react-native';
import AutogrowInput from 'react-native-autogrow-input';

export default class InputBar extends React.Component {
	render() {
		return (
			<View style={ styles.container }>
				<AutogrowInput
					multiline
					defaultHeight={40}
					maxLength={255}
					style={ styles.input } placeholder="Message..." />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#e3e3e3',
		borderTopWidth: 1,
		borderColor: '#d3d3d3',
		justifyContent: 'center'
	},
	input: {
		borderWidth: 1,
		backgroundColor: '#fff',
		borderColor: '#d3d3d3',
		height: 40,
		fontSize: 18,
		borderRadius: 20,
		paddingLeft: 15,
		paddingRight: 15,
		marginLeft: 10,
		marginRight: 10,
		marginTop: 5,
		marginBottom: 5
	}
});
