import React from 'react';
import {
	View,
	TextInput,
	StyleSheet
} from 'react-native';
import AutogrowInput from 'react-native-autogrow-input';
import Icon from 'react-native-vector-icons/MaterialIcons';

class SendButton extends React.Component {
	render() {
		return (
			<View style={ styles.sendBtnContainer }>
				<View style={ styles.sendBtn }>
					<Icon
						size={24}
						name='arrow-upward'
						color="#fff"
					/>
				</View>
			</View>
		);
	}
}

export default class InputBar extends React.Component {
	render() {
		return (
			<View style={ styles.container }>
				<AutogrowInput
					multiline
					defaultHeight={40}
					maxLength={255}
					style={ styles.input } placeholder="Message..."
				/>
				<SendButton />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		backgroundColor: '#e3e3e3',
		borderTopWidth: 1,
		borderColor: '#d3d3d3',
		justifyContent: 'center'
	},
	input: {
		flex: 1,
		borderWidth: 1,
		backgroundColor: '#fff',
		borderColor: '#d3d3d3',
		height: 40,
		fontSize: 18,
		borderRadius: 20,
		paddingLeft: 15,
		paddingRight: 15,
		marginLeft: 5,
		marginRight: 5,
		marginTop: 5,
		marginBottom: 5
	},
	sendBtnContainer: {
		justifyContent: 'center'
	},
	sendBtn: {
		height: 35,
		width: 35,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 30,
		marginLeft: 5,
		marginRight: 5,
		borderWidth: 1,
		borderColor: '#d3d3d3',
		backgroundColor: '#ff9500'
	}
});
