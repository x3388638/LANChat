import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Platform,
	Alert
} from 'react-native';
import {
	FormLabel,
	FormInput,
	Button
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default class CreateGroupScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			groupName: '',
			pass: ''
		};

		this.handleChangeText = this.handleChangeText.bind(this);
		this.handleCreate = this.handleCreate.bind(this);
	}

	static navigationOptions = {
		title: '新群組'
	};

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

	handleCreate() {
		const { groupName, pass } = this.state;
		if (!groupName || !pass) {
			Alert.alert('欄位不得為空');
			return;
		}
	}

	render() {
		return (
			<KeyboardAwareScrollView style={ styles.container }>
				<FormLabel>群組名稱</FormLabel>
				<FormInput
					value={ this.state.groupName }
					maxLength={15}
					onChangeText={(text) => { this.handleChangeText('groupName', text, 1) }}
					onEndEditing={(e) => { this.handleChangeText('groupName', e.nativeEvent.text, 2) }}
				/>
				<FormLabel>群組密碼</FormLabel>
				<FormInput
					value={ this.state.pass }
					maxLength={20}
					onChangeText={(text) => { this.handleChangeText('pass', text, 1) }}
					onEndEditing={(e) => { this.handleChangeText('pass', e.nativeEvent.text, 2) }}
				/>
				<View style={ styles.btnContainer }>
					<Button
						title="建立"
						backgroundColor="#37474F"
						onPress={ this.handleCreate }
					/>
				</View>
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		paddingTop: '20%',
		paddingLeft: 30,
		paddingRight: 30
	},
	btnContainer: {
		marginTop: 20,
		marginBottom: 20
	}
});
