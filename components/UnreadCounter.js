import React from 'react';
import { StyleSheet } from 'react-native';
import { Badge } from 'react-native-elements';

export default class UnreadCounter extends React.Component {
	render() {
		return (
			<Badge
				value={ this.props.count }
				textStyle={ styles.text }
				containerStyle={ styles.container }
			/>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#007aff',
		paddingLeft: 7,
		paddingRight: 7
	},
	text: {
		color: '#fff'
	}
});
