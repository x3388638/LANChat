import React from 'react';
import {
	View,
	Text
} from 'react-native';
import Modal from 'react-native-modal';

export default class CreatePollModal extends React.Component {
	render() {
		return (
			<Modal
				isVisible={ this.props.isOpen }
				onBackButtonPress={ this.props.hide }
				onBackdropPress={ this.props.hide }
			>
				<View style={{ backgroundColor: '#fff' }}>
					<Text>lalal</Text>
				</View>
			</Modal>
		);
	}
}
