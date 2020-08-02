'use strict';

// Dependencies
const { assert, test }	= require( '../../../../../../test_helper' );
const colorize			= require( './../../../../../../../server/components/logger/components/transport_types/formatters/colorize' );

test({
	message	: 'Colorize.red',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.red( 'test' ), '\u001b[31mtest' );

		done();
	}
});

test({
	message	: 'Colorize.black',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.black( 'test' ), '\u001b[30mtest' );

		done();
	}
});

test({
	message	: 'Colorize.green',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.green( 'test' ), '\u001b[32mtest' );

		done();
	}
});

test({
	message	: 'Colorize.yellow',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.yellow( 'test' ), '\u001b[33mtest' );

		done();
	}
});

test({
	message	: 'Colorize.blue',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.blue( 'test' ), '\u001b[34mtest' );

		done();
	}
});

test({
	message	: 'Colorize.magenta',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.magenta( 'test' ), '\u001b[35mtest' );

		done();
	}
});

test({
	message	: 'Colorize.cyan',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.cyan( 'test' ), '\u001b[36mtest' );

		done();
	}
});

test({
	message	: 'Colorize.white',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.white( 'test' ), '\u001b[37mtest' );

		done();
	}
});

test({
	message	: 'Colorize.reset',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.reset( 'test' ), '\u001b[0mtest' );

		done();
	}
});

test({
	message	: 'Colorize.reset.without.anything',
	test	: ( done )=>{
		assert.deepStrictEqual( colorize.reset(), '\u001b[0m' );

		done();
	}
});
