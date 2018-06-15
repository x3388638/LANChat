import React from 'react';
import {
	View,
	ScrollView,
	Text,
	TouchableOpacity,
	StyleSheet
} from 'react-native';
import {
	Button,
	Divider
} from 'react-native-elements';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class PollModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: null
		};

		this.handleSelect = this.handleSelect.bind(this);
	}

	handleSelect(optionID) {
		this.setState({
			selected: optionID
		});
	}

	render() {
		if (!this.props.poll) {
			return null
		} else {
			return (
				<Modal
					isVisible={ this.props.isOpen }
					onBackButtonPress={ this.props.hide }
					onBackdropPress={ this.props.hide }
				>
					<ScrollView style={ styles.container }>
						<Text style={ styles.header }>{ this.props.poll.title }</Text>
						<Divider style={ styles.divider } />
						{ this.props.poll.desc &&
							<View style={ styles.descContainer }>
								<Text style={ styles.desc }>{ this.props.poll.desc }</Text>
							</View>
						}
						<View style={ styles.options }>
							{ this.props.poll.options.map((option, i) => (
								<TouchableOpacity onPress={() => { this.handleSelect(option.id) }} key={ option.id } style={ styles.optionContainer }>
									<View style={ styles.optionTextContainer }>
										<Text style={ styles.optionText }>{ i + 1 }. { option.text }</Text>
									</View>
									<Icon
										size={ 26 }
										color="#5ba19b"
										name={ option.id === this.state.selected ? 'check-circle' : 'circle-o' }
									/>
								</TouchableOpacity>
							)) }
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
								onPress={() => {}}
							/>
						</View>
					</View>
				</Modal>
			);
		}
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
	header: {
		textAlign: 'center',
		fontSize: 26
	},
	divider: {
		marginTop: 10,
		marginBottom: 10
	},
	descContainer: {
		backgroundColor: '#f3f3f3',
		padding: 10,
		borderRadius: 10
	},
	desc: {
		color: '#63676F'
	},
	options: {
		marginTop: 10
	},
	optionContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10
	},
	optionTextContainer: {
		flex: 1
	},
	optionText: {
		color: '#63676F',
		fontSize: 20
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
