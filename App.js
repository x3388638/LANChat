import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	Text,
	View,
	YellowBox
} from 'react-native';
import { SwitchNavigator, StackNavigator } from 'react-navigation';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import HomeScreen from './components/HomeScreen';
import QRScannerModal from './components/QRScannerModal';

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
			Home: HomeScreen
		}),
		QRScanner: QRScannerModal
	}, {
		mode: 'modal',
		headerMode: 'none'
	})
}, {
	initialRouteName: 'LoginRegister'
});
