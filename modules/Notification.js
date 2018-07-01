import {
	Platform
} from 'react-native';

const PushNotification = require('react-native-push-notification');

export default (() => {
	function push(title, message, subText = null) {
		if (Platform.OS === 'ios') {
			return;
		}

		PushNotification.localNotification({
			title, // (optional) 
			message, // (required)
			subText, // (optional) default: none
			vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
			ongoing: false, // (optional) set whether this is an "ongoing" notification
		});
	}

	return {
		push
	}
})();
