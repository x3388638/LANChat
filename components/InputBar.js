import React from 'react';
import {
	View,
	TouchableOpacity,
	StyleSheet,
	Platform,
	Keyboard
} from 'react-native';
import AutogrowInput from 'react-native-autogrow-input';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Util from '../modules/util.js';

class MoreFunc extends React.Component {
	render() {
		return (
			<View style={ styles.btnContainer }>
				<View style={ styles.moreBtn }>
					<Icon
						size={26}
						name='more-horiz'
						color="#63676F"
					/>
				</View>
			</View>
		);
	}
}

class SendButton extends React.Component {
	render() {
		return (
			<TouchableOpacity style={ styles.btnContainer } onPress={ this.props.onPress }>
				<View style={ styles.sendBtn }>
					<Icon
						size={24}
						name='arrow-upward'
						color="#fff"
					/>
				</View>
			</TouchableOpacity>
		);
	}
}

export default class InputBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inputMsg: ''
		};

		this.handleChangeText = this.handleChangeText.bind(this);
		this.send = this.send.bind(this);
	}

	handleChangeText(text, type) {
		if (Platform.OS === 'ios' && type === 2 ||
			Platform.OS !== 'ios' && type === 1) {
			return;
		}

		this.setState({
			inputMsg: text
		});
	}

	send() {
		Keyboard.dismiss();
		const msg = this.msgTextInput.inputRef._lastNativeText.trim();
		if (msg === '') {
			return;
		}

		setTimeout(() => {
			this.setState({
				inputMsg: ''
			});

			// TODO: reset input
		}, 150);

		Util.sendMsg({
			type: 'text',
			bssid: this.props.bssid,
			groupID: this.props.groupID,
			msg
		});
	}

	render() {
		return (
			<View style={ styles.container }>
				<MoreFunc />
				<AutogrowInput
					multiline
					ref={(ref) => { this.msgTextInput = ref }}
					defaultHeight={40}
					maxLength={255}
					value={ this.state.inputMsg }
					onEndEditing={(e) => { this.handleChangeText(e.nativeEvent.text, 1) }}
					onChangeText={(text) => { this.handleChangeText(text, 2) }}
					style={ styles.input } placeholder="Message..."
				/>
				<SendButton onPress={ this.send } />
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
	btnContainer: {
		justifyContent: 'center'
	},
	sendBtn: {
		height: 35,
		width: 35,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 30,
		marginRight: 5,
		borderWidth: 1,
		borderColor: '#d3d3d3',
		backgroundColor: '#63676F'
	},
	moreBtn: {
		height: 35,
		width: 35,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 5,
	}
});
