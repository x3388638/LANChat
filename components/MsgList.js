import React from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet
} from 'react-native';
import moment from 'moment';
import Util from '../modules/util';

class MsgItem extends React.PureComponent {
	render() {
		return (
			<View style={ styles.msgContainer }>
				<View>
					<Text style={ !!this.props.isSelf ? styles.msgUsername_right : styles.msgUsername_left }>{ this.props.item.username }</Text>
				</View>
				<View style={!!this.props.isSelf ? styles.msgBubbleContainer_right : styles.msgBubbleContainer_left }>
					<View style={ !!this.props.isSelf ? styles.msgBubble_right : styles.msgBubble_left }>
						<Text style={ styles.msgBubbleText }>{ this.props.item[this.props.item.type] }</Text>
						<View style={ styles.timeWrapper }>
							<Text style={ styles.time }>{ moment(this.props.item.timestamp).format('HH:mm') }</Text>
						</View>
					</View>
				</View>
			</View>
		);
	}
}

export default class MsgList extends React.Component {
	constructor(props) {
		super(props);
		this.scrolling = false;
		this.scrollTimeout = null;
		this.renderMsg = this.renderMsg.bind(this);
		this.handleScrollStart = this.handleScrollStart.bind(this);
		this.handleScrollEnd = this.handleScrollEnd.bind(this);
		this.handleContentSizeChange = this.handleContentSizeChange.bind(this);
	}

	handleScrollStart() {
		this.scrolling = true;
		if (this.scrollTimeout) {
			clearTimeout(this.scrollTimeout);
		}
	}

	handleScrollEnd() {
		if (this.scrollTimeout) {
			clearTimeout(this.scrollTimeout);
		}

		this.scrollTimeout = setTimeout(() => {
			this.scrolling = false;
		}, 10000);
	}

	handleContentSizeChange() {
		if (!this.scrolling) {
			this.list.scrollToEnd();
		}
	}

	renderMsg({ item }) {
		const isSelf = item.sender === Util.getUid();
		return <MsgItem isSelf={isSelf} item={item} />;
	}

	render() {
		return (
			<FlatList
				ref={(ref) => { this.list = ref }}
				style={{ marginBottom: 5 }}
				initialNumToRender={ 20 }
				data={ this.props.messages }
				renderItem={ this.renderMsg }
				onScrollBeginDrag={ this.handleScrollStart }
				onScrollEndDrag={ this.handleScrollEnd }
				onContentSizeChange={ this.handleContentSizeChange }
			/>
		);
	}
}

const styles = StyleSheet.create({
	msgContainer: {
		margin: 10,
		marginBottom: 0
	},
	msgUsername_left: {
		color: '#666',
		marginBottom: 2,
		marginLeft: 5,
		fontSize: 16,
		fontWeight: 'bold'
	},
	msgUsername_right: {
		color: '#666',
		marginBottom: 2,
		marginRight: 5,
		fontSize: 16,
		fontWeight: 'bold',
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
		backgroundColor: '#F8F8F8',
		maxWidth: '85%',
		minWidth: 100,
		padding: 10
	},
	msgBubble_right: {
		borderRadius: 8,
		backgroundColor: '#B3B3A1',
		maxWidth: '85%',
		minWidth: 100,
		padding: 10,
	},
	msgBubbleText: {
		color: '#63676F'
	},
	timeWrapper: {
		marginTop: 1
	},
	time: {
		textAlign: 'right',
		color: '#666'
	}
});
