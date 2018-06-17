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

		this.handleCreate = this.handleCreate.bind(this);
	}

	static navigationOptions = {
		title: '新群組'
	};

	handleCreate() {
		Keyboard.dismiss();
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
		}, 150);
	}

	render() {
		return (
			<KeyboardAwareScrollView style={ styles.container }>
				<FormLabel>群組名稱</FormLabel>
				<FormInput
					maxLength={15}
					inputStyle={{ width: '100%' }}
					value={ Platform.OS === 'ios' ? null : this.state.groupName }
					onChangeText={(groupName) => { this.setState({ groupName }) }}
				/>
				<FormLabel>群組密碼</FormLabel>
				<FormInput
					maxLength={20}
					inputStyle={{ width: '100%' }}
					value={ Platform.OS === 'ios' ? null : this.state.pass }
					onChangeText={(pass) => { this.setState({ pass }) }}
				/>
				<FormLabel>群組簡介</FormLabel>
				<FormInput
					multiline
					inputStyle={{ width: '100%' }}
					maxLength={150}
					value={ Platform.OS === 'ios' ? null : this.state.groupDesc }
					onChangeText={(groupDesc) => { this.setState({ groupDesc }) }}
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
