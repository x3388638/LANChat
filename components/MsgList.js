import React from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet
} from 'react-native';
import moment from 'moment';

export default class MsgList extends React.Component {
	constructor(props) {
		super(props);
		this.renderMsg = this.renderMsg.bind(this);
	}

	renderMsg({item}) {
		const isSelf = item.username === 'yy';
		return (
			<View style={ styles.msgContainer }>
				<View>
					<Text style={ !!isSelf ? styles.msgUsername_right : styles.msgUsername_left }>{ item.username }</Text>
				</View>
				<View style={!!isSelf ? styles.msgBubbleContainer_right : styles.msgBubbleContainer_left }>
					<View style={ !!isSelf ? styles.msgBubble_right : styles.msgBubble_left }>
						<Text style={ styles.msgBubbleText }>{ item.text }</Text>
						<View style={ styles.timeWrapper }>
							<Text style={ styles.time }>{ moment(item.timestamp).format('HH:mm') }</Text>
						</View>
					</View>
				</View>
			</View>
		);
	}

	render() {
		return (
			<FlatList
				style={{ marginBottom: 5 }}
				data={ data }
				renderItem={ this.renderMsg }
			/>
		);
	}
}

const data = [
	{
		key: 'a',
		username: 'yy',
		timestamp: '2018-05-26T00:52:23+08:00',
		text: 'lalalalla'
	},
	{
		key: 'b',
		username: 'yy',
		timestamp: '2018-05-26T00:52:23+08:00',
		text: 'lalalalasdflkja w;lkej;asldjhv;a oljkwef; lvckahw ;ejla'
	},
	{
		key: 'c',
		username: 'zz',
		timestamp: '2018-05-26T00:52:23+08:00',
		text: 'lalaafewihe;ocuh a;wenca;wekfjc;awouieh lalla'
	},
	{
		key: 'd',
		username: 'yy',
		timestamp: '2018-05-26T00:52:23+08:00',
		text: 'lalalawelkfn alla'
	}
];

const styles = StyleSheet.create({
	msgContainer: {
		margin: 10,
		marginBottom: 0
	},
	msgUsername_left: {
		color: '#666',
		marginBottom: 1
	},
	msgUsername_right: {
		color: '#666',
		marginBottom: 1,
		textAlign: 'right'
	},
	msgBubbleContainer_left: {
		flexDirection: 'row'
	},
	msgBubbleContainer_right: {
		flexDirection: 'row',
		alignSelf: 'flex-end'
	},
	msgBubble_left: {
		borderRadius: 8,
		backgroundColor: '#fff',
		maxWidth: '65%',
		padding: 10
	},
	msgBubble_right: {
		borderRadius: 8,
		backgroundColor: '#ff9500',
		maxWidth: '65%',
		padding: 10,
	},
	msgBubbleText: {
		color: '#111'
	},
	timeWrapper: {
		marginTop: 1
	},
	time: {
		textAlign: 'right',
		color: '#666'
	}
});
