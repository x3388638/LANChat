import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import Modal from 'react-native-modal';

export default class EmergencyModal extends React.Component {
	render() {
		const { lat, lng } = JSON.parse(this.props.location);
		return (
			<Modal
				isVisible={ this.props.open }
				style={ styles.container }
			>
				<View>
					<Text>發送緊急訊息</Text>
					<Text>{ lat }</Text>
					<Text>{ lng }</Text>
				</View>
			</Modal>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 30
	}
});
