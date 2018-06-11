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
const ImagePicker = require('react-native-image-picker');

import MoreFuncModal from './MoreFuncModal.js';
import ImgPreviewModal from './ImgPreviewModal.js';

import Util from '../modules/util.js';

class MoreFunc extends React.Component {
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

class SendButton extends React.Component {
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

export default class InputBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inputMsg: '',
			moreFuncModalOpen: false,
			imgSelected: null,
			imgPreviewModalOpen: false
		};

		this.send = this.send.bind(this);
		this.pickImg = this.pickImg.bind(this);
		this.sendImg = this.sendImg.bind(this);
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
				ImageResizer.createResizedImage(base64, 500, 500, 'JPEG', 50).then((response) => {
					console.warn(Object.keys(response));
					this.setState({
						moreFuncModalOpen: false,
						imgSelected: response.uri,
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
				}).catch((err) => {
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
			imgPreviewModalOpen: false,
			imgSelected: null
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
				/>
				<ImgPreviewModal
					img={ this.state.imgSelected }
					isOpen={ this.state.imgPreviewModalOpen }
					hide={() => { this.setState({ imgPreviewModalOpen: false, imgSelected: null }) }}
					onSend={ this.sendImg }
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
