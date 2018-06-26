import React from 'react';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	Platform
} from 'react-native';
import {
	Divider,
	Button
} from 'react-native-elements';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ImgPreviewModal from './ImgPreviewModal.js';
import PollModal from './PollModal.js';

import Util from '../modules/util.js';
import Storage from '../modules/Storage.js';

class MsgItem extends React.PureComponent {
	render() {
		const type = this.props.item.type;
		const voteData = this.props.voteData;
		const pollData = this.props.pollData;
		const votesOfPoll = this.props.votesOfPoll;
		return (
			<View style={ styles.msgContainer }>
				<View>
					<Text style={[styles.msgUsername, this.props.isSelf ? styles.msgUsername_right : styles.msgUsername_left ]}>
						{ this.props.item.username }
					</Text>
				</View>
				<View style={[styles.msgBUbbleContainer, this.props.isSelf && styles.msgBubbleContainer_right]}>
					<View 
						style={[
							styles.msgBubble, this.props.isSelf ? styles.msgBubble_right : styles.msgBubble_left,
							type === 'emergency' && styles.msgBubble_emergency,
							(type === 'poll' || type === 'vote') && styles.msgBubble_poll
						]}
					>
						{ (type === 'text' || type === 'emergency') &&
							<Text style={[styles.msgBubbleText, type === 'emergency' && styles.msgBubbleText_emergency]}>
								{ this.props.item[type] }
							</Text>
						}

						{ type === 'poll' &&
							<View>
								<View style={ styles.pollHeader }>
									<Icon
										size={24}
										color="#5ba19b"
										name="poll"
									/>
									<View style={[styles.pollTextContainer, Platform.OS === 'ios' && styles.pollTextContainer_ios]}>
										<Text style={ styles.pollText }>票選活動</Text>
									</View>
								</View>
								<Divider style={ styles.divider } />
								<Text style={ styles.pollTitle }>
									{ this.props.item[type].title }
								</Text>
								<Text style={ styles.pollDesc }>
									{ this.props.item[type].desc }
								</Text>
								<Divider style={ styles.divider } />
								<View>
									{ this.props.item[type].options.map((option, i) => (
										<Text key={ option.id } style={ styles.option }>{ i + 1 }. { option.text }</Text>
									)) }
								</View>
								<Button
									title="投票"
									backgroundColor="#8aae92"
									buttonStyle={ styles.btnVote }
									onPress={() => { this.props.toVote(this.props.item[type].pollID) }}
								/>
							</View>
						}

						{ type === 'vote' &&
							<View>
								<Text style={ styles.msgBubbleText }>
									{ this.props.item.username }於 
									<Text style={ styles.textBold }>{ pollData.title }</Text>投票給 
									<Text style={ styles.textBold }>{ (pollData.options.find((option) => option.id === voteData.optionID)).text }</Text>
								</Text>
								{ pollData.options.map((option, i) => {
									const count = votesOfPoll.reduce((sum, vote) => {
										if (vote.optionID === option.id) {
											return sum + 1;
										}

										return sum;
									}, 0);

									return (
										<Text
											key={ option.id }
											style={ styles.msgBubbleText }
										>
											{ i + 1 }. { option.text } ({ count } 票, { (count * 100 / votesOfPoll.length).toFixed(2) }%)
										</Text>
									)
								}) }
								<Button
									title="投票"
									backgroundColor="#8aae92"
									buttonStyle={ styles.btnVote }
									onPress={() => { this.props.toVote(voteData.pollID) }}
								/>
							</View>
						}

						{ type === 'img' &&
							<TouchableOpacity onPress={() => { this.props.onPressImg(this.props.item[type]) }}>
								<Image
									style={{ width: 200, height: 200 }}
									source={{ uri: this.props.item[type] }}
								/>
							</TouchableOpacity>
						}

						{ type === 'file' &&
							<TouchableOpacity onPress={() => { this.props.onFileClick(this.props.item.sender, this.props.item[type].fileID) }}>
								<Text style={ styles.fileText }>💾 { this.props.item[type].fileName }</Text>
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

export default class MsgList extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			imgPreview: null,
			imgPreviewModalOpen: false,
			poll: null,
			pollModalOpen: false,
			votedVoteID: null,
			votedOptionID: null
		};

		this.scrolling = false;
		this.scrollTimeout = null;
		this.pollID = null;
		this.renderMsg = this.renderMsg.bind(this);
		this.handleScrollStart = this.handleScrollStart.bind(this);
		this.handleScrollEnd = this.handleScrollEnd.bind(this);
		this.handleContentSizeChange = this.handleContentSizeChange.bind(this);
		this.handleViewImg = this.handleViewImg.bind(this);
		this.handleVote = this.handleVote.bind(this);
		this.openPollModal = this.openPollModal.bind(this);
		this.getFile = this.getFile.bind(this);
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

	handleVote(optionID) {
		Util.sendMsg({
			type: 'vote',
			bssid: this.props.bssid,
			groupID: this.props.groupID,
			msg: {
				voteID: this.state.votedVoteID || Util.genUUID(),
				pollID: this.pollID,
				optionID
			}
		});

		this.setState({
			poll: null,
			pollModalOpen: false
		});

		this.pollID = null;
	}

	async openPollModal(pollID) {
		this.pollID = pollID;
		const poll = await Storage.getPoll(pollID);
		const votes = await Storage.getVote();
		const myVote = Object.keys(votes).find((voteID) => {
			if (votes[voteID].pollID === pollID && votes[voteID].voter === Util.getUid()) {
				return true;
			}
		});

		this.setState({
			poll,
			pollModalOpen: true,
			votedVoteID: myVote,
			votedOptionID: myVote ? votes[myVote].optionID : null
		});
	}

	getFile(uid, fileID) {

	}

	renderMsg({ item }) {
		const isSelf = item.sender === Util.getUid();
		let voteData;
		let pollData;
		let votesOfPoll;
		if (item.type === 'vote') {
			voteData = this.props.votes[item.vote.voteID];
			pollData = this.props.polls[voteData.pollID];
			votesOfPoll = Object.keys(this.props.votes).map((voteID) => {
				if (this.props.votes[voteID].pollID === voteData.pollID) {
					return this.props.votes[voteID];
				}
			}).filter((voteObj) => !!voteObj);
		}

		return (
			<MsgItem
				isSelf={ isSelf }
				item={ item }
				voteData={ voteData }
				pollData={ pollData }
				votesOfPoll={ votesOfPoll }
				onPressImg={ this.handleViewImg }
				toVote={ this.openPollModal }
				onFileClick={ this.getFile }
			/>
		);
	}

	render() {
		return (
			[
				<FlatList
					key="msgList"
					removeClippedSubviews
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
					key="imgPreviewModal"
					img={ this.state.imgPreview }
					isOpen={ this.state.imgPreviewModalOpen }
					hide={() => { this.setState({ imgPreviewModalOpen: false, imgSelected: null }) }}
				/>,
				<PollModal
					key="pollModal"
					poll={ this.state.poll }
					voted={ this.state.votedOptionID }
					isOpen={ this.state.pollModalOpen }
					hide={() => { this.setState({ pollModalOpen: false }) }}
					onSend={ this.handleVote }
				/>
			]
		);
	}
}

const styles = StyleSheet.create({
	msgContainer: {
		margin: 10,
		marginBottom: 0,
		overflow: 'hidden'
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
	msgBubble_poll: {
		backgroundColor: '#bad7df'
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
	},
	pollHeader: {
		flexDirection: 'row',
		justifyContent: 'center'
	},
	pollTextContainer: {
		minWidth: 50
	},
	pollTextContainer_ios: {
		paddingTop: 3
	},
	pollText: {
		textAlign: 'center',
		color: '#63676F',
		fontSize: 20,
		fontWeight: 'bold'
	},
	divider: {
		marginTop: 5,
		marginBottom: 5
	},
	pollTitle: {
		textAlign: 'center',
		color: '#333',
		fontWeight: 'bold'
	},
	pollDesc: {
		textAlign: 'center',
		color: '#63676F'
	},
	option: {
		color: '#63676F',
		fontWeight: 'bold'
	},
	btnVote: {
		width: 150,
		padding: 5,
		marginTop: 10,
		marginBottom: 10,
		alignSelf: 'center'
	},
	textBold: {
		fontWeight: 'bold'
	},
	fileText: {
		color: '#007aff'
	}
});
