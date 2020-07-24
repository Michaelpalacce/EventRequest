'use strict';

const { assert, test }	= require( '../../../test_helper' );
const TemplatingEngine	= require( '../../../../server/components/templating_engine/default_templating_engine' );

test({
	message	: 'TemplatingEngine.render returns html as it is',
	test	: ( done ) => {
		const html	= '<h1>Test</h1>{{ testKey }}';

		assert.equal( new TemplatingEngine().render( html, { testKey: 'hey' } ), html );

		done();
	}
});
