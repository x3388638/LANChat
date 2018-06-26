import React from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Alert,
	StyleSheet,
	Platform
} from 'react-native';
import {
	Divider
} from 'react-native-elements';
import Modal from 'react-native-modal';
import FilePickerManager from 'react-native-file-picker';

export default class MoreFuncModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.handleFile = this.handleFile.bind(this);
	}

	handleFile() {
		FilePickerManager.showFilePicker(null, (response) => {
			if (response.didCancel) {
				console.log('User cancelled file picker');
			} else if (response.error) {
				console.log('FilePickerManager Error: ', response.error);
			} else {
				this.props.hide();
				const { fileName, path } = response;
				Alert.alert('傳送檔案', fileName, [
					{ text: '取消', onPress: () => {} },
					{ text: '確定', onPress: () => { this.props.onFile(fileName, path); } }
				]);
			}
		});
	}

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
					{ Platform.OS !== 'ios' &&
						<View>
							<Divider />
							<TouchableOpacity
								onPress={ this.handleFile }
							>
								<Text style={styles.btn}>選擇檔案</Text>
							</TouchableOpacity>
						</View>
					}
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
