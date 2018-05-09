
export default (() => {
	/**
	 * private variable
	 */
	const _events = {};

	/**
	 * public method
	 */
	function on(eventName, callback) {
		_events[eventName] = _events[eventName] || [];
		_events[eventName].push(callback);
	}

	function emit(eventName) {
		_events[eventName] && _events[eventName].forEach((callback) => {
			callback();
		});
	}

	return {
		emit,
		on
	}
})();
