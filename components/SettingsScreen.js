import React from 'react';
import {
	View,
	Text,
	Button,
	Alert,
	StyleSheet
} from 'react-native';
import {
	FormLabel,
	FormInput,
	Divider
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DatePicker from 'react-native-datepicker';

import Storage from '../modules/Storage.js';

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
		});

		Alert.alert('儲存成功');
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

	render() {
		return (
			<KeyboardAwareScrollView>
				<View style={ styles.container }>
					<Text style={ styles.formTitle }>公開資訊</Text>
					<View style={ styles.formContainer }>
						<FormLabel>姓名*</FormLabel>
						<FormInput value={ this.state.username } maxLength={10} onChangeText={(username) => {this.setState({ username })}} />
						<FormLabel>簡介</FormLabel>
						<FormInput value={ this.state.selfIntro } maxLength={150} onChangeText={(selfIntro) => {this.setState({ selfIntro })}} />
					</View>
					<Divider style={ styles.divider } />
					<Text style={ styles.formTitle }>緊急小卡 <Text style={ styles.note }>*僅使用於緊急求助通報</Text></Text>
					<View style={ styles.formContainer }>
						<FormLabel>真實姓名</FormLabel>
						<FormInput value={ this.state.name } maxLength={15} onChangeText={(name) => {this.setState({ name })}} />
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
						<FormInput value={ this.state.gender } onChangeText={(gender) => {this.setState({ gender })}} />
						<FormLabel>血型</FormLabel>
						<FormInput value={ this.state.bloodType } onChangeText={(bloodType) => {this.setState({ bloodType })}} />
						<FormLabel>住址</FormLabel>
						<FormInput value={ this.state.address } maxLength={30} onChangeText={(address) => {this.setState({ address })}} />
						<FormLabel>補充資訊</FormLabel>
						<FormInput value={ this.state.memo } maxLength={150} onChangeText={(memo) => {this.setState({ memo })}} />
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
		fontWeight: 'bold'
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
	note: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666'
	}
});
