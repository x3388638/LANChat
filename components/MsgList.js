import React from 'react';
import {
	View,
	Text,
	Image,
	FlatList,
	StyleSheet
} from 'react-native';
import moment from 'moment';
import Util from '../modules/util';

class MsgItem extends React.PureComponent {
	render() {
		const type = this.props.item.type;
		return (
			<View style={ styles.msgContainer }>
				<View>
					<Text style={ [styles.msgUsername, this.props.isSelf ? styles.msgUsername_right : styles.msgUsername_left ] }>
						{ this.props.item.username }
					</Text>
				</View>
				<View style={ [styles.msgBUbbleContainer, this.props.isSelf && styles.msgBubbleContainer_right] }>
					<View style={ [styles.msgBubble, this.props.isSelf ? styles.msgBubble_right : styles.msgBubble_left, type === 'emergency' && styles.msgBubble_emergency] }>
						<Text style={ [styles.msgBubbleText, type === 'emergency' && styles.msgBubbleText_emergency] }>
							{ (type === 'text' || type === 'emergency') && this.props.item[type] }
							{ type === 'img' &&
								<Image
									style={{ width: 200, height: 200 }}
									source={{ uri: this.props.item[type] }}
								/>
							}
						</Text>
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
		}, 5000);
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
	msgUsername: {
		color: '#666',
		marginBottom: 2,
		fontSize: 16,
		fontWeight: 'bold',
	},
	msgUsername_left: {
		marginLeft: 5
	},
	msgUsername_right: {
		marginRight: 5,
		textAlign: 'right'
	},
	msgBUbbleContainer: {
		flexDirection: 'row'
	},
	msgBubbleContainer_right: {
		alignSelf: 'flex-end'
	},
	msgBubble: {
		borderRadius: 8,
		maxWidth: '85%',
		minWidth: 100,
		padding: 10
	},
	msgBubble_left: {
		backgroundColor: '#F8F8F8'
	},
	msgBubble_right: {
		backgroundColor: '#B3B3A1',
	},
	msgBubble_emergency: {
		backgroundColor: '#ff3b30'
	},
	msgBubbleText: {
		color: '#63676F'
	},
	msgBubbleText_emergency: {
		color: '#fff'
	},
	timeWrapper: {
		marginTop: 1
	},
	time: {
		textAlign: 'right',
		color: '#666'
	}
});
