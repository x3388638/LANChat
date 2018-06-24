import React from 'react';
import { StyleSheet } from 'react-native';
import { Badge } from 'react-native-elements';

export default class UnreadCounter extends React.PureComponent {
	render() {
		const badgeColor = this.props.emergency ? '#ff3b30' : '#007aff'
		return (
			<Badge
				value={ this.props.count }
				textStyle={ styles.text }
				containerStyle={ [styles.container, { backgroundColor: badgeColor }] }
			/>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		paddingLeft: 7,
		paddingRight: 7
	},
	text: {
		color: '#fff'
	}
});
