'use strict';

const AbstractFileStream				= require( '../../../../server/components/file_streams/abstract_file_stream' );
const { assert, test, Mock, helpers }	= require( '../../../test_helper' );
const path								= require( 'path' );

const DEFAULT_TEST_FILE			= path.join( __dirname, './fixtures/testFile.txt' );

test({
	message	: 'AbstractFileStream.constructor',
	test	: ( done ) => {
		const fileStream	= new AbstractFileStream();

		assert.deepStrictEqual( fileStream.SUPPORTED_FORMATS, [] );
		assert.deepStrictEqual( fileStream._streamType, 'unknown' );

		done();
	}
});

test({
	message	: 'AbstractFileStream.supports.when.does.not.support',
	test	: ( done ) => {
		const fileStream	= new AbstractFileStream();

		assert.deepStrictEqual( fileStream.supports( DEFAULT_TEST_FILE ), false );

		done();
	}
});

test({
	message	: 'AbstractFileStream.supports.when.supports',
	test	: ( done ) => {
		const fileStream	= new AbstractFileStream( ['.txt'] );

		assert.deepStrictEqual( fileStream.supports( DEFAULT_TEST_FILE ), true );

		done();
	}
});

test({
	message	: 'AbstractFileStream.getType',
	test	: ( done ) => {
		const fileStream	= new AbstractFileStream( ['.txt'], 'TYPE' );

		assert.deepStrictEqual( fileStream.getType(), 'TYPE' );

		done();
	}
});
