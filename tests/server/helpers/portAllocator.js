// Added since I don't want to refactor everything

const startPort = 6000;
let current = startPort;

/**
 * This function will return a port that is not being used.
 *
 * Very complex logic ahead, beware.
 *
 * @returns {number}
 */
function getNextPort() {
	return ++current;
}

module.exports = getNextPort;