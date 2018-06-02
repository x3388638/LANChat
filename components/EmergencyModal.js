import React from 'react';
import {
	View,
	Text
} from 'react-native';
import Modal from 'react-native-modal';

export default class EmergencyModal extends React.Component {
	render() {
		return (
			<Modal
				isVisible={this.props.open}
			>
				<View>
					<Text>123</Text>
				</View>
			</Modal>
		);
	}
}
