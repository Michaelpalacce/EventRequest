const {assert, test, helpers, Mocker, Mock} = require('../test_helper');
const path = require('path');
const {Server} = require('./../../server/index');
const fs = require('fs');
const querystring = require('querystring');
const JsonBodyParser = require('./../../server/components/body_parsers/json_body_parser');
const BodyParserPlugin = require('./../../server/plugins/available_plugins/body_parser_plugin');
const getNextPort = require("./helpers/portAllocator");

test({
	message: 'Server.test.er_body_parser_json.does.not.parse.anything.but.application/json',
	test: (done) => {
		const name = 'testErJsonBodyParserParsesApplicationJson';
		const formDataKey = 'testErJsonBodyParserParsesApplicationJson';
		const formDataValue = 'value';
		const port = getNextPort();

		const app = new Server();

		app.apply(app.er_body_parser_json, {maxPayloadLength: 60});

		app.get(`/${name}`, (event) => {
			if (
				typeof event.body === 'undefined'
				|| typeof event.body[formDataKey] === 'undefined'
				|| !event.body[formDataKey].includes(formDataValue)
			) {
				event.sendError('Body was not parsed', 400);
			}

			event.send('ok');
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': 'application/json'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify({[formDataKey]: formDataValue}),
				{['content-type'.toUpperCase()]: 'application/json'},
				port
			)
		);

		// Above the limit of 60 bytes
		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue + formDataValue + formDataValue}),
				{'content-type': 'application/json'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': 'application/*'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': '*/*'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': 'json'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': '*'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				'{wrongJson',
				{},
				port
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				server.close();
				done();
			}).catch(done);
		});
	}
});

test({
	message: 'Server.test.er_body_parser_json.does.not.parse.anything.but.application/json.setting.options',
	test: (done) => {
		const name = 'testErJsonBodyParserParsesApplicationJson';
		const formDataKey = 'testErJsonBodyParserParsesApplicationJson';
		const formDataValue = 'value';
		const port = getNextPort();

		const app = new Server();

		app.er_body_parser_json.setOptions({
			maxPayloadLength: 60
		});
		app.apply(app.er_body_parser_json);

		app.get(`/${name}`, (event) => {
			if (
				typeof event.body === 'undefined'
				|| typeof event.body[formDataKey] === 'undefined'
				|| !event.body[formDataKey].includes(formDataValue)
			) {
				event.sendError('Body was not parsed', 400);
			}

			event.send('ok');
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': 'application/json'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify({[formDataKey]: formDataValue}),
				{['content-type'.toUpperCase()]: 'application/json'},
				port
			)
		);

		// Above the limit of 60 bytes
		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue + formDataValue + formDataValue}),
				{'content-type': 'application/json'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': 'application/*'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': '*/*'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': 'json'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{'content-type': '*'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify({[formDataKey]: formDataValue}),
				{},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				'{wrongJson',
				{},
				port
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				server.close();
				done();
			}).catch(done);
		});
	}
});

test({
	message: 'Server.test.er_body_parser_json.does.not.parse.above.the.maxPayload.if.strict',
	test: (done) => {
		const name = 'testErJsonBodyParserParsesApplicationJson';
		const formDataKey = 'testErJsonBodyParserParsesApplicationJson';
		const formDataValue = 'value';
		const port = getNextPort();

		const app = new Server();

		app.apply(app.er_body_parser_json, {maxPayloadLength: 60, strict: true});

		app.get(`/${name}`, (event) => {
			assert.deepStrictEqual(event.body, {});
			assert.deepStrictEqual(event.rawBody, {});

			event.send('ok');
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify({[formDataKey]: formDataValue + formDataValue + formDataValue}),
				{'content-type': 'application/json'},
				port
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				server.close();
				done();
			}).catch(done);
		});
	}
});

