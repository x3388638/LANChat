import sha256 from 'sha256';
import DeviceInfo from 'react-native-device-info';

export default (() => {
	function genPass(pass) {
		const salt = DeviceInfo.getBrand().toLocaleLowerCase();
		const n = ([...pass].reduce((sum, curr) => sum + (+curr), 0)) % 5;
		let newPass = [...pass];
		newPass.splice(n, 0, salt);
		const result = sha256(newPass.join(''));
		return result;
	}
	
	return {
		genPass
	}
})();
