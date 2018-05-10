
export default (() => {
	/**
	 * private variable
	 */
	const _events = {};

	/**
	 * public method
	 */
	function on(eventName, callback) {
		_events[eventName] = callback
	}

	function emit(eventName, data) {
		_events[eventName](data);
	}

	return {
		emit,
		on
	}
})();