test({
	message: 'Server.test.er_body_parser_form.parser.above.the.maxPayload.if.not.strict',
	test: (done) => {
		const name = 'testErBodyParserFormParsesApplicationXWwwFormUrlencoded';
		const formDataKey = 'testErBodyParserFormParsesApplicationXWwwFormUrlencoded';
		const formDataValue = 'value';
		const port = getNextPort();

		const app = new Server();

		app.apply(app.er_body_parser_form, {maxPayloadLength: 60, strict: false});

		app.get(`/${name}`, (event) => {
			if (
				typeof event.body === 'undefined'
				|| typeof event.body[formDataKey] === 'undefined'
				|| !event.body[formDataKey].includes(formDataValue)
			) {
				event.sendError('Body was not parsed', 400);
			}

			event.send('ok');
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify({[formDataKey]: formDataValue}),
				{'content-type': 'application/x-www-form-urlencoded'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify({[formDataKey]: formDataValue + formDataValue + formDataValue}),
				{'content-type': 'application/x-www-form-urlencoded'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify({[formDataKey]: formDataValue}),
				{'content-type': ''},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify({[formDataKey]: formDataValue}),
				{'content-type': 'application/*'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify({[formDataKey]: formDataValue}),
				{'content-type': '*'},
				port
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				server.close();
				done();
			}).catch(done);
		});
	}
});

test({
	message: 'Server.test.er_body_parser_form.does.parse.not.above.the.maxPayload.if.strict',
	test: (done) => {
		const name = 'testErBodyParserFormParsesApplicationXWwwFormUrlencoded';
		const formDataKey = 'testErBodyParserFormParsesApplicationXWwwFormUrlencoded';
		const formDataValue = 'value';
		const port = getNextPort();

		const app = new Server();

		app.apply(app.er_body_parser_form, {maxPayloadLength: 60, strict: true});

		app.get(`/${name}`, (event) => {
			assert.deepStrictEqual(event.body, {});

			event.send('ok');
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				querystring.stringify({[formDataKey]: formDataValue + formDataValue + formDataValue}),
				{'content-type': 'application/x-www-form-urlencoded'},
				port
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				server.close();
				done();
			}).catch(done);
		});
	}
});

test({
	message: 'Server.test.er_body_parser_multipart.parses.only.multipart/form-data',
	test: (done) => {
		const name = 'testErBodyParserMultipartParsesMultipartFormData';
		const multipartDataCR = fs.readFileSync(path.join(__dirname, './fixture/body_parser/multipart/multipart_data_CR'));
		const multipartDataCRLF = fs.readFileSync(path.join(__dirname, './fixture/body_parser/multipart/multipart_data_CRLF'));
		const multipartDataLF = fs.readFileSync(path.join(__dirname, './fixture/body_parser/multipart/multipart_data_LF'));
		const tempDir = path.join(__dirname, `./fixture/body_parser/multipart`);
		const app = new Server();
		const port = getNextPort();

		app.apply(app.er_body_parser_multipart, {tempDir});

		app.get(`/${name}`, (event) => {
			if (
				typeof event.body === 'undefined'
				|| typeof event.body.$files === 'undefined'
				|| event.body.text !== 'text default'
				|| event.body.$files.length !== 2
				|| event.body.$files[0].type !== 'file'
				|| event.body.$files[0].size !== 17
				|| event.body.$files[0].contentType !== 'text/plain'
				|| event.body.$files[0].name !== 'a.txt'
				|| !event.body.$files[0].path.includes(tempDir)
				|| event.body.$files[1].type !== 'file'
				|| event.body.$files[1].size !== 48
				|| event.body.$files[1].contentType !== 'text/html'
				|| event.body.$files[1].name !== 'a.html'
				|| !event.body.$files[1].path.includes(tempDir)
			) {
				event.sendError('Body was not parsed', 400);
			}

			event.send('ok');
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				multipartDataCRLF,
				{'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				multipartDataCR,
				{'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				multipartDataLF,
				{'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				multipartDataCRLF,
				{'content-type': 'multipart/form-data; boundary=---------------------------9041544843365972754266'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				500,
				multipartDataCRLF,
				{'content-type': 'multipart/form-data'},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				multipartDataCRLF,
				{},
				port
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				'',
				{'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266'},
				port
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				setTimeout(() => {
					server.close();
					done();
				}, 500);
			}).catch(done);
		});
	}
});

test({
	message: 'Server.test.er_body_parser_multipart.will.not.parse.if.limit.is.reached',
	test: (done) => {
		const name = 'testErBodyParserMultipartParsesMultipartFormData';
		const multipartData = fs.readFileSync(path.join(__dirname, `./fixture/body_parser/multipart/multipart_data_CRLF`));
		const tempDir = path.join(__dirname, './fixture/body_parser/multipart');
		const app = new Server();
		const port = getNextPort();

		app.apply(app.er_body_parser_multipart, {tempDir, maxPayload: 10});

		app.get(`/${name}`, (event) => {
			event.send('ok');
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				500,
				multipartData,
				{'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266'},
				port
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				setTimeout(() => {
					server.close();
					done();
				}, 500);
			}).catch(done);
		});
	}
});

