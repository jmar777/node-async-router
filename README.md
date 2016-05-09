# node-async-router

node-async-router is a patched version of [pillarjs/router](https://github.com/pillarjs/router) that
adds support for ES2016/ES7 async functions.

This module is _not_ a compiler, transpiler, shim, polyfill, or anything else that modifies your
code or runtime environment, so if you want to use async functions you will still need to use
something like [Babel](https://babeljs.io/).

## Quick Example (Express)

```javascript
var app = require('express')(),
    router = require('node-async-router')();

router.get('/users/:username', async function(req, res, next) {
    var user = await UserModel.find({ username: req.params.username });
    res.json(user);
});

app.use(router);

app.listen(3000);
```

## Installation

```
$ npm install node-async-router
```

## Documentation

* [Overview](#overview)
* [Features](#features)
* [Error Handling](#error-handling)

### Overview

node-async-router is a thin wrapper around the
[router](https://github.com/pillarjs/router) module. Aside from monkey-patching in support for async
functions as middleware, it retains 100% compatible with its preexisting API (the bulk of the work
is still actually done by the wrapped router module).

### Features

As was previously alluded to, node-async-router is designed to enable async functions to be used
within router's existing API, and then it gets out of the way.

At present, the following router APIs are extended to support async functions:

* [`router.use([path], ...middleware)`](https://github.com/pillarjs/router#routerusepath-middleware)
* [`router[method](path, ...[middleware], handler)`](https://github.com/pillarjs/router#routermethodpath-middleware-handler)
* [`router.param(name, param_middleware)`](https://github.com/pillarjs/router#routerparamname-param_middleware)
* [`route[method](handler)`](https://github.com/pillarjs/router#routemethodhandler)
* [`route.all(handler)`](https://github.com/pillarjs/router#routeallhandler)

The API surface is well tested, but please do 
[report any issues](https://github.com/jmar777/node-async-router/issues), however!

### Error Handling

Error handling behaves the same as in the [router](https://github.com/pillarjs/router) module, with
the exception that if an async function is used and it resolves to a rejection (error), then that
error is automatically passed on to `next()`.

**Example:**

```javascript
var app = require('express')(),
    router = require('node-async-router')();

router.get('/500-me', async function(req, res, next) {
    var err = new Error();

    // option 1: use next()
    return next(err);

    // option 2: throw it
    throw err;

    // option 3: await on a rejected promise (without catching it)
    var user = await somePromiseThatWillBeRejected();
});

router.use(function(err, req, res, next) {
    console.error('Unhandled error:', err);
    res.status(500).send('My bad!');
});

app.use(router);

app.listen(3000);
```

## License

[MIT](https://github.com/jmar777/node-async-router/blob/master/LICENSE)
