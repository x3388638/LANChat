import React from 'react';
import {
	View,
	Text,
	Button,
	StyleSheet
} from 'react-native';
import {
	FormLabel,
	FormInput,
	FormValidationMessage,
	Divider
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DatePicker from 'react-native-datepicker'

export default class SettingsScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			birth: '1900-01-01'
		};

		this.handleSave = this.handleSave.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		title: '個人資訊',
		headerRight: <Button title="儲存" onPress={() => { navigation.state.params.handleSave() }} />
	});

	componentDidMount() {
		this.props.navigation.setParams({ handleSave: this.handleSave });
	}

	handleSave() {
		alert('save~');
	}

	render() {
		return (
			<KeyboardAwareScrollView>
				<View style={ styles.container }>
					<Text style={ styles.formTitle }>公開資訊</Text>
					<View style={ styles.formContainer }>
						<FormLabel>姓名*</FormLabel>
						<FormInput onChangeText={() => {}} />
						<FormLabel>簡介</FormLabel>
						<FormInput onChangeText={() => { }} />
					</View>
					<Divider style={ styles.divider } />
					<Text style={ styles.formTitle }>緊急小卡 <Text style={ styles.note }>*僅使用於緊急求助通報</Text></Text>
					<View style={ styles.formContainer }>
						<FormLabel>真實姓名</FormLabel>
						<FormInput onChangeText={() => { }} />
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
						<FormInput onChangeText={() => { }} />
						<FormLabel>性別</FormLabel>
						<FormInput onChangeText={() => { }} />
						<FormLabel>血型</FormLabel>
						<FormInput onChangeText={() => { }} />
						<FormLabel>住址</FormLabel>
						<FormInput onChangeText={() => { }} />
						<FormLabel>補充資訊</FormLabel>
						<FormInput onChangeText={() => { }} />
					</View>
				</View>
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
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