test({
	message: 'Server.test.er_body_parser.setOptions.without.anything',
	test: (done) => {
		const app = new Server();

		app.apply(app.er_body_parser_json, {maxPayloadLength: 1});
		assert.deepStrictEqual(app.er_body_parser_json.options, {maxPayloadLength: 1});

		app.er_body_parser_json.setOptions();
		app.apply(app.er_body_parser_json);
		assert.deepStrictEqual(app.er_body_parser_json.options, {});

		done();
	}
});

test({
	message: 'Server.test.er_body_parser.when.event.body.already.exists.does.not.parse',
	test: (done) => {
		const name = 'testErBodyParserDoesNotParseIfBodyExists';
		const app = new Server();
		const port = getNextPort();

		app.get(`/${name}`, (event) => {
			event.body = 'TEST';
			event.rawBody = 'TEST';
			event.next();
		});

		app.apply(app.er_body_parser_json);

		app.get(`/${name}`, (event) => {
			event.send({body: event.body, rawBody: event.rawBody});
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify({key: 123}),
				{'content-type': 'application/json'},
				port,
				JSON.stringify({body: 'TEST', rawBody: 'TEST'})
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				server.close();
				done();
			}).catch(done);
		});
	}
});

test({
	message: 'Server.test.er_body_parser.when.parsed.data.is.invalid',
	test: (done) => {
		const name = 'testErBodyParserIfInvalidParserData';
		const app = new Server();
		const MockBodyParser = Mock(JsonBodyParser);
		const port = getNextPort();

		Mocker(MockBodyParser, {
			method: 'parse',
			shouldReturn: () => {
				return new Promise((resolve) => {
					resolve('wrongData');
				});
			}
		});

		Mocker(MockBodyParser, {
			method: 'supports',
			shouldReturn: () => {
				return true;
			}
		});

		app.apply(new BodyParserPlugin(MockBodyParser, 'er_test'));

		app.get(`/${name}`, (event) => {
			event.send({body: event.body, rawBody: event.rawBody});
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				'',
				{'content-type': '*/*'},
				port,
				JSON.stringify({body: {}, rawBody: {}})
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				server.close();
				done();
			}).catch(done);
		});
	}
});

test({
	message: 'Server.test.er_body_parser_raw.handles.anything',
	test: (done) => {
		const name = 'testErBodyParserRaw';
		const app = new Server();
		const port = getNextPort();

		app.apply(app.er_body_parser_raw, {maxPayloadLength: 15});

		app.get(`/${name}`, (event) => {
			event.send({body: event.body, rawBody: event.rawBody});
		});

		const responses = [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				'SomeRandomData',
				{'content-type': 'somethingDoesntMatter'},
				port,
				JSON.stringify({body: 'SomeRandomData', rawBody: 'SomeRandomData'})
			)
		);

		// Returns 200 and an empty body due to limit reached
		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				'SomeRandomDataSomeRandomData',
				{'content-type': 'somethingDoesntMatter'},
				port,
				JSON.stringify({body: {}, rawBody: {}})
			)
		);

		const server = app.listen(port, () => {
			Promise.all(responses).then(() => {
				setTimeout(() => {
					server.close();
					done();
				}, 500);
			}).catch(done);
		});
	}
});