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
import Icon from 'react-native-vector-icons/FontAwesome';

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
				<View style={ styles.optionContainer }>
					{ this.props.options.map((option, i) => (
						<View key={ option.id } style={ styles.option }>
							<View style={ styles.optionLabel }>
								<Text style={ styles.optionText }>{ `${ i + 1 }. ${ option.text }` }</Text>
							</View>
							<View style={ styles.btnDelete }>
								<Icon
									size={24}
									color="#ff3b30"
									name="trash-o"
									style={styles.newGroupBtn}
									onPress={() => { this.props.onDel(option.id) }}
								/>
							</View>
						</View>
					))}
				</View>
				<View style={ styles.newOptionContainer }>
					<View style={{ flex: 1 }}>
						<FormInput
							ref={(ref) => { this.newOption = ref }}
							maxLength={ 15 }
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
	optionContainer: {
		margin: 20,
	},
	option: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 10
	},
	optionLabel: {
		flex: 1
	},
	optionText: {
		fontSize: 26
	},
	btnDelete: {
		width: 20
	},
	newOptionContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start'
	}
});
