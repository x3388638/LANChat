import React from 'react';
import {
	Text,
	StyleSheet
} from 'react-native';
import {
	Divider
} from 'react-native-elements';
import Modal from 'react-native-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default class CreatePollModal extends React.Component {
	render() {
		return (
			<Modal
				isVisible={ this.props.isOpen }
				onBackButtonPress={ this.props.hide }
				onBackdropPress={ this.props.hide }
			>
				<KeyboardAwareScrollView style={ styles.container }>
					<Text style={ styles.title }>新增投票</Text>
					<Divider style={ styles.divider } />
				</KeyboardAwareScrollView>
			</Modal>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 20,
		width: 500,
		maxWidth: '100%',
		alignSelf: 'center'
	},
	title: {
		textAlign: 'center',
		fontSize: 26
	},
	divider: {
		marginTop: 10,
		marginBottom: 10
	}
});
