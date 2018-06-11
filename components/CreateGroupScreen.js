import React from 'react';
import {
	View,
	StyleSheet,
	Platform,
	Alert,
	Keyboard
} from 'react-native';
import {
	FormLabel,
	FormInput,
	Button
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';

import Util from '../modules/util.js';
import Storage from '../modules/Storage.js';

export default class CreateGroupScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			groupName: '',
			pass: '',
			groupDesc: '',
			generating: false
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
		Alert.alert('群組建立中...', null, [{ text: 'OK', onPress: Keyboard.dismiss }]);
		this.setState({
			generating: true
		});

		setTimeout(() => {
			const { groupName, pass, groupDesc } = this.state;
			if (!groupName || !pass) {
				this.setState({
					generating: false
				});

				Alert.alert('欄位不得為空');
				return;
			}
			
			const key = Util.genGroupKey(groupName, pass);
			const groupID = Util.genUUID();
			const createdTime = moment().format();
			Storage.addGroup({
				groupID,
				groupName,
				groupDesc,
				createdTime,
				key
			}, (err) => {
				if (err) {
					Alert.alert(err);
					return;
				}

				Util.sendUserData();
				Alert.alert('群組新建成功', null, [{ text: 'OK', onPress: this.props.navigation.goBack }]);
			});

			this.setState({
				generating: false
			});
		}, 300);
	}

	render() {
		return (
			<KeyboardAwareScrollView style={ styles.container }>
				<FormLabel>群組名稱</FormLabel>
				<FormInput
					ref={(node) => {this.groupName = node}}
					value={ this.state.groupName }
					maxLength={15}
					onChangeText={(text) => { this.handleChangeText('groupName', text, 1) }}
					onEndEditing={(e) => { this.handleChangeText('groupName', e.nativeEvent.text, 2) }}
				/>
				<FormLabel>群組密碼</FormLabel>
				<FormInput
					ref={(node) => {this.pass = node}}
					value={ this.state.pass }
					maxLength={20}
					onChangeText={(text) => { this.handleChangeText('pass', text, 1) }}
					onEndEditing={(e) => { this.handleChangeText('pass', e.nativeEvent.text, 2) }}
				/>
				<FormLabel>群組簡介</FormLabel>
				<FormInput
					ref={(node) => { this.groupDesc = node }}
					value={this.state.groupDesc}
					maxLength={150}
					onChangeText={(text) => { this.handleChangeText('groupDesc', text, 1) }}
					onEndEditing={(e) => { this.handleChangeText('groupDesc', e.nativeEvent.text, 2) }}
				/>
				<View style={ styles.btnContainer }>
					<Button
						title={this.state.generating ? '金鑰產生中...' : '建立'}
						backgroundColor="#37474F"
						disabled={ this.state.generating }
						loading={ this.state.generating }
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
