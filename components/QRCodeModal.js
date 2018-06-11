import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import {
	Button
} from 'react-native-elements';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class QRCodeModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalOnLoad: false
		};

		this.handleModalOnLoad = this.handleModalOnLoad.bind(this);
		this.handleModalHide = this.handleModalHide.bind(this);
	}

	handleModalOnLoad() {
		if (!this.state.modalOnLoad) {
			this.setState({ modalOnLoad: true });
		}
	}

	handleModalHide() {
		if (!!this.state.modalOnLoad) {
			this.setState({ modalOnLoad: false });
		}
	}

	render() {
		return (
			<Modal
				isVisible={ this.props.open }
				onBackdropPress={ this.props.onHide }
				onModalShow={ this.handleModalOnLoad }
				onModalHide={ this.handleModalHide }
			>
				<View style={ styles.container }>
					<Text style={ styles.title }>{ this.props.groupInfo.groupName }</Text>
					{ this.state.modalOnLoad ?
						<QRCode
							size={250}
							color="#132731"
							value={ JSON.stringify(this.props.groupInfo) }
						/> :
						<Button
							loading
							title="QR Code 載入中..."
							backgroundColor="#fff"
							color="#132731"
						/>
					}
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
		alignSelf: 'center',
		width: 300,
		backgroundColor: '#fff',
		paddingTop: 50,
		paddingBottom: 50,
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
