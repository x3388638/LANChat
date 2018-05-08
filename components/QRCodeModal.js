import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class QRCodeModal extends React.Component {
	render() {
		return (
			<Modal
				isVisible={ this.props.open }
				onBackdropPress={ this.props.onHide }>
				<View style={ styles.container }>
					<Text style={ styles.title }>{ this.props.groupInfo.groupName }</Text>
					<QRCode
						size={250}
						color="#132731"
						value={ JSON.stringify(this.props.groupInfo) }
					/>
					<View style={ styles.closeBtnContainer }>
						<Icon
							size={40}
							color="#ff3b30"
							name="times-circle"
							onPress={ this.props.onHide }
						/>
					</View>
				</View>
			</Modal>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		height: '76%',
		backgroundColor: '#fff',
		paddingLeft: 30,
		paddingRight: 30,
		alignItems: 'center',
		justifyContent: 'center'
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 25,
		color: '#132731'
	},
	closeBtnContainer: {
		marginTop: 65
	}
})
