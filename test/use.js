var assert = require('assert'),
	express = require('express'),
	request = require('supertest'),
	AsyncRouter = require('../');

describe('router.use(fn)', function(){
	it('should auto-wrap async functions', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use(async function(req, res, next) {
			req.foo = 'bar';
			next();
		});

		router.get('/', function(req, res, next) {
			res.send(req.foo);
		});

		app.use('/test', router);

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

		app.use('/test', router);

		request(app).get('/test').end(noop);
	});

	it('should support async function error handlers', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use(function(req, res, next) {
			throw new Error('catch me');
		});

		router.use(async function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use('/test', router);

		request(app).get('/test').end(noop);
	});
});

describe('router.use(path, fn)', function(){
	it('should auto-wrap async functions', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use('/', async function(req, res, next) {
			req.foo = 'bar';
			next();
		});

		router.get('/', function(req, res, next) {
			res.send(req.foo);
		});

		app.use('/test', router);

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

		router.use('/', async function(req, res, next) {
			throw new Error('catch me');
		});

		router.use(function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.use('/test', router);

		request(app).get('/test').end(noop);
	});

	it('should support async function error handlers', function(done) {
		var app = express(),
			router = AsyncRouter();

		router.use('/', async function(req, res, next) {
			throw new Error('catch me');
		});

		router.use(async function(err, req, res, next) {
			assert.strictEqual(err.message, 'catch me');
			done();
		});

		app.get('/test', router);

		request(app).get('/test').end(noop);
	});
});

function noop() {};
