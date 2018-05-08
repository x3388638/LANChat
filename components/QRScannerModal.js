import React from 'react';
import {
	View,
	Text,
	Alert,
	StyleSheet,
	AsyncStorage
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/FontAwesome';

import Storage from '../modules/Storage.js';

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props);
		this.onRead = this.onRead.bind(this);
	}

	onRead(e) {
		try {
			const data = JSON.parse(e.data);
			const { groupID, groupName, groupDesc, net, createdTime, key } = data;
			if (!groupID || !groupName || !net || !createdTime || !key) {
				throw 'error';
			}

			Storage.addGroup({ groupID, groupName, groupDesc, net, createdTime, key }, (err) => {
				if (err) {
					Alert.alert(err);
					return;
				}

				Alert.alert('加入成功', `群組: ${groupName}`, [{ text: 'OK', onPress: this.props.navigation.goBack }]);
			});
		} catch (err) {
			Alert.alert('QR Code 格式錯誤', null, [{ text: 'OK', onPress: this.scanner.reactivate }])
		}
	}

	render() {
		return (
			<QRCodeScanner
				ref={(node) => { this.scanner = node }}
				onRead={ this.onRead }
				topContent={
					<Text style={ styles.title }>掃描群組 QR Code</Text>
				}
				bottomContent={
					<Icon
						size={16}
						color="#37474F"
						name="chevron-left"
						style={styles.newGroupBtn}
						onPress={() => this.props.navigation.goBack()}
					> 返回</Icon>
				}
			/>
		)
	}
}

const styles = StyleSheet.create({
	title: {
		flex: 1,
		fontSize: 24,
		fontWeight: 'bold',
		marginTop: '15%',
		color: '#111',
	},
	textBold: {
		fontWeight: '500',
		color: '#000',
	},
});
