var Router = require('router'),
    methods = require('methods');

function AsyncRouter(opts) {
    return patch(Router(opts));
}

function patch(router) {
    ['use', 'param'].map(wrapRouterMethod.bind(null, router));

    var origRoute = router.route;
    router.route = function route() {
        var ret = origRoute.apply(this, arguments);
        methods.concat('all').forEach(wrapRouterMethod.bind(null, ret));
        return ret;
    };

    return router;
}

function wrapRouterMethod(obj, method) {
    var orig = obj[method];
    if (!orig) return orig;

    obj[method] = function() {
        return orig.apply(this, map(arguments, wrapArg));
    };
}

function wrapArg(fn) {
    if (typeof fn !== 'function') return fn;

    // express checks the function length to detect error-handling middleware
    // (e.g., `function(error, req, res, next) {}`), so we need to preserve that.
    if (fn.length === 4) {
        return function(err, req, res, next) {
            var ret;

            try { ret = fn.apply(this, arguments); }
            catch (err) { return next(err); }

            if (isThenable(ret)) {
                ret.then(function(val) { next(null, val); }, next);
            }
        };
    }

    return function(req, res, next) {
        var ret;

        try { ret = fn.apply(this, arguments); }
        catch (err) { return next(err); }

        if (isThenable(ret)) {
            ret.then(function(val) { next(null, val); }, next);
        }
    };
}

function isThenable(obj) {
    return obj && typeof obj.then === 'function';
}

var map = Function.prototype.call.bind(Array.prototype.map);

module.exports = AsyncRouter;
