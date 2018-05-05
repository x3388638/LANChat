import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	Text,
	View,
	YellowBox,
	AsyncStorage
} from 'react-native';
import { SwitchNavigator, StackNavigator } from 'react-navigation';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import HomeScreen from './components/HomeScreen';
import QRScannerModal from './components/QRScannerModal';
import SettingsScreen from './components/SettingsScreen';

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

AsyncStorage.setItem('lalala', '123456889');

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
			Settings: SettingsScreen
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
