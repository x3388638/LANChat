import React from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet
} from 'react-native';
import {
	Divider
} from 'react-native-elements';
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
					<TouchableOpacity
						onPress={() => {}}
					>
						<Text style={styles.btn}>發起投票</Text>
					</TouchableOpacity>
					<Divider />
					<TouchableOpacity
						onPress={() => {}}
					>
						<Text style={styles.btn}>選擇圖片</Text>
					</TouchableOpacity>
					<Divider />
					<TouchableOpacity
						onPress={() => { }}
					>
						<Text style={styles.btn}>選擇檔案</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		paddingTop: 20,
		paddingBottom: 20,
		paddingLeft: 10,
		paddingRight: 10,
		borderRadius: 20
	},
	btn: {
		textAlign: 'center',
		color: '#007aff',
		fontSize: 30,
		paddingTop: 8,
		paddingBottom: 8
	}
});
