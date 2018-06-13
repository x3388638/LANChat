import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Platform
} from 'react-native';
import {
	Button,
	Divider,
	FormInput,
	FormLabel
} from 'react-native-elements';
import Modal from 'react-native-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import OptionList from './OptionList.js';
import Util from '../modules/util.js';

export default class CreatePollModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: '',
			desc: '',
			options: [] // [{ id: '', text: '' }]
		};

		this.handleAddOption = this.handleAddOption.bind(this);
		this.handleDelOption = this.handleDelOption.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleAddOption(text) {
		const id = Util.genUUID();
		this.setState((prevState) => ({
			options: [...prevState.options, { id, text }]
		}));
	}

	handleDelOption(id) {
		let index;
		this.state.options.find((option, i) => {
			if (option.id === id) {
				index = i;
				return true;
			}
		});

		this.setState((prevState) => ({
			options: [...prevState.options.slice(0, index), ...prevState.options.slice(index + 1, prevState.options.length)]
		}));
	}

	handleSubmit() {
		const { title, desc } = this.state;
		// TODO: get options
	}

	render() {
		return (
			<Modal
				isVisible={ this.props.isOpen }
				onBackButtonPress={ this.props.hide }
				onBackdropPress={ this.props.hide }
				onModalShow={() => { this.setState({ title: '', desc: '', options: [] }) }}
			>
				<KeyboardAwareScrollView style={ styles.container }>
					<Text style={ styles.title }>新增投票</Text>
					<Divider style={ styles.divider } />
					<FormLabel>標題</FormLabel>
					<FormInput
						maxLength={ 15 }
						value={ Platform.OS === 'ios' ? null : this.state.title }
						onChangeText={(title) => { this.setState({ title }) }}
					/>
					<FormLabel>描述</FormLabel>
					<FormInput
						multiline
						maxLength={ 150 }
						value={ Platform.OS === 'ios' ? null : this.state.desc }
						onChangeText={(desc) => { this.setState({ desc }) }}
					/>
					<OptionList
						options={ this.state.options }
						onAdd={ this.handleAddOption }
						onDel={ this.handleDelOption }
					/>
					<View style={{ height: 50 }}></View>
				</KeyboardAwareScrollView>
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
							onPress={ this.handleSubmit }
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
	title: {
		textAlign: 'center',
		fontSize: 26
	},
	divider: {
		marginTop: 10,
		marginBottom: 10
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
	},
});
