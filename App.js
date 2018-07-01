import {
	YellowBox,
} from 'react-native';
import { SwitchNavigator, StackNavigator } from 'react-navigation';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import HomeScreen from './components/HomeScreen';
import QRScannerModal from './components/QRScannerModal';
import SettingsScreen from './components/SettingsScreen';
import CreateGroupScreen from './components/CreateGroupScreen';
import ChatScreen from './components/ChatScreen';
import FileReaderScreen from './components/FileReaderScreen';
import ChatInfoScreen from './components/ChatInfoScreen';
import UserInfoScreen from './components/UserInfoScreen';

import PubSub from './modules/PubSub.js';
global.PubSub = PubSub;

import UdpSocket from './modules/UdpSocket.js';
global.UdpSocket = UdpSocket;

import TcpScoket from './modules/TcpSocket.js';
global.TcpSocket = TcpScoket;

import Notification from './modules/Notification.js';
global.Notification = Notification;

global.netUsers = {};

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

export default SwitchNavigator({
	LoginRegister: StackNavigator({
		Login: LoginScreen,
		Register: RegisterScreen
	}, {
		initialRouteName: 'Login'
	}),
	Main1: StackNavigator({
		Main2: StackNavigator({
			Home: HomeScreen,
			Settings: SettingsScreen,
			CreateGroup: CreateGroupScreen,
			Chat: ChatScreen,
			FileReader: FileReaderScreen,
			ChatInfo: ChatInfoScreen,
			UserInfo: UserInfoScreen
		}, {
			initialRouteName: 'Home'
		}),
		QRScanner: QRScannerModal
	}, {
		mode: 'modal',
		headerMode: 'none'
	})
}, {
	initialRouteName: 'LoginRegister'
});
