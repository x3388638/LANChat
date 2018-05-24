export default (() => {
	/**
	 * private variable
	 */
	const _maxLength = 15;

	/**
	 * private method
	 */
	function _isFull() {
		return global.packetHistoryQueue.length >= 15;
	}
	
	/**
	 * public method
	 */
	function add(id, packetString) {
		if (_isFull()) {
			global.packetHistoryQueue.shift();
		}

		global.packetHistoryQueue.push({
			id,
			packetString
		});
	}

	function get(id) {
		const packetData = global.packetHistoryQueue.find((packet) => packet.id === id); // undefined for not found
		return packetData;
	}
	
	return {
		add,
		get
	}
})();
