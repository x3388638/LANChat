import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import Modal from 'react-native-modal';

export default class MoreFuncModal extends React.Component {
	render() {
		return (
			<Modal
				isVisible={ this.props.isOpen }
				onBackButtonPress={ this.props.hide }
				onBackdropPress={ this.props.hide }
			>
				<View style={ styles.container }>
					<Text>123</Text>
				</View>
			</Modal>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff'
	}
});
