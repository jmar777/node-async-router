var assert = require('assert'),
	express = require('express'),
	request = require('supertest'),
	methods = require('methods'),
	AsyncRouter = require('../');

methods.filter(function(method) {
	// todo: how do we test CONNECT requests?
	return method !== 'connect';
}).concat('all').forEach(function(method) {
	describe('router.' + method + '(path, fn)', function() {
		it('should support async functions', function(done) {
			var app = express(),
				router = AsyncRouter();

			router[method]('/', async function(req, res, next) {
				res.send(method + ' successful');
			});

			app.use(router);

			request(app)[method === 'all' ? 'get' : method]('/')
				.end(function(err, res) {
					assert.ifError(err);
					assert.strictEqual(res.statusCode, 200);
					if (method !== 'head') {
						assert.strictEqual(res.text, method + ' successful');
					}
					done();
				});
		});

		it('should work with multiple middleware', function(done) {
			var app = express(),
				router = AsyncRouter();

			router[method]('/', async function(req, res, next) {
				req.foo = 'bar';
				next();
			},
			async function(req, res, next) {
				req.foo += 'baz';
				next();
			},
			async function(req, res, next) {
				res.send(req.foo);
			});

			app.use(router);

			request(app)[method === 'all' ? 'get' : method]('/')
				.end(function(err, res) {
					assert.ifError(err);
					assert.strictEqual(res.statusCode, 200);
					if (method !== 'head') {
						assert.strictEqual(res.text, 'barbaz');
					}
					done();
				});
		});

		it('should forward thrown errors', function(done) {
			var app = express(),
				router = AsyncRouter();

			router[method]('/', async function(req, res, next) {
				throw new Error('catch me');
			});

			router.use(function(err, req, res, next) {
				assert.strictEqual(err.message, 'catch me');
				done();
			});

			app.use(router);

			request(app)[method === 'all' ? 'get' : method]('/').end(noop);
		});

		it('should forward awaited promise rejections', function(done) {
			var app = express(),
				router = AsyncRouter();

			router[method]('/', async function(req, res, next) {
				await Promise.reject(new Error('catch me'));
			});

			router.use(function(err, req, res, next) {
				assert.strictEqual(err.message, 'catch me');
				done();
			});

			app.use(router);

			request(app)[method === 'all' ? 'get' : method]('/').end(noop);
		});
	});
});

function noop() {}
