import React from 'react';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	FlatList,
	StyleSheet
} from 'react-native';
import moment from 'moment';

import ImgPreviewModal from './ImgPreviewModal.js';

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
						{ (type === 'text' || type === 'emergency') &&
							<Text style={ [styles.msgBubbleText, type === 'emergency' && styles.msgBubbleText_emergency] }>
								{ this.props.item[type] }
							</Text>
						}
						{ type === 'img' &&
							<TouchableOpacity onPress={() => { this.props.onPressImg(this.props.item[type]) }}>
								<Image
									style={{ width: 200, height: 200 }}
									source={{ uri: this.props.item[type] }}
								/>
							</TouchableOpacity>
						}
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
		this.state = {
			imgPreview: null,
			imgPreviewModalOpen: false
		};

		this.scrolling = false;
		this.scrollTimeout = null;
		this.renderMsg = this.renderMsg.bind(this);
		this.handleScrollStart = this.handleScrollStart.bind(this);
		this.handleScrollEnd = this.handleScrollEnd.bind(this);
		this.handleContentSizeChange = this.handleContentSizeChange.bind(this);
		this.handleViewImg = this.handleViewImg.bind(this);
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

	handleViewImg(uri) {
		this.setState({
			imgPreview: uri,
			imgPreviewModalOpen: true
		});
	}

	renderMsg({ item }) {
		const isSelf = item.sender === Util.getUid();
		return <MsgItem isSelf={isSelf} item={item} onPressImg={ this.handleViewImg } />;
	}

	render() {
		return (
			[
				<FlatList
					key="msgList"
					ref={(ref) => { this.list = ref }}
					style={{ marginBottom: 5 }}
					initialNumToRender={ 20 }
					data={ this.props.messages }
					renderItem={ this.renderMsg }
					onScrollBeginDrag={ this.handleScrollStart }
					onScrollEndDrag={ this.handleScrollEnd }
					onContentSizeChange={ this.handleContentSizeChange }
				/>,
				<ImgPreviewModal
					key="modal"
					img={ this.state.imgPreview }
					isOpen={ this.state.imgPreviewModalOpen }
					hide={() => { this.setState({ imgPreviewModalOpen: false, imgSelected: null }) }}
				/>
			]
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
