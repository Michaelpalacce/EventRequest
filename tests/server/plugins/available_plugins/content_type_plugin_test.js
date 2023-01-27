'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const ContentTypePlugin			= require( '../../../../server/plugins/available_plugins/content_type_plugin' );

test({
	message	: 'ContentTypePlugin.constructor.on.defaults.does.not.throw',
	test	: ( done ) => {
		new ContentTypePlugin("er_content_type_plugin");

		done();
	}
});

test({
	message	: 'ContentTypePlugin.constructor.on.with.options',
	test	: ( done ) => {
		const options	= {defaultContentType: "application/json"};
		const plugin	= new ContentTypePlugin("er_content_type_plugin", options);

		assert.deepStrictEqual(plugin.options, options);

		done();
	}
});

test({
	message	: 'ContentTypePlugin.onEventSend.does.not.attach.content.type.header.when.header.is.present',
	test	: ( done ) => {
		const contentType	= "application/json";
		const options		= {defaultContentType: contentType};
		const plugin		= new ContentTypePlugin("er_content_type_plugin", options);
		let called			= 0;

		const eventRequest	= helpers.getEventRequest();

		eventRequest.response._mock({
			method			: 'getHeader',
			shouldReturn	: () => {
				called	++;
				return contentType;
			},
			with			: [
				['Content-Type'],
			],
			called			: 1
		});

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: () => { throw new Error("Should not be called!"); }
		});

		plugin.onEventSend(eventRequest);

		assert.equal(called, 1);

		done();
	}
});

test({
	message	: 'ContentTypePlugin.onEventSend.attaches.content.type.header.when.header.is.not.present',
	test	: ( done ) => {
		const contentType	= "application/json";
		const options		= {defaultContentType: contentType};
		const plugin		= new ContentTypePlugin("er_content_type_plugin", options);
		let called			= 0;

		const eventRequest	= helpers.getEventRequest();

		eventRequest.response._mock({
			method			: 'getHeader',
			shouldReturn	: () => {
				called	++;
				return null;
			},
			with			: [
				['Content-Type'],
			],
			called			: 1
		});

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: () => {
				called ++;
			},
			with			: [
				['Content-Type', contentType],
			],
			called			: 1
		});

		plugin.onEventSend(eventRequest);

		assert.equal(called, 2);

		done();
	}
});

test({
	message	: 'ContentTypePlugin.setOptions.when.options.passed',
	test	: ( done ) => {
		const contentType	= "application/json";
		const plugin		= new ContentTypePlugin("er_content_type_plugin", {});

		plugin.setOptions({defaultContentType: contentType});

		assert.deepStrictEqual(plugin.defaultContentType, contentType);

		done();
	}
});

test({
	message	: 'ContentTypePlugin.setOptions.when.options.not.passed',
	test	: ( done ) => {
		const contentType	= "application/json";
		const plugin		= new ContentTypePlugin("er_content_type_plugin", {});

		plugin.setOptions();

		assert.deepStrictEqual(plugin.defaultContentType, contentType);

		done();
	}
});

test({
	message	: 'ContentTypePlugin.getPluginMiddleware.returns.one.middleware',
	test	: ( done ) => {
		const plugin		= new ContentTypePlugin("er_content_type_plugin");

		assert.deepStrictEqual(plugin.getPluginMiddleware().length, 1);

		done();
	}
});
