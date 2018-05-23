import React from 'react';
import {
	View,
	Text,
	Button,
	Alert,
	TextInput,
	StyleSheet,
	Platform,
	Keyboard
} from 'react-native';
import {
	FormLabel,
	FormInput,
	Divider,
	CheckBox
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DatePicker from 'react-native-datepicker';

import Storage from '../modules/Storage.js';
import Util from '../modules/util.js';

export default class SettingsScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			selfIntro: '',
			name: '',
			birth: '1900-01-01',
			phone: '',
			gender: '',
			bloodType: '',
			address: '',
			memo: ''
		};

		this.handleSave = this.handleSave.bind(this);
		this.handleChangeText = this.handleChangeText.bind(this);
		this.getPersonalInfo = this.getPersonalInfo.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		title: '個人資訊',
		headerRight: <Text style={ styles.headerRight } onPress={() => { navigation.state.params.handleSave() }}>儲存</Text>
	});

	componentDidMount() {
		this.props.navigation.setParams({ handleSave: this.handleSave });
		this.getPersonalInfo();
	}

	handleSave() {
		if (TextInput.State.currentlyFocusedField()) {
			Keyboard.dismiss();
		}

		setTimeout(() => {
			if (this.state.username.length === 0) {
				Alert.alert('姓名為必填');
				return;
			}

			const { username, selfIntro, name, birth, phone, gender, bloodType, address, memo } = this.state;
			Storage.setPersonalInfo({
				normal: {
					username,
					selfIntro
				},
				emergency: {
					name,
					birth,
					phone,
					gender,
					bloodType,
					address,
					memo
				}
			}, () => {
				Util.sendUserData();
				Alert.alert('儲存成功');
			});
		}, 300);
	}

	async getPersonalInfo() {
		const info = await Storage.getPersonalInfo();
		this.setState({
			username: info.normal.username || '',
			selfIntro: info.normal.selfIntro || '',
			name: info.emergency.name || '',
			birth: info.emergency.birth || '1900-01-01',
			phone: info.emergency.phone || '',
			gender: info.emergency.gender || '',
			bloodType: info.emergency.bloodType || '',
			address: info.emergency.address || '',
			memo: info.emergency.memo || ''
		});
	}

	handleChangeText(key, value, eventType) {
		if (eventType === 1 && Platform.OS === 'ios') {
			return;
		}

		if (eventType === 2 && Platform.OS !== 'ios') {
			return;
		}

		this.setState({
			[key]: value
		});
	}

	render() {
		return (
			<KeyboardAwareScrollView>
				<View style={ styles.container }>
					<Text style={ styles.formTitle }>公開資訊</Text>
					<View style={ styles.formContainer }>
						<FormLabel>姓名*</FormLabel>
						<FormInput
							value={ this.state.username }
							maxLength={10}
							onChangeText={(text) => { this.handleChangeText('username', text, 1) }}
							onEndEditing={(e) => { this.handleChangeText('username', e.nativeEvent.text, 2) }}
						/>
						<FormLabel>簡介</FormLabel>
						<FormInput
							value={ this.state.selfIntro }
							maxLength={150}
							onChangeText={(text) => { this.handleChangeText('selfIntro', text, 1) }}
							onEndEditing={(e) => { this.handleChangeText('selfIntro', e.nativeEvent.text, 2) }}
						/>
					</View>
					<Divider style={ styles.divider } />
					<Text style={ styles.formTitle }>私密資訊 <Text style={ styles.note }>*僅使用於緊急求助通報</Text></Text>
					<View style={ styles.formContainer }>
						<FormLabel>真實姓名</FormLabel>
						<FormInput
							value={ this.state.name }
							maxLength={15}
							onChangeText={(text) => { this.handleChangeText('name', text, 1) }}
							onEndEditing={(e) => { this.handleChangeText('name', e.nativeEvent.text, 2) }}
						/>
						<FormLabel>生日</FormLabel>
						<View style={ styles.birthContainer }>
							<DatePicker
								style={ styles.birth }
								date={ this.state.birth }
								showIcon={false}
								format="YYYY-MM-DD"
								confirmBtnText="確定"
								onDateChange={(date) => { this.setState({ birth: date }) }}
							/>
						</View>
						<FormLabel>電話</FormLabel>
						<FormInput value={ this.state.phone } maxLength={15} onChangeText={(phone) => {this.setState({ phone })}} />
						<FormLabel>性別</FormLabel>
						<View style={ styles.checkboxesContainer }>
							<View style={ styles.checkboxes }>
								<CheckBox
									containerStyle={ styles.checkbox }
									size={14}
									title='男'
									checkedIcon='dot-circle-o'
									uncheckedIcon='circle-o'
									checked={ this.state.gender === 'M' }
									onPress={() => { this.setState({ gender: 'M' }) }}
								/>
								<CheckBox
									containerStyle={ styles.checkbox }
									size={14}
									title='女'
									checkedIcon='dot-circle-o'
									uncheckedIcon='circle-o'
									checked={ this.state.gender === 'F' }
									onPress={() => { this.setState({ gender: 'F' }) }}
								/>
							</View>
						</View>
						<FormLabel>血型</FormLabel>
						<View style={ styles.checkboxesContainer }>
							<View style={ styles.checkboxes }>
								<CheckBox
									containerStyle={ styles.checkbox }
									size={14}
									title='A'
									checkedIcon='dot-circle-o'
									uncheckedIcon='circle-o'
									checked={ this.state.bloodType === 'A' }
									onPress={() => { this.setState({ bloodType: 'A' }) }}
								/>
								<CheckBox
									containerStyle={ styles.checkbox }
									size={14}
									center
									title='B'
									checkedIcon='dot-circle-o'
									uncheckedIcon='circle-o'
									checked={this.state.bloodType === 'B' }
									onPress={() => { this.setState({ bloodType: 'B' }) }}
								/>
								<CheckBox
									containerStyle={ styles.checkbox }
									size={14}
									center
									title='AB'
									checkedIcon='dot-circle-o'
									uncheckedIcon='circle-o'
									checked={ this.state.bloodType === 'AB' }
									onPress={() => { this.setState({ bloodType: 'AB' }) }}
								/>
								<CheckBox
									containerStyle={ styles.checkbox }
									size={14}
									center
									title='O'
									checkedIcon='dot-circle-o'
									uncheckedIcon='circle-o'
									checked={ this.state.bloodType === 'O' }
									onPress={() => { this.setState({ bloodType: 'O' }) }}
								/>
							</View>
						</View>
						<FormLabel>住址</FormLabel>
						<FormInput
							value={ this.state.address }
							maxLength={30}
							onChangeText={(text) => { this.handleChangeText('address', text, 1) }}
							onEndEditing={(e) => { this.handleChangeText('address', e.nativeEvent.text, 2) }}
						/>
						<FormLabel>補充資訊</FormLabel>
						<FormInput
							value={ this.state.memo }
							maxLength={150}
							onChangeText={(text) => { this.handleChangeText('memo', text, 1) }}
							onEndEditing={(e) => { this.handleChangeText('memo', e.nativeEvent.text, 2) }}
						/>
					</View>
				</View>
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	headerRight: {
		color: '#007dff',
		fontSize: 17,
		marginRight: 10
	},
	container: {
		padding: 15
	},
	formContainer: {
		marginTop: 10,
		paddingBottom: 14,
		marginLeft: 8,
		borderLeftWidth: 2,
		borderColor: '#37474F'
	},
	formTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#37474F'
	},
	birthContainer: {
		flex: 1,
		alignItems: 'center'
	},
	birth: {
		marginTop: 5,
		width: '90%'
	},
	divider: {
		marginTop: 20,
		marginBottom: 20,
	},
	checkboxesContainer: {
		alignItems: 'center'
	},
	checkboxes: {
		width: '90%',
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 0
	},
	checkbox: {
		flex: 1,
		marginLeft: 5,
		marginRight: 5,
		marginBottom: 0
	},
	note: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666'
	}
});
