import React from 'react';
import {
	View,
	Text
} from 'react-native';
import {
	FormInput,
	FormLabel
} from 'react-native-elements';

export default class OptionList extends React.Component {
	render() {
		return (
			<View>
				<FormLabel>選項</FormLabel>
				<View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
					<View style={{ flex: 1 }}>
						<FormInput />
					</View>
					<Text style={{ width: 50 }}>add</Text>
				</View>
			</View>
		);
	}
}
