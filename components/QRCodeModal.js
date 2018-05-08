import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import Modal from "react-native-modal";

export default class QRCodeModal extends React.Component {
	render() {
		return (
			<Modal
				isVisible={ this.props.open }
				onBackdropPress={ this.props.onHide }>
				<View style={ styles.container }>
					<Text>modal</Text>
				</View>
			</Modal>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		height: '80%',
		backgroundColor: '#fff'
	}
})
