'use strict';

let colorize	= {};

const BLACK		= '\u001b[30m';
const RED		= '\u001b[31m';
const GREEN		= '\u001b[32m';
const YELLOW	= '\u001b[33m';
const BLUE		= '\u001b[34m';
const MAGENTA	= '\u001b[35m';
const CYAN		= '\u001b[36m';
const WHITE		= '\u001b[37m';
const RESET		= '\u001b[0m';

/**
 * @brief	Colorize the logs
 *
 * @param	String log
 *
 * @return	String
 */
colorize.red		= log => { return RED + log; };
colorize.black		= log => { return BLACK + log; };
colorize.green		= log => { return GREEN + log; };
colorize.yellow		= log => { return YELLOW + log; };
colorize.blue		= log => { return BLUE + log; };
colorize.magenta	= log => { return MAGENTA + log; };
colorize.cyan		= log => { return CYAN + log; };
colorize.white		= log => { return WHITE + log; };
colorize.reset		= log => { return RESET + log; };

module.exports	= colorize;
