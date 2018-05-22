import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import Util from '../modules/util';

export default class MemberOnlineStatus extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			online: 0,
			text: ''
		};

		this.getOnlineStatus = this.getOnlineStatus.bind(this);
	}

	componentDidMount() {
		this.getOnlineStatus();
	}

	async getOnlineStatus() {
		const onlineStatus = await Util.getOnlineStatus(this.props.uid);
		this.setState({
			online: onlineStatus.online,
			text: onlineStatus.text
		});
	}

	render() {
		const dotColor = this.state.online ? '#4cd964' : '#4E6068';
		return (
			<View style={ styles.container }>
				<View style={ styles.dot }>
					<Icon
						size={ 12 }
						color={ dotColor }
						name="circle"
					/>
				</View>
				<Text style={ styles.text }>{ this.state.text }</Text>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row'
	},
	dot: {
		width: 15,
		marginLeft: 10,
		alignItems: 'center',
		justifyContent: 'center'
	},
	text: {
		flex: 1,
		color: '#4E6068'
	}
});
