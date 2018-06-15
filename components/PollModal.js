import React from 'react';
import {
	View,
	ScrollView,
	Text,
	StyleSheet
} from 'react-native';
import {
	Button
} from 'react-native-elements';
import Modal from 'react-native-modal';

export default class PollModal extends React.Component {
	render() {
		return (
			<Modal
				isVisible={ this.props.isOpen }
				onBackButtonPress={ this.props.hide }
				onBackdropPress={ this.props.hide }
			>
				<ScrollView style={ styles.container }>
					<Text>this is PollModal</Text>
					<Text>pollID: { this.props.pollID }</Text>
				</ScrollView>
				<View style={ styles.btnContainer }>
					<View style={ styles.btn }>
						<Button
							icon={{ name: 'close' }}
							backgroundColor="#ff3b30"
							title='取消'
							containerViewStyle={{ marginRight: 5, marginLeft: 5 }}
							onPress={ this.props.hide }
						/>
					</View>
					<View style={ styles.btn }>
						<Button
							icon={{ name: 'send' }}
							backgroundColor="#007aff"
							title='送出'
							containerViewStyle={{ marginRight: 5, marginLeft: 5 }}
							onPress={() => {}}
						/>
					</View>
				</View>
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
	btnContainer: {
		marginTop: 10,
		width: 500,
		maxWidth: '100%',
		flexDirection: 'row',
		alignSelf: 'center',
		alignItems: 'flex-start'
	},
	btn: {
		width: '50%'
	},
});
