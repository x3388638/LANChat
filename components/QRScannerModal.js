import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	AsyncStorage
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props);
		this.onRead = this.onRead.bind(this);
	}

	onRead(e) {
		alert(e.data);
		this.scanner.reactivate();
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
		marginTop: 100,
		color: '#111',
	},
	textBold: {
		fontWeight: '500',
		color: '#000',
	},
});
