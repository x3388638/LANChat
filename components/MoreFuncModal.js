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
import FilePickerManager from 'react-native-file-picker';

export default class MoreFuncModal extends React.PureComponent {
	render() {
		return (
			<Modal
				animationOutTiming={ 100 }
				isVisible={ this.props.isOpen }
				onBackButtonPress={ this.props.hide }
				onBackdropPress={ this.props.hide }
			>
				<View style={ styles.container }>
					<TouchableOpacity
						onPress={ this.props.onPoll }
					>
						<Text style={styles.btn}>建立票選活動</Text>
					</TouchableOpacity>
					<Divider />
					<TouchableOpacity
						onPress={ this.props.onImg }
					>
						<Text style={styles.btn}>選擇圖片</Text>
					</TouchableOpacity>
					<Divider />
					<TouchableOpacity
						onPress={() => {
							FilePickerManager.showFilePicker(null, (response) => {
								console.warn('Response = ', response);

								if (response.didCancel) {
									console.warn('User cancelled file picker');
								}
								else if (response.error) {
									console.warn('FilePickerManager Error: ', response.error);
								}
								else {
									this.setState({
										file: response
									});
								}
							});
						}}
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
		fontSize: 26,
		paddingTop: 8,
		paddingBottom: 8
	}
});
