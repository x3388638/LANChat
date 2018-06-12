import React from 'react';
import {
	View,
	Image,
	StyleSheet
} from 'react-native';
import {
	Button
} from 'react-native-elements';
import Modal from 'react-native-modal';

export default class ImgPreviewModal extends React.Component {
	render() {
		return (
			<Modal
				isVisible={ this.props.isOpen }
				onBackButtonPress={ this.props.hide }
				onBackdropPress={ this.props.hide }
			>
				<View style={ styles.container }>
					{ this.props.img &&
						<Image
							style={{ flex:1, height: undefined, width: undefined, resizeMode: 'contain' }}
							source={{ uri: this.props.img }}
						/>
					}
					<View style={ styles.btnContainer }>
						<View style={ !!this.props.onSend ? styles.btn : styles.btnFill }>
							<Button
								icon={{ name: 'close' }}
								backgroundColor="#ff3b30"
								title='取消'
								containerViewStyle={{ marginRight: 5, marginLeft: 5 }}
								onPress={ this.props.hide }
							/>
						</View>
						{ !!this.props.onSend &&
							<View style={ styles.btn }>
								<Button
									icon={{ name: 'send' }}
									backgroundColor="#007aff"
									title='送出'
									containerViewStyle={{ marginRight: 5, marginLeft: 5 }}
									onPress={ this.props.onSend }
								/>
							</View>
						}
					</View>
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
		borderRadius: 10,
		height: '95%',
		width: '100%'
	},
	btnContainer: {
		marginTop: 5,
		flexDirection: 'row',
		alignItems: 'flex-start'
	},
	btn: {
		width: '50%'
	},
	btnFill: {
		width: '100%'
	}
});
