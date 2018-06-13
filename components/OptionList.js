import React from 'react';
import {
	View,
	Text,
	Button,
	StyleSheet,
	Platform
} from 'react-native';
import {
	FormInput,
	FormLabel
} from 'react-native-elements';

export default class OptionList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newOption: ''
		};

		this.handleAdd = this.handleAdd.bind(this);
	}

	handleAdd() {
		const option = this.state.newOption;
		if (option === '') {
			return;
		}

		if (Platform.OS === 'ios') {
			this.newOption.input.setNativeProps({ text: ' ' });
		}

		setTimeout(() => {
			this.newOption.input.setNativeProps({ text: '' });
		});

		this.setState({
			newOption: ''
		}, () => {
			this.props.onAdd(option);
		});
	}

	render() {
		return (
			<View>
				<FormLabel>選項</FormLabel>
				{ this.props.options.map((val, i) => <Text key={ val.id }>{ i + 1 }. { val.text }</Text>) }
				<View style={ styles.newOptionContainer }>
					<View style={{ flex: 1 }}>
						<FormInput
							ref={(ref) => { this.newOption = ref }}
							value={ Platform.OS === 'ios' ? null : this.state.newOption }
							onChangeText={(newOption) => { this.setState({ newOption }) }}
							placeholder="新選項"
						/>
					</View>
					<View style={{ width: 50 }}>
						<Button title="新增" onPress={ this.handleAdd } />
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	newOptionContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start'
	}
});
