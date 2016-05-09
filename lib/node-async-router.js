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
        return orig.apply(this, map(arguments, wrapArg.bind(null, method === 'param')));
    };
}

function wrapArg(isParamHandler, fn) {
    if (typeof fn !== 'function') return fn;

    // two cases where the function length is likely to be 4:
    // - it's an error-handling middlewhare (i.e., err, req, res, next)
    // - it's a param handler (i.e., req, res, next, paramValue)
    // in the first case, we just want make sure we preserve the function
    // length. in the second case, we can just to the next wrapper
    // implementation, which handles `next` in the correct position.
    if (fn.length === 4 && !isParamHandler) {
        return function(err, req, res, next) {
            var ret;

            try { ret = fn.apply(this, arguments); }
            catch (err) { return next(err); }

            if (isThenable(ret)) {
                ret.catch(next);
            }
        };
    }

    return function(req, res, next) {
        var ret;

        try { ret = fn.apply(this, arguments); }
        catch (err) { return next(err); }

        if (isThenable(ret)) {
            ret.catch(next);
        }
    };
}

function isThenable(obj) {
    return obj && typeof obj.then === 'function';
}

var map = Function.prototype.call.bind(Array.prototype.map);

module.exports = AsyncRouter;
