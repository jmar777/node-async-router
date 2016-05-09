var assert = require('assert'),
	express = require('express'),
	request = require('supertest'),
	AsyncRouter = require('../');

describe('router.use(fn)', function(){
	it('should support async functions', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use(async function(req, res, next) {
			req.foo = 'bar';
			next();
		});

		router.get('/test', function(req, res, next) {
			res.send(req.foo);
		});

		app.use(router);

		request(app)
			.get('/test')
			.end(function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res.text, 'bar');
				done();
			});
	});

	it('should forward thrown errors', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use(async function(req, res, next) {
			throw new Error('catch me');
		});

		router.use(function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use(router);

		request(app).get('/').end(noop);
	});

	it('should forward awaited promise rejections', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use(async function(req, res, next) {
			await Promise.reject(new Error('catch me'));
		});

		router.use(function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use(router);

		request(app).get('/').end(noop);
	});

	it('should allow defining error handlers with async functions', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use(function(req, res, next) {
			throw new Error('catch me');
		});

		router.use(async function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use(router);

		request(app).get('/').end(noop);
	});
});

describe('router.use(path, fn)', function(){
	it('should support async functions', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use('/test', async function(req, res, next) {
			req.foo = 'bar';
			next();
		});

		router.get('/test', function(req, res, next) {
			res.send(req.foo);
		});

		app.use(router);

		request(app)
			.get('/test')
			.end(function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res.text, 'bar');
				done();
			});
	});

	it('should forward thrown errors', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use('/test', async function(req, res, next) {
			throw new Error('catch me');
		});

		router.use('/test', function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use(router);

		request(app).get('/test').end(noop);
	});

	it('should forward awaited promise rejections', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use('/test', async function(req, res, next) {
			await Promise.reject(new Error('catch me'));
		});

		router.use(function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use(router);

		request(app).get('/test').end(noop);
	});

	it('should allow defining error handlers with async functions', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use('/test', async function(req, res, next) {
			throw new Error('catch me');
		});

		router.use(async function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use(router);

		request(app).get('/test').end(noop);
	});
});

function noop() {};
