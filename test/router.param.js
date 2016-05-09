var assert = require('assert'),
	express = require('express'),
	request = require('supertest'),
	AsyncRouter = require('../');

describe('router.param(name, fn)', function(){
	it('should support async functions', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.param('foo', async function(req, res, next, foo) {
			req.foo = foo;
			next();
		});

		router.get('/:foo', function (req, res, next) {
			res.send(req.foo);
		});

		app.use(router);

		request(app)
			.get('/bar')
			.end(function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res.text, 'bar');
				done();
			});
	});

	it('should forward thrown errors', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.param('foo', async function(req, res, next, foo) {
			throw new Error('catch me');
		});

		router.get('/:foo', function (req, res, next) {
			next();
		});

		router.use(function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use(router);

		request(app).get('/bar').end(noop);
	});

	it('should forward awaited promise rejections', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.param('foo', async function(req, res, next, foo) {
			await Promise.reject(new Error('catch me'));
		});

		router.get('/:foo', function (req, res, next) {
			next();
		});

		router.use(function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use(router);

		request(app).get('/bar').end(noop);
	});
});

function noop() {};
