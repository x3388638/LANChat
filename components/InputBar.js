import React from 'react';
import {
	View,
	TouchableOpacity,
	StyleSheet,
	Platform
} from 'react-native';
import AutogrowInput from 'react-native-autogrow-input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageResizer from 'react-native-image-resizer';
import ImgToBase64 from 'react-native-image-base64';
const ImagePicker = require('react-native-image-picker');

import MoreFuncModal from './MoreFuncModal.js';
import ImgPreviewModal from './ImgPreviewModal.js';
import CreatePollModal from './CreatePollModal.js';

import Util from '../modules/util.js';
import Storage from '../modules/Storage.js';

class MoreFunc extends React.PureComponent {
	render() {
		return (
			<TouchableOpacity
				style={ styles.btnContainer }
				onPress={ () => { !this.props.readOnly && this.props.onPress() } }
			>
				<View style={ styles.moreBtn }>
					<Icon
						size={26}
						name='more-horiz'
						color="#63676F"
					/>
				</View>
			</TouchableOpacity>
		);
	}
}

class SendButton extends React.PureComponent {
	render() {
		return (
			<TouchableOpacity style={ styles.btnContainer } onPress={() => { !this.props.readOnly && this.props.onPress() }}>
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

export default class InputBar extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			inputMsg: '',
			moreFuncModalOpen: false,
			imgSelected: null,
			imgPreviewModalOpen: false,
			createPollModalOpen: false
		};

		this.handleOpenPollModal = this.handleOpenPollModal.bind(this);
		this.send = this.send.bind(this);
		this.pickImg = this.pickImg.bind(this);
		this.sendImg = this.sendImg.bind(this);
		this.sendPoll = this.sendPoll.bind(this);
		this.sendFile = this.sendFile.bind(this);
	}

	handleOpenPollModal() {
		this.setState({
			moreFuncModalOpen: false,
			createPollModalOpen: Platform.OS !== 'ios'
		}, () => {
			if (Platform.OS === 'ios') {
				setTimeout(() => {
					this.setState({
						createPollModalOpen: true
					});
				}, 150);
			}
		});
	}

	send() {
		const msg = this.state.inputMsg.trim();
		if (msg === '') {
			return;
		}

		this.setState({
			inputMsg: ''
		});

		if (Platform.OS === 'ios') {
			this.msgTextInput.inputRef.setNativeProps({ text: ' ' });
		}

		setTimeout(() => {
			this.msgTextInput.inputRef.setNativeProps({ text: '' });
		});

		Util.sendMsg({
			type: 'text',
			bssid: this.props.bssid,
			groupID: this.props.groupID,
			msg
		});
	}

	pickImg() {
		ImagePicker.launchImageLibrary({}, (response) => {
			console.log('Response = ', response);
			if (response.didCancel) {
				console.log('User cancelled image picker');
			}
			else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			}
			else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			}
			else {
				const base64 = `data:image/jpeg;base64,${ response.data }`;
				ImageResizer
					.createResizedImage(base64, 500, 500, 'JPEG', 50)
					.then((response) => ImgToBase64.getBase64String(response.uri))
					.then((resizedBase64) => {
						this.setState({
							moreFuncModalOpen: false,
							imgSelected: `data:image/jpeg;base64,${ resizedBase64 }`,
							imgPreviewModalOpen: Platform.OS !== 'ios'
						}, () => {
							if (Platform.OS === 'ios') {
								setTimeout(() => {
									this.setState({
										imgPreviewModalOpen: true
									});
								}, 150);
							}
						});
					})
					.catch((err) => {
						console.warn('error????' + err);
					});
			}
		});
	}

	sendImg() {
		Util.sendMsg({
			type: 'img',
			bssid: this.props.bssid,
			groupID: this.props.groupID,
			msg: this.state.imgSelected
		});

		this.setState({
			imgPreviewModalOpen: false
		});
	}

	sendPoll({ title, desc, options }) {
		Util.sendMsg({
			type: 'poll',
			bssid: this.props.bssid,
			groupID: this.props.groupID,
			msg: {
				pollID: Util.genUUID(),
				title,
				desc,
				options
			}
		});
	}

	sendFile(fileName, filePath) {
		const fileID = Util.genUUID();
		Storage.addFile({
			bssid: this.props.bssid,
			groupID: this.props.groupID,
			fileID,
			fileName,
			filePath
		});

		Util.sendMsg({
			type: 'file',
			bssid: this.props.bssid,
			groupID: this.props.groupID,
			msg: {
				fileID,
				fileName
			}
		});
	}

	render() {
		const readOnly = this.props.currentBssid !== this.props.bssid;
		return (
			<View style={ styles.container }>
				<MoreFunc
					readOnly={ readOnly }
					onPress={() => { this.setState({ moreFuncModalOpen: true }) }}
				/>
				<AutogrowInput
					multiline
					editable={ !readOnly }
					ref={(ref) => { this.msgTextInput = ref }}
					defaultHeight={40}
					maxLength={255}
					value={ Platform.OS === 'ios' ? null : this.state.inputMsg }
					onChangeText={(inputMsg) => { this.setState({ inputMsg }) }}
					style={ styles.input } placeholder="Message..."
				/>
				<SendButton onPress={ this.send } readOnly={ readOnly } />
				<MoreFuncModal
					isOpen={ this.state.moreFuncModalOpen }
					hide={() => { this.setState({ moreFuncModalOpen: false }) }}
					onImg={ this.pickImg }
					onPoll={ this.handleOpenPollModal }
					onFile={ this.sendFile }
				/>
				<ImgPreviewModal
					img={ this.state.imgSelected }
					isOpen={ this.state.imgPreviewModalOpen }
					hide={() => { this.setState({ imgPreviewModalOpen: false, imgSelected: null }) }}
					onSend={ this.sendImg }
				/>
				<CreatePollModal
					isOpen={ this.state.createPollModalOpen }
					hide={() => { this.setState({ createPollModalOpen: false }) }}
					onSend={ this.sendPoll }
				/>
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
