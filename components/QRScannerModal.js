import React from 'react';
import {
	View,
	Text,
	AsyncStorage
} from 'react-native';

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			aaa: ''
		};

		this.save = this.save.bind(this);
	}

	componentDidMount() {
		this.save();
	}

	async save() {
		this.setState({
			aaa: await AsyncStorage.getItem('lalala')
		})
	}

	render() {
		return (
			<View>
				<Text style={{ marginTop: 50 }}>{ this.state.aaa }</Text>
			</View>
		)
	}
}
