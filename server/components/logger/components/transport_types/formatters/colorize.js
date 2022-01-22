'use strict';

// THIS IS NOT A FORMATTER, JUST LAZY TO MOVE IT
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
 * @property	{String} log
 *
 * @return	String
 */
colorize.red		= ( log ) => { return RED + log + RESET; };
colorize.black		= ( log ) => { return BLACK + log + RESET; };
colorize.green		= ( log ) => { return GREEN + log + RESET; };
colorize.yellow		= ( log ) => { return YELLOW + log + RESET; };
colorize.blue		= ( log ) => { return BLUE + log + RESET; };
colorize.magenta	= ( log ) => { return MAGENTA + log + RESET; };
colorize.cyan		= ( log ) => { return CYAN + log + RESET; };
colorize.white		= ( log ) => { return WHITE + log + RESET; };
colorize.reset		= ( log = '' ) => { return RESET + log + RESET; };

module.exports	= colorize;
