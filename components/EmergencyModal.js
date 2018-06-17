import React from 'react';
import {
	View,
	Text,
	ScrollView,
	StyleSheet
} from 'react-native';
import {
	Divider,
	Button
} from 'react-native-elements';
import Modal from 'react-native-modal';

export default class EmergencyModal extends React.Component {
	render() {
		const { lat, lng } = JSON.parse(this.props.location);
		const personalInfo = JSON.parse(this.props.personalInfo);
		const emergency = personalInfo ? personalInfo.emergency || {} : {};

		return (
			<Modal
				isVisible={ this.props.isOpen }
				onBackButtonPress={ this.props.hide }
				onBackdropPress={ this.props.hide }
			>
				<ScrollView style={ styles.container }>
					<Text style={ styles.title }>緊急訊息</Text>
					<Divider style={ styles.divider } />
					<View style={ styles.blockContainer }>
						<Text style={ styles.subtitleText }>緊急訊息將發送您於<Text style={ styles.textBold }>個人資訊</Text>提供之<Text style={ styles.textBold }>私密資訊</Text>傳送至 LOBBY 公開群組以請求協助，若非必要請勿使用此功能以免個資遭有心人士利用。</Text>
					</View>
					<Divider style={ styles.divider } />
					<View style={ styles.blockContainer }>
						<View style={ styles.fieldRow }>
							<Text style={ styles.filedLabel }>真實姓名</Text>
							<Text style={ styles.fieldValue}>{ emergency.name }</Text>
						</View>
						<View style={ styles.fieldRow }>
							<Text style={ styles.filedLabel }>生日</Text>
							<Text style={ styles.fieldValue}>{ emergency.birth }</Text>
						</View>
						<View style={ styles.fieldRow }>
							<Text style={ styles.filedLabel }>電話</Text>
							<Text style={ styles.fieldValue}>{ emergency.phone }</Text>
						</View>
						<View style={ styles.fieldRow }>
							<Text style={ styles.filedLabel }>性別</Text>
							<Text style={ styles.fieldValue}>{ (emergency.gender || '').toUpperCase() === 'M' ? '男' : '女' }</Text>
						</View>
						<View style={ styles.fieldRow }>
							<Text style={ styles.filedLabel }>血型</Text>
							<Text style={ styles.fieldValue}>{ `${ emergency.bloodType } ${ emergency.bloodType ? '型' : '' }` }</Text>
						</View>
						<View style={ styles.fieldRow }>
							<Text style={ styles.filedLabel }>住址</Text>
							<Text style={ styles.fieldValue}>{ emergency.address }</Text>
						</View>
						<View style={ styles.fieldRow }>
							<Text style={ styles.filedLabel }>補充資訊</Text>
							<Text style={ styles.fieldValue}>{ emergency.memo }</Text>
						</View>
						<View style={ styles.fieldRow }>
							<Text style={ styles.filedLabel }>GPS 經度</Text>
							<Text style={ styles.fieldValue}>{ lng }</Text>
						</View>
						<View style={ styles.fieldRow }>
							<Text style={ styles.filedLabel }>GPS 緯度</Text>
							<Text style={ styles.fieldValue}>{ lat }</Text>
						</View>
					</View>
				</ScrollView>
				<View style={ styles.btnContainer }>
					<View style={ styles.btn }>
						<Button
							icon={{ name: 'close' }}
							backgroundColor="#ff3b30"
							title='取消'
							containerViewStyle={{ marginRight: 5, marginLeft: 5 }}
							onPress={ this.props.hide }
						/>
					</View>
					<View style={ styles.btn }>
						<Button
							icon={{ name: 'send' }}
							backgroundColor="#007aff"
							title='送出'
							containerViewStyle={{ marginRight: 5, marginLeft: 5 }}
							onPress={ this.props.onSubmit }
						/>
					</View>
				</View>
			</Modal>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 20,
		width: 500,
		maxWidth: '100%',
		alignSelf: 'center'
	},
	divider: {
		marginBottom: 10
	},
	title: {
		marginBottom: 10,
		fontSize: 28,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	blockContainer: {
		maxWidth: 400,
		width: '100%',
		alignSelf: 'center',
		marginBottom: 10
	},
	subtitleText: {
		color: '#666'
	},
	textBold: {
		fontWeight: 'bold'
	},
	blockContainer: {
		maxWidth: 400,
		width: '100%',
		alignSelf: 'center',
		marginBottom: 10
	},
	fieldRow: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderColor: '#d3d3d3',
		marginBottom: 10,
		marginLeft: 8,
		marginRight: 8
	},
	filedLabel: {
		width: 90,
		fontSize: 18
	},
	fieldValue: {
		flex: 1,
		fontSize: 18,
	},
	btnContainer: {
		marginTop: 10,
		width: 500,
		maxWidth: '100%',
		flexDirection: 'row',
		alignSelf: 'center',
		alignItems: 'flex-start'
	},
	btn: {
		width: '50%'
	}
});
