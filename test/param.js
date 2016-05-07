var assert = require('assert'),
	express = require('express'),
	request = require('supertest'),
	AsyncRouter = require('../');

describe('router.param(name, fn)', function(){
	it('should auto-wrap async functions', function(done) {
		var app = express(),
			router = AsyncRouter();

		app.use('/test', router);

		router.param('foo', async function(req, res, next, foo) {
			req.foo = foo;
			next();
		});

		router.get('/:foo', function (req, res, next) {
			res.send(req.foo);
		});

		request(app)
			.get('/test/bar')
			.end(function(err, res) {
				assert.ifError(err);

				assert.strictEqual(res.text, 'bar');
				done();
			});
	});
});
