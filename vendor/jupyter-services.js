/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*-----------------------------------------------------------------------------
	| Copyright (c) 2014-2015, Jupyter Development Team.
	|
	| Distributed under the terms of the Modified BSD License.
	|----------------------------------------------------------------------------*/
	'use strict';
	// Polyfill for ES6 Promises
	__webpack_require__(1);
	var services_1 = __webpack_require__(4);
	var BASE_URL = services_1.utils.getBaseUrl();
	var WS_URL = services_1.utils.getWsUrl();
	function startNewPythonSession(kernelName, kernelPath) {
	    // Start a new session.
	    var options = {
	        baseUrl: BASE_URL,
	        wsUrl: WS_URL,
	        kernelName: kernelName,
	        path: kernelPath
	    };
	    return services_1.Session.startNew(options);
	    // .then(session => {
	    //     // Rename the session.
	    //     session.rename('bar.ipynb').then(() => {
	    //       console.log('Session renamed to', session.path);
	    //       // Execute and handle replies on the kernel.
	    //       let future = session.kernel.requestExecute({ code: 'a = 1' });
	    //       future.onReply = (reply) => {
	    //         console.log('Got execute reply');
	    //       };
	    //       future.onDone = () => {
	    //         console.log('Future is fulfilled');
	    //         // Shut down the session.
	    //         session.shutdown().then(() => {
	    //           console.log('Session shut down');
	    //           alert('Test Complete!  See the console output for details');
	    //         });
	    //       };
	    //     });
	    //   });
	}
	window.H2OPythonClient = {
	    Session: services_1.Session,
	    Kernel: services_1.Kernel,
	    KernelMessage: services_1.KernelMessage,
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var require;/* WEBPACK VAR INJECTION */(function(process, global) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   3.3.1
	 */

	(function (global, factory) {
	     true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    (global.ES6Promise = factory());
	}(this, (function () { 'use strict';

	function objectOrFunction(x) {
	  return typeof x === 'function' || typeof x === 'object' && x !== null;
	}

	function isFunction(x) {
	  return typeof x === 'function';
	}

	var _isArray = undefined;
	if (!Array.isArray) {
	  _isArray = function (x) {
	    return Object.prototype.toString.call(x) === '[object Array]';
	  };
	} else {
	  _isArray = Array.isArray;
	}

	var isArray = _isArray;

	var len = 0;
	var vertxNext = undefined;
	var customSchedulerFn = undefined;

	var asap = function asap(callback, arg) {
	  queue[len] = callback;
	  queue[len + 1] = arg;
	  len += 2;
	  if (len === 2) {
	    // If len is 2, that means that we need to schedule an async flush.
	    // If additional callbacks are queued before the queue is flushed, they
	    // will be processed by this flush that we are scheduling.
	    if (customSchedulerFn) {
	      customSchedulerFn(flush);
	    } else {
	      scheduleFlush();
	    }
	  }
	};

	function setScheduler(scheduleFn) {
	  customSchedulerFn = scheduleFn;
	}

	function setAsap(asapFn) {
	  asap = asapFn;
	}

	var browserWindow = typeof window !== 'undefined' ? window : undefined;
	var browserGlobal = browserWindow || {};
	var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

	// test for web worker but not in IE10
	var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

	// node
	function useNextTick() {
	  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	  // see https://github.com/cujojs/when/issues/410 for details
	  return function () {
	    return process.nextTick(flush);
	  };
	}

	// vertx
	function useVertxTimer() {
	  return function () {
	    vertxNext(flush);
	  };
	}

	function useMutationObserver() {
	  var iterations = 0;
	  var observer = new BrowserMutationObserver(flush);
	  var node = document.createTextNode('');
	  observer.observe(node, { characterData: true });

	  return function () {
	    node.data = iterations = ++iterations % 2;
	  };
	}

	// web worker
	function useMessageChannel() {
	  var channel = new MessageChannel();
	  channel.port1.onmessage = flush;
	  return function () {
	    return channel.port2.postMessage(0);
	  };
	}

	function useSetTimeout() {
	  // Store setTimeout reference so es6-promise will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var globalSetTimeout = setTimeout;
	  return function () {
	    return globalSetTimeout(flush, 1);
	  };
	}

	var queue = new Array(1000);
	function flush() {
	  for (var i = 0; i < len; i += 2) {
	    var callback = queue[i];
	    var arg = queue[i + 1];

	    callback(arg);

	    queue[i] = undefined;
	    queue[i + 1] = undefined;
	  }

	  len = 0;
	}

	function attemptVertx() {
	  try {
	    var r = require;
	    var vertx = __webpack_require__(3);
	    vertxNext = vertx.runOnLoop || vertx.runOnContext;
	    return useVertxTimer();
	  } catch (e) {
	    return useSetTimeout();
	  }
	}

	var scheduleFlush = undefined;
	// Decide what async method to use to triggering processing of queued callbacks:
	if (isNode) {
	  scheduleFlush = useNextTick();
	} else if (BrowserMutationObserver) {
	  scheduleFlush = useMutationObserver();
	} else if (isWorker) {
	  scheduleFlush = useMessageChannel();
	} else if (browserWindow === undefined && "function" === 'function') {
	  scheduleFlush = attemptVertx();
	} else {
	  scheduleFlush = useSetTimeout();
	}

	function then(onFulfillment, onRejection) {
	  var _arguments = arguments;

	  var parent = this;

	  var child = new this.constructor(noop);

	  if (child[PROMISE_ID] === undefined) {
	    makePromise(child);
	  }

	  var _state = parent._state;

	  if (_state) {
	    (function () {
	      var callback = _arguments[_state - 1];
	      asap(function () {
	        return invokeCallback(_state, child, callback, parent._result);
	      });
	    })();
	  } else {
	    subscribe(parent, child, onFulfillment, onRejection);
	  }

	  return child;
	}

	/**
	  `Promise.resolve` returns a promise that will become resolved with the
	  passed `value`. It is shorthand for the following:

	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    resolve(1);
	  });

	  promise.then(function(value){
	    // value === 1
	  });
	  ```

	  Instead of writing the above, your code now simply becomes the following:

	  ```javascript
	  let promise = Promise.resolve(1);

	  promise.then(function(value){
	    // value === 1
	  });
	  ```

	  @method resolve
	  @static
	  @param {Any} value value that the returned promise will be resolved with
	  Useful for tooling.
	  @return {Promise} a promise that will become fulfilled with the given
	  `value`
	*/
	function resolve(object) {
	  /*jshint validthis:true */
	  var Constructor = this;

	  if (object && typeof object === 'object' && object.constructor === Constructor) {
	    return object;
	  }

	  var promise = new Constructor(noop);
	  _resolve(promise, object);
	  return promise;
	}

	var PROMISE_ID = Math.random().toString(36).substring(16);

	function noop() {}

	var PENDING = void 0;
	var FULFILLED = 1;
	var REJECTED = 2;

	var GET_THEN_ERROR = new ErrorObject();

	function selfFulfillment() {
	  return new TypeError("You cannot resolve a promise with itself");
	}

	function cannotReturnOwn() {
	  return new TypeError('A promises callback cannot return that same promise.');
	}

	function getThen(promise) {
	  try {
	    return promise.then;
	  } catch (error) {
	    GET_THEN_ERROR.error = error;
	    return GET_THEN_ERROR;
	  }
	}

	function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	  try {
	    then.call(value, fulfillmentHandler, rejectionHandler);
	  } catch (e) {
	    return e;
	  }
	}

	function handleForeignThenable(promise, thenable, then) {
	  asap(function (promise) {
	    var sealed = false;
	    var error = tryThen(then, thenable, function (value) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	      if (thenable !== value) {
	        _resolve(promise, value);
	      } else {
	        fulfill(promise, value);
	      }
	    }, function (reason) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;

	      _reject(promise, reason);
	    }, 'Settle: ' + (promise._label || ' unknown promise'));

	    if (!sealed && error) {
	      sealed = true;
	      _reject(promise, error);
	    }
	  }, promise);
	}

	function handleOwnThenable(promise, thenable) {
	  if (thenable._state === FULFILLED) {
	    fulfill(promise, thenable._result);
	  } else if (thenable._state === REJECTED) {
	    _reject(promise, thenable._result);
	  } else {
	    subscribe(thenable, undefined, function (value) {
	      return _resolve(promise, value);
	    }, function (reason) {
	      return _reject(promise, reason);
	    });
	  }
	}

	function handleMaybeThenable(promise, maybeThenable, then$$) {
	  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
	    handleOwnThenable(promise, maybeThenable);
	  } else {
	    if (then$$ === GET_THEN_ERROR) {
	      _reject(promise, GET_THEN_ERROR.error);
	    } else if (then$$ === undefined) {
	      fulfill(promise, maybeThenable);
	    } else if (isFunction(then$$)) {
	      handleForeignThenable(promise, maybeThenable, then$$);
	    } else {
	      fulfill(promise, maybeThenable);
	    }
	  }
	}

	function _resolve(promise, value) {
	  if (promise === value) {
	    _reject(promise, selfFulfillment());
	  } else if (objectOrFunction(value)) {
	    handleMaybeThenable(promise, value, getThen(value));
	  } else {
	    fulfill(promise, value);
	  }
	}

	function publishRejection(promise) {
	  if (promise._onerror) {
	    promise._onerror(promise._result);
	  }

	  publish(promise);
	}

	function fulfill(promise, value) {
	  if (promise._state !== PENDING) {
	    return;
	  }

	  promise._result = value;
	  promise._state = FULFILLED;

	  if (promise._subscribers.length !== 0) {
	    asap(publish, promise);
	  }
	}

	function _reject(promise, reason) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	  promise._state = REJECTED;
	  promise._result = reason;

	  asap(publishRejection, promise);
	}

	function subscribe(parent, child, onFulfillment, onRejection) {
	  var _subscribers = parent._subscribers;
	  var length = _subscribers.length;

	  parent._onerror = null;

	  _subscribers[length] = child;
	  _subscribers[length + FULFILLED] = onFulfillment;
	  _subscribers[length + REJECTED] = onRejection;

	  if (length === 0 && parent._state) {
	    asap(publish, parent);
	  }
	}

	function publish(promise) {
	  var subscribers = promise._subscribers;
	  var settled = promise._state;

	  if (subscribers.length === 0) {
	    return;
	  }

	  var child = undefined,
	      callback = undefined,
	      detail = promise._result;

	  for (var i = 0; i < subscribers.length; i += 3) {
	    child = subscribers[i];
	    callback = subscribers[i + settled];

	    if (child) {
	      invokeCallback(settled, child, callback, detail);
	    } else {
	      callback(detail);
	    }
	  }

	  promise._subscribers.length = 0;
	}

	function ErrorObject() {
	  this.error = null;
	}

	var TRY_CATCH_ERROR = new ErrorObject();

	function tryCatch(callback, detail) {
	  try {
	    return callback(detail);
	  } catch (e) {
	    TRY_CATCH_ERROR.error = e;
	    return TRY_CATCH_ERROR;
	  }
	}

	function invokeCallback(settled, promise, callback, detail) {
	  var hasCallback = isFunction(callback),
	      value = undefined,
	      error = undefined,
	      succeeded = undefined,
	      failed = undefined;

	  if (hasCallback) {
	    value = tryCatch(callback, detail);

	    if (value === TRY_CATCH_ERROR) {
	      failed = true;
	      error = value.error;
	      value = null;
	    } else {
	      succeeded = true;
	    }

	    if (promise === value) {
	      _reject(promise, cannotReturnOwn());
	      return;
	    }
	  } else {
	    value = detail;
	    succeeded = true;
	  }

	  if (promise._state !== PENDING) {
	    // noop
	  } else if (hasCallback && succeeded) {
	      _resolve(promise, value);
	    } else if (failed) {
	      _reject(promise, error);
	    } else if (settled === FULFILLED) {
	      fulfill(promise, value);
	    } else if (settled === REJECTED) {
	      _reject(promise, value);
	    }
	}

	function initializePromise(promise, resolver) {
	  try {
	    resolver(function resolvePromise(value) {
	      _resolve(promise, value);
	    }, function rejectPromise(reason) {
	      _reject(promise, reason);
	    });
	  } catch (e) {
	    _reject(promise, e);
	  }
	}

	var id = 0;
	function nextId() {
	  return id++;
	}

	function makePromise(promise) {
	  promise[PROMISE_ID] = id++;
	  promise._state = undefined;
	  promise._result = undefined;
	  promise._subscribers = [];
	}

	function Enumerator(Constructor, input) {
	  this._instanceConstructor = Constructor;
	  this.promise = new Constructor(noop);

	  if (!this.promise[PROMISE_ID]) {
	    makePromise(this.promise);
	  }

	  if (isArray(input)) {
	    this._input = input;
	    this.length = input.length;
	    this._remaining = input.length;

	    this._result = new Array(this.length);

	    if (this.length === 0) {
	      fulfill(this.promise, this._result);
	    } else {
	      this.length = this.length || 0;
	      this._enumerate();
	      if (this._remaining === 0) {
	        fulfill(this.promise, this._result);
	      }
	    }
	  } else {
	    _reject(this.promise, validationError());
	  }
	}

	function validationError() {
	  return new Error('Array Methods must be provided an Array');
	};

	Enumerator.prototype._enumerate = function () {
	  var length = this.length;
	  var _input = this._input;

	  for (var i = 0; this._state === PENDING && i < length; i++) {
	    this._eachEntry(_input[i], i);
	  }
	};

	Enumerator.prototype._eachEntry = function (entry, i) {
	  var c = this._instanceConstructor;
	  var resolve$$ = c.resolve;

	  if (resolve$$ === resolve) {
	    var _then = getThen(entry);

	    if (_then === then && entry._state !== PENDING) {
	      this._settledAt(entry._state, i, entry._result);
	    } else if (typeof _then !== 'function') {
	      this._remaining--;
	      this._result[i] = entry;
	    } else if (c === Promise) {
	      var promise = new c(noop);
	      handleMaybeThenable(promise, entry, _then);
	      this._willSettleAt(promise, i);
	    } else {
	      this._willSettleAt(new c(function (resolve$$) {
	        return resolve$$(entry);
	      }), i);
	    }
	  } else {
	    this._willSettleAt(resolve$$(entry), i);
	  }
	};

	Enumerator.prototype._settledAt = function (state, i, value) {
	  var promise = this.promise;

	  if (promise._state === PENDING) {
	    this._remaining--;

	    if (state === REJECTED) {
	      _reject(promise, value);
	    } else {
	      this._result[i] = value;
	    }
	  }

	  if (this._remaining === 0) {
	    fulfill(promise, this._result);
	  }
	};

	Enumerator.prototype._willSettleAt = function (promise, i) {
	  var enumerator = this;

	  subscribe(promise, undefined, function (value) {
	    return enumerator._settledAt(FULFILLED, i, value);
	  }, function (reason) {
	    return enumerator._settledAt(REJECTED, i, reason);
	  });
	};

	/**
	  `Promise.all` accepts an array of promises, and returns a new promise which
	  is fulfilled with an array of fulfillment values for the passed promises, or
	  rejected with the reason of the first passed promise to be rejected. It casts all
	  elements of the passed iterable to promises as it runs this algorithm.

	  Example:

	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = resolve(2);
	  let promise3 = resolve(3);
	  let promises = [ promise1, promise2, promise3 ];

	  Promise.all(promises).then(function(array){
	    // The array here would be [ 1, 2, 3 ];
	  });
	  ```

	  If any of the `promises` given to `all` are rejected, the first promise
	  that is rejected will be given as an argument to the returned promises's
	  rejection handler. For example:

	  Example:

	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = reject(new Error("2"));
	  let promise3 = reject(new Error("3"));
	  let promises = [ promise1, promise2, promise3 ];

	  Promise.all(promises).then(function(array){
	    // Code here never runs because there are rejected promises!
	  }, function(error) {
	    // error.message === "2"
	  });
	  ```

	  @method all
	  @static
	  @param {Array} entries array of promises
	  @param {String} label optional string for labeling the promise.
	  Useful for tooling.
	  @return {Promise} promise that is fulfilled when all `promises` have been
	  fulfilled, or rejected if any of them become rejected.
	  @static
	*/
	function all(entries) {
	  return new Enumerator(this, entries).promise;
	}

	/**
	  `Promise.race` returns a new promise which is settled in the same way as the
	  first passed promise to settle.

	  Example:

	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });

	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 2');
	    }, 100);
	  });

	  Promise.race([promise1, promise2]).then(function(result){
	    // result === 'promise 2' because it was resolved before promise1
	    // was resolved.
	  });
	  ```

	  `Promise.race` is deterministic in that only the state of the first
	  settled promise matters. For example, even if other promises given to the
	  `promises` array argument are resolved, but the first settled promise has
	  become rejected before the other promises became fulfilled, the returned
	  promise will become rejected:

	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });

	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      reject(new Error('promise 2'));
	    }, 100);
	  });

	  Promise.race([promise1, promise2]).then(function(result){
	    // Code here never runs
	  }, function(reason){
	    // reason.message === 'promise 2' because promise 2 became rejected before
	    // promise 1 became fulfilled
	  });
	  ```

	  An example real-world use case is implementing timeouts:

	  ```javascript
	  Promise.race([ajax('foo.json'), timeout(5000)])
	  ```

	  @method race
	  @static
	  @param {Array} promises array of promises to observe
	  Useful for tooling.
	  @return {Promise} a promise which settles in the same way as the first passed
	  promise to settle.
	*/
	function race(entries) {
	  /*jshint validthis:true */
	  var Constructor = this;

	  if (!isArray(entries)) {
	    return new Constructor(function (_, reject) {
	      return reject(new TypeError('You must pass an array to race.'));
	    });
	  } else {
	    return new Constructor(function (resolve, reject) {
	      var length = entries.length;
	      for (var i = 0; i < length; i++) {
	        Constructor.resolve(entries[i]).then(resolve, reject);
	      }
	    });
	  }
	}

	/**
	  `Promise.reject` returns a promise rejected with the passed `reason`.
	  It is shorthand for the following:

	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    reject(new Error('WHOOPS'));
	  });

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  Instead of writing the above, your code now simply becomes the following:

	  ```javascript
	  let promise = Promise.reject(new Error('WHOOPS'));

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  @method reject
	  @static
	  @param {Any} reason value that the returned promise will be rejected with.
	  Useful for tooling.
	  @return {Promise} a promise rejected with the given `reason`.
	*/
	function reject(reason) {
	  /*jshint validthis:true */
	  var Constructor = this;
	  var promise = new Constructor(noop);
	  _reject(promise, reason);
	  return promise;
	}

	function needsResolver() {
	  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	}

	function needsNew() {
	  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	}

	/**
	  Promise objects represent the eventual result of an asynchronous operation. The
	  primary way of interacting with a promise is through its `then` method, which
	  registers callbacks to receive either a promise's eventual value or the reason
	  why the promise cannot be fulfilled.

	  Terminology
	  -----------

	  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	  - `thenable` is an object or function that defines a `then` method.
	  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	  - `exception` is a value that is thrown using the throw statement.
	  - `reason` is a value that indicates why a promise was rejected.
	  - `settled` the final resting state of a promise, fulfilled or rejected.

	  A promise can be in one of three states: pending, fulfilled, or rejected.

	  Promises that are fulfilled have a fulfillment value and are in the fulfilled
	  state.  Promises that are rejected have a rejection reason and are in the
	  rejected state.  A fulfillment value is never a thenable.

	  Promises can also be said to *resolve* a value.  If this value is also a
	  promise, then the original promise's settled state will match the value's
	  settled state.  So a promise that *resolves* a promise that rejects will
	  itself reject, and a promise that *resolves* a promise that fulfills will
	  itself fulfill.


	  Basic Usage:
	  ------------

	  ```js
	  let promise = new Promise(function(resolve, reject) {
	    // on success
	    resolve(value);

	    // on failure
	    reject(reason);
	  });

	  promise.then(function(value) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```

	  Advanced Usage:
	  ---------------

	  Promises shine when abstracting away asynchronous interactions such as
	  `XMLHttpRequest`s.

	  ```js
	  function getJSON(url) {
	    return new Promise(function(resolve, reject){
	      let xhr = new XMLHttpRequest();

	      xhr.open('GET', url);
	      xhr.onreadystatechange = handler;
	      xhr.responseType = 'json';
	      xhr.setRequestHeader('Accept', 'application/json');
	      xhr.send();

	      function handler() {
	        if (this.readyState === this.DONE) {
	          if (this.status === 200) {
	            resolve(this.response);
	          } else {
	            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	          }
	        }
	      };
	    });
	  }

	  getJSON('/posts.json').then(function(json) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```

	  Unlike callbacks, promises are great composable primitives.

	  ```js
	  Promise.all([
	    getJSON('/posts'),
	    getJSON('/comments')
	  ]).then(function(values){
	    values[0] // => postsJSON
	    values[1] // => commentsJSON

	    return values;
	  });
	  ```

	  @class Promise
	  @param {function} resolver
	  Useful for tooling.
	  @constructor
	*/
	function Promise(resolver) {
	  this[PROMISE_ID] = nextId();
	  this._result = this._state = undefined;
	  this._subscribers = [];

	  if (noop !== resolver) {
	    typeof resolver !== 'function' && needsResolver();
	    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
	  }
	}

	Promise.all = all;
	Promise.race = race;
	Promise.resolve = resolve;
	Promise.reject = reject;
	Promise._setScheduler = setScheduler;
	Promise._setAsap = setAsap;
	Promise._asap = asap;

	Promise.prototype = {
	  constructor: Promise,

	  /**
	    The primary way of interacting with a promise is through its `then` method,
	    which registers callbacks to receive either a promise's eventual value or the
	    reason why the promise cannot be fulfilled.
	  
	    ```js
	    findUser().then(function(user){
	      // user is available
	    }, function(reason){
	      // user is unavailable, and you are given the reason why
	    });
	    ```
	  
	    Chaining
	    --------
	  
	    The return value of `then` is itself a promise.  This second, 'downstream'
	    promise is resolved with the return value of the first promise's fulfillment
	    or rejection handler, or rejected if the handler throws an exception.
	  
	    ```js
	    findUser().then(function (user) {
	      return user.name;
	    }, function (reason) {
	      return 'default name';
	    }).then(function (userName) {
	      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	      // will be `'default name'`
	    });
	  
	    findUser().then(function (user) {
	      throw new Error('Found user, but still unhappy');
	    }, function (reason) {
	      throw new Error('`findUser` rejected and we're unhappy');
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	    });
	    ```
	    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	  
	    ```js
	    findUser().then(function (user) {
	      throw new PedagogicalException('Upstream error');
	    }).then(function (value) {
	      // never reached
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // The `PedgagocialException` is propagated all the way down to here
	    });
	    ```
	  
	    Assimilation
	    ------------
	  
	    Sometimes the value you want to propagate to a downstream promise can only be
	    retrieved asynchronously. This can be achieved by returning a promise in the
	    fulfillment or rejection handler. The downstream promise will then be pending
	    until the returned promise is settled. This is called *assimilation*.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // The user's comments are now available
	    });
	    ```
	  
	    If the assimliated promise rejects, then the downstream promise will also reject.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // If `findCommentsByAuthor` fulfills, we'll have the value here
	    }, function (reason) {
	      // If `findCommentsByAuthor` rejects, we'll have the reason here
	    });
	    ```
	  
	    Simple Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let result;
	  
	    try {
	      result = findResult();
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	    findResult(function(result, err){
	      if (err) {
	        // failure
	      } else {
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findResult().then(function(result){
	      // success
	    }, function(reason){
	      // failure
	    });
	    ```
	  
	    Advanced Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let author, books;
	  
	    try {
	      author = findAuthor();
	      books  = findBooksByAuthor(author);
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	  
	    function foundBooks(books) {
	  
	    }
	  
	    function failure(reason) {
	  
	    }
	  
	    findAuthor(function(author, err){
	      if (err) {
	        failure(err);
	        // failure
	      } else {
	        try {
	          findBoooksByAuthor(author, function(books, err) {
	            if (err) {
	              failure(err);
	            } else {
	              try {
	                foundBooks(books);
	              } catch(reason) {
	                failure(reason);
	              }
	            }
	          });
	        } catch(error) {
	          failure(err);
	        }
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findAuthor().
	      then(findBooksByAuthor).
	      then(function(books){
	        // found books
	    }).catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method then
	    @param {Function} onFulfilled
	    @param {Function} onRejected
	    Useful for tooling.
	    @return {Promise}
	  */
	  then: then,

	  /**
	    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	    as the catch block of a try/catch statement.
	  
	    ```js
	    function findAuthor(){
	      throw new Error('couldn't find that author');
	    }
	  
	    // synchronous
	    try {
	      findAuthor();
	    } catch(reason) {
	      // something went wrong
	    }
	  
	    // async with promises
	    findAuthor().catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method catch
	    @param {Function} onRejection
	    Useful for tooling.
	    @return {Promise}
	  */
	  'catch': function _catch(onRejection) {
	    return this.then(null, onRejection);
	  }
	};

	function polyfill() {
	    var local = undefined;

	    if (typeof global !== 'undefined') {
	        local = global;
	    } else if (typeof self !== 'undefined') {
	        local = self;
	    } else {
	        try {
	            local = Function('return this')();
	        } catch (e) {
	            throw new Error('polyfill failed because global object is unavailable in this environment');
	        }
	    }

	    var P = local.Promise;

	    if (P) {
	        var promiseToString = null;
	        try {
	            promiseToString = Object.prototype.toString.call(P.resolve());
	        } catch (e) {
	            // silently ignored
	        }

	        if (promiseToString === '[object Promise]' && !P.cast) {
	            return;
	        }
	    }

	    local.Promise = Promise;
	}

	polyfill();
	// Strange compat..
	Promise.polyfill = polyfill;
	Promise.Promise = Promise;

	return Promise;

	})));
	//# sourceMappingURL=es6-promise.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 3 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(5));
	__export(__webpack_require__(16));
	__export(__webpack_require__(25));
	__export(__webpack_require__(40));
	__export(__webpack_require__(50));
	__export(__webpack_require__(41));
	__export(__webpack_require__(46));
	var utils = __webpack_require__(6);
	exports.utils = utils;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var utils = __webpack_require__(6);
	/**
	 * The url for the config service.
	 */
	var SERVICE_CONFIG_URL = 'api/config';
	/**
	 * The namespace for ConfigSection statics.
	 */
	var ConfigSection;
	(function (ConfigSection) {
	    /**
	     * Create a config section.
	     *
	     * @returns A Promise that is fulfilled with the config section is loaded.
	     */
	    function create(options) {
	        var section = new DefaultConfigSection(options);
	        return section.load().then(function () {
	            return section;
	        });
	    }
	    ConfigSection.create = create;
	})(ConfigSection = exports.ConfigSection || (exports.ConfigSection = {}));
	/**
	 * Implementation of the Configurable data section.
	 */
	var DefaultConfigSection = (function () {
	    /**
	     * Construct a new config section.
	     */
	    function DefaultConfigSection(options) {
	        this._url = 'unknown';
	        this._data = null;
	        this._ajaxSettings = null;
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        this.ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        this._url = utils.urlPathJoin(baseUrl, SERVICE_CONFIG_URL, encodeURIComponent(options.name));
	    }
	    Object.defineProperty(DefaultConfigSection.prototype, "ajaxSettings", {
	        /**
	         * Get a copy of the default ajax settings for the section.
	         */
	        get: function () {
	            return utils.copy(this._ajaxSettings);
	        },
	        /**
	         * Set the default ajax settings for the section.
	         */
	        set: function (value) {
	            this._ajaxSettings = utils.copy(value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultConfigSection.prototype, "data", {
	        /**
	         * Get the data for this section.
	         */
	        get: function () {
	            return this._data;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Load the initial data for this section.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/config).
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     */
	    DefaultConfigSection.prototype.load = function () {
	        var _this = this;
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'GET';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(this._url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            _this._data = success.data;
	        });
	    };
	    /**
	     * Modify the stored config values.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/config).
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     *
	     * Updates the local data immediately, sends the change to the server,
	     * and updates the local data with the response, and fulfils the promise
	     * with that data.
	     */
	    DefaultConfigSection.prototype.update = function (newdata) {
	        var _this = this;
	        this._data = utils.extend(this._data, newdata);
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'PATCH';
	        ajaxSettings.data = JSON.stringify(newdata);
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.contentType = 'application/json';
	        return utils.ajaxRequest(this._url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            _this._data = success.data;
	            return _this._data;
	        });
	    };
	    return DefaultConfigSection;
	}());
	/**
	 * Configurable object with defaults.
	 */
	var ConfigWithDefaults = (function () {
	    /**
	     * Create a new config with defaults.
	     */
	    function ConfigWithDefaults(options) {
	        this._section = null;
	        this._defaults = null;
	        this._className = '';
	        this._section = options.section;
	        this._defaults = options.defaults || {};
	        this._className = options.className || '';
	    }
	    /**
	     * Get data from the config section or fall back to defaults.
	     */
	    ConfigWithDefaults.prototype.get = function (key) {
	        var data = this._classData();
	        return key in data ? data[key] : this._defaults[key];
	    };
	    /**
	     * Set a config value.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/config).
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     *
	     * Sends the update to the server, and changes our local copy of the data
	     * immediately.
	     */
	    ConfigWithDefaults.prototype.set = function (key, value) {
	        var d = {};
	        d[key] = value;
	        if (this._className) {
	            var d2 = {};
	            d2[this._className] = d;
	            return this._section.update(d2);
	        }
	        else {
	            return this._section.update(d);
	        }
	    };
	    /**
	     * Get data from the Section with our classname, if available.
	     *
	     * #### Notes
	     * If we have no classname, get all of the data in the Section
	     */
	    ConfigWithDefaults.prototype._classData = function () {
	        var data = this._section.data;
	        if (this._className && this._className in data) {
	            return data[this._className];
	        }
	        return data;
	    };
	    return ConfigWithDefaults;
	}());
	exports.ConfigWithDefaults = ConfigWithDefaults;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	'use strict';
	var minimist = __webpack_require__(7);
	var url = __webpack_require__(8);
	var urljoin = __webpack_require__(15);
	/**
	 * Copy the contents of one object to another, recursively.
	 *
	 * From [stackoverflow](http://stackoverflow.com/a/12317051).
	 */
	function extend(target, source) {
	    target = target || {};
	    for (var prop in source) {
	        if (typeof source[prop] === 'object') {
	            target[prop] = extend(target[prop], source[prop]);
	        }
	        else {
	            target[prop] = source[prop];
	        }
	    }
	    return target;
	}
	exports.extend = extend;
	/**
	 * Get a deep copy of a JSON object.
	 */
	function copy(object) {
	    return JSON.parse(JSON.stringify(object));
	}
	exports.copy = copy;
	/**
	 * Get a random 32 character hex string (not a formal UUID)
	 */
	function uuid() {
	    var s = [];
	    var hexDigits = '0123456789abcdef';
	    var nChars = hexDigits.length;
	    for (var i = 0; i < 32; i++) {
	        s[i] = hexDigits.charAt(Math.floor(Math.random() * nChars));
	    }
	    return s.join('');
	}
	exports.uuid = uuid;
	/**
	 * Parse a url into a URL object.
	 *
	 * @param urlString - The URL string to parse.
	 *
	 * @param parseQueryString - If `true`, the query property will always be set
	 *   to an object returned by the `querystring` module's `parse()` method.
	 *   If `false`, the `query` property on the returned URL object will be an
	 *   unparsed, undecoded string. Defaults to `false`.
	 *
	 * @param slashedDenoteHost - If `true`, the first token after the literal
	 *   string `//` and preceeding the next `/` will be interpreted as the `host`.
	 *   For instance, given `//foo/bar`, the result would be
	 *   `{host: 'foo', pathname: '/bar'}` rather than `{pathname: '//foo/bar'}`.
	 *   Defaults to `false`.
	 *
	 * @returns A URL object.
	 */
	function urlParse(urlStr, parseQueryString, slashesDenoteHost) {
	    return url.parse(urlStr, parseQueryString, slashesDenoteHost);
	}
	exports.urlParse = urlParse;
	/**
	 * Resolve a url.
	 *
	 * Take a base URL, and a href URL, and resolve them as a browser would for
	 * an anchor tag.
	 */
	function urlResolve(from, to) {
	    return url.resolve(from, to);
	}
	exports.urlResolve = urlResolve;
	/**
	 * Join a sequence of url components and normalizes as in node `path.join`.
	 */
	function urlPathJoin() {
	    var parts = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        parts[_i - 0] = arguments[_i];
	    }
	    return urljoin.apply(void 0, parts);
	}
	exports.urlPathJoin = urlPathJoin;
	/**
	 * Encode the components of a multi-segment url.
	 *
	 * #### Notes
	 * Preserves the `'/'` separators.
	 * Should not include the base url, since all parts are escaped.
	 */
	function urlEncodeParts(uri) {
	    // Normalize and join, split, encode, then join.
	    uri = urljoin(uri);
	    var parts = uri.split('/').map(encodeURIComponent);
	    return urljoin.apply(void 0, parts);
	}
	exports.urlEncodeParts = urlEncodeParts;
	/**
	 * Return a serialized object string suitable for a query.
	 *
	 * From [stackoverflow](http://stackoverflow.com/a/30707423).
	 */
	function jsonToQueryString(json) {
	    return '?' + Object.keys(json).map(function (key) {
	        return encodeURIComponent(key) + '=' + encodeURIComponent(String(json[key]));
	    }).join('&');
	}
	exports.jsonToQueryString = jsonToQueryString;
	/**
	 * Asynchronous XMLHTTPRequest handler.
	 *
	 * @param url - The url to request.
	 *
	 * @param settings - The settings to apply to the request and response.
	 *
	 * #### Notes
	 * Based on this [example](http://www.html5rocks.com/en/tutorials/es6/promises/#toc-promisifying-xmlhttprequest).
	 */
	function ajaxRequest(url, ajaxSettings) {
	    var method = ajaxSettings.method || 'GET';
	    var user = ajaxSettings.user || '';
	    var password = ajaxSettings.password || '';
	    if (!ajaxSettings.cache) {
	        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache.
	        url += ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();
	    }
	    return new Promise(function (resolve, reject) {
	        var xhr = new XMLHttpRequest();
	        xhr.open(method, url, true, user, password);
	        if (ajaxSettings.contentType !== void 0) {
	            xhr.setRequestHeader('Content-Type', ajaxSettings.contentType);
	        }
	        if (ajaxSettings.timeout !== void 0) {
	            xhr.timeout = ajaxSettings.timeout;
	        }
	        if (!!ajaxSettings.withCredentials) {
	            xhr.withCredentials = true;
	        }
	        if (ajaxSettings.requestHeaders !== void 0) {
	            for (var prop in ajaxSettings.requestHeaders) {
	                xhr.setRequestHeader(prop, ajaxSettings.requestHeaders[prop]);
	            }
	        }
	        xhr.onload = function (event) {
	            if (xhr.status >= 300) {
	                reject({ event: event, xhr: xhr, ajaxSettings: ajaxSettings, throwError: xhr.statusText });
	            }
	            var data = xhr.responseText;
	            try {
	                data = JSON.parse(data);
	            }
	            catch (err) {
	            }
	            resolve({ xhr: xhr, ajaxSettings: ajaxSettings, data: data, event: event });
	        };
	        xhr.onabort = function (event) {
	            reject({ xhr: xhr, event: event, ajaxSettings: ajaxSettings });
	        };
	        xhr.onerror = function (event) {
	            reject({ xhr: xhr, event: event, ajaxSettings: ajaxSettings });
	        };
	        xhr.ontimeout = function (ev) {
	            reject({ xhr: xhr, event: event, ajaxSettings: ajaxSettings });
	        };
	        if (ajaxSettings.data) {
	            xhr.send(ajaxSettings.data);
	        }
	        else {
	            xhr.send();
	        }
	    });
	}
	exports.ajaxRequest = ajaxRequest;
	/**
	 * Create an ajax error from an ajax success.
	 *
	 * @param success - The original success object.
	 *
	 * @param throwError - The optional new error name.  If not given
	 *  we use "Invalid Status: <xhr.status>"
	 */
	function makeAjaxError(success, throwError) {
	    var xhr = success.xhr;
	    var ajaxSettings = success.ajaxSettings;
	    var event = success.event;
	    throwError = throwError || "Invalid Status: " + xhr.status;
	    return Promise.reject({ xhr: xhr, ajaxSettings: ajaxSettings, event: event, throwError: throwError });
	}
	exports.makeAjaxError = makeAjaxError;
	/**
	 * Try to load an object from a module or a registry.
	 *
	 * Try to load an object from a module asynchronously if a module
	 * is specified, otherwise tries to load an object from the global
	 * registry, if the global registry is provided.
	 */
	function loadObject(name, moduleName, registry) {
	    return new Promise(function (resolve, reject) {
	        // Try loading the view module using require.js
	        if (moduleName) {
	            if (typeof requirejs === 'undefined') {
	                throw new Error('requirejs not found');
	            }
	            requirejs([moduleName], function (mod) {
	                if (mod[name] === void 0) {
	                    var msg = "Object '" + name + "' not found in module '" + moduleName + "'";
	                    reject(new Error(msg));
	                }
	                else {
	                    resolve(mod[name]);
	                }
	            }, reject);
	        }
	        else {
	            if (registry && registry[name]) {
	                resolve(registry[name]);
	            }
	            else {
	                reject(new Error("Object '" + name + "' not found in registry"));
	            }
	        }
	    });
	}
	exports.loadObject = loadObject;
	;
	/**
	 * A Promise that can be resolved or rejected by another object.
	 */
	var PromiseDelegate = (function () {
	    /**
	     * Construct a new Promise delegate.
	     */
	    function PromiseDelegate() {
	        var _this = this;
	        this._promise = new Promise(function (resolve, reject) {
	            _this._resolve = resolve;
	            _this._reject = reject;
	        });
	    }
	    Object.defineProperty(PromiseDelegate.prototype, "promise", {
	        /**
	         * Get the underlying Promise.
	         */
	        get: function () {
	            return this._promise;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Resolve the underlying Promise with an optional value or another Promise.
	     */
	    PromiseDelegate.prototype.resolve = function (value) {
	        // Note: according to the Promise spec, and the `this` context for resolve
	        // and reject are ignored
	        this._resolve(value);
	    };
	    /**
	     * Reject the underlying Promise with an optional reason.
	     */
	    PromiseDelegate.prototype.reject = function (reason) {
	        // Note: according to the Promise spec, the `this` context for resolve
	        // and reject are ignored
	        this._reject(reason);
	    };
	    return PromiseDelegate;
	}());
	exports.PromiseDelegate = PromiseDelegate;
	/**
	 * Global config data for the Jupyter application.
	 */
	var configData = null;
	/**
	 *  Make an object fully immutable by freezing each object in it.
	 */
	function deepFreeze(obj) {
	    // Freeze properties before freezing self
	    Object.getOwnPropertyNames(obj).forEach(function (name) {
	        var prop = obj[name];
	        // Freeze prop if it is an object
	        if (typeof prop === 'object' && prop !== null && !Object.isFrozen(prop)) {
	            deepFreeze(prop);
	        }
	    });
	    // Freeze self
	    return Object.freeze(obj);
	}
	/**
	 * Get global configuration data for the Jupyter application.
	 *
	 * @param name - The name of the configuration option.
	 *
	 * @returns The config value or `undefined` if not found.
	 *
	 * #### Notes
	 * For browser based applications, it is assumed that the page HTML
	 * includes a script tag with the id `jupyter-config-data` containing the
	 * configuration as valid JSON.
	 */
	function getConfigOption(name) {
	    if (configData) {
	        return configData[name];
	    }
	    if (typeof document === 'undefined') {
	        configData = minimist(process.argv.slice(2));
	    }
	    else {
	        var el = document.getElementById('jupyter-config-data');
	        if (el) {
	            configData = JSON.parse(el.textContent);
	        }
	        else {
	            configData = {};
	        }
	    }
	    configData = deepFreeze(configData);
	    return configData[name];
	}
	exports.getConfigOption = getConfigOption;
	/**
	 * Get the base URL for a Jupyter application.
	 */
	function getBaseUrl() {
	    var baseUrl = getConfigOption('baseUrl');
	    if (!baseUrl || baseUrl === '/') {
	        baseUrl = (typeof location === 'undefined' ?
	            'http://localhost:8888/' : location.origin + '/');
	    }
	    return baseUrl;
	}
	exports.getBaseUrl = getBaseUrl;
	/**
	 * Get the base websocket URL for a Jupyter application.
	 */
	function getWsUrl(baseUrl) {
	    var wsUrl = getConfigOption('wsUrl');
	    if (!wsUrl) {
	        baseUrl = baseUrl || getBaseUrl();
	        if (baseUrl.indexOf('http') !== 0) {
	            if (typeof location !== 'undefined') {
	                baseUrl = urlPathJoin(location.origin, baseUrl);
	            }
	            else {
	                baseUrl = urlPathJoin('http://localhost:8888/', baseUrl);
	            }
	        }
	        wsUrl = 'ws' + baseUrl.slice(4);
	    }
	    return wsUrl;
	}
	exports.getWsUrl = getWsUrl;
	/**
	 * Add token to ajaxSettings.requestHeaders if defined.
	 * Always returns a copy of ajaxSettings, and a dict.
	 */
	function ajaxSettingsWithToken(ajaxSettings, token) {
	    if (!ajaxSettings) {
	        ajaxSettings = {};
	    }
	    else {
	        ajaxSettings = copy(ajaxSettings);
	    }
	    if (!token) {
	        token = getConfigOption('token');
	    }
	    if (!token || token == '') {
	        return ajaxSettings;
	    }
	    if (!ajaxSettings.requestHeaders) {
	        ajaxSettings.requestHeaders = {};
	    }
	    ajaxSettings.requestHeaders['Authorization'] = "token " + token;
	    return ajaxSettings;
	}
	exports.ajaxSettingsWithToken = ajaxSettingsWithToken;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function (args, opts) {
	    if (!opts) opts = {};
	    
	    var flags = { bools : {}, strings : {}, unknownFn: null };

	    if (typeof opts['unknown'] === 'function') {
	        flags.unknownFn = opts['unknown'];
	    }

	    if (typeof opts['boolean'] === 'boolean' && opts['boolean']) {
	      flags.allBools = true;
	    } else {
	      [].concat(opts['boolean']).filter(Boolean).forEach(function (key) {
	          flags.bools[key] = true;
	      });
	    }
	    
	    var aliases = {};
	    Object.keys(opts.alias || {}).forEach(function (key) {
	        aliases[key] = [].concat(opts.alias[key]);
	        aliases[key].forEach(function (x) {
	            aliases[x] = [key].concat(aliases[key].filter(function (y) {
	                return x !== y;
	            }));
	        });
	    });

	    [].concat(opts.string).filter(Boolean).forEach(function (key) {
	        flags.strings[key] = true;
	        if (aliases[key]) {
	            flags.strings[aliases[key]] = true;
	        }
	     });

	    var defaults = opts['default'] || {};
	    
	    var argv = { _ : [] };
	    Object.keys(flags.bools).forEach(function (key) {
	        setArg(key, defaults[key] === undefined ? false : defaults[key]);
	    });
	    
	    var notFlags = [];

	    if (args.indexOf('--') !== -1) {
	        notFlags = args.slice(args.indexOf('--')+1);
	        args = args.slice(0, args.indexOf('--'));
	    }

	    function argDefined(key, arg) {
	        return (flags.allBools && /^--[^=]+$/.test(arg)) ||
	            flags.strings[key] || flags.bools[key] || aliases[key];
	    }

	    function setArg (key, val, arg) {
	        if (arg && flags.unknownFn && !argDefined(key, arg)) {
	            if (flags.unknownFn(arg) === false) return;
	        }

	        var value = !flags.strings[key] && isNumber(val)
	            ? Number(val) : val
	        ;
	        setKey(argv, key.split('.'), value);
	        
	        (aliases[key] || []).forEach(function (x) {
	            setKey(argv, x.split('.'), value);
	        });
	    }

	    function setKey (obj, keys, value) {
	        var o = obj;
	        keys.slice(0,-1).forEach(function (key) {
	            if (o[key] === undefined) o[key] = {};
	            o = o[key];
	        });

	        var key = keys[keys.length - 1];
	        if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean') {
	            o[key] = value;
	        }
	        else if (Array.isArray(o[key])) {
	            o[key].push(value);
	        }
	        else {
	            o[key] = [ o[key], value ];
	        }
	    }
	    
	    function aliasIsBoolean(key) {
	      return aliases[key].some(function (x) {
	          return flags.bools[x];
	      });
	    }

	    for (var i = 0; i < args.length; i++) {
	        var arg = args[i];
	        
	        if (/^--.+=/.test(arg)) {
	            // Using [\s\S] instead of . because js doesn't support the
	            // 'dotall' regex modifier. See:
	            // http://stackoverflow.com/a/1068308/13216
	            var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
	            var key = m[1];
	            var value = m[2];
	            if (flags.bools[key]) {
	                value = value !== 'false';
	            }
	            setArg(key, value, arg);
	        }
	        else if (/^--no-.+/.test(arg)) {
	            var key = arg.match(/^--no-(.+)/)[1];
	            setArg(key, false, arg);
	        }
	        else if (/^--.+/.test(arg)) {
	            var key = arg.match(/^--(.+)/)[1];
	            var next = args[i + 1];
	            if (next !== undefined && !/^-/.test(next)
	            && !flags.bools[key]
	            && !flags.allBools
	            && (aliases[key] ? !aliasIsBoolean(key) : true)) {
	                setArg(key, next, arg);
	                i++;
	            }
	            else if (/^(true|false)$/.test(next)) {
	                setArg(key, next === 'true', arg);
	                i++;
	            }
	            else {
	                setArg(key, flags.strings[key] ? '' : true, arg);
	            }
	        }
	        else if (/^-[^-]+/.test(arg)) {
	            var letters = arg.slice(1,-1).split('');
	            
	            var broken = false;
	            for (var j = 0; j < letters.length; j++) {
	                var next = arg.slice(j+2);
	                
	                if (next === '-') {
	                    setArg(letters[j], next, arg)
	                    continue;
	                }
	                
	                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
	                    setArg(letters[j], next.split('=')[1], arg);
	                    broken = true;
	                    break;
	                }
	                
	                if (/[A-Za-z]/.test(letters[j])
	                && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
	                    setArg(letters[j], next, arg);
	                    broken = true;
	                    break;
	                }
	                
	                if (letters[j+1] && letters[j+1].match(/\W/)) {
	                    setArg(letters[j], arg.slice(j+2), arg);
	                    broken = true;
	                    break;
	                }
	                else {
	                    setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
	                }
	            }
	            
	            var key = arg.slice(-1)[0];
	            if (!broken && key !== '-') {
	                if (args[i+1] && !/^(-|--)[^-]/.test(args[i+1])
	                && !flags.bools[key]
	                && (aliases[key] ? !aliasIsBoolean(key) : true)) {
	                    setArg(key, args[i+1], arg);
	                    i++;
	                }
	                else if (args[i+1] && /true|false/.test(args[i+1])) {
	                    setArg(key, args[i+1] === 'true', arg);
	                    i++;
	                }
	                else {
	                    setArg(key, flags.strings[key] ? '' : true, arg);
	                }
	            }
	        }
	        else {
	            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
	                argv._.push(
	                    flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
	                );
	            }
	            if (opts.stopEarly) {
	                argv._.push.apply(argv._, args.slice(i + 1));
	                break;
	            }
	        }
	    }
	    
	    Object.keys(defaults).forEach(function (key) {
	        if (!hasKey(argv, key.split('.'))) {
	            setKey(argv, key.split('.'), defaults[key]);
	            
	            (aliases[key] || []).forEach(function (x) {
	                setKey(argv, x.split('.'), defaults[key]);
	            });
	        }
	    });
	    
	    if (opts['--']) {
	        argv['--'] = new Array();
	        notFlags.forEach(function(key) {
	            argv['--'].push(key);
	        });
	    }
	    else {
	        notFlags.forEach(function(key) {
	            argv._.push(key);
	        });
	    }

	    return argv;
	};

	function hasKey (obj, keys) {
	    var o = obj;
	    keys.slice(0,-1).forEach(function (key) {
	        o = (o[key] || {});
	    });

	    var key = keys[keys.length - 1];
	    return key in o;
	}

	function isNumber (x) {
	    if (typeof x === 'number') return true;
	    if (/^0x[0-9a-f]+$/i.test(x)) return true;
	    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
	}



/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	var punycode = __webpack_require__(9);
	var util = __webpack_require__(11);

	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;

	exports.Url = Url;

	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,

	    // Special case for a simple path URL
	    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

	    // RFC 2396: characters not allowed for various reasons.
	    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = ['\''].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    unsafeProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    },
	    querystring = __webpack_require__(12);

	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && util.isObject(url) && url instanceof Url) return url;

	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}

	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!util.isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }

	  // Copy chrome, IE, opera backslash-handling behavior.
	  // Back slashes before the query string get converted to forward slashes
	  // See: https://code.google.com/p/chromium/issues/detail?id=25916
	  var queryIndex = url.indexOf('?'),
	      splitter =
	          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
	      uSplit = url.split(splitter),
	      slashRegex = /\\/g;
	  uSplit[0] = uSplit[0].replace(slashRegex, '/');
	  url = uSplit.join(splitter);

	  var rest = url;

	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();

	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      this.path = rest;
	      this.href = rest;
	      this.pathname = simplePath[1];
	      if (simplePath[2]) {
	        this.search = simplePath[2];
	        if (parseQueryString) {
	          this.query = querystring.parse(this.search.substr(1));
	        } else {
	          this.query = this.search.substr(1);
	        }
	      } else if (parseQueryString) {
	        this.search = '';
	        this.query = {};
	      }
	      return this;
	    }
	  }

	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    this.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }

	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }

	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {

	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c

	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.

	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (var i = 0; i < hostEndingChars.length; i++) {
	      var hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }

	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }

	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = decodeURIComponent(auth);
	    }

	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (var i = 0; i < nonHostChars.length; i++) {
	      var hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;

	    this.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);

	    // pull out port.
	    this.parseHost();

	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';

	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';

	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (var i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }

	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      this.hostname = this.hostname.toLowerCase();
	    }

	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a punycoded representation of "domain".
	      // It only converts parts of the domain name that
	      // have non-ASCII characters, i.e. it doesn't matter if
	      // you call it with a domain that already is ASCII-only.
	      this.hostname = punycode.toASCII(this.hostname);
	    }

	    var p = this.port ? ':' + this.port : '';
	    var h = this.hostname || '';
	    this.host = h + p;
	    this.href += this.host;

	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }

	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {

	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (var i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      if (rest.indexOf(ae) === -1)
	        continue;
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }


	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    this.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      this.query = querystring.parse(this.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    this.search = '';
	    this.query = {};
	  }
	  if (rest) this.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '/';
	  }

	  //to support http.request
	  if (this.pathname || this.search) {
	    var p = this.pathname || '';
	    var s = this.search || '';
	    this.path = p + s;
	  }

	  // finally, reconstruct the href based on what has been validated.
	  this.href = this.format();
	  return this;
	};

	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (util.isString(obj)) obj = urlParse(obj);
	  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
	  return obj.format();
	}

	Url.prototype.format = function() {
	  var auth = this.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }

	  var protocol = this.protocol || '',
	      pathname = this.pathname || '',
	      hash = this.hash || '',
	      host = false,
	      query = '';

	  if (this.host) {
	    host = auth + this.host;
	  } else if (this.hostname) {
	    host = auth + (this.hostname.indexOf(':') === -1 ?
	        this.hostname :
	        '[' + this.hostname + ']');
	    if (this.port) {
	      host += ':' + this.port;
	    }
	  }

	  if (this.query &&
	      util.isObject(this.query) &&
	      Object.keys(this.query).length) {
	    query = querystring.stringify(this.query);
	  }

	  var search = this.search || (query && ('?' + query)) || '';

	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (this.slashes ||
	      (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }

	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;

	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');

	  return protocol + host + pathname + search + hash;
	};

	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}

	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};

	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}

	Url.prototype.resolveObject = function(relative) {
	  if (util.isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }

	  var result = new Url();
	  var tkeys = Object.keys(this);
	  for (var tk = 0; tk < tkeys.length; tk++) {
	    var tkey = tkeys[tk];
	    result[tkey] = this[tkey];
	  }

	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;

	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }

	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    var rkeys = Object.keys(relative);
	    for (var rk = 0; rk < rkeys.length; rk++) {
	      var rkey = rkeys[rk];
	      if (rkey !== 'protocol')
	        result[rkey] = relative[rkey];
	    }

	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	        result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }

	    result.href = result.format();
	    return result;
	  }

	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      var keys = Object.keys(relative);
	      for (var v = 0; v < keys.length; v++) {
	        var k = keys[v];
	        result[k] = relative[k];
	      }
	      result.href = result.format();
	      return result;
	    }

	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      var relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }

	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	      isRelAbs = (
	          relative.host ||
	          relative.pathname && relative.pathname.charAt(0) === '/'
	      ),
	      mustEndAbs = (isRelAbs || isSourceAbs ||
	                    (result.host && relative.pathname)),
	      removeAllDots = mustEndAbs,
	      srcPath = result.pathname && result.pathname.split('/') || [],
	      relPath = relative.pathname && relative.pathname.split('/') || [],
	      psychotic = result.protocol && !slashedProtocol[result.protocol];

	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }

	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	                  relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	                      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!util.isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especially happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                       result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	                    (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }

	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }

	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	      (result.host || relative.host || srcPath.length > 1) &&
	      (last === '.' || last === '..') || last === '');

	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last === '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }

	  if (mustEndAbs && srcPath[0] !== '' &&
	      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }

	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }

	  var isAbsolute = srcPath[0] === '' ||
	      (srcPath[0] && srcPath[0].charAt(0) === '/');

	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	                                    srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especially happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                     result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }

	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }

	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }

	  //to support request.http
	  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	                  (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};

	Url.prototype.parseHost = function() {
	  var host = this.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) this.hostname = host;
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.3.2 by @mathias */
	;(function(root) {

		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}

		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,

		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'

		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},

		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,

		/** Temporary variable */
		key;

		/*--------------------------------------------------------------------------*/

		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}

		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}

		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}

		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}

		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}

		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}

		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}

		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}

		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;

			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.

			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}

			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}

			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.

			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

					if (index >= inputLength) {
						error('invalid-input');
					}

					digit = basicToDigit(input.charCodeAt(index++));

					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}

					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

					if (digit < t) {
						break;
					}

					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}

					w *= baseMinusT;

				}

				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);

				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}

				n += floor(i / out);
				i %= out;

				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);

			}

			return ucs2encode(output);
		}

		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;

			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);

			// Cache the length
			inputLength = input.length;

			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;

			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}

			handledCPCount = basicLength = output.length;

			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.

			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}

			// Main encoding loop:
			while (handledCPCount < inputLength) {

				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}

				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}

				delta += (m - n) * handledCPCountPlusOne;
				n = m;

				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];

					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}

					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}

						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}

				++delta;
				++n;

			}
			return output.join('');
		}

		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}

		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}

		/*--------------------------------------------------------------------------*/

		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.3.2',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};

		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}

	}(this));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)(module), (function() { return this; }())))

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  isString: function(arg) {
	    return typeof(arg) === 'string';
	  },
	  isObject: function(arg) {
	    return typeof(arg) === 'object' && arg !== null;
	  },
	  isNull: function(arg) {
	    return arg === null;
	  },
	  isNullOrUndefined: function(arg) {
	    return arg == null;
	  }
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.decode = exports.parse = __webpack_require__(13);
	exports.encode = exports.stringify = __webpack_require__(14);


/***/ },
/* 13 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};

	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }

	  var regexp = /\+/g;
	  qs = qs.split(sep);

	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }

	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }

	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;

	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }

	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);

	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }

	  return obj;
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	};

	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (name, context, definition) {
	  if (typeof module !== 'undefined' && module.exports) module.exports = definition();
	  else if (true) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  else context[name] = definition();
	})('urljoin', this, function () {

	  function normalize (str, options) {

	    // make sure protocol is followed by two slashes
	    str = str.replace(/:\//g, '://');

	    // remove consecutive slashes
	    str = str.replace(/([^:\s])\/+/g, '$1/');

	    // remove trailing slash before parameters or hash
	    str = str.replace(/\/(\?|&|#[^!])/g, '$1');

	    // replace ? in parameters with &
	    str = str.replace(/(\?.+)\?/g, '$1&');

	    return str;
	  }

	  return function () {
	    var input = arguments;
	    var options = {};

	    if (typeof arguments[0] === 'object') {
	      // new syntax with array and options
	      input = arguments[0];
	      options = arguments[1] || {};
	    }

	    var joined = [].slice.call(input, 0).join('/');
	    return normalize(joined, options);
	  };

	});


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var posix = __webpack_require__(17);
	var signaling_1 = __webpack_require__(21);
	var utils = __webpack_require__(6);
	var validate = __webpack_require__(24);
	/**
	 * The url for the contents service.
	 */
	var SERVICE_CONTENTS_URL = 'api/contents';
	/**
	 * The url for the file access.
	 */
	var FILES_URL = 'files';
	/**
	 * A contents manager that passes file operations to the server.
	 *
	 * This includes checkpointing with the normal file operations.
	 */
	var ContentsManager = (function () {
	    /**
	     * Construct a new contents manager object.
	     *
	     * @param options - The options used to initialize the object.
	     */
	    function ContentsManager(options) {
	        if (options === void 0) { options = {}; }
	        this._baseUrl = '';
	        this._isDisposed = false;
	        this._ajaxSettings = null;
	        this._baseUrl = options.baseUrl || utils.getBaseUrl();
	        this._ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	    }
	    Object.defineProperty(ContentsManager.prototype, "isDisposed", {
	        /**
	         * Test whether the manager has been disposed.
	         */
	        get: function () {
	            return this._isDisposed;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Dispose of the resources held by the manager.
	     */
	    ContentsManager.prototype.dispose = function () {
	        if (this.isDisposed) {
	            return;
	        }
	        this._isDisposed = true;
	        signaling_1.clearSignalData(this);
	    };
	    Object.defineProperty(ContentsManager.prototype, "baseUrl", {
	        /**
	         * Get the base url of the manager.
	         */
	        get: function () {
	            return this._baseUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(ContentsManager.prototype, "ajaxSettings", {
	        /**
	         * Get a copy of the default ajax settings for the contents manager.
	         */
	        get: function () {
	            return utils.copy(this._ajaxSettings);
	        },
	        /**
	         * Set the default ajax settings for the contents manager.
	         */
	        set: function (value) {
	            this._ajaxSettings = utils.copy(value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Get a file or directory.
	     *
	     * @param path: The path to the file.
	     *
	     * @param options: The options used to fetch the file.
	     *
	     * @returns A promise which resolves with the file content.
	     *
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
	     */
	    ContentsManager.prototype.get = function (path, options) {
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'GET';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.cache = false;
	        var url = this._getUrl(path);
	        if (options) {
	            // The notebook type cannot take an format option.
	            if (options.type === 'notebook') {
	                delete options['format'];
	            }
	            var params = utils.copy(options);
	            params.content = options.content ? '1' : '0';
	            url += utils.jsonToQueryString(params);
	        }
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            try {
	                validate.validateContentsModel(success.data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            return success.data;
	        });
	    };
	    /**
	     * Get an encoded download url given a file path.
	     *
	     * @param path - An absolute POSIX file path on the server.
	     *
	     * #### Notes
	     * It is expected that the path contains no relative paths,
	     * use [[ContentsManager.getAbsolutePath]] to get an absolute
	     * path if necessary.
	     */
	    ContentsManager.prototype.getDownloadUrl = function (path) {
	        return utils.urlPathJoin(this._baseUrl, FILES_URL, utils.urlEncodeParts(path));
	    };
	    /**
	     * Create a new untitled file or directory in the specified directory path.
	     *
	     * @param options: The options used to create the file.
	     *
	     * @returns A promise which resolves with the created file content when the
	     *    file is created.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
	     */
	    ContentsManager.prototype.newUntitled = function (options) {
	        var _this = this;
	        if (options === void 0) { options = {}; }
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'POST';
	        ajaxSettings.dataType = 'json';
	        if (options) {
	            if (options.ext) {
	                options.ext = ContentsManager.normalizeExtension(options.ext);
	            }
	            ajaxSettings.data = JSON.stringify(options);
	            ajaxSettings.contentType = 'application/json';
	        }
	        var url = this._getUrl(options.path || '');
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 201) {
	                return utils.makeAjaxError(success);
	            }
	            var data = success.data;
	            try {
	                validate.validateContentsModel(data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            _this.fileChanged.emit({
	                type: 'new',
	                oldValue: null,
	                newValue: data
	            });
	            return data;
	        });
	    };
	    /**
	     * Delete a file.
	     *
	     * @param path - The path to the file.
	     *
	     * @returns A promise which resolves when the file is deleted.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
	     */
	    ContentsManager.prototype.delete = function (path) {
	        var _this = this;
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'DELETE';
	        ajaxSettings.dataType = 'json';
	        var url = this._getUrl(path);
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 204) {
	                return utils.makeAjaxError(success);
	            }
	            _this.fileChanged.emit({
	                type: 'delete',
	                oldValue: { path: path },
	                newValue: null
	            });
	        }, function (error) {
	            // Translate certain errors to more specific ones.
	            // TODO: update IPEP27 to specify errors more precisely, so
	            // that error types can be detected here with certainty.
	            if (error.xhr.status === 400) {
	                var err = JSON.parse(error.xhr.response);
	                if (err.message) {
	                    error.throwError = err.message;
	                }
	            }
	            return Promise.reject(error);
	        });
	    };
	    /**
	     * Rename a file or directory.
	     *
	     * @param path - The original file path.
	     *
	     * @param newPath - The new file path.
	     *
	     * @returns A promise which resolves with the new file contents model when
	     *   the file is renamed.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
	     */
	    ContentsManager.prototype.rename = function (path, newPath) {
	        var _this = this;
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'PATCH';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.contentType = 'application/json';
	        ajaxSettings.data = JSON.stringify({ path: newPath });
	        var url = this._getUrl(path);
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            var data = success.data;
	            try {
	                validate.validateContentsModel(data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            _this.fileChanged.emit({
	                type: 'rename',
	                oldValue: { path: path },
	                newValue: data
	            });
	            return data;
	        });
	    };
	    /**
	     * Save a file.
	     *
	     * @param path - The desired file path.
	     *
	     * @param options - Optional overrides to the model.
	     *
	     * @returns A promise which resolves with the file content model when the
	     *   file is saved.
	     *
	     * #### Notes
	     * Ensure that `model.content` is populated for the file.
	     *
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
	     */
	    ContentsManager.prototype.save = function (path, options) {
	        var _this = this;
	        if (options === void 0) { options = {}; }
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'PUT';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.data = JSON.stringify(options);
	        ajaxSettings.contentType = 'application/json';
	        ajaxSettings.cache = false;
	        var url = this._getUrl(path);
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            // will return 200 for an existing file and 201 for a new file
	            if (success.xhr.status !== 200 && success.xhr.status !== 201) {
	                return utils.makeAjaxError(success);
	            }
	            var data = success.data;
	            try {
	                validate.validateContentsModel(data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            _this.fileChanged.emit({
	                type: 'save',
	                oldValue: null,
	                newValue: data
	            });
	            return data;
	        });
	    };
	    /**
	     * Copy a file into a given directory.
	     *
	     * @param path - The original file path.
	     *
	     * @param toDir - The destination directory path.
	     *
	     * @returns A promise which resolves with the new contents model when the
	     *  file is copied.
	     *
	     * #### Notes
	     * The server will select the name of the copied file.
	     *
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
	     */
	    ContentsManager.prototype.copy = function (fromFile, toDir) {
	        var _this = this;
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'POST';
	        ajaxSettings.data = JSON.stringify({ copy_from: fromFile });
	        ajaxSettings.contentType = 'application/json';
	        ajaxSettings.dataType = 'json';
	        var url = this._getUrl(toDir);
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 201) {
	                return utils.makeAjaxError(success);
	            }
	            var data = success.data;
	            try {
	                validate.validateContentsModel(data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            _this.fileChanged.emit({
	                type: 'new',
	                oldValue: null,
	                newValue: data
	            });
	            return data;
	        });
	    };
	    /**
	     * Create a checkpoint for a file.
	     *
	     * @param path - The path of the file.
	     *
	     * @returns A promise which resolves with the new checkpoint model when the
	     *   checkpoint is created.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
	     */
	    ContentsManager.prototype.createCheckpoint = function (path) {
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'POST';
	        ajaxSettings.dataType = 'json';
	        var url = this._getUrl(path, 'checkpoints');
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 201) {
	                return utils.makeAjaxError(success);
	            }
	            try {
	                validate.validateCheckpointModel(success.data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            return success.data;
	        });
	    };
	    /**
	     * List available checkpoints for a file.
	     *
	     * @param path - The path of the file.
	     *
	     * @returns A promise which resolves with a list of checkpoint models for
	     *    the file.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
	     */
	    ContentsManager.prototype.listCheckpoints = function (path) {
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'GET';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.cache = false;
	        var url = this._getUrl(path, 'checkpoints');
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            if (!Array.isArray(success.data)) {
	                return utils.makeAjaxError(success, 'Invalid Checkpoint list');
	            }
	            for (var i = 0; i < success.data.length; i++) {
	                try {
	                    validate.validateCheckpointModel(success.data[i]);
	                }
	                catch (err) {
	                    return utils.makeAjaxError(success, err.message);
	                }
	            }
	            return success.data;
	        });
	    };
	    /**
	     * Restore a file to a known checkpoint state.
	     *
	     * @param path - The path of the file.
	     *
	     * @param checkpointID - The id of the checkpoint to restore.
	     *
	     * @returns A promise which resolves when the checkpoint is restored.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
	     */
	    ContentsManager.prototype.restoreCheckpoint = function (path, checkpointID) {
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'POST';
	        ajaxSettings.dataType = 'json';
	        var url = this._getUrl(path, 'checkpoints', checkpointID);
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 204) {
	                return utils.makeAjaxError(success);
	            }
	        });
	    };
	    /**
	     * Delete a checkpoint for a file.
	     *
	     * @param path - The path of the file.
	     *
	     * @param checkpointID - The id of the checkpoint to delete.
	     *
	     * @returns A promise which resolves when the checkpoint is deleted.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
	     */
	    ContentsManager.prototype.deleteCheckpoint = function (path, checkpointID) {
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'DELETE';
	        ajaxSettings.dataType = 'json';
	        var url = this._getUrl(path, 'checkpoints', checkpointID);
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 204) {
	                return utils.makeAjaxError(success);
	            }
	        });
	    };
	    /**
	     * Get a REST url for a file given a path.
	     */
	    ContentsManager.prototype._getUrl = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        var parts = args.map(function (path) { return utils.urlEncodeParts(path); });
	        return utils.urlPathJoin.apply(utils, [this._baseUrl, SERVICE_CONTENTS_URL].concat(parts));
	    };
	    return ContentsManager;
	}());
	exports.ContentsManager = ContentsManager;
	// Define the signals for the `ContentsManager` class.
	signaling_1.defineSignal(ContentsManager.prototype, 'fileChanged');
	/**
	 * A namespace for ContentsManager statics.
	 */
	var ContentsManager;
	(function (ContentsManager) {
	    /**
	     * Get the absolute POSIX path to a file on the server.
	     *
	     * @param relativePath - The relative POSIX path to the file.
	     *
	     * @param cwd - The optional POSIX current working directory.  The default is
	     *  an empty string.
	     *
	     * #### Notes
	     * Absolute path in this context is equivalent to a POSIX path without
	     * the initial `'/'` because IPEP 27 paths denote `''` as the root.
	     * If the resulting path is not contained within the server root,
	     * returns `null`, since it cannot be served.
	     */
	    function getAbsolutePath(relativePath, cwd) {
	        if (cwd === void 0) { cwd = ''; }
	        // Bail if it looks like a url.
	        var urlObj = utils.urlParse(relativePath);
	        if (urlObj.protocol) {
	            return relativePath;
	        }
	        var norm = posix.normalize(posix.join(cwd, relativePath));
	        if (norm.indexOf('../') === 0) {
	            return null;
	        }
	        return posix.resolve('/', cwd, relativePath).slice(1);
	    }
	    ContentsManager.getAbsolutePath = getAbsolutePath;
	    /**
	     * Get the last portion of a path, similar to the Unix basename command.
	     */
	    function basename(path, ext) {
	        return posix.basename(path, ext);
	    }
	    ContentsManager.basename = basename;
	    /**
	     * Get the directory name of a path, similar to the Unix dirname command.
	     */
	    function dirname(path) {
	        return posix.dirname(path);
	    }
	    ContentsManager.dirname = dirname;
	    /**
	     * Get the extension of the path.
	     *
	     * #### Notes
	     * The extension is the string from the last occurance of the `.`
	     * character to end of string in the last portion of the path.
	     * If there is no `.` in the last portion of the path, or if the first
	     * character of the basename of path [[basename]] is `.`, then an
	     * empty string is returned.
	     */
	    function extname(path) {
	        return posix.extname(path);
	    }
	    ContentsManager.extname = extname;
	    /**
	     * Normalize a file extension to be of the type `'.foo'`.
	     *
	     * Adds a leading dot if not present and converts to lower case.
	     */
	    function normalizeExtension(extension) {
	        if (extension.length > 0 && extension.indexOf('.') !== 0) {
	            extension = "." + extension;
	        }
	        return extension;
	    }
	    ContentsManager.normalizeExtension = normalizeExtension;
	})(ContentsManager = exports.ContentsManager || (exports.ContentsManager = {}));


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';
	var util = __webpack_require__(18);
	var isString = function (x) {
	  return typeof x === 'string';
	};


	// resolves . and .. elements in a path array with directory names there
	// must be no slashes or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  var res = [];
	  for (var i = 0; i < parts.length; i++) {
	    var p = parts[i];

	    // ignore empty parts
	    if (!p || p === '.')
	      continue;

	    if (p === '..') {
	      if (res.length && res[res.length - 1] !== '..') {
	        res.pop();
	      } else if (allowAboveRoot) {
	        res.push('..');
	      }
	    } else {
	      res.push(p);
	    }
	  }

	  return res;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var posix = {};


	function posixSplitPath(filename) {
	  return splitPathRe.exec(filename).slice(1);
	}


	// path.resolve([from ...], to)
	// posix version
	posix.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (!isString(path)) {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(resolvedPath.split('/'),
	                                !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	posix.normalize = function(path) {
	  var isAbsolute = posix.isAbsolute(path),
	      trailingSlash = path.substr(-1) === '/';

	  // Normalize the path
	  path = normalizeArray(path.split('/'), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	posix.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	posix.join = function() {
	  var path = '';
	  for (var i = 0; i < arguments.length; i++) {
	    var segment = arguments[i];
	    if (!isString(segment)) {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    if (segment) {
	      if (!path) {
	        path += segment;
	      } else {
	        path += '/' + segment;
	      }
	    }
	  }
	  return posix.normalize(path);
	};


	// path.relative(from, to)
	// posix version
	posix.relative = function(from, to) {
	  from = posix.resolve(from).substr(1);
	  to = posix.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};


	posix._makeLong = function(path) {
	  return path;
	};


	posix.dirname = function(path) {
	  var result = posixSplitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	posix.basename = function(path, ext) {
	  var f = posixSplitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	posix.extname = function(path) {
	  return posixSplitPath(path)[3];
	};


	posix.format = function(pathObject) {
	  if (!util.isObject(pathObject)) {
	    throw new TypeError(
	        "Parameter 'pathObject' must be an object, not " + typeof pathObject
	    );
	  }

	  var root = pathObject.root || '';

	  if (!isString(root)) {
	    throw new TypeError(
	        "'pathObject.root' must be a string or undefined, not " +
	        typeof pathObject.root
	    );
	  }

	  var dir = pathObject.dir ? pathObject.dir + posix.sep : '';
	  var base = pathObject.base || '';
	  return dir + base;
	};


	posix.parse = function(pathString) {
	  if (!isString(pathString)) {
	    throw new TypeError(
	        "Parameter 'pathString' must be a string, not " + typeof pathString
	    );
	  }
	  var allParts = posixSplitPath(pathString);
	  if (!allParts || allParts.length !== 4) {
	    throw new TypeError("Invalid path '" + pathString + "'");
	  }
	  allParts[1] = allParts[1] || '';
	  allParts[2] = allParts[2] || '';
	  allParts[3] = allParts[3] || '';

	  return {
	    root: allParts[0],
	    dir: allParts[0] + allParts[1].slice(0, allParts[1].length - 1),
	    base: allParts[2],
	    ext: allParts[3],
	    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
	  };
	};


	posix.sep = '/';
	posix.delimiter = ':';

	  module.exports = posix;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(19);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(20);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(2)))

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 20 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {/*-----------------------------------------------------------------------------
	| Copyright (c) 2014-2016, PhosphorJS Contributors
	|
	| Distributed under the terms of the BSD 3-Clause License.
	|
	| The full license is in the file LICENSE, distributed with this software.
	|----------------------------------------------------------------------------*/
	"use strict";
	/**
	 * Define a signal property on a prototype object.
	 *
	 * @param target - The prototype for the class of interest.
	 *
	 * @param name - The name of the signal property.
	 *
	 * #### Notes
	 * The defined signal property is read-only.
	 *
	 * #### Example
	 * ```typescript
	 * class SomeClass {
	 *   valueChanged: ISignal<SomeClass, number>;
	 * }
	 *
	 * defineSignal(SomeClass.prototype, 'valueChanged');
	 */
	function defineSignal(target, name) {
	    var token = Object.freeze({});
	    Object.defineProperty(target, name, {
	        get: function () { return new Signal(this, token); }
	    });
	}
	exports.defineSignal = defineSignal;
	/**
	 * Remove all connections where the given object is the sender.
	 *
	 * @param sender - The sender object of interest.
	 *
	 * #### Example
	 * ```typescript
	 * disconnectSender(someObject);
	 * ```
	 */
	function disconnectSender(sender) {
	    // If there are no receivers, there is nothing to do.
	    var receiverList = senderData.get(sender);
	    if (receiverList === void 0) {
	        return;
	    }
	    // Clear the connections and schedule a cleanup of the
	    // receiver's corresponding list of sender connections.
	    for (var i = 0, n = receiverList.length; i < n; ++i) {
	        var conn = receiverList[i];
	        var senderList = receiverData.get(conn.thisArg || conn.slot);
	        scheduleCleanup(senderList);
	        conn.token = null;
	    }
	    // Schedule a cleanup of the receiver list.
	    scheduleCleanup(receiverList);
	}
	exports.disconnectSender = disconnectSender;
	/**
	 * Remove all connections where the given object is the receiver.
	 *
	 * @param receiver - The receiver object of interest.
	 *
	 * #### Notes
	 * If a `thisArg` is provided when connecting a signal, that object
	 * is considered the receiver. Otherwise, the `callback` is used as
	 * the receiver.
	 *
	 * #### Example
	 * ```typescript
	 * // disconnect a regular object receiver
	 * disconnectReceiver(myObject);
	 *
	 * // disconnect a plain callback receiver
	 * disconnectReceiver(myCallback);
	 * ```
	 */
	function disconnectReceiver(receiver) {
	    // If there are no senders, there is nothing to do.
	    var senderList = receiverData.get(receiver);
	    if (senderList === void 0) {
	        return;
	    }
	    // Clear the connections and schedule a cleanup of the
	    // senders's corresponding list of receiver connections.
	    for (var i = 0, n = senderList.length; i < n; ++i) {
	        var conn = senderList[i];
	        var receiverList = senderData.get(conn.sender);
	        scheduleCleanup(receiverList);
	        conn.token = null;
	    }
	    // Schedule a cleanup of the sender list.
	    scheduleCleanup(senderList);
	}
	exports.disconnectReceiver = disconnectReceiver;
	/**
	 * Clear all signal data associated with the given object.
	 *
	 * @param obj - The object for which the signal data should be cleared.
	 *
	 * #### Notes
	 * This removes all signal connections where the object is used as
	 * either the sender or the receiver.
	 *
	 * #### Example
	 * ```typescript
	 * clearSignalData(someObject);
	 * ```
	 */
	function clearSignalData(obj) {
	    disconnectSender(obj);
	    disconnectReceiver(obj);
	}
	exports.clearSignalData = clearSignalData;
	/**
	 * A concrete implementation of `ISignal`.
	 */
	var Signal = (function () {
	    /**
	     * Construct a new signal.
	     *
	     * @param sender - The object which owns the signal.
	     *
	     * @param token - The unique token identifying the signal.
	     */
	    function Signal(sender, token) {
	        this._sender = sender;
	        this._token = token;
	    }
	    /**
	     * Connect a slot to the signal.
	     *
	     * @param slot - The slot to invoke when the signal is emitted.
	     *
	     * @param thisArg - The `this` context for the slot. If provided,
	     *   this must be a non-primitive object.
	     *
	     * @returns `true` if the connection succeeds, `false` otherwise.
	     */
	    Signal.prototype.connect = function (slot, thisArg) {
	        return connect(this._sender, this._token, slot, thisArg);
	    };
	    /**
	     * Disconnect a slot from the signal.
	     *
	     * @param slot - The slot to disconnect from the signal.
	     *
	     * @param thisArg - The `this` context for the slot. If provided,
	     *   this must be a non-primitive object.
	     *
	     * @returns `true` if the connection is removed, `false` otherwise.
	     */
	    Signal.prototype.disconnect = function (slot, thisArg) {
	        return disconnect(this._sender, this._token, slot, thisArg);
	    };
	    /**
	     * Emit the signal and invoke the connected slots.
	     *
	     * @param args - The args to pass to the connected slots.
	     */
	    Signal.prototype.emit = function (args) {
	        emit(this._sender, this._token, args);
	    };
	    return Signal;
	}());
	/**
	 * A weak mapping of sender to list of receiver connections.
	 */
	var senderData = new WeakMap();
	/**
	 * A weak mapping of receiver to list of sender connections.
	 */
	var receiverData = new WeakMap();
	/**
	 * A set of connection lists which are pending cleanup.
	 */
	var dirtySet = new Set();
	/**
	 * A local reference to an event loop callback.
	 */
	var defer = (function () {
	    var ok = typeof requestAnimationFrame === 'function';
	    return ok ? requestAnimationFrame : setImmediate;
	})();
	/**
	 * Connect a slot to a signal.
	 *
	 * @param sender - The object emitting the signal.
	 *
	 * @param token - The unique token for the signal.
	 *
	 * @param slot - The slot to connect to the signal.
	 *
	 * @param thisArg - The `this` context for the slot.
	 *
	 * @returns `true` if the connection succeeds, `false` otherwise.
	 *
	 * #### Notes
	 * Signal connections are unique. If a connection already exists for
	 * the given `slot` and `thisArg`, this function returns `false`.
	 *
	 * A newly connected slot will not be invoked until the next time the
	 * signal is emitted, even if the slot is connected while the signal
	 * is dispatching.
	 */
	function connect(sender, token, slot, thisArg) {
	    // Coerce a `null` thisArg to `undefined`.
	    thisArg = thisArg || void 0;
	    // Ensure the sender's receiver list is created.
	    var receiverList = senderData.get(sender);
	    if (receiverList === void 0) {
	        receiverList = [];
	        senderData.set(sender, receiverList);
	    }
	    // Bail if a matching connection already exists.
	    if (findConnection(receiverList, token, slot, thisArg) !== null) {
	        return false;
	    }
	    // Ensure the receiver's sender list is created.
	    var receiver = thisArg || slot;
	    var senderList = receiverData.get(receiver);
	    if (senderList === void 0) {
	        senderList = [];
	        receiverData.set(receiver, senderList);
	    }
	    // Create a new connection and add it to the end of each list.
	    var connection = { sender: sender, token: token, slot: slot, thisArg: thisArg };
	    receiverList.push(connection);
	    senderList.push(connection);
	    // Indicate a successful connection.
	    return true;
	}
	/**
	 * Disconnect a slot from a signal.
	 *
	 * @param sender - The object emitting the signal.
	 *
	 * @param token - The unique token for the signal.
	 *
	 * @param slot - The slot to disconnect from the signal.
	 *
	 * @param thisArg - The `this` context for the slot.
	 *
	 * @returns `true` if the connection is removed, `false` otherwise.
	 *
	 * #### Notes
	 * If no connection exists for the given `slot` and `thisArg`, this
	 * function returns `false`.
	 *
	 * A disconnected slot will no longer be invoked, even if the slot
	 * is disconnected while the signal is dispatching.
	 */
	function disconnect(sender, token, slot, thisArg) {
	    // Coerce a `null` thisArg to `undefined`.
	    thisArg = thisArg || void 0;
	    // Lookup the list of receivers, and bail if none exist.
	    var receiverList = senderData.get(sender);
	    if (receiverList === void 0) {
	        return false;
	    }
	    // Bail if no matching connection exits.
	    var conn = findConnection(receiverList, token, slot, thisArg);
	    if (conn === null) {
	        return false;
	    }
	    // Lookup the list of senders, which is now known to exist.
	    var senderList = receiverData.get(thisArg || slot);
	    // Clear the connection and schedule list cleanup.
	    conn.token = null;
	    scheduleCleanup(receiverList);
	    scheduleCleanup(senderList);
	    // Indicate a successful disconnection.
	    return true;
	}
	/**
	 * Emit a signal and invoke the connected slots.
	 *
	 * @param sender - The object emitting the signal.
	 *
	 * @param token - The unique token for the signal.
	 *
	 * @param args - The args to pass to the connected slots.
	 *
	 * #### Notes
	 * Connected slots are invoked synchronously, in the order in which
	 * they are connected.
	 *
	 * Exceptions thrown by connected slots will be caught and logged.
	 */
	function emit(sender, token, args) {
	    // If there are no receivers, there is nothing to do.
	    var receiverList = senderData.get(sender);
	    if (receiverList === void 0) {
	        return;
	    }
	    // Invoke the connections which match the given token.
	    for (var i = 0, n = receiverList.length; i < n; ++i) {
	        var conn = receiverList[i];
	        if (conn.token === token) {
	            invokeSlot(conn, args);
	        }
	    }
	}
	/**
	 * Safely invoke a non-empty connection.
	 *
	 * @param conn - The connection of interest
	 *
	 * @param args - The arguments to pass to the slot.
	 *
	 * #### Notes
	 * Any exception thrown by the slot will be caught and logged.
	 */
	function invokeSlot(conn, args) {
	    try {
	        conn.slot.call(conn.thisArg, conn.sender, args);
	    }
	    catch (err) {
	        console.error(err);
	    }
	}
	/**
	 * Find a connection which matches the given parameters.
	 *
	 * @param list - The list of connections to search.
	 *
	 * @param token - The unique token for the signal.
	 *
	 * @param slot - The slot of interest.
	 *
	 * @param thisArg - The `this` context for the slot.
	 *
	 * @returns The first connection which matches the supplied parameters,
	 *   or null if no matching connection is found.
	 */
	function findConnection(list, token, slot, thisArg) {
	    for (var i = 0, n = list.length; i < n; ++i) {
	        var conn = list[i];
	        if (conn.token === token &&
	            conn.slot === slot &&
	            conn.thisArg === thisArg) {
	            return conn;
	        }
	    }
	    return null;
	}
	/**
	 * Schedule a cleanup of a connection list.
	 *
	 * @param list - The list of connections to cleanup.
	 *
	 * #### Notes
	 * This will add the list to the dirty set and schedule a deferred
	 * cleanup of the list contents. On cleanup, any connection with a
	 * null token will be removed from the array.
	 */
	function scheduleCleanup(list) {
	    if (dirtySet.size === 0) {
	        defer(cleanupDirtySet);
	    }
	    dirtySet.add(list);
	}
	/**
	 * Cleanup the connection lists in the dirty set.
	 *
	 * #### Notes
	 * This function should only be invoked asynchronously, when the stack
	 * frame is guaranteed to not be on the path of a signal dispatch.
	 */
	function cleanupDirtySet() {
	    dirtySet.forEach(cleanupList);
	    dirtySet.clear();
	}
	/**
	 * Cleanup the dirty connections in a connection list.
	 *
	 * @param list - The list of connection to cleanup.
	 *
	 * #### Notes
	 * This will remove any connection with a null token from the list,
	 * while retaining the relative order of the other connections.
	 *
	 * This function should only be invoked asynchronously, when the stack
	 * frame is guaranteed to not be on the path of a signal dispatch.
	 */
	function cleanupList(list) {
	    var count = 0;
	    for (var i = 0, n = list.length; i < n; ++i) {
	        var conn = list[i];
	        if (conn.token === null) {
	            count++;
	        }
	        else {
	            list[i - count] = conn;
	        }
	    }
	    list.length -= count;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22).setImmediate))

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(23);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(2)))

/***/ },
/* 24 */
/***/ function(module, exports) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	/**
	 * Validate a property as being on an object, and optionally
	 * of a given type.
	 */
	function validateProperty(object, name, typeName) {
	    if (!object.hasOwnProperty(name)) {
	        throw Error("Missing property '" + name + "'");
	    }
	    if (typeName !== void 0) {
	        var valid = true;
	        var value = object[name];
	        switch (typeName) {
	            case 'array':
	                valid = Array.isArray(value);
	                break;
	            case 'object':
	                valid = typeof value !== 'undefined';
	                break;
	            default:
	                valid = typeof value === typeName;
	        }
	        if (!valid) {
	            throw new Error("Property '" + name + "' is not of type '" + typeName);
	        }
	    }
	}
	/**
	 * Validate an `Contents.IModel` object.
	 */
	function validateContentsModel(model) {
	    validateProperty(model, 'name', 'string');
	    validateProperty(model, 'path', 'string');
	    validateProperty(model, 'type', 'string');
	    validateProperty(model, 'created', 'string');
	    validateProperty(model, 'last_modified', 'string');
	    validateProperty(model, 'mimetype', 'object');
	    validateProperty(model, 'content', 'object');
	    validateProperty(model, 'format', 'object');
	}
	exports.validateContentsModel = validateContentsModel;
	/**
	 * Validate an `Contents.ICheckpointModel` object.
	 */
	function validateCheckpointModel(model) {
	    validateProperty(model, 'id', 'string');
	    validateProperty(model, 'last_modified', 'string');
	}
	exports.validateCheckpointModel = validateCheckpointModel;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	'use strict';
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(26));
	__export(__webpack_require__(38));
	__export(__webpack_require__(34));


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var default_1 = __webpack_require__(27);
	/**
	 * A namespace for kernel types, interfaces, and type checker functions.
	 */
	var Kernel;
	(function (Kernel) {
	    /**
	     * Find a kernel by id.
	     *
	     * #### Notes
	     * If the kernel was already started via `startNewKernel`, we return its
	     * `Kernel.IModel`.
	     *
	     * Otherwise, if `options` are given, we attempt to find to the existing
	     * kernel.
	     * The promise is fulfilled when the kernel is found,
	     * otherwise the promise is rejected.
	     */
	    function findById(id, options) {
	        return default_1.DefaultKernel.findById(id, options);
	    }
	    Kernel.findById = findById;
	    /**
	     * Fetch all of the kernel specs.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernelspecs).
	     */
	    function getSpecs(options) {
	        if (options === void 0) { options = {}; }
	        return default_1.DefaultKernel.getSpecs(options);
	    }
	    Kernel.getSpecs = getSpecs;
	    /**
	     * Fetch the running kernels.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     */
	    function listRunning(options) {
	        if (options === void 0) { options = {}; }
	        return default_1.DefaultKernel.listRunning(options);
	    }
	    Kernel.listRunning = listRunning;
	    /**
	     * Start a new kernel.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
	     *
	     * If no options are given or the kernel name is not given, the
	     * default kernel will by started by the server.
	     *
	     * Wraps the result in a Kernel object. The promise is fulfilled
	     * when the kernel is started by the server, otherwise the promise is rejected.
	     */
	    function startNew(options) {
	        options = options || {};
	        return default_1.DefaultKernel.startNew(options);
	    }
	    Kernel.startNew = startNew;
	    /**
	     * Connect to a running kernel.
	     *
	     * #### Notes
	     * If the kernel was already started via `startNewKernel`, the existing
	     * Kernel object info is used to create another instance.
	     *
	     * Otherwise, if `options` are given, we attempt to connect to the existing
	     * kernel found by calling `listRunningKernels`.
	     * The promise is fulfilled when the kernel is running on the server,
	     * otherwise the promise is rejected.
	     *
	     * If the kernel was not already started and no `options` are given,
	     * the promise is rejected.
	     */
	    function connectTo(id, options) {
	        return default_1.DefaultKernel.connectTo(id, options);
	    }
	    Kernel.connectTo = connectTo;
	    /**
	     * Shut down a kernel by id.
	     */
	    function shutdown(id, options) {
	        if (options === void 0) { options = {}; }
	        return default_1.DefaultKernel.shutdown(id, options);
	    }
	    Kernel.shutdown = shutdown;
	})(Kernel = exports.Kernel || (exports.Kernel = {}));


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var iteration_1 = __webpack_require__(28);
	var searching_1 = __webpack_require__(29);
	var vector_1 = __webpack_require__(31);
	var disposable_1 = __webpack_require__(32);
	var signaling_1 = __webpack_require__(21);
	var comm_1 = __webpack_require__(33);
	var messages_1 = __webpack_require__(34);
	var future_1 = __webpack_require__(35);
	var serialize = __webpack_require__(36);
	var validate = __webpack_require__(37);
	var utils = __webpack_require__(6);
	/**
	 * The url for the kernel service.
	 */
	var KERNEL_SERVICE_URL = 'api/kernels';
	/**
	 * The url for the kernelspec service.
	 */
	var KERNELSPEC_SERVICE_URL = 'api/kernelspecs';
	/**
	 * Implementation of the Kernel object
	 */
	var DefaultKernel = (function () {
	    /**
	     * Construct a kernel object.
	     */
	    function DefaultKernel(options, id) {
	        this._id = '';
	        this._token = '';
	        this._name = '';
	        this._baseUrl = '';
	        this._wsUrl = '';
	        this._status = 'unknown';
	        this._clientId = '';
	        this._ws = null;
	        this._username = '';
	        this._ajaxSettings = '{}';
	        this._reconnectLimit = 7;
	        this._reconnectAttempt = 0;
	        this._isReady = false;
	        this._futures = null;
	        this._commPromises = null;
	        this._comms = null;
	        this._targetRegistry = Object.create(null);
	        this._info = null;
	        this._pendingMessages = [];
	        this._connectionPromise = null;
	        this._specPromise = null;
	        this._name = options.name;
	        this._id = id;
	        this._baseUrl = options.baseUrl || utils.getBaseUrl();
	        this._wsUrl = options.wsUrl || utils.getWsUrl(this._baseUrl);
	        this._ajaxSettings = JSON.stringify(utils.ajaxSettingsWithToken(options.ajaxSettings, options.token));
	        this._token = options.token || utils.getConfigOption('token');
	        this._clientId = options.clientId || utils.uuid();
	        this._username = options.username || '';
	        this._futures = new Map();
	        this._commPromises = new Map();
	        this._comms = new Map();
	        this._createSocket();
	        Private.runningKernels.pushBack(this);
	    }
	    Object.defineProperty(DefaultKernel.prototype, "id", {
	        /**
	         * The id of the server-side kernel.
	         */
	        get: function () {
	            return this._id;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "name", {
	        /**
	         * The name of the server-side kernel.
	         */
	        get: function () {
	            return this._name;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "model", {
	        /**
	         * Get the model associated with the kernel.
	         */
	        get: function () {
	            return { name: this.name, id: this.id };
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "username", {
	        /**
	         * The client username.
	         */
	        get: function () {
	            return this._username;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "clientId", {
	        /**
	         * The client unique id.
	         */
	        get: function () {
	            return this._clientId;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "status", {
	        /**
	         * The current status of the kernel.
	         */
	        get: function () {
	            return this._status;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "baseUrl", {
	        /**
	         * The base url of the kernel.
	         */
	        get: function () {
	            return this._baseUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "ajaxSettings", {
	        /**
	         * Get a copy of the default ajax settings for the kernel.
	         */
	        get: function () {
	            return JSON.parse(this._ajaxSettings);
	        },
	        /**
	         * Set the default ajax settings for the kernel.
	         */
	        set: function (value) {
	            this._ajaxSettings = JSON.stringify(value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "isDisposed", {
	        /**
	         * Test whether the kernel has been disposed.
	         */
	        get: function () {
	            return this._futures === null;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "info", {
	        /**
	         * The cached kernel info.
	         *
	         * #### Notes
	         * This value will be null until the kernel is ready.
	         */
	        get: function () {
	            return this._info;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "isReady", {
	        /**
	         * Test whether the kernel is ready.
	         */
	        get: function () {
	            return this._isReady;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultKernel.prototype, "ready", {
	        /**
	         * A promise that is fulfilled when the kernel is ready.
	         */
	        get: function () {
	            return this._connectionPromise.promise;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Get the kernel spec.
	     *
	     * @returns A promise that resolves with the kernel spec.
	     */
	    DefaultKernel.prototype.getSpec = function () {
	        var _this = this;
	        if (this._specPromise) {
	            return this._specPromise;
	        }
	        var options = {
	            baseUrl: this._baseUrl,
	            ajaxSettings: this.ajaxSettings
	        };
	        this._specPromise = Private.findSpecs(options).then(function (specs) {
	            return specs.kernelspecs[_this._name];
	        });
	        return this._specPromise;
	    };
	    /**
	     * Clone the current kernel with a new clientId.
	     */
	    DefaultKernel.prototype.clone = function () {
	        var options = {
	            baseUrl: this._baseUrl,
	            wsUrl: this._wsUrl,
	            name: this._name,
	            username: this._username,
	            token: this._token,
	            ajaxSettings: this.ajaxSettings
	        };
	        return new DefaultKernel(options, this._id);
	    };
	    /**
	     * Dispose of the resources held by the kernel.
	     */
	    DefaultKernel.prototype.dispose = function () {
	        if (this.isDisposed) {
	            return;
	        }
	        this._status = 'dead';
	        if (this._ws !== null) {
	            this._ws.close();
	        }
	        this._ws = null;
	        this._futures.forEach(function (future, key) {
	            future.dispose();
	        });
	        this._comms.forEach(function (comm, key) {
	            comm.dispose();
	        });
	        this._futures = null;
	        this._commPromises = null;
	        this._comms = null;
	        this._targetRegistry = null;
	        Private.runningKernels.remove(this);
	        signaling_1.clearSignalData(this);
	    };
	    /**
	     * Send a shell message to the kernel.
	     *
	     * #### Notes
	     * Send a message to the kernel's shell channel, yielding a future object
	     * for accepting replies.
	     *
	     * If `expectReply` is given and `true`, the future is disposed when both a
	     * shell reply and an idle status message are received. If `expectReply`
	     * is not given or is `false`, the future is resolved when an idle status
	     * message is received.
	     * If `disposeOnDone` is not given or is `true`, the Future is disposed at this point.
	     * If `disposeOnDone` is given and `false`, it is up to the caller to dispose of the Future.
	     *
	     * All replies are validated as valid kernel messages.
	     *
	     * If the kernel status is `dead`, this will throw an error.
	     */
	    DefaultKernel.prototype.sendShellMessage = function (msg, expectReply, disposeOnDone) {
	        var _this = this;
	        if (expectReply === void 0) { expectReply = false; }
	        if (disposeOnDone === void 0) { disposeOnDone = true; }
	        if (this.status === 'dead') {
	            throw new Error('Kernel is dead');
	        }
	        if (!this._isReady) {
	            this._pendingMessages.push(msg);
	        }
	        else {
	            this._ws.send(serialize.serialize(msg));
	        }
	        var future = new future_1.KernelFutureHandler(function () {
	            _this._futures.delete(msg.header.msg_id);
	        }, msg, expectReply, disposeOnDone);
	        this._futures.set(msg.header.msg_id, future);
	        return future;
	    };
	    /**
	     * Interrupt a kernel.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels).
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     *
	     * It is assumed that the API call does not mutate the kernel id or name.
	     *
	     * The promise will be rejected if the kernel status is `Dead` or if the
	     * request fails or the response is invalid.
	     */
	    DefaultKernel.prototype.interrupt = function () {
	        return Private.interruptKernel(this, this._baseUrl, this.ajaxSettings);
	    };
	    /**
	     * Restart a kernel.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
	     *
	     * Any existing Future or Comm objects are cleared.
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     *
	     * It is assumed that the API call does not mutate the kernel id or name.
	     *
	     * The promise will be rejected if the request fails or the response is
	     * invalid.
	     */
	    DefaultKernel.prototype.restart = function () {
	        this._clearState();
	        this._updateStatus('restarting');
	        return Private.restartKernel(this, this._baseUrl, this.ajaxSettings);
	    };
	    /**
	     * Reconnect to a disconnected kernel.
	     *
	     * #### Notes
	     * Used when the websocket connection to the kernel is lost.
	     */
	    DefaultKernel.prototype.reconnect = function () {
	        this._isReady = false;
	        if (this._ws !== null) {
	            // Clear the websocket event handlers and the socket itself.
	            this._ws.onopen = null;
	            this._ws.onclose = null;
	            this._ws.onerror = null;
	            this._ws.onmessage = null;
	            this._ws.close();
	            this._ws = null;
	        }
	        this._updateStatus('reconnecting');
	        this._createSocket();
	        return this._connectionPromise.promise;
	    };
	    /**
	     * Shutdown a kernel.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels).
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     *
	     * On a valid response, closes the websocket and disposes of the kernel
	     * object, and fulfills the promise.
	     *
	     * The promise will be rejected if the kernel status is `Dead` or if the
	     * request fails or the response is invalid.
	     */
	    DefaultKernel.prototype.shutdown = function () {
	        if (this.status === 'dead') {
	            return Promise.reject(new Error('Kernel is dead'));
	        }
	        this._clearState();
	        return Private.shutdownKernel(this.id, this._baseUrl, this.ajaxSettings);
	    };
	    /**
	     * Send a `kernel_info_request` message.
	     *
	     * #### Notes
	     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#kernel-info).
	     *
	     * Fulfills with the `kernel_info_response` content when the shell reply is
	     * received and validated.
	     */
	    DefaultKernel.prototype.requestKernelInfo = function () {
	        var _this = this;
	        var options = {
	            msgType: 'kernel_info_request',
	            channel: 'shell',
	            username: this._username,
	            session: this._clientId
	        };
	        var msg = messages_1.KernelMessage.createShellMessage(options);
	        return Private.handleShellMessage(this, msg).then(function (reply) {
	            _this._info = reply.content;
	            return reply;
	        });
	    };
	    /**
	     * Send a `complete_request` message.
	     *
	     * #### Notes
	     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#completion).
	     *
	     * Fulfills with the `complete_reply` content when the shell reply is
	     * received and validated.
	     */
	    DefaultKernel.prototype.requestComplete = function (content) {
	        var options = {
	            msgType: 'complete_request',
	            channel: 'shell',
	            username: this._username,
	            session: this._clientId
	        };
	        var msg = messages_1.KernelMessage.createShellMessage(options, content);
	        return Private.handleShellMessage(this, msg);
	    };
	    /**
	     * Send an `inspect_request` message.
	     *
	     * #### Notes
	     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#introspection).
	     *
	     * Fulfills with the `inspect_reply` content when the shell reply is
	     * received and validated.
	     */
	    DefaultKernel.prototype.requestInspect = function (content) {
	        var options = {
	            msgType: 'inspect_request',
	            channel: 'shell',
	            username: this._username,
	            session: this._clientId
	        };
	        var msg = messages_1.KernelMessage.createShellMessage(options, content);
	        return Private.handleShellMessage(this, msg);
	    };
	    /**
	     * Send a `history_request` message.
	     *
	     * #### Notes
	     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#history).
	     *
	     * Fulfills with the `history_reply` content when the shell reply is
	     * received and validated.
	     */
	    DefaultKernel.prototype.requestHistory = function (content) {
	        var options = {
	            msgType: 'history_request',
	            channel: 'shell',
	            username: this._username,
	            session: this._clientId
	        };
	        var msg = messages_1.KernelMessage.createShellMessage(options, content);
	        return Private.handleShellMessage(this, msg);
	    };
	    /**
	     * Send an `execute_request` message.
	     *
	     * #### Notes
	     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#execute).
	     *
	     * Future `onReply` is called with the `execute_reply` content when the
	     * shell reply is received and validated. The future will resolve when
	     * this message is received and the `idle` iopub status is received.
	     * The future will also be disposed at this point unless `disposeOnDone`
	     * is specified and `false`, in which case it is up to the caller to dispose
	     * of the future.
	     *
	     * **See also:** [[IExecuteReply]]
	     */
	    DefaultKernel.prototype.requestExecute = function (content, disposeOnDone) {
	        if (disposeOnDone === void 0) { disposeOnDone = true; }
	        var options = {
	            msgType: 'execute_request',
	            channel: 'shell',
	            username: this._username,
	            session: this._clientId
	        };
	        var defaults = {
	            silent: false,
	            store_history: true,
	            user_expressions: {},
	            allow_stdin: true,
	            stop_on_error: false
	        };
	        content = utils.extend(defaults, content);
	        var msg = messages_1.KernelMessage.createShellMessage(options, content);
	        return this.sendShellMessage(msg, true, disposeOnDone);
	    };
	    /**
	     * Send an `is_complete_request` message.
	     *
	     * #### Notes
	     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#code-completeness).
	     *
	     * Fulfills with the `is_complete_response` content when the shell reply is
	     * received and validated.
	     */
	    DefaultKernel.prototype.requestIsComplete = function (content) {
	        var options = {
	            msgType: 'is_complete_request',
	            channel: 'shell',
	            username: this._username,
	            session: this._clientId
	        };
	        var msg = messages_1.KernelMessage.createShellMessage(options, content);
	        return Private.handleShellMessage(this, msg);
	    };
	    /**
	     * Send a `comm_info_request` message.
	     *
	     * #### Notes
	     * Fulfills with the `comm_info_reply` content when the shell reply is
	     * received and validated.
	     */
	    DefaultKernel.prototype.requestCommInfo = function (content) {
	        var options = {
	            msgType: 'comm_info_request',
	            channel: 'shell',
	            username: this._username,
	            session: this._clientId
	        };
	        var msg = messages_1.KernelMessage.createShellMessage(options, content);
	        return Private.handleShellMessage(this, msg);
	    };
	    /**
	     * Send an `input_reply` message.
	     *
	     * #### Notes
	     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#messages-on-the-stdin-router-dealer-sockets).
	     */
	    DefaultKernel.prototype.sendInputReply = function (content) {
	        if (this.status === 'dead') {
	            throw new Error('Kernel is dead');
	        }
	        var options = {
	            msgType: 'input_reply',
	            channel: 'stdin',
	            username: this._username,
	            session: this._clientId
	        };
	        var msg = messages_1.KernelMessage.createMessage(options, content);
	        if (!this._isReady) {
	            this._pendingMessages.push(msg);
	        }
	        else {
	            this._ws.send(serialize.serialize(msg));
	        }
	    };
	    /**
	     * Register an IOPub message hook.
	     *
	     * @param msg_id - The parent_header message id the hook will intercept.
	     *
	     * @param hook - The callback invoked for the message.
	     *
	     * @returns A disposable used to unregister the message hook.
	     *
	     * #### Notes
	     * The IOPub hook system allows you to preempt the handlers for IOPub messages with a
	     * given parent_header message id. The most recently registered hook is run first.
	     * If the hook returns false, any later hooks and the future's onIOPub handler will not run.
	     * If a hook throws an error, the error is logged to the console and the next hook is run.
	     * If a hook is registered during the hook processing, it won't run until the next message.
	     * If a hook is disposed during the hook processing, it will be deactivated immediately.
	     *
	     * See also [[IFuture.registerMessageHook]].
	     */
	    DefaultKernel.prototype.registerMessageHook = function (msgId, hook) {
	        var _this = this;
	        var future = this._futures && this._futures.get(msgId);
	        if (future) {
	            future.registerMessageHook(hook);
	        }
	        return new disposable_1.DisposableDelegate(function () {
	            future = _this._futures && _this._futures.get(msgId);
	            if (future) {
	                future.removeMessageHook(hook);
	            }
	        });
	    };
	    /**
	     * Register a comm target handler.
	     *
	     * @param targetName - The name of the comm target.
	     *
	     * @param callback - The callback invoked for a comm open message.
	     *
	     * @returns A disposable used to unregister the comm target.
	     *
	     * #### Notes
	     * Only one comm target can be registered at a time, an existing
	     * callback will be overidden.  A registered comm target handler will take
	     * precedence over a comm which specifies a `target_module`.
	     */
	    DefaultKernel.prototype.registerCommTarget = function (targetName, callback) {
	        var _this = this;
	        this._targetRegistry[targetName] = callback;
	        return new disposable_1.DisposableDelegate(function () {
	            if (!_this.isDisposed) {
	                delete _this._targetRegistry[targetName];
	            }
	        });
	    };
	    /**
	     * Connect to a comm, or create a new one.
	     *
	     * #### Notes
	     * If a client-side comm already exists, it is returned.
	     */
	    DefaultKernel.prototype.connectToComm = function (targetName, commId) {
	        var _this = this;
	        if (commId === void 0) {
	            commId = utils.uuid();
	        }
	        var comm = this._comms.get(commId);
	        if (!comm) {
	            comm = new comm_1.CommHandler(targetName, commId, this, function () { _this._unregisterComm(commId); });
	            this._comms.set(commId, comm);
	        }
	        return comm;
	    };
	    /**
	     * Create the kernel websocket connection and add socket status handlers.
	     */
	    DefaultKernel.prototype._createSocket = function () {
	        var _this = this;
	        var partialUrl = utils.urlPathJoin(this._wsUrl, KERNEL_SERVICE_URL, encodeURIComponent(this._id));
	        // Strip any authentication from the display string.
	        var parsed = utils.urlParse(partialUrl);
	        var display = partialUrl.replace(parsed.auth, '');
	        var url = utils.urlPathJoin(partialUrl, 'channels?session_id=' + encodeURIComponent(this._clientId));
	        // if token authentication is in use
	        if (this._token !== '') {
	            url = url + ("&token=" + encodeURIComponent(this._token));
	        }
	        console.log('Starting websocket', display);
	        this._connectionPromise = new utils.PromiseDelegate();
	        this._ws = new WebSocket(url);
	        // Ensure incoming binary messages are not Blobs
	        this._ws.binaryType = 'arraybuffer';
	        this._ws.onmessage = function (evt) { _this._onWSMessage(evt); };
	        this._ws.onopen = function (evt) { _this._onWSOpen(evt); };
	        this._ws.onclose = function (evt) { _this._onWSClose(evt); };
	        this._ws.onerror = function (evt) { _this._onWSClose(evt); };
	    };
	    /**
	     * Handle a websocket open event.
	     */
	    DefaultKernel.prototype._onWSOpen = function (evt) {
	        var _this = this;
	        this._reconnectAttempt = 0;
	        // Allow the message to get through.
	        this._isReady = true;
	        // Get the kernel info, signaling that the kernel is ready.
	        this.requestKernelInfo().then(function () {
	            _this._connectionPromise.resolve(void 0);
	        }).catch(function (err) {
	            _this._connectionPromise.reject(err);
	        });
	        this._isReady = false;
	    };
	    /**
	     * Handle a websocket message, validating and routing appropriately.
	     */
	    DefaultKernel.prototype._onWSMessage = function (evt) {
	        if (this.status === 'dead') {
	            // If the socket is being closed, ignore any messages
	            return;
	        }
	        var msg = serialize.deserialize(evt.data);
	        try {
	            validate.validateMessage(msg);
	        }
	        catch (error) {
	            console.error("Invalid message: " + error.message);
	            return;
	        }
	        if (msg.parent_header) {
	            var parentHeader = msg.parent_header;
	            var future = this._futures && this._futures.get(parentHeader.msg_id);
	            if (future) {
	                future.handleMsg(msg);
	            }
	            else {
	                // If the message was sent by us and was not iopub, it is orphaned.
	                var owned = parentHeader.session === this.clientId;
	                if (msg.channel !== 'iopub' && owned) {
	                    this.unhandledMessage.emit(msg);
	                }
	            }
	        }
	        if (msg.channel === 'iopub') {
	            switch (msg.header.msg_type) {
	                case 'status':
	                    this._updateStatus(msg.content.execution_state);
	                    break;
	                case 'comm_open':
	                    this._handleCommOpen(msg);
	                    break;
	                case 'comm_msg':
	                    this._handleCommMsg(msg);
	                    break;
	                case 'comm_close':
	                    this._handleCommClose(msg);
	                    break;
	            }
	            this.iopubMessage.emit(msg);
	        }
	    };
	    /**
	     * Handle a websocket close event.
	     */
	    DefaultKernel.prototype._onWSClose = function (evt) {
	        if (this.status === 'dead') {
	            return;
	        }
	        // Clear the websocket event handlers and the socket itself.
	        this._ws.onclose = null;
	        this._ws.onerror = null;
	        this._ws = null;
	        if (this._reconnectAttempt < this._reconnectLimit) {
	            this._updateStatus('reconnecting');
	            var timeout = Math.pow(2, this._reconnectAttempt);
	            console.error('Connection lost, reconnecting in ' + timeout + ' seconds.');
	            setTimeout(this._createSocket.bind(this), 1e3 * timeout);
	            this._reconnectAttempt += 1;
	        }
	        else {
	            this._updateStatus('dead');
	            this._connectionPromise.reject(new Error('Could not establish connection'));
	        }
	    };
	    /**
	     * Handle status iopub messages from the kernel.
	     */
	    DefaultKernel.prototype._updateStatus = function (status) {
	        switch (status) {
	            case 'starting':
	            case 'idle':
	            case 'busy':
	                this._isReady = true;
	                break;
	            case 'restarting':
	            case 'reconnecting':
	            case 'dead':
	                this._isReady = false;
	                break;
	            default:
	                console.error('invalid kernel status:', status);
	                return;
	        }
	        if (status !== this._status) {
	            this._status = status;
	            Private.logKernelStatus(this);
	            this.statusChanged.emit(status);
	            if (status === 'dead') {
	                this.dispose();
	            }
	        }
	        if (this._isReady) {
	            this._sendPending();
	        }
	    };
	    /**
	     * Send pending messages to the kernel.
	     */
	    DefaultKernel.prototype._sendPending = function () {
	        // We shift the message off the queue
	        // after the message is sent so that if there is an exception,
	        // the message is still pending.
	        while (this._pendingMessages.length > 0) {
	            var msg = serialize.serialize(this._pendingMessages[0]);
	            this._ws.send(msg);
	            this._pendingMessages.shift();
	        }
	    };
	    /**
	     * Clear the internal state.
	     */
	    DefaultKernel.prototype._clearState = function () {
	        this._isReady = false;
	        this._pendingMessages = [];
	        this._futures.forEach(function (future, key) {
	            future.dispose();
	        });
	        this._comms.forEach(function (comm, key) {
	            comm.dispose();
	        });
	        this._futures = new Map();
	        this._commPromises = new Map();
	        this._comms = new Map();
	    };
	    /**
	     * Handle a `comm_open` kernel message.
	     */
	    DefaultKernel.prototype._handleCommOpen = function (msg) {
	        var _this = this;
	        var content = msg.content;
	        var promise = utils.loadObject(content.target_name, content.target_module, this._targetRegistry).then(function (target) {
	            var comm = new comm_1.CommHandler(content.target_name, content.comm_id, _this, function () { _this._unregisterComm(content.comm_id); });
	            var response;
	            try {
	                response = target(comm, msg);
	            }
	            catch (e) {
	                comm.close();
	                console.error('Exception opening new comm');
	                throw (e);
	            }
	            return Promise.resolve(response).then(function () {
	                _this._commPromises.delete(comm.commId);
	                _this._comms.set(comm.commId, comm);
	                return comm;
	            });
	        });
	        this._commPromises.set(content.comm_id, promise);
	    };
	    /**
	     * Handle 'comm_close' kernel message.
	     */
	    DefaultKernel.prototype._handleCommClose = function (msg) {
	        var _this = this;
	        var content = msg.content;
	        var promise = this._commPromises.get(content.comm_id);
	        if (!promise) {
	            var comm = this._comms.get(content.comm_id);
	            if (!comm) {
	                console.error('Comm not found for comm id ' + content.comm_id);
	                return;
	            }
	            promise = Promise.resolve(comm);
	        }
	        promise.then(function (comm) {
	            _this._unregisterComm(comm.commId);
	            try {
	                var onClose = comm.onClose;
	                if (onClose) {
	                    onClose(msg);
	                }
	                comm.dispose();
	            }
	            catch (e) {
	                console.error('Exception closing comm: ', e, e.stack, msg);
	            }
	        });
	    };
	    /**
	     * Handle a 'comm_msg' kernel message.
	     */
	    DefaultKernel.prototype._handleCommMsg = function (msg) {
	        var content = msg.content;
	        var promise = this._commPromises.get(content.comm_id);
	        if (!promise) {
	            var comm = this._comms.get(content.comm_id);
	            if (!comm) {
	                // We do have a registered comm for this comm id, ignore.
	                return;
	            }
	            else {
	                var onMsg = comm.onMsg;
	                if (onMsg) {
	                    onMsg(msg);
	                }
	            }
	        }
	        else {
	            promise.then(function (comm) {
	                try {
	                    var onMsg = comm.onMsg;
	                    if (onMsg) {
	                        onMsg(msg);
	                    }
	                }
	                catch (e) {
	                    console.error('Exception handling comm msg: ', e, e.stack, msg);
	                }
	                return comm;
	            });
	        }
	    };
	    /**
	     * Unregister a comm instance.
	     */
	    DefaultKernel.prototype._unregisterComm = function (commId) {
	        this._comms.delete(commId);
	        this._commPromises.delete(commId);
	    };
	    return DefaultKernel;
	}());
	exports.DefaultKernel = DefaultKernel;
	// Define the signals for the `DefaultKernel` class.
	signaling_1.defineSignal(DefaultKernel.prototype, 'terminated');
	signaling_1.defineSignal(DefaultKernel.prototype, 'statusChanged');
	signaling_1.defineSignal(DefaultKernel.prototype, 'iopubMessage');
	signaling_1.defineSignal(DefaultKernel.prototype, 'unhandledMessage');
	/**
	 * The namespace for `DefaultKernel` statics.
	 */
	var DefaultKernel;
	(function (DefaultKernel) {
	    /**
	     * Find a kernel by id.
	     *
	     * #### Notes
	     * If the kernel was already started via `startNewKernel`, we return its
	     * `Kernel.IModel`.
	     *
	     * Otherwise, if `options` are given, we attempt to find the existing
	     * kernel.
	     * The promise is fulfilled when the kernel is found,
	     * otherwise the promise is rejected.
	     */
	    function findById(id, options) {
	        return Private.findById(id, options);
	    }
	    DefaultKernel.findById = findById;
	    /**
	     * Fetch all of the kernel specs.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernelspecs).
	     */
	    function getSpecs(options) {
	        if (options === void 0) { options = {}; }
	        return Private.getSpecs(options);
	    }
	    DefaultKernel.getSpecs = getSpecs;
	    /**
	     * Fetch the running kernels.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     */
	    function listRunning(options) {
	        if (options === void 0) { options = {}; }
	        return Private.listRunning(options);
	    }
	    DefaultKernel.listRunning = listRunning;
	    /**
	     * Start a new kernel.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
	     *
	     * If no options are given or the kernel name is not given, the
	     * default kernel will by started by the server.
	     *
	     * Wraps the result in a Kernel object. The promise is fulfilled
	     * when the kernel is started by the server, otherwise the promise is rejected.
	     */
	    function startNew(options) {
	        options = options || {};
	        return Private.startNew(options);
	    }
	    DefaultKernel.startNew = startNew;
	    /**
	     * Connect to a running kernel.
	     *
	     * #### Notes
	     * If the kernel was already started via `startNewKernel`, the existing
	     * Kernel object info is used to create another instance.
	     *
	     * Otherwise, if `options` are given, we attempt to connect to the existing
	     * kernel found by calling `listRunningKernels`.
	     * The promise is fulfilled when the kernel is running on the server,
	     * otherwise the promise is rejected.
	     *
	     * If the kernel was not already started and no `options` are given,
	     * the promise is rejected.
	     */
	    function connectTo(id, options) {
	        return Private.connectTo(id, options);
	    }
	    DefaultKernel.connectTo = connectTo;
	    /**
	     * Shut down a kernel by id.
	     */
	    function shutdown(id, options) {
	        if (options === void 0) { options = {}; }
	        return Private.shutdown(id, options);
	    }
	    DefaultKernel.shutdown = shutdown;
	})(DefaultKernel = exports.DefaultKernel || (exports.DefaultKernel = {}));
	/**
	 * A private namespace for the Kernel.
	 */
	var Private;
	(function (Private) {
	    /**
	     * A module private store for running kernels.
	     */
	    Private.runningKernels = new vector_1.Vector();
	    /**
	     * A module private store of kernel specs by base url.
	     */
	    Private.specs = Object.create(null);
	    /**
	     * Find a kernel by id.
	     */
	    function findById(id, options) {
	        var kernel = searching_1.find(Private.runningKernels, function (value) {
	            return (value.id === id);
	        });
	        if (kernel) {
	            return Promise.resolve(kernel.model);
	        }
	        return getKernelModel(id, options).catch(function () {
	            throw new Error("No running kernel with id: " + id);
	        });
	    }
	    Private.findById = findById;
	    /**
	     * Get the cached kernel specs or fetch them.
	     */
	    function findSpecs(options) {
	        var promise = Private.specs[options.baseUrl];
	        if (promise) {
	            return promise;
	        }
	        return getSpecs(options);
	    }
	    Private.findSpecs = findSpecs;
	    /**
	     * Fetch all of the kernel specs.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernelspecs).
	     */
	    function getSpecs(options) {
	        if (options === void 0) { options = {}; }
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var url = utils.urlPathJoin(baseUrl, KERNELSPEC_SERVICE_URL);
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'GET';
	        ajaxSettings.dataType = 'json';
	        var promise = utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            try {
	                return validate.validateSpecModels(success.data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	        });
	        Private.specs[baseUrl] = promise;
	        return promise;
	    }
	    Private.getSpecs = getSpecs;
	    /**
	     * Fetch the running kernels.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     */
	    function listRunning(options) {
	        if (options === void 0) { options = {}; }
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var url = utils.urlPathJoin(baseUrl, KERNEL_SERVICE_URL);
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'GET';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            if (!Array.isArray(success.data)) {
	                return utils.makeAjaxError(success, 'Invalid kernel list');
	            }
	            for (var i = 0; i < success.data.length; i++) {
	                try {
	                    validate.validateModel(success.data[i]);
	                }
	                catch (err) {
	                    return utils.makeAjaxError(success, err.message);
	                }
	            }
	            return updateRunningKernels(success.data);
	        }, onKernelError);
	    }
	    Private.listRunning = listRunning;
	    /**
	     * Update the running kernels based on new data from the server.
	     */
	    function updateRunningKernels(kernels) {
	        iteration_1.each(Private.runningKernels, function (kernel) {
	            var updated = searching_1.find(kernels, function (model) {
	                if (kernel.id === model.id) {
	                    return true;
	                }
	            });
	            // If kernel is no longer running on disk, emit dead signal.
	            if (!updated && kernel.status !== 'dead') {
	                kernel.terminated.emit(void 0);
	                kernel.dispose();
	            }
	        });
	        return kernels;
	    }
	    Private.updateRunningKernels = updateRunningKernels;
	    /**
	     * Start a new kernel.
	     */
	    function startNew(options) {
	        options = options || {};
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var url = utils.urlPathJoin(baseUrl, KERNEL_SERVICE_URL);
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'POST';
	        ajaxSettings.data = JSON.stringify({ name: options.name });
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.contentType = 'application/json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 201) {
	                return utils.makeAjaxError(success);
	            }
	            validate.validateModel(success.data);
	            options = utils.copy(options);
	            options.name = success.data.name;
	            return new DefaultKernel(options, success.data.id);
	        }, onKernelError);
	    }
	    Private.startNew = startNew;
	    /**
	     * Connect to a running kernel.
	     *
	     * #### Notes
	     * If the kernel was already started via `startNewKernel`, the existing
	     * Kernel object info is used to create another instance.
	     *
	     * Otherwise, if `options` are given, we attempt to connect to the existing
	     * kernel found by calling `listRunningKernels`.
	     * The promise is fulfilled when the kernel is running on the server,
	     * otherwise the promise is rejected.
	     *
	     * If the kernel was not already started and no `options` are given,
	     * the promise is rejected.
	     */
	    function connectTo(id, options) {
	        var kernel = searching_1.find(Private.runningKernels, function (value) {
	            return value.id === id;
	        });
	        if (kernel) {
	            return Promise.resolve(kernel.clone());
	        }
	        return getKernelModel(id, options).then(function (model) {
	            options = utils.copy(options);
	            options.name = model.name;
	            return new DefaultKernel(options, id);
	        }).catch(function () {
	            throw new Error("No running kernel with id: " + id);
	        });
	    }
	    Private.connectTo = connectTo;
	    /**
	     * Shut down a kernel by id.
	     */
	    function shutdown(id, options) {
	        if (options === void 0) { options = {}; }
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        return shutdownKernel(id, baseUrl, ajaxSettings);
	    }
	    Private.shutdown = shutdown;
	    /**
	     * Restart a kernel.
	     */
	    function restartKernel(kernel, baseUrl, ajaxSettings) {
	        if (kernel.status === 'dead') {
	            return Promise.reject(new Error('Kernel is dead'));
	        }
	        var url = utils.urlPathJoin(baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(kernel.id), 'restart');
	        ajaxSettings = ajaxSettings || {};
	        ajaxSettings.method = 'POST';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.contentType = 'application/json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            try {
	                validate.validateModel(success.data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	        }, onKernelError);
	    }
	    Private.restartKernel = restartKernel;
	    /**
	     * Interrupt a kernel.
	     */
	    function interruptKernel(kernel, baseUrl, ajaxSettings) {
	        if (kernel.status === 'dead') {
	            return Promise.reject(new Error('Kernel is dead'));
	        }
	        var url = utils.urlPathJoin(baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(kernel.id), 'interrupt');
	        ajaxSettings = ajaxSettings || {};
	        ajaxSettings.method = 'POST';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.contentType = 'application/json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 204) {
	                return utils.makeAjaxError(success);
	            }
	        }, onKernelError);
	    }
	    Private.interruptKernel = interruptKernel;
	    /**
	     * Delete a kernel.
	     */
	    function shutdownKernel(id, baseUrl, ajaxSettings) {
	        var url = utils.urlPathJoin(baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(id));
	        ajaxSettings = ajaxSettings || {};
	        ajaxSettings.method = 'DELETE';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 204) {
	                return utils.makeAjaxError(success);
	            }
	            killKernels(id);
	        }, function (error) {
	            if (error.xhr.status === 404) {
	                var response = JSON.parse(error.xhr.responseText);
	                console.warn(response['message']);
	                killKernels(id);
	            }
	            else {
	                return onKernelError(error);
	            }
	        });
	    }
	    Private.shutdownKernel = shutdownKernel;
	    /**
	     * Kill the kernels by id.
	     */
	    function killKernels(id) {
	        iteration_1.each(iteration_1.toArray(Private.runningKernels), function (kernel) {
	            if (kernel.id === id) {
	                kernel.terminated.emit(void 0);
	                kernel.dispose();
	            }
	        });
	    }
	    /**
	     * Get a full kernel model from the server by kernel id string.
	     */
	    function getKernelModel(id, options) {
	        options = options || {};
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var url = utils.urlPathJoin(baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(id));
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'GET';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            var data = success.data;
	            try {
	                validate.validateModel(data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            return data;
	        }, Private.onKernelError);
	    }
	    Private.getKernelModel = getKernelModel;
	    /**
	     * Log the current kernel status.
	     */
	    function logKernelStatus(kernel) {
	        switch (kernel.status) {
	            case 'idle':
	            case 'busy':
	            case 'unknown':
	                return;
	            default:
	                console.log("Kernel: " + kernel.status + " (" + kernel.id + ")");
	                break;
	        }
	    }
	    Private.logKernelStatus = logKernelStatus;
	    /**
	     * Handle an error on a kernel Ajax call.
	     */
	    function onKernelError(error) {
	        var text = (error.throwError ||
	            error.xhr.statusText ||
	            error.xhr.responseText);
	        var msg = "API request failed: " + text;
	        console.error(msg);
	        return Promise.reject(error);
	    }
	    Private.onKernelError = onKernelError;
	    /**
	     * Send a kernel message to the kernel and resolve the reply message.
	     */
	    function handleShellMessage(kernel, msg) {
	        var future;
	        try {
	            future = kernel.sendShellMessage(msg, true);
	        }
	        catch (e) {
	            return Promise.reject(e);
	        }
	        return new Promise(function (resolve, reject) {
	            future.onReply = function (reply) {
	                resolve(reply);
	            };
	        });
	    }
	    Private.handleShellMessage = handleShellMessage;
	})(Private || (Private = {}));


/***/ },
/* 28 */
/***/ function(module, exports) {

	/*-----------------------------------------------------------------------------
	| Copyright (c) 2014-2016, PhosphorJS Contributors
	|
	| Distributed under the terms of the BSD 3-Clause License.
	|
	| The full license is in the file LICENSE, distributed with this software.
	|----------------------------------------------------------------------------*/
	"use strict";
	/**
	 * Create an iterator for an iterable or array-like object.
	 *
	 * @param object - The iterable or array-like object of interest.
	 *
	 * @returns A new iterator for the given object.
	 *
	 * #### Notes
	 * This function allows iteration algorithms to operate on user-defined
	 * iterable types and builtin array-like objects in a uniform fashion.
	 */
	function iter(object) {
	    var it;
	    if (typeof object.iter === 'function') {
	        it = object.iter();
	    }
	    else {
	        it = new ArrayIterator(object, 0);
	    }
	    return it;
	}
	exports.iter = iter;
	/**
	 * Create an array from an iterable of values.
	 *
	 * @param object - The iterable or array-like object of interest.
	 *
	 * @returns A new array of values from the given object.
	 */
	function toArray(object) {
	    var value;
	    var result = [];
	    var it = iter(object);
	    while ((value = it.next()) !== void 0) {
	        result[result.length] = value;
	    }
	    return result;
	}
	exports.toArray = toArray;
	/**
	 * Create an empty iterator.
	 *
	 * @returns A new iterator which yields nothing.
	 */
	function empty() {
	    return new EmptyIterator();
	}
	exports.empty = empty;
	/**
	 * An iterator which is always empty.
	 */
	var EmptyIterator = (function () {
	    /**
	     * Construct a new empty iterator.
	     */
	    function EmptyIterator() {
	    }
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A reference to `this` iterator.
	     */
	    EmptyIterator.prototype.iter = function () {
	        return this;
	    };
	    /**
	     * Create an independent clone of the current iterator.
	     *
	     * @returns A new independent clone of the current iterator.
	     */
	    EmptyIterator.prototype.clone = function () {
	        return new EmptyIterator();
	    };
	    /**
	     * Get the next value from the iterator.
	     *
	     * @returns Always `undefined`.
	     */
	    EmptyIterator.prototype.next = function () {
	        return void 0;
	    };
	    return EmptyIterator;
	}());
	exports.EmptyIterator = EmptyIterator;
	/**
	 * An iterator for an array-like object.
	 *
	 * #### Notes
	 * This iterator can be used for any builtin JS array-like object.
	 */
	var ArrayIterator = (function () {
	    /**
	     * Construct a new array iterator.
	     *
	     * @param source - The array-like object of interest.
	     *
	     * @param start - The starting index for iteration.
	     */
	    function ArrayIterator(source, start) {
	        this._source = source;
	        this._index = start;
	    }
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A reference to `this` iterator.
	     */
	    ArrayIterator.prototype.iter = function () {
	        return this;
	    };
	    /**
	     * Create an independent clone of the current iterator.
	     *
	     * @returns A new independent clone of the current iterator.
	     *
	     * #### Notes
	     * The source array is shared among clones.
	     */
	    ArrayIterator.prototype.clone = function () {
	        return new ArrayIterator(this._source, this._index);
	    };
	    /**
	     * Get the next value from the source array.
	     *
	     * @returns The next value from the source array, or `undefined`
	     *   if the iterator is exhausted.
	     */
	    ArrayIterator.prototype.next = function () {
	        if (this._index >= this._source.length) {
	            return void 0;
	        }
	        return this._source[this._index++];
	    };
	    return ArrayIterator;
	}());
	exports.ArrayIterator = ArrayIterator;
	/**
	 * Invoke a function for each value in an iterable.
	 *
	 * @param object - The iterable or array-like object of interest.
	 *
	 * @param fn - The callback function to invoke for each value.
	 *
	 * #### Notes
	 * Iteration cannot be terminated early.
	 */
	function each(object, fn) {
	    var value;
	    var it = iter(object);
	    while ((value = it.next()) !== void 0) {
	        fn(value);
	    }
	}
	exports.each = each;
	/**
	 * Test whether all values in an iterable satisfy a predicate.
	 *
	 * @param object - The iterable or array-like object of interest.
	 *
	 * @param fn - The predicate function to invoke for each value.
	 *
	 * @returns `true` if all values pass the test, `false` otherwise.
	 *
	 * #### Notes
	 * Iteration terminates on the first `false` predicate result.
	 */
	function every(object, fn) {
	    var value;
	    var it = iter(object);
	    while ((value = it.next()) !== void 0) {
	        if (!fn(value)) {
	            return false;
	        }
	    }
	    return true;
	}
	exports.every = every;
	/**
	 * Test whether any value in an iterable satisfies a predicate.
	 *
	 * @param object - The iterable or array-like object of interest.
	 *
	 * @param fn - The predicate function to invoke for each value.
	 *
	 * @returns `true` if any value passes the test, `false` otherwise.
	 *
	 * #### Notes
	 * Iteration terminates on the first `true` predicate result.
	 */
	function some(object, fn) {
	    var value;
	    var it = iter(object);
	    while ((value = it.next()) !== void 0) {
	        if (fn(value)) {
	            return true;
	        }
	    }
	    return false;
	}
	exports.some = some;
	function reduce(object, fn, initial) {
	    // Setup the iterator and fetch the first value.
	    var it = iter(object);
	    var first = it.next();
	    // An empty iterator and no initial value is an error.
	    if (first === void 0 && initial === void 0) {
	        throw new TypeError('Reduce of empty iterable with no initial value.');
	    }
	    // If the iterator is empty, return the initial value.
	    if (first === void 0) {
	        return initial;
	    }
	    // If the iterator has a single item and no initial value, the
	    // reducer is not invoked and the first item is the return value.
	    var second = it.next();
	    if (second === void 0 && initial === void 0) {
	        return first;
	    }
	    // If iterator has a single item and an initial value is provided,
	    // the reducer is invoked and that result is the return value.
	    if (second === void 0) {
	        return fn(initial, first);
	    }
	    // Setup the initial accumulator value.
	    var accumulator;
	    if (initial === void 0) {
	        accumulator = fn(first, second);
	    }
	    else {
	        accumulator = fn(fn(initial, first), second);
	    }
	    // Iterate the rest of the values, updating the accumulator.
	    var next;
	    while ((next = it.next()) !== void 0) {
	        accumulator = fn(accumulator, next);
	    }
	    // Return the final accumulated value.
	    return accumulator;
	}
	exports.reduce = reduce;
	/**
	 * Filter an iterable for values which pass a test.
	 *
	 * @param object - The iterable or array-like object of interest.
	 *
	 * @param fn - The predicate function to invoke for each value.
	 *
	 * @returns An iterator which yields the values which pass the test.
	 */
	function filter(object, fn) {
	    return new FilterIterator(iter(object), fn);
	}
	exports.filter = filter;
	/**
	 * An iterator which yields values which pass a test.
	 */
	var FilterIterator = (function () {
	    /**
	     * Construct a new filter iterator.
	     *
	     * @param source - The iterator of values of interest.
	     *
	     * @param fn - The predicate function to invoke for each value in
	     *   the iterator. It returns whether the value passes the test.
	     */
	    function FilterIterator(source, fn) {
	        this._source = source;
	        this._fn = fn;
	    }
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A reference to `this` iterator.
	     */
	    FilterIterator.prototype.iter = function () {
	        return this;
	    };
	    /**
	     * Create an independent clone of the current iterator.
	     *
	     * @returns A new independent clone of the current iterator.
	     *
	     * #### Notes
	     * The source iterator must be cloneable.
	     *
	     * The predicate function is shared among clones.
	     */
	    FilterIterator.prototype.clone = function () {
	        return new FilterIterator(this._source.clone(), this._fn);
	    };
	    /**
	     * Get the next value which passes the test.
	     *
	     * @returns The next value from the source iterator which passes
	     *   the predicate, or `undefined` if the iterator is exhausted.
	     */
	    FilterIterator.prototype.next = function () {
	        var value;
	        var fn = this._fn;
	        var it = this._source;
	        while ((value = it.next()) !== void 0) {
	            if (fn(value)) {
	                return value;
	            }
	        }
	        return void 0;
	    };
	    return FilterIterator;
	}());
	exports.FilterIterator = FilterIterator;
	/**
	 * Transform the values of an iterable with a mapping function.
	 *
	 * @param object - The iterable or array-like object of interest.
	 *
	 * @param fn - The mapping function to invoke for each value.
	 *
	 * @returns An iterator which yields the transformed values.
	 */
	function map(object, fn) {
	    return new MapIterator(iter(object), fn);
	}
	exports.map = map;
	/**
	 * An iterator which transforms values using a mapping function.
	 */
	var MapIterator = (function () {
	    /**
	     * Construct a new map iterator.
	     *
	     * @param source - The iterator of values of interest.
	     *
	     * @param fn - The mapping function to invoke for each value in the
	     *   iterator. It returns the transformed value.
	     */
	    function MapIterator(source, fn) {
	        this._source = source;
	        this._fn = fn;
	    }
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A reference to `this` iterator.
	     */
	    MapIterator.prototype.iter = function () {
	        return this;
	    };
	    /**
	     * Create an independent clone of the current iterator.
	     *
	     * @returns A new independent clone of the current iterator.
	     *
	     * #### Notes
	     * The source iterator must be cloneable.
	     *
	     * The mapping function is shared among clones.
	     */
	    MapIterator.prototype.clone = function () {
	        return new MapIterator(this._source.clone(), this._fn);
	    };
	    /**
	     * Get the next mapped value from the source iterator.
	     *
	     * @returns The next value from the source iterator transformed
	     *   by the mapper, or `undefined` if the iterator is exhausted.
	     */
	    MapIterator.prototype.next = function () {
	        var value = this._source.next();
	        if (value === void 0) {
	            return void 0;
	        }
	        return this._fn.call(void 0, value);
	    };
	    return MapIterator;
	}());
	exports.MapIterator = MapIterator;
	/**
	 * Attach an incremental index to an iterable.
	 *
	 * @param object - The iterable or array-like object of interest.
	 *
	 * @param start - The initial value of the index. The default is zero.
	 *
	 * @returns An iterator which yields `[index, value]` tuples.
	 */
	function enumerate(object, start) {
	    if (start === void 0) { start = 0; }
	    return new EnumerateIterator(iter(object), start);
	}
	exports.enumerate = enumerate;
	/**
	 * An iterator which attaches an incremental index to a source.
	 */
	var EnumerateIterator = (function () {
	    /**
	     * Construct a new enumerate iterator.
	     *
	     * @param source - The iterator of values of interest.
	     *
	     * @param start - The initial value of the index.
	     */
	    function EnumerateIterator(source, start) {
	        this._source = source;
	        this._index = start;
	    }
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A reference to `this` iterator.
	     */
	    EnumerateIterator.prototype.iter = function () {
	        return this;
	    };
	    /**
	     * Create an independent clone of the enumerate iterator.
	     *
	     * @returns A new iterator starting with the current value.
	     *
	     * #### Notes
	     * The source iterator must be cloneable.
	     */
	    EnumerateIterator.prototype.clone = function () {
	        return new EnumerateIterator(this._source.clone(), this._index);
	    };
	    /**
	     * Get the next value from the enumeration.
	     *
	     * @returns The next value from the enumeration, or `undefined` if
	     *   the iterator is exhausted.
	     */
	    EnumerateIterator.prototype.next = function () {
	        var value = this._source.next();
	        if (value === void 0) {
	            return void 0;
	        }
	        return [this._index++, value];
	    };
	    return EnumerateIterator;
	}());
	exports.EnumerateIterator = EnumerateIterator;
	/**
	 * Create an iterator which yields a value a single time.
	 *
	 * @param value - The value to wrap in an iterator.
	 *
	 * @returns A new iterator which yields the value a single time.
	 */
	function once(value) {
	    return new RepeatIterator(value, 1);
	}
	exports.once = once;
	/**
	 * Create an iterator which repeats a value a number of times.
	 *
	 * @param value - The value to repeat.
	 *
	 * @param count - The number of times to repeat the value.
	 *
	 * @returns A new iterator which repeats the specified value.
	 */
	function repeat(value, count) {
	    return new RepeatIterator(value, count);
	}
	exports.repeat = repeat;
	/**
	 * An iterator which repeats a value a specified number of times.
	 */
	var RepeatIterator = (function () {
	    /**
	     * Construct a new repeat iterator.
	     *
	     * @param value - The value to repeat.
	     *
	     * @param count - The number of times to repeat the value.
	     */
	    function RepeatIterator(value, count) {
	        this._value = value;
	        this._count = count;
	    }
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A reference to `this` iterator.
	     */
	    RepeatIterator.prototype.iter = function () {
	        return this;
	    };
	    /**
	     * Create an independent clone of the repeat iterator.
	     *
	     * @returns A new iterator starting with the current value.
	     */
	    RepeatIterator.prototype.clone = function () {
	        return new RepeatIterator(this._value, this._count);
	    };
	    /**
	     * Get the next value from the iterator.
	     *
	     * @returns The next value from the iterator, or `undefined` if
	     *   the iterator is exhausted.
	     */
	    RepeatIterator.prototype.next = function () {
	        if (this._count <= 0) {
	            return void 0;
	        }
	        this._count--;
	        return this._value;
	    };
	    return RepeatIterator;
	}());
	exports.RepeatIterator = RepeatIterator;
	/**
	 * Chain together several iterables.
	 *
	 * @param objects - The iterables or array-like objects of interest.
	 *
	 * @returns An iterator which yields the values of the given iterables
	 *   in the order in which they are supplied.
	 */
	function chain() {
	    var objects = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        objects[_i - 0] = arguments[_i];
	    }
	    return new ChainIterator(map(objects, iter));
	}
	exports.chain = chain;
	/**
	 * An iterator which chains together several iterators.
	 */
	var ChainIterator = (function () {
	    /**
	     * Construct a new chain iterator.
	     *
	     * @param source - The iterator of iterators of interest.
	     */
	    function ChainIterator(source) {
	        this._cloned = false;
	        this._source = source;
	        this._active = void 0;
	    }
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A reference to `this` iterator.
	     */
	    ChainIterator.prototype.iter = function () {
	        return this;
	    };
	    /**
	     * Create an independent clone of the chain iterator.
	     *
	     * @returns A new iterator starting with the current value.
	     *
	     * #### Notes
	     * The source iterators must be cloneable.
	     */
	    ChainIterator.prototype.clone = function () {
	        var result = new ChainIterator(this._source.clone());
	        result._active = this._active && this._active.clone();
	        result._cloned = true;
	        this._cloned = true;
	        return result;
	    };
	    /**
	     * Get the next value from the iterator.
	     *
	     * @returns The next value from the iterator, or `undefined` when
	     *   all source iterators are exhausted.
	     */
	    ChainIterator.prototype.next = function () {
	        if (this._active === void 0) {
	            this._active = this._source.next();
	            if (this._active === void 0) {
	                return void 0;
	            }
	            if (this._cloned) {
	                this._active = this._active.clone();
	            }
	        }
	        var value = this._active.next();
	        if (value !== void 0) {
	            return value;
	        }
	        this._active = void 0;
	        return this.next();
	    };
	    return ChainIterator;
	}());
	exports.ChainIterator = ChainIterator;
	/**
	 * Iterate several iterables in lockstep.
	 *
	 * @param objects - The iterables or array-like objects of interest.
	 *
	 * @returns An iterator which yields successive tuples of values where
	 *   each value is taken in turn from the provided iterables. It will
	 *   be as long as the shortest provided iterable.
	 */
	function zip() {
	    var objects = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        objects[_i - 0] = arguments[_i];
	    }
	    return new ZipIterator(objects.map(iter));
	}
	exports.zip = zip;
	/**
	 * An iterator which iterates several sources in lockstep.
	 */
	var ZipIterator = (function () {
	    /**
	     * Construct a new zip iterator.
	     *
	     * @param source - The iterators of interest.
	     */
	    function ZipIterator(source) {
	        this._source = source;
	    }
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A reference to `this` iterator.
	     */
	    ZipIterator.prototype.iter = function () {
	        return this;
	    };
	    /**
	     * Create an independent clone of the zip iterator.
	     *
	     * @returns A new iterator starting with the current value.
	     *
	     * #### Notes
	     * The source iterators must be cloneable.
	     */
	    ZipIterator.prototype.clone = function () {
	        return new ZipIterator(this._source.map(function (it) { return it.clone(); }));
	    };
	    /**
	     * Get the next zipped value from the iterator.
	     *
	     * @returns The next zipped value from the iterator, or `undefined`
	     *   when the first source iterator is exhausted.
	     */
	    ZipIterator.prototype.next = function () {
	        var iters = this._source;
	        var result = new Array(iters.length);
	        for (var i = 0, n = iters.length; i < n; ++i) {
	            var value = iters[i].next();
	            if (value === void 0) {
	                return void 0;
	            }
	            result[i] = value;
	        }
	        return result;
	    };
	    return ZipIterator;
	}());
	exports.ZipIterator = ZipIterator;
	/**
	 * Iterate over an iterable using a stepped increment.
	 *
	 * @param object - The iterable or array-like object of interest.
	 *
	 * @param step - The distance to step on each iteration. A value
	 *   of less than `1` will behave the same as a value of `1`.
	 *
	 * @returns An iterator which traverses the iterable step-wise.
	 */
	function stride(object, step) {
	    return new StrideIterator(iter(object), step);
	}
	exports.stride = stride;
	/**
	 * An iterator which traverses a source iterator step-wise.
	 */
	var StrideIterator = (function () {
	    /**
	     * Construct a new stride iterator.
	     *
	     * @param source - The iterator of values of interest.
	     *
	     * @param step - The distance to step on each iteration. A value
	     *   of less than `1` will behave the same as a value of `1`.
	     */
	    function StrideIterator(source, step) {
	        this._source = source;
	        this._step = step;
	    }
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A reference to `this` iterator.
	     */
	    StrideIterator.prototype.iter = function () {
	        return this;
	    };
	    /**
	     * Create an independent clone of the stride iterator.
	     *
	     * @returns A new iterator starting with the current value.
	     *
	     * #### Notes
	     * The source iterator must be cloneable.
	     */
	    StrideIterator.prototype.clone = function () {
	        return new StrideIterator(this._source.clone(), this._step);
	    };
	    /**
	     * Get the next stepped value from the iterator.
	     *
	     * @returns The next stepped value from the iterator, or `undefined`
	     *   when the source iterator is exhausted.
	     */
	    StrideIterator.prototype.next = function () {
	        var value = this._source.next();
	        if (value === void 0) {
	            return void 0;
	        }
	        var step = this._step;
	        while (--step > 0) {
	            this._source.next();
	        }
	        return value;
	    };
	    return StrideIterator;
	}());
	exports.StrideIterator = StrideIterator;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*-----------------------------------------------------------------------------
	| Copyright (c) 2014-2016, PhosphorJS Contributors
	|
	| Distributed under the terms of the BSD 3-Clause License.
	|
	| The full license is in the file LICENSE, distributed with this software.
	|----------------------------------------------------------------------------*/
	var iteration_1 = __webpack_require__(28);
	var sequence_1 = __webpack_require__(30);
	/**
	 * Find the first value in an iterable which matches a predicate.
	 *
	 * @param object - The iterable or array-like object to search.
	 *
	 * @param fn - The predicate function to apply to the values.
	 *
	 * @returns The first matching value, or `undefined` if no matching
	 *   value is found.
	 *
	 * #### Complexity
	 * Linear.
	 *
	 * #### Example
	 * ```typescript
	 * import { find } from 'phosphor/lib/algorithm/searching';
	 *
	 * interface IAnimal { species: string, name: string };
	 *
	 * function isCat(value: IAnimal): boolean {
	 *   return value.species === 'cat';
	 * }
	 *
	 * let data: IAnimal[] = [
	 *   { species: 'dog', name: 'spot' },
	 *   { species: 'cat', name: 'fluffy' },
	 *   { species: 'alligator', name: 'pocho' },
	 * ];
	 *
	 * find(data, isCat).name;  // 'fluffy'
	 * ```
	 */
	function find(object, fn) {
	    var value;
	    var it = iteration_1.iter(object);
	    while ((value = it.next()) !== void 0) {
	        if (fn(value)) {
	            return value;
	        }
	    }
	    return void 0;
	}
	exports.find = find;
	/**
	 * Test whether an iterable contains a specific value.
	 *
	 * @param object - The iterable or array-like object to search.
	 *
	 * @param value - The value to search for in the iterable. Values
	 *   are compared using strict `===` equality.
	 *
	 * @returns `true` if the value is found, `false` otherwise.
	 *
	 * #### Complexity
	 * Linear.
	 *
	 * #### Example
	 * ```typescript
	 * import { contains } from 'phosphor/lib/algorithm/searching';
	 *
	 * let data: number[] = [5, 7, 0, -2, 9];
	 *
	 * contains(data, -2);  // true
	 * contains(data, 3);   // false
	 * ```
	 */
	function contains(object, value) {
	    var temp;
	    var it = iteration_1.iter(object);
	    while ((temp = it.next()) !== void 0) {
	        if (temp === value) {
	            return true;
	        }
	    }
	    return false;
	}
	exports.contains = contains;
	/**
	 * Find the minimum value in an iterable.
	 *
	 * @param object - The iterable or array-like object to search.
	 *
	 * @param fn - The 3-way comparison function to apply to the values.
	 *   It should return `< 0` if the first value is less than the second.
	 *   `0` if the values are equivalent, or `> 0` if the first value is
	 *   greater than the second.
	 *
	 * @returns The minimum value in the iterable. If multiple values are
	 *   equivalent to the minimum, the left-most value is returned. If
	 *   the iterable is empty, this returns `undefined`.
	 *
	 * #### Complexity
	 * Linear.
	 *
	 * #### Example
	 * ```typescript
	 * import { min } from 'phosphor/lib/algorithm/searching';
	 *
	 * function numberCmp(a: number, b: number): number {
	 *   return a - b;
	 * }
	 *
	 * min([7, 4, 0, 3, 9, 4], numberCmp);  // 0
	 * ```
	 */
	function min(object, fn) {
	    var it = iteration_1.iter(object);
	    var result = it.next();
	    if (result === void 0) {
	        return void 0;
	    }
	    var value;
	    while ((value = it.next()) !== void 0) {
	        if (fn(value, result) < 0) {
	            result = value;
	        }
	    }
	    return result;
	}
	exports.min = min;
	/**
	 * Find the maximum value in an iterable.
	 *
	 * @param object - The iterable or array-like object to search.
	 *
	 * @param fn - The 3-way comparison function to apply to the values.
	 *   It should return `< 0` if the first value is less than the second.
	 *   `0` if the values are equivalent, or `> 0` if the first value is
	 *   greater than the second.
	 *
	 * @returns The maximum value in the iterable. If multiple values are
	 *   equivalent to the maximum, the left-most value is returned. If
	 *   the iterable is empty, this returns `undefined`.
	 *
	 * #### Complexity
	 * Linear.
	 *
	 * #### Example
	 * ```typescript
	 * import { max } from 'phosphor/lib/algorithm/searching';
	 *
	 * function numberCmp(a: number, b: number): number {
	 *   return a - b;
	 * }
	 *
	 * max([7, 4, 0, 3, 9, 4], numberCmp);  // 9
	 * ```
	 */
	function max(object, fn) {
	    var it = iteration_1.iter(object);
	    var result = it.next();
	    if (result === void 0) {
	        return void 0;
	    }
	    var value;
	    while ((value = it.next()) !== void 0) {
	        if (fn(value, result) > 0) {
	            result = value;
	        }
	    }
	    return result;
	}
	exports.max = max;
	/**
	 * Find the index of the first occurrence of a value in a sequence.
	 *
	 * @param object - The sequence or array-like object to search.
	 *
	 * @param value - The value to locate in the sequence. Values are
	 *   compared using strict `===` equality.
	 *
	 * @param fromIndex - The starting index of the search. The default
	 *   value is `0`.
	 *
	 * @returns The index of the first occurrence of the value, or `-1`
	 *   if the value is not found.
	 *
	 * #### Complexity
	 * Linear.
	 *
	 * #### Undefined Behavior
	 * A `fromIndex` which is non-integral or `< 0`.
	 *
	 * #### Example
	 * ```typescript
	 * import { indexOf } from 'phosphor/lib/algorithm/searching';
	 *
	 * let data = ['one', 'two', 'three', 'four', 'one'];
	 * indexOf(data, 'red');     // -1
	 * indexOf(data, 'one');     // 0
	 * indexOf(data, 'one', 1);  // 4
	 * indexOf(data, 'two', 2);  // -1
	 * ```
	 */
	function indexOf(object, value, fromIndex) {
	    var length = object.length;
	    if (length === 0) {
	        return -1;
	    }
	    var start;
	    if (fromIndex === void 0) {
	        start = 0;
	    }
	    else {
	        start = fromIndex;
	    }
	    var seq = sequence_1.asSequence(object);
	    for (var i = start; i < length; ++i) {
	        if (seq.at(i) === value) {
	            return i;
	        }
	    }
	    return -1;
	}
	exports.indexOf = indexOf;
	/**
	 * Find the index of the last occurrence of a value in a sequence.
	 *
	 * @param object - The sequence or array-like object to search.
	 *
	 * @param value - The value to locate in the sequence. Values are
	 *   compared using strict `===` equality.
	 *
	 * @param fromIndex - The starting index of the search. The default
	 *   value is `length - 1`.
	 *
	 * @returns The index of the last occurrence of the value, or `-1`
	 *   if the value is not found.
	 *
	 * #### Complexity
	 * Linear.
	 *
	 * #### Undefined Behavior
	 * A `fromIndex` which is non-integral or `>= length`.
	 *
	 * #### Example
	 * ```typescript
	 * import { lastIndexOf } from 'phosphor/lib/algorithm/searching';
	 *
	 * let data = ['one', 'two', 'three', 'four', 'one'];
	 * lastIndexOf(data, 'red');     // -1
	 * lastIndexOf(data, 'one');     // 4
	 * lastIndexOf(data, 'one', 1);  // 0
	 * lastIndexOf(data, 'two', 2);  // 1
	 * ```
	 */
	function lastIndexOf(object, value, fromIndex) {
	    var length = object.length;
	    if (length === 0) {
	        return -1;
	    }
	    var start;
	    if (fromIndex === void 0) {
	        start = length - 1;
	    }
	    else {
	        start = fromIndex;
	    }
	    var seq = sequence_1.asSequence(object);
	    for (var i = start; i >= 0; --i) {
	        if (seq.at(i) === value) {
	            return i;
	        }
	    }
	    return -1;
	}
	exports.lastIndexOf = lastIndexOf;
	/**
	 * Find the index of the first value which matches a predicate.
	 *
	 * @param object - The sequence or array-like object to search.
	 *
	 * @param fn - The predicate function to apply to the values.
	 *
	 * @param fromIndex - The starting index of the search. The default
	 *   value is `0`.
	 *
	 * @returns The index of the first matching value, or `-1` if no
	 *   matching value is found.
	 *
	 * #### Complexity
	 * Linear.
	 *
	 * #### Undefined Behavior
	 * A `fromIndex` which is non-integral or `< 0`.
	 *
	 * Modifying the length of the sequence while searching.
	 *
	 * #### Example
	 * ```typescript
	 * import { findIndex } from 'phosphor/lib/algorithm/searching';
	 *
	 * function isEven(value: number): boolean {
	 *   return value % 2 === 0;
	 * }
	 *
	 * let data = [1, 2, 3, 4, 3, 2, 1];
	 * findIndex(data, isEven);     // 1
	 * findIndex(data, isEven, 4);  // 5
	 * findIndex(data, isEven, 6);  // -1
	 * ```
	 */
	function findIndex(object, fn, fromIndex) {
	    var length = object.length;
	    if (length === 0) {
	        return -1;
	    }
	    var start;
	    if (fromIndex === void 0) {
	        start = 0;
	    }
	    else {
	        start = fromIndex;
	    }
	    var seq = sequence_1.asSequence(object);
	    for (var i = start; i < length; ++i) {
	        if (fn(seq.at(i), i)) {
	            return i;
	        }
	    }
	    return -1;
	}
	exports.findIndex = findIndex;
	/**
	 * Find the index of the last value which matches a predicate.
	 *
	 * @param object - The sequence or array-like object to search.
	 *
	 * @param fn - The predicate function to apply to the values.
	 *
	 * @param fromIndex - The starting index of the search. The default
	 *   value is `length - 1`.
	 *
	 * @returns The index of the last matching value, or `-1` if no
	 *   matching value is found.
	 *
	 * #### Complexity
	 * Linear.
	 *
	 * #### Undefined Behavior
	 * A `fromIndex` which is non-integral or `>= length`.
	 *
	 * Modifying the length of the sequence while searching.
	 *
	 * #### Example
	 * ```typescript
	 * import { findLastIndex } from 'phosphor/lib/algorithm/searching';
	 *
	 * function isEven(value: number): boolean {
	 *   return value % 2 === 0;
	 * }
	 *
	 * let data = [1, 2, 3, 4, 3, 2, 1];
	 * findLastIndex(data, isEven);     // 5
	 * findLastIndex(data, isEven, 4);  // 3
	 * findLastIndex(data, isEven, 0);  // -1
	 * ```
	 */
	function findLastIndex(object, fn, fromIndex) {
	    var length = object.length;
	    if (length === 0) {
	        return -1;
	    }
	    var start;
	    if (fromIndex === void 0) {
	        start = length - 1;
	    }
	    else {
	        start = fromIndex;
	    }
	    var seq = sequence_1.asSequence(object);
	    for (var i = start; i >= 0; --i) {
	        if (fn(seq.at(i), i)) {
	            return i;
	        }
	    }
	    return -1;
	}
	exports.findLastIndex = findLastIndex;
	/**
	 * Find the index of the first element which compares `>=` to a value.
	 *
	 * @param sequence - The sequence or array-like object to search.
	 *   It must be sorted in ascending order.
	 *
	 * @param value - The value to locate in the sequence.
	 *
	 * @param fn - The 3-way comparison function to apply to the values.
	 *   It should return `< 0` if an element is less than a value, `0` if
	 *   an element is equal to a value, or `> 0` if an element is greater
	 *   than a value.
	 *
	 * @returns The index of the first element which compares `>=` to the
	 *   value, or `length` if there is no such element.
	 *
	 * #### Complexity
	 * Logarithmic.
	 *
	 * #### Undefined Behavior
	 * A sequence which is not sorted in ascending order.
	 *
	 * Modifying the length of the sequence while searching.
	 *
	 * #### Example
	 * ```typescript
	 * import { lowerBound } from 'phosphor/lib/algorithm/searching';
	 *
	 * function numberCmp(a: number, b: number): number {
	 *   return a - b;
	 * }
	 *
	 * let data = [0, 3, 4, 7, 7, 9];
	 * lowerBound(data, 0, numberCmp);   // 0
	 * lowerBound(data, 6, numberCmp);   // 3
	 * lowerBound(data, 7, numberCmp);   // 3
	 * lowerBound(data, -1, numberCmp);  // 0
	 * lowerBound(data, 10, numberCmp);  // 6
	 * ```
	 */
	function lowerBound(object, value, fn) {
	    var n = object.length;
	    if (n === 0) {
	        return 0;
	    }
	    var begin = 0;
	    var half;
	    var middle;
	    var seq = sequence_1.asSequence(object);
	    while (n > 0) {
	        half = n / 2 | 0;
	        middle = begin + half;
	        if (fn(seq.at(middle), value) < 0) {
	            begin = middle + 1;
	            n -= half + 1;
	        }
	        else {
	            n = half;
	        }
	    }
	    return begin;
	}
	exports.lowerBound = lowerBound;
	/**
	 * Find the index of the first element which compares `>` than a value.
	 *
	 * @param sequence - The sequence or array-like object to search.
	 *   It must be sorted in ascending order.
	 *
	 * @param value - The value to locate in the sequence.
	 *
	 * @param fn - The 3-way comparison function to apply to the values.
	 *   It should return `< 0` if an element is less than a value, `0` if
	 *   an element is equal to a value, or `> 0` if an element is greater
	 *   than a value.
	 *
	 * @returns The index of the first element which compares `>` than the
	 *   value, or `length` if there is no such element.
	 *
	 * #### Complexity
	 * Logarithmic.
	 *
	 * #### Undefined Behavior
	 * A sequence which is not sorted in ascending order.
	 *
	 * Modifying the length of the sequence while searching.
	 *
	 * #### Example
	 * ```typescript
	 * import { upperBound } from 'phosphor/lib/algorithm/searching';
	 *
	 * function numberCmp(a: number, b: number): number {
	 *   return a - b;
	 * }
	 *
	 * let data = [0, 3, 4, 7, 7, 9];
	 * upperBound(data, 0, numberCmp);   // 1
	 * upperBound(data, 6, numberCmp);   // 3
	 * upperBound(data, 7, numberCmp);   // 5
	 * upperBound(data, -1, numberCmp);  // 0
	 * upperBound(data, 10, numberCmp);  // 6
	 * ```
	 */
	function upperBound(object, value, fn) {
	    var n = object.length;
	    if (n === 0) {
	        return 0;
	    }
	    var begin = 0;
	    var half;
	    var middle;
	    var seq = sequence_1.asSequence(object);
	    while (n > 0) {
	        half = n / 2 | 0;
	        middle = begin + half;
	        if (fn(seq.at(middle), value) > 0) {
	            n = half;
	        }
	        else {
	            begin = middle + 1;
	            n -= half + 1;
	        }
	    }
	    return begin;
	}
	exports.upperBound = upperBound;
	/**
	 * A namespace which holds string searching functionality.
	 */
	var StringSearch;
	(function (StringSearch) {
	    /**
	     * Compute the sum-of-squares match for the given search text.
	     *
	     * @param sourceText - The text which should be searched.
	     *
	     * @param queryText - The query text to locate in the source text.
	     *
	     * @returns The match result object, or `null` if there is no match.
	     *
	     * #### Complexity
	     * Linear on `sourceText`.
	     *
	     * #### Notes
	     * This scoring algorithm uses a sum-of-squares approach to determine
	     * the score. In order for there to be a match, all of the characters
	     * in `queryText` **must** appear in `sourceText` in order. The index
	     * of each matching character is squared and added to the score. This
	     * means that early and consecutive character matches are preferred.
	     *
	     * The character match is performed with strict equality. It is case
	     * sensitive and does not ignore whitespace. If those behaviors are
	     * required, the text should be transformed before scoring.
	     */
	    function sumOfSquares(sourceText, queryText) {
	        var score = 0;
	        var indices = new Array(queryText.length);
	        for (var i = 0, j = 0, n = queryText.length; i < n; ++i, ++j) {
	            j = sourceText.indexOf(queryText[i], j);
	            if (j === -1) {
	                return null;
	            }
	            indices[i] = j;
	            score += j * j;
	        }
	        return { score: score, indices: indices };
	    }
	    StringSearch.sumOfSquares = sumOfSquares;
	    /**
	     * Highlight the matched characters of a source string.
	     *
	     * @param source - The text which should be highlighted.
	     *
	     * @param indices - The indices of the matched characters. They must
	     *   appear in increasing order and must be in bounds of the source.
	     *
	     * @returns A string with interpolated `<mark>` tags.
	     */
	    function highlight(sourceText, indices) {
	        var k = 0;
	        var last = 0;
	        var result = '';
	        var n = indices.length;
	        while (k < n) {
	            var i = indices[k];
	            var j = indices[k];
	            while (++k < n && indices[k] === j + 1) {
	                j++;
	            }
	            var head = sourceText.slice(last, i);
	            var chunk = sourceText.slice(i, j + 1);
	            result += head + "<mark>" + chunk + "</mark>";
	            last = j + 1;
	        }
	        return result + sourceText.slice(last);
	    }
	    StringSearch.highlight = highlight;
	})(StringSearch = exports.StringSearch || (exports.StringSearch = {}));


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	/*-----------------------------------------------------------------------------
	| Copyright (c) 2014-2016, PhosphorJS Contributors
	|
	| Distributed under the terms of the BSD 3-Clause License.
	|
	| The full license is in the file LICENSE, distributed with this software.
	|----------------------------------------------------------------------------*/
	var iteration_1 = __webpack_require__(28);
	/**
	 * Cast a sequence or array-like object to a sequence.
	 *
	 * @param object - The sequence or array-like object of interest.
	 *
	 * @returns A sequence for the given object.
	 *
	 * #### Notes
	 * This function allows sequence algorithms to operate on user-defined
	 * sequence types and builtin array-like objects in a uniform fashion.
	 */
	function asSequence(object) {
	    var seq;
	    if (typeof object.at === 'function') {
	        seq = object;
	    }
	    else {
	        seq = new ArraySequence(object);
	    }
	    return seq;
	}
	exports.asSequence = asSequence;
	/**
	 * Cast a mutable sequence or array-like object to a mutable sequence.
	 *
	 * @param object - The sequence or array-like object of interest.
	 *
	 * @returns A mutable sequence for the given object.
	 *
	 * #### Notes
	 * This function allows sequence algorithms to operate on user-defined
	 * sequence types and builtin array-like objects in a uniform fashion.
	 */
	function asMutableSequence(object) {
	    var seq;
	    if (typeof object.set === 'function') {
	        seq = object;
	    }
	    else {
	        seq = new MutableArraySequence(object);
	    }
	    return seq;
	}
	exports.asMutableSequence = asMutableSequence;
	/**
	 * A sequence for an array-like object.
	 *
	 * #### Notes
	 * This sequence can be used for any builtin JS array-like object.
	 */
	var ArraySequence = (function () {
	    /**
	     * Construct a new array sequence.
	     *
	     * @param source - The array-like object of interest.
	     */
	    function ArraySequence(source) {
	        this._source = source;
	    }
	    Object.defineProperty(ArraySequence.prototype, "length", {
	        /**
	         * The length of the sequence.
	         *
	         * #### Notes
	         * This is a read-only property.
	         */
	        get: function () {
	            return this._source.length;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Create an iterator over the object's values.
	     *
	     * @returns A new iterator which traverses the object's values.
	     */
	    ArraySequence.prototype.iter = function () {
	        return new iteration_1.ArrayIterator(this._source, 0);
	    };
	    /**
	     * Get the value at the specified index.
	     *
	     * @param index - The positive integer index of interest.
	     *
	     * @returns The value at the specified index.
	     *
	     * #### Undefined Behavior
	     * An `index` which is non-integral or out of range.
	     */
	    ArraySequence.prototype.at = function (index) {
	        return this._source[index];
	    };
	    return ArraySequence;
	}());
	exports.ArraySequence = ArraySequence;
	/**
	 * A sequence for a mutable array-like object.
	 *
	 * #### Notes
	 * This sequence can be used for any builtin JS array-like object.
	 */
	var MutableArraySequence = (function (_super) {
	    __extends(MutableArraySequence, _super);
	    function MutableArraySequence() {
	        _super.apply(this, arguments);
	    }
	    /**
	     * Set the value at the specified index.
	     *
	     * @param index - The positive integer index of interest.
	     *
	     * @param value - The value to set at the specified index.
	     *
	     * #### Undefined Behavior
	     * An `index` which is non-integral or out of range.
	     */
	    MutableArraySequence.prototype.set = function (index, value) {
	        this._source[index] = value;
	    };
	    return MutableArraySequence;
	}(ArraySequence));
	exports.MutableArraySequence = MutableArraySequence;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*-----------------------------------------------------------------------------
	| Copyright (c) 2014-2016, PhosphorJS Contributors
	|
	| Distributed under the terms of the BSD 3-Clause License.
	|
	| The full license is in the file LICENSE, distributed with this software.
	|----------------------------------------------------------------------------*/
	var iteration_1 = __webpack_require__(28);
	/**
	 * A generic vector data structure.
	 */
	var Vector = (function () {
	    /**
	     * Construct a new vector.
	     *
	     * @param values - The initial values for the vector.
	     */
	    function Vector(values) {
	        var _this = this;
	        this._array = [];
	        if (values)
	            iteration_1.each(values, function (value) { _this.pushBack(value); });
	    }
	    Object.defineProperty(Vector.prototype, "isEmpty", {
	        /**
	         * Test whether the vector is empty.
	         *
	         * @returns `true` if the vector is empty, `false` otherwise.
	         *
	         * #### Notes
	         * This is a read-only property.
	         *
	         * #### Complexity
	         * Constant.
	         *
	         * #### Iterator Validity
	         * No changes.
	         */
	        get: function () {
	            return this._array.length === 0;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Vector.prototype, "length", {
	        /**
	         * Get the length of the vector.
	         *
	         * @return The number of values in the vector.
	         *
	         * #### Notes
	         * This is a read-only property.
	         *
	         * #### Complexity
	         * Constant.
	         *
	         * #### Iterator Validity
	         * No changes.
	         */
	        get: function () {
	            return this._array.length;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Vector.prototype, "front", {
	        /**
	         * Get the value at the front of the vector.
	         *
	         * @returns The value at the front of the vector, or `undefined` if
	         *   the vector is empty.
	         *
	         * #### Notes
	         * This is a read-only property.
	         *
	         * #### Complexity
	         * Constant.
	         *
	         * #### Iterator Validity
	         * No changes.
	         */
	        get: function () {
	            return this._array[0];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Vector.prototype, "back", {
	        /**
	         * Get the value at the back of the vector.
	         *
	         * @returns The value at the back of the vector, or `undefined` if
	         *   the vector is empty.
	         *
	         * #### Notes
	         * This is a read-only property.
	         *
	         * #### Complexity
	         * Constant.
	         *
	         * #### Iterator Validity
	         * No changes.
	         */
	        get: function () {
	            return this._array[this._array.length - 1];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Create an iterator over the values in the vector.
	     *
	     * @returns A new iterator starting at the front of the vector.
	     *
	     * #### Complexity
	     * Constant.
	     *
	     * #### Iterator Validity
	     * No changes.
	     */
	    Vector.prototype.iter = function () {
	        return new iteration_1.ArrayIterator(this._array, 0);
	    };
	    /**
	     * Get the value at the specified index.
	     *
	     * @param index - The positive integer index of interest.
	     *
	     * @returns The value at the specified index.
	     *
	     * #### Complexity
	     * Constant.
	     *
	     * #### Iterator Validity
	     * No changes.
	     *
	     * #### Undefined Behavior
	     * An `index` which is non-integral or out of range.
	     */
	    Vector.prototype.at = function (index) {
	        return this._array[index];
	    };
	    /**
	     * Set the value at the specified index.
	     *
	     * @param index - The positive integer index of interest.
	     *
	     * @param value - The value to set at the specified index.
	     *
	     * #### Complexity
	     * Constant.
	     *
	     * #### Iterator Validity
	     * No changes.
	     *
	     * #### Undefined Behavior
	     * An `index` which is non-integral or out of range.
	     */
	    Vector.prototype.set = function (index, value) {
	        this._array[index] = value;
	    };
	    /**
	     * Add a value to the back of the vector.
	     *
	     * @param value - The value to add to the back of the vector.
	     *
	     * @returns The new length of the vector.
	     *
	     * #### Complexity
	     * Constant.
	     *
	     * #### Iterator Validity
	     * No changes.
	     */
	    Vector.prototype.pushBack = function (value) {
	        return this._array.push(value);
	    };
	    /**
	     * Remove and return the value at the back of the vector.
	     *
	     * @returns The value at the back of the vector, or `undefined` if
	     *   the vector is empty.
	     *
	     * #### Complexity
	     * Constant.
	     *
	     * #### Iterator Validity
	     * Iterators pointing at the removed value are invalidated.
	     */
	    Vector.prototype.popBack = function () {
	        return this._array.pop();
	    };
	    /**
	     * Insert a value into the vector at a specific index.
	     *
	     * @param index - The index at which to insert the value.
	     *
	     * @param value - The value to set at the specified index.
	     *
	     * @returns The new length of the vector.
	     *
	     * #### Complexity
	     * Linear.
	     *
	     * #### Iterator Validity
	     * No changes.
	     *
	     * #### Notes
	     * The `index` will be clamped to the bounds of the vector.
	     *
	     * #### Undefined Behavior
	     * An `index` which is non-integral.
	     */
	    Vector.prototype.insert = function (index, value) {
	        var array = this._array;
	        var n = array.length;
	        index = Math.max(0, Math.min(index, n));
	        for (var i = n; i > index; --i) {
	            array[i] = array[i - 1];
	        }
	        array[index] = value;
	        return n + 1;
	    };
	    /**
	     * Remove the first occurrence of a value from the vector.
	     *
	     * @param value - The value of interest.
	     *
	     * @returns The index of the removed value, or `-1` if the value
	     *   is not contained in the vector.
	     *
	     * #### Complexity
	     * Linear.
	     *
	     * #### Iterator Validity
	     * Iterators pointing at the removed value and beyond are invalidated.
	     *
	     * #### Notes
	     * Comparison is performed using strict `===` equality.
	     */
	    Vector.prototype.remove = function (value) {
	        var index = this._array.indexOf(value);
	        if (index !== -1)
	            this.removeAt(index);
	        return index;
	    };
	    /**
	     * Remove and return the value at a specific index.
	     *
	     * @param index - The index of the value of interest.
	     *
	     * @returns The value at the specified index, or `undefined` if the
	     *   index is out of range.
	     *
	     * #### Complexity
	     * Constant.
	     *
	     * #### Iterator Validity
	     * Iterators pointing at the removed value and beyond are invalidated.
	     *
	     * #### Undefined Behavior
	     * An `index` which is non-integral.
	     */
	    Vector.prototype.removeAt = function (index) {
	        var array = this._array;
	        var n = array.length;
	        if (index < 0 || index >= n) {
	            return void 0;
	        }
	        var value = array[index];
	        for (var i = index + 1; i < n; ++i) {
	            array[i - 1] = array[i];
	        }
	        array.length = n - 1;
	        return value;
	    };
	    /**
	     * Remove all values from the vector.
	     *
	     * #### Complexity
	     * Linear.
	     *
	     * #### Iterator Validity
	     * All current iterators are invalidated.
	     */
	    Vector.prototype.clear = function () {
	        this._array.length = 0;
	    };
	    /**
	     * Swap the contents of the vector with the contents of another.
	     *
	     * @param other - The other vector holding the contents to swap.
	     *
	     * #### Complexity
	     * Constant.
	     *
	     * #### Iterator Validity
	     * All current iterators remain valid, but will now point to the
	     * contents of the other vector involved in the swap.
	     */
	    Vector.prototype.swap = function (other) {
	        var array = other._array;
	        other._array = this._array;
	        this._array = array;
	    };
	    return Vector;
	}());
	exports.Vector = Vector;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*-----------------------------------------------------------------------------
	| Copyright (c) 2014-2016, PhosphorJS Contributors
	|
	| Distributed under the terms of the BSD 3-Clause License.
	|
	| The full license is in the file LICENSE, distributed with this software.
	|----------------------------------------------------------------------------*/
	var iteration_1 = __webpack_require__(28);
	/**
	 * A disposable object which delegates to a callback function.
	 */
	var DisposableDelegate = (function () {
	    /**
	     * Construct a new disposable delegate.
	     *
	     * @param callback - The function to invoke on dispose.
	     */
	    function DisposableDelegate(callback) {
	        this._callback = callback || null;
	    }
	    Object.defineProperty(DisposableDelegate.prototype, "isDisposed", {
	        /**
	         * Test whether the delegate has been disposed.
	         *
	         * #### Notes
	         * This is a read-only property which is always safe to access.
	         */
	        get: function () {
	            return this._callback === null;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Dispose of the delegate and invoke the callback function.
	     *
	     * #### Notes
	     * All calls to this method after the first will be a no-op.
	     */
	    DisposableDelegate.prototype.dispose = function () {
	        if (this._callback === null) {
	            return;
	        }
	        var callback = this._callback;
	        this._callback = null;
	        callback();
	    };
	    return DisposableDelegate;
	}());
	exports.DisposableDelegate = DisposableDelegate;
	/**
	 * An object which manages a collection of disposable items.
	 */
	var DisposableSet = (function () {
	    /**
	     * Construct a new disposable set.
	     *
	     * @param items - The initial disposable items.
	     */
	    function DisposableSet(items) {
	        var _this = this;
	        this._set = new Set();
	        if (items)
	            iteration_1.each(items, function (item) { _this._set.add(item); });
	    }
	    Object.defineProperty(DisposableSet.prototype, "isDisposed", {
	        /**
	         * Test whether the set has been disposed.
	         *
	         * #### Notes
	         * This is a read-only property which is always safe to access.
	         */
	        get: function () {
	            return this._set === null;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Dispose of the set and the disposable items it contains.
	     *
	     * #### Notes
	     * Items are disposed in the order they are added to the set.
	     *
	     * It is unsafe to use the set after it has been disposed.
	     *
	     * All calls to this method after the first will be a no-op.
	     */
	    DisposableSet.prototype.dispose = function () {
	        if (this._set === null) {
	            return;
	        }
	        var set = this._set;
	        this._set = null;
	        set.forEach(function (item) { item.dispose(); });
	    };
	    /**
	     * Add a disposable item to the set.
	     *
	     * @param item - The disposable item to add to the set. If the item
	     *   is already contained in the set, this is a no-op.
	     *
	     * @throws An error if the set has been disposed.
	     */
	    DisposableSet.prototype.add = function (item) {
	        if (this._set === null) {
	            throw new Error('Object is disposed');
	        }
	        this._set.add(item);
	    };
	    /**
	     * Remove a disposable item from the set.
	     *
	     * @param item - The disposable item to remove from the set. If the
	     *   item does not exist in the set, this is a no-op.
	     *
	     * @throws An error if the set has been disposed.
	     */
	    DisposableSet.prototype.remove = function (item) {
	        if (this._set === null) {
	            throw new Error('Object is disposed');
	        }
	        this._set.delete(item);
	    };
	    /**
	     * Remove all disposable items from the set.
	     *
	     * @throws An error if the set has been disposed.
	     */
	    DisposableSet.prototype.clear = function () {
	        if (this._set === null) {
	            throw new Error('Object is disposed');
	        }
	        this._set.clear();
	    };
	    return DisposableSet;
	}());
	exports.DisposableSet = DisposableSet;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var disposable_1 = __webpack_require__(32);
	var messages_1 = __webpack_require__(34);
	/**
	 * Comm channel handler.
	 */
	var CommHandler = (function (_super) {
	    __extends(CommHandler, _super);
	    /**
	     * Construct a new comm channel.
	     */
	    function CommHandler(target, id, kernel, disposeCb) {
	        _super.call(this, disposeCb);
	        this._target = '';
	        this._id = '';
	        this._kernel = null;
	        this._onClose = null;
	        this._onMsg = null;
	        this._id = id;
	        this._target = target;
	        this._kernel = kernel;
	    }
	    Object.defineProperty(CommHandler.prototype, "commId", {
	        /**
	         * The unique id for the comm channel.
	         */
	        get: function () {
	            return this._id;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CommHandler.prototype, "targetName", {
	        /**
	         * The target name for the comm channel.
	         */
	        get: function () {
	            return this._target;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CommHandler.prototype, "onClose", {
	        /**
	         * Get the callback for a comm close event.
	         *
	         * #### Notes
	         * This is called when the comm is closed from either the server or
	         * client.
	         *
	         * **See also:** [[ICommClose]], [[close]]
	         */
	        get: function () {
	            return this._onClose;
	        },
	        /**
	         * Set the callback for a comm close event.
	         *
	         * #### Notes
	         * This is called when the comm is closed from either the server or
	         * client.
	         *
	         * **See also:** [[close]]
	         */
	        set: function (cb) {
	            this._onClose = cb;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CommHandler.prototype, "onMsg", {
	        /**
	         * Get the callback for a comm message received event.
	         */
	        get: function () {
	            return this._onMsg;
	        },
	        /**
	         * Set the callback for a comm message received event.
	         */
	        set: function (cb) {
	            this._onMsg = cb;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CommHandler.prototype, "isDisposed", {
	        /**
	         * Test whether the comm has been disposed.
	         */
	        get: function () {
	            return (this._kernel === null);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Open a comm with optional data and metadata.
	     *
	     * #### Notes
	     * This sends a `comm_open` message to the server.
	     *
	     * **See also:** [[ICommOpen]]
	     */
	    CommHandler.prototype.open = function (data, metadata) {
	        if (this.isDisposed || this._kernel.isDisposed) {
	            return;
	        }
	        var options = {
	            msgType: 'comm_open',
	            channel: 'shell',
	            username: this._kernel.username,
	            session: this._kernel.clientId
	        };
	        var content = {
	            comm_id: this._id,
	            target_name: this._target,
	            data: data || {}
	        };
	        var msg = messages_1.KernelMessage.createShellMessage(options, content, metadata);
	        return this._kernel.sendShellMessage(msg, false, true);
	    };
	    /**
	     * Send a `comm_msg` message to the kernel.
	     *
	     * #### Notes
	     * This is a no-op if the comm has been closed.
	     *
	     * **See also:** [[ICommMsg]]
	     */
	    CommHandler.prototype.send = function (data, metadata, buffers, disposeOnDone) {
	        if (buffers === void 0) { buffers = []; }
	        if (disposeOnDone === void 0) { disposeOnDone = true; }
	        if (this.isDisposed || this._kernel.isDisposed) {
	            return;
	        }
	        var options = {
	            msgType: 'comm_msg',
	            channel: 'shell',
	            username: this._kernel.username,
	            session: this._kernel.clientId
	        };
	        var content = {
	            comm_id: this._id,
	            data: data
	        };
	        var msg = messages_1.KernelMessage.createShellMessage(options, content, metadata, buffers);
	        return this._kernel.sendShellMessage(msg, false, true);
	    };
	    /**
	     * Close the comm.
	     *
	     * #### Notes
	     * This will send a `comm_close` message to the kernel, and call the
	     * `onClose` callback if set.
	     *
	     * This is a no-op if the comm is already closed.
	     *
	     * **See also:** [[ICommClose]], [[onClose]]
	     */
	    CommHandler.prototype.close = function (data, metadata) {
	        if (this.isDisposed || this._kernel.isDisposed) {
	            return;
	        }
	        var options = {
	            msgType: 'comm_msg',
	            channel: 'shell',
	            username: this._kernel.username,
	            session: this._kernel.clientId
	        };
	        var content = {
	            comm_id: this._id,
	            data: data || {}
	        };
	        var msg = messages_1.KernelMessage.createShellMessage(options, content, metadata);
	        var future = this._kernel.sendShellMessage(msg, false, true);
	        options.channel = 'iopub';
	        var ioMsg = messages_1.KernelMessage.createMessage(options, content, metadata);
	        var onClose = this._onClose;
	        if (onClose) {
	            onClose(ioMsg);
	        }
	        this.dispose();
	        return future;
	    };
	    /**
	     * Dispose of the resources held by the comm.
	     */
	    CommHandler.prototype.dispose = function () {
	        if (this.isDisposed) {
	            return;
	        }
	        this._onClose = null;
	        this._onMsg = null;
	        this._kernel = null;
	        _super.prototype.dispose.call(this);
	    };
	    return CommHandler;
	}(disposable_1.DisposableDelegate));
	exports.CommHandler = CommHandler;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var utils = __webpack_require__(6);
	/**
	 * A namespace for kernel messages.
	 */
	var KernelMessage;
	(function (KernelMessage) {
	    /**
	     * Create a well-formed kernel message.
	     */
	    function createMessage(options, content, metadata, buffers) {
	        if (content === void 0) { content = {}; }
	        if (metadata === void 0) { metadata = {}; }
	        if (buffers === void 0) { buffers = []; }
	        return {
	            header: {
	                username: options.username || '',
	                version: '5.0',
	                session: options.session,
	                msg_id: options.msgId || utils.uuid(),
	                msg_type: options.msgType
	            },
	            parent_header: {},
	            channel: options.channel,
	            content: content,
	            metadata: metadata,
	            buffers: buffers
	        };
	    }
	    KernelMessage.createMessage = createMessage;
	    /**
	     * Create a well-formed kernel shell message.
	     */
	    function createShellMessage(options, content, metadata, buffers) {
	        if (content === void 0) { content = {}; }
	        if (metadata === void 0) { metadata = {}; }
	        if (buffers === void 0) { buffers = []; }
	        var msg = createMessage(options, content, metadata, buffers);
	        return msg;
	    }
	    KernelMessage.createShellMessage = createShellMessage;
	    /**
	     * Test whether a kernel message is a `'stream'` message.
	     */
	    function isStreamMsg(msg) {
	        return msg.header.msg_type === 'stream';
	    }
	    KernelMessage.isStreamMsg = isStreamMsg;
	    /**
	     * Test whether a kernel message is an `'display_data'` message.
	     */
	    function isDisplayDataMsg(msg) {
	        return msg.header.msg_type === 'display_data';
	    }
	    KernelMessage.isDisplayDataMsg = isDisplayDataMsg;
	    /**
	     * Test whether a kernel message is an `'execute_input'` message.
	     */
	    function isExecuteInputMsg(msg) {
	        return msg.header.msg_type === 'execute_input';
	    }
	    KernelMessage.isExecuteInputMsg = isExecuteInputMsg;
	    /**
	     * Test whether a kernel message is an `'execute_result'` message.
	     */
	    function isExecuteResultMsg(msg) {
	        return msg.header.msg_type === 'execute_result';
	    }
	    KernelMessage.isExecuteResultMsg = isExecuteResultMsg;
	    /**
	     * Test whether a kernel message is an `'error'` message.
	     */
	    function isErrorMsg(msg) {
	        return msg.header.msg_type === 'error';
	    }
	    KernelMessage.isErrorMsg = isErrorMsg;
	    /**
	     * Test whether a kernel message is a `'status'` message.
	     */
	    function isStatusMsg(msg) {
	        return msg.header.msg_type === 'status';
	    }
	    KernelMessage.isStatusMsg = isStatusMsg;
	    /**
	     * Test whether a kernel message is a `'clear_output'` message.
	     */
	    function isClearOutputMsg(msg) {
	        return msg.header.msg_type === 'clear_output';
	    }
	    KernelMessage.isClearOutputMsg = isClearOutputMsg;
	    /**
	     * Test whether a kernel message is a `'comm_open'` message.
	     */
	    function isCommOpenMsg(msg) {
	        return msg.header.msg_type === 'comm_open';
	    }
	    KernelMessage.isCommOpenMsg = isCommOpenMsg;
	    /**
	     * Test whether a kernel message is a `'comm_close'` message.
	     */
	    function isCommCloseMsg(msg) {
	        return msg.header.msg_type === 'comm_close';
	    }
	    KernelMessage.isCommCloseMsg = isCommCloseMsg;
	    /**
	     * Test whether a kernel message is a `'comm_msg'` message.
	     */
	    function isCommMsgMsg(msg) {
	        return msg.header.msg_type === 'comm_msg';
	    }
	    KernelMessage.isCommMsgMsg = isCommMsgMsg;
	    ;
	    /**
	     * Test whether a kernel message is an `'input_request'` message.
	     */
	    function isInputRequestMsg(msg) {
	        return msg.header.msg_type === 'input_request';
	    }
	    KernelMessage.isInputRequestMsg = isInputRequestMsg;
	})(KernelMessage = exports.KernelMessage || (exports.KernelMessage = {}));


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var disposable_1 = __webpack_require__(32);
	var messages_1 = __webpack_require__(34);
	/**
	 * Implementation of a kernel future.
	 */
	var KernelFutureHandler = (function (_super) {
	    __extends(KernelFutureHandler, _super);
	    /**
	     * Construct a new KernelFutureHandler.
	     */
	    function KernelFutureHandler(cb, msg, expectShell, disposeOnDone) {
	        _super.call(this, cb);
	        this._msg = null;
	        this._status = 0;
	        this._stdin = null;
	        this._iopub = null;
	        this._reply = null;
	        this._done = null;
	        this._hooks = new Private.HookList();
	        this._disposeOnDone = true;
	        this._msg = msg;
	        if (!expectShell) {
	            this._setFlag(Private.KernelFutureFlag.GotReply);
	        }
	        this._disposeOnDone = disposeOnDone;
	    }
	    Object.defineProperty(KernelFutureHandler.prototype, "msg", {
	        /**
	         * Get the original outgoing message.
	         */
	        get: function () {
	            return this._msg;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelFutureHandler.prototype, "isDone", {
	        /**
	         * Check for message done state.
	         */
	        get: function () {
	            return this._testFlag(Private.KernelFutureFlag.IsDone);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelFutureHandler.prototype, "onReply", {
	        /**
	         * Get the reply handler.
	         */
	        get: function () {
	            return this._reply;
	        },
	        /**
	         * Set the reply handler.
	         */
	        set: function (cb) {
	            this._reply = cb;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelFutureHandler.prototype, "onIOPub", {
	        /**
	         * Get the iopub handler.
	         */
	        get: function () {
	            return this._iopub;
	        },
	        /**
	         * Set the iopub handler.
	         */
	        set: function (cb) {
	            this._iopub = cb;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelFutureHandler.prototype, "onDone", {
	        /**
	         * Get the done handler.
	         */
	        get: function () {
	            return this._done;
	        },
	        /**
	         * Set the done handler.
	         */
	        set: function (cb) {
	            this._done = cb;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelFutureHandler.prototype, "onStdin", {
	        /**
	         * Get the stdin handler.
	         */
	        get: function () {
	            return this._stdin;
	        },
	        /**
	         * Set the stdin handler.
	         */
	        set: function (cb) {
	            this._stdin = cb;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Register hook for IOPub messages.
	     *
	     * @param hook - The callback invoked for an IOPub message.
	     *
	     * #### Notes
	     * The IOPub hook system allows you to preempt the handlers for IOPub messages handled
	     * by the future. The most recently registered hook is run first.
	     * If the hook returns false, any later hooks and the future's onIOPub handler will not run.
	     * If a hook throws an error, the error is logged to the console and the next hook is run.
	     * If a hook is registered during the hook processing, it won't run until the next message.
	     * If a hook is removed during the hook processing, it will be deactivated immediately.
	     */
	    KernelFutureHandler.prototype.registerMessageHook = function (hook) {
	        this._hooks.add(hook);
	    };
	    /**
	     * Remove a hook for IOPub messages.
	     *
	     * @param hook - The hook to remove.
	     *
	     * #### Notes
	     * If a hook is removed during the hook processing, it will be deactivated immediately.
	     */
	    KernelFutureHandler.prototype.removeMessageHook = function (hook) {
	        if (this.isDisposed) {
	            return;
	        }
	        this._hooks.remove(hook);
	    };
	    /**
	     * Dispose and unregister the future.
	     */
	    KernelFutureHandler.prototype.dispose = function () {
	        this._stdin = null;
	        this._iopub = null;
	        this._reply = null;
	        this._done = null;
	        this._msg = null;
	        if (this._hooks) {
	            this._hooks.dispose();
	        }
	        this._hooks = null;
	        _super.prototype.dispose.call(this);
	    };
	    /**
	     * Handle an incoming kernel message.
	     */
	    KernelFutureHandler.prototype.handleMsg = function (msg) {
	        switch (msg.channel) {
	            case 'shell':
	                this._handleReply(msg);
	                break;
	            case 'stdin':
	                this._handleStdin(msg);
	                break;
	            case 'iopub':
	                this._handleIOPub(msg);
	                break;
	        }
	    };
	    KernelFutureHandler.prototype._handleReply = function (msg) {
	        var reply = this._reply;
	        if (reply) {
	            reply(msg);
	        }
	        this._setFlag(Private.KernelFutureFlag.GotReply);
	        if (this._testFlag(Private.KernelFutureFlag.GotIdle)) {
	            this._handleDone();
	        }
	    };
	    KernelFutureHandler.prototype._handleStdin = function (msg) {
	        var stdin = this._stdin;
	        if (stdin) {
	            stdin(msg);
	        }
	    };
	    KernelFutureHandler.prototype._handleIOPub = function (msg) {
	        var process = this._hooks.process(msg);
	        var iopub = this._iopub;
	        if (process && iopub) {
	            iopub(msg);
	        }
	        if (messages_1.KernelMessage.isStatusMsg(msg) &&
	            msg.content.execution_state === 'idle') {
	            this._setFlag(Private.KernelFutureFlag.GotIdle);
	            if (this._testFlag(Private.KernelFutureFlag.GotReply)) {
	                this._handleDone();
	            }
	        }
	    };
	    KernelFutureHandler.prototype._handleDone = function () {
	        if (this.isDone) {
	            return;
	        }
	        this._setFlag(Private.KernelFutureFlag.IsDone);
	        var done = this._done;
	        if (done)
	            done();
	        this._done = null;
	        if (this._disposeOnDone) {
	            this.dispose();
	        }
	    };
	    /**
	     * Test whether the given future flag is set.
	     */
	    KernelFutureHandler.prototype._testFlag = function (flag) {
	        return (this._status & flag) !== 0;
	    };
	    /**
	     * Set the given future flag.
	     */
	    KernelFutureHandler.prototype._setFlag = function (flag) {
	        this._status |= flag;
	    };
	    return KernelFutureHandler;
	}(disposable_1.DisposableDelegate));
	exports.KernelFutureHandler = KernelFutureHandler;
	var Private;
	(function (Private) {
	    /**
	     * A polyfill for a function to run code outside of the current execution context.
	     */
	    var defer = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setImmediate;
	    var HookList = (function () {
	        function HookList() {
	            this._hooks = [];
	        }
	        /**
	         * Register a hook.
	         *
	         * @param hook - The callback to register.
	         */
	        HookList.prototype.add = function (hook) {
	            this.remove(hook);
	            this._hooks.push(hook);
	        };
	        /**
	         * Remove a hook.
	         *
	         * @param hook - The callback to remove.
	         */
	        HookList.prototype.remove = function (hook) {
	            if (this.isDisposed) {
	                return;
	            }
	            var index = this._hooks.indexOf(hook);
	            if (index >= 0) {
	                this._hooks[index] = null;
	                this._scheduleCompact();
	            }
	        };
	        /**
	         * Process a message through the hooks.
	         *
	         * #### Notes
	         * The most recently registered hook is run first.
	         * If the hook returns false, any later hooks will not run.
	         * If a hook throws an error, the error is logged to the console and the next hook is run.
	         * If a hook is registered during the hook processing, it won't run until the next message.
	         * If a hook is removed during the hook processing, it will be deactivated immediately.
	         */
	        HookList.prototype.process = function (msg) {
	            var continueHandling;
	            // most recently-added hook is called first
	            for (var i = this._hooks.length - 1; i >= 0; i--) {
	                var hook = this._hooks[i];
	                if (hook === null) {
	                    continue;
	                }
	                try {
	                    continueHandling = hook(msg);
	                }
	                catch (err) {
	                    continueHandling = true;
	                    console.error(err);
	                }
	                if (continueHandling === false) {
	                    return false;
	                }
	            }
	            return true;
	        };
	        Object.defineProperty(HookList.prototype, "isDisposed", {
	            /**
	             * Test whether the HookList has been disposed.
	             */
	            get: function () {
	                return (this._hooks === null);
	            },
	            enumerable: true,
	            configurable: true
	        });
	        /**
	         * Dispose the hook list.
	         */
	        HookList.prototype.dispose = function () {
	            this._hooks = null;
	        };
	        /**
	         * Schedule a cleanup of the list, removing any hooks that have been nulled out.
	         */
	        HookList.prototype._scheduleCompact = function () {
	            var _this = this;
	            if (!this._cleanupScheduled) {
	                this._cleanupScheduled = true;
	                defer(function () {
	                    _this._cleanupScheduled = false;
	                    _this._compact();
	                });
	            }
	        };
	        /**
	         * Compact the list, removing any nulls.
	         */
	        HookList.prototype._compact = function () {
	            if (this.isDisposed) {
	                return;
	            }
	            var numNulls = 0;
	            for (var i = 0, len = this._hooks.length; i < len; i++) {
	                var hook = this._hooks[i];
	                if (this._hooks[i] === null) {
	                    numNulls++;
	                }
	                else {
	                    this._hooks[i - numNulls] = hook;
	                }
	            }
	            this._hooks.length -= numNulls;
	        };
	        return HookList;
	    }());
	    Private.HookList = HookList;
	    /**
	     * Bit flags for the kernel future state.
	     */
	    (function (KernelFutureFlag) {
	        KernelFutureFlag[KernelFutureFlag["GotReply"] = 1] = "GotReply";
	        KernelFutureFlag[KernelFutureFlag["GotIdle"] = 2] = "GotIdle";
	        KernelFutureFlag[KernelFutureFlag["IsDone"] = 4] = "IsDone";
	        KernelFutureFlag[KernelFutureFlag["DisposeOnDone"] = 8] = "DisposeOnDone";
	    })(Private.KernelFutureFlag || (Private.KernelFutureFlag = {}));
	    var KernelFutureFlag = Private.KernelFutureFlag;
	})(Private || (Private = {}));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22).setImmediate))

/***/ },
/* 36 */
/***/ function(module, exports) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	/**
	 * Deserialize and return the unpacked message.
	 *
	 * #### Notes
	 * Handles JSON blob strings and binary messages.
	 */
	function deserialize(data) {
	    var value;
	    if (typeof data === 'string') {
	        value = JSON.parse(data);
	    }
	    else {
	        value = deserializeBinary(data);
	    }
	    return value;
	}
	exports.deserialize = deserialize;
	/**
	 * Serialize a kernel message for transport.
	 *
	 * #### Notes
	 * If there is binary content, an `ArrayBuffer` is returned,
	 * otherwise the message is converted to a JSON string.
	 */
	function serialize(msg) {
	    var value;
	    if (msg.buffers && msg.buffers.length) {
	        value = serializeBinary(msg);
	    }
	    else {
	        value = JSON.stringify(msg);
	    }
	    return value;
	}
	exports.serialize = serialize;
	/**
	 * Deserialize a binary message to a Kernel Message.
	 */
	function deserializeBinary(buf) {
	    var data = new DataView(buf);
	    // read the header: 1 + nbufs 32b integers
	    var nbufs = data.getUint32(0);
	    var offsets = [];
	    if (nbufs < 2) {
	        throw new Error('Invalid incoming Kernel Message');
	    }
	    for (var i = 1; i <= nbufs; i++) {
	        offsets.push(data.getUint32(i * 4));
	    }
	    var jsonBytes = new Uint8Array(buf.slice(offsets[0], offsets[1]));
	    var msg = JSON.parse((new TextDecoder('utf8')).decode(jsonBytes));
	    // the remaining chunks are stored as DataViews in msg.buffers
	    msg.buffers = [];
	    for (var i = 1; i < nbufs; i++) {
	        var start = offsets[i];
	        var stop = offsets[i + 1] || buf.byteLength;
	        msg.buffers.push(new DataView(buf.slice(start, stop)));
	    }
	    return msg;
	}
	/**
	 * Implement the binary serialization protocol.
	 *
	 * Serialize Kernel message to ArrayBuffer.
	 */
	function serializeBinary(msg) {
	    var offsets = [];
	    var buffers = [];
	    var encoder = new TextEncoder('utf8');
	    var jsonUtf8 = encoder.encode(JSON.stringify(msg, replaceBuffers));
	    buffers.push(jsonUtf8.buffer);
	    for (var i = 0; i < msg.buffers.length; i++) {
	        // msg.buffers elements could be either views or ArrayBuffers
	        // buffers elements are ArrayBuffers
	        var b = msg.buffers[i];
	        buffers.push(b instanceof ArrayBuffer ? b : b.buffer);
	    }
	    var nbufs = buffers.length;
	    offsets.push(4 * (nbufs + 1));
	    for (var i = 0; i + 1 < buffers.length; i++) {
	        offsets.push(offsets[offsets.length - 1] + buffers[i].byteLength);
	    }
	    var msgBuf = new Uint8Array(offsets[offsets.length - 1] + buffers[buffers.length - 1].byteLength);
	    // use DataView.setUint32 for network byte-order
	    var view = new DataView(msgBuf.buffer);
	    // write nbufs to first 4 bytes
	    view.setUint32(0, nbufs);
	    // write offsets to next 4 * nbufs bytes
	    for (var i = 0; i < offsets.length; i++) {
	        view.setUint32(4 * (i + 1), offsets[i]);
	    }
	    // write all the buffers at their respective offsets
	    for (var i = 0; i < buffers.length; i++) {
	        msgBuf.set(new Uint8Array(buffers[i]), offsets[i]);
	    }
	    return msgBuf.buffer;
	}
	/**
	 * Filter `"buffers"` key for `JSON.stringify`.
	 */
	function replaceBuffers(key, value) {
	    if (key === 'buffers') {
	        return undefined;
	    }
	    return value;
	}


/***/ },
/* 37 */
/***/ function(module, exports) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	/**
	 * Required fields for `IKernelHeader`.
	 */
	var HEADER_FIELDS = ['username', 'version', 'session', 'msg_id', 'msg_type'];
	/**
	 * Requred fields and types for contents of various types of `kernel.IMessage`
	 * messages on the iopub channel.
	 */
	var IOPUB_CONTENT_FIELDS = {
	    stream: { name: 'string', text: 'string' },
	    display_data: { data: 'object', metadata: 'object' },
	    execute_input: { code: 'string', execution_count: 'number' },
	    execute_result: { execution_count: 'number', data: 'object',
	        metadata: 'object' },
	    error: { ename: 'string', evalue: 'string', traceback: 'object' },
	    status: { execution_state: 'string' },
	    clear_output: { wait: 'boolean' },
	    comm_open: { comm_id: 'string', target_name: 'string', data: 'object' },
	    comm_msg: { comm_id: 'string', data: 'object' },
	    comm_close: { comm_id: 'string' },
	    shutdown_reply: { restart: 'boolean' } // Emitted by the IPython kernel.
	};
	/**
	 * Validate a property as being on an object, and optionally
	 * of a given type.
	 */
	function validateProperty(object, name, typeName) {
	    if (!object.hasOwnProperty(name)) {
	        throw Error("Missing property '" + name + "'");
	    }
	    if (typeName !== void 0) {
	        var valid = true;
	        var value = object[name];
	        switch (typeName) {
	            case 'array':
	                valid = Array.isArray(value);
	                break;
	            case 'object':
	                valid = typeof value !== 'undefined';
	                break;
	            default:
	                valid = typeof value === typeName;
	        }
	        if (!valid) {
	            throw new Error("Property '" + name + "' is not of type '" + typeName);
	        }
	    }
	}
	/**
	 * Validate the header of a kernel message.
	 */
	function validateHeader(header) {
	    for (var i = 0; i < HEADER_FIELDS.length; i++) {
	        validateProperty(header, HEADER_FIELDS[i], 'string');
	    }
	}
	/**
	 * Validate a kernel message object.
	 */
	function validateMessage(msg) {
	    validateProperty(msg, 'metadata', 'object');
	    validateProperty(msg, 'content', 'object');
	    validateProperty(msg, 'channel', 'string');
	    validateHeader(msg.header);
	    if (msg.channel === 'iopub') {
	        validateIOPubContent(msg);
	    }
	}
	exports.validateMessage = validateMessage;
	/**
	 * Validate content an kernel message on the iopub channel.
	 */
	function validateIOPubContent(msg) {
	    if (msg.channel === 'iopub') {
	        var fields = IOPUB_CONTENT_FIELDS[msg.header.msg_type];
	        if (fields === void 0) {
	            throw Error("Invalid Kernel message: iopub message type " + msg.header.msg_type + " not recognized");
	        }
	        var names = Object.keys(fields);
	        var content = msg.content;
	        for (var i = 0; i < names.length; i++) {
	            validateProperty(content, names[i], fields[names[i]]);
	        }
	    }
	}
	/**
	 * Validate a `Kernel.IModel` object.
	 */
	function validateModel(model) {
	    validateProperty(model, 'name', 'string');
	    validateProperty(model, 'id', 'string');
	}
	exports.validateModel = validateModel;
	/**
	 * Validate a server kernelspec model to a client side model.
	 */
	function validateSpecModel(data) {
	    var spec = data.spec;
	    if (!spec) {
	        throw new Error('Invalid kernel spec');
	    }
	    validateProperty(data, 'name', 'string');
	    validateProperty(data, 'resources', 'object');
	    validateProperty(spec, 'language', 'string');
	    validateProperty(spec, 'display_name', 'string');
	    validateProperty(spec, 'argv', 'array');
	    return {
	        name: data.name,
	        resources: data.resources,
	        language: spec.language,
	        display_name: spec.display_name,
	        argv: spec.argv
	    };
	}
	exports.validateSpecModel = validateSpecModel;
	/**
	 * Validate a `Kernel.ISpecModels` object.
	 */
	function validateSpecModels(data) {
	    if (!data.hasOwnProperty('kernelspecs')) {
	        throw new Error('No kernelspecs found');
	    }
	    var keys = Object.keys(data.kernelspecs);
	    var kernelspecs = Object.create(null);
	    var defaultSpec = data.default;
	    for (var i = 0; i < keys.length; i++) {
	        var ks = data.kernelspecs[keys[i]];
	        try {
	            kernelspecs[keys[i]] = validateSpecModel(ks);
	        }
	        catch (err) {
	            // Remove the errant kernel spec.
	            console.warn("Removing errant kernel spec: " + keys[i]);
	        }
	    }
	    keys = Object.keys(kernelspecs);
	    if (!keys.length) {
	        throw new Error('No valid kernelspecs found');
	    }
	    if (!defaultSpec || typeof defaultSpec !== 'string' ||
	        !(defaultSpec in kernelspecs)) {
	        defaultSpec = keys[0];
	        console.warn("Default kernel not found, using '" + keys[0] + "'");
	    }
	    return {
	        default: defaultSpec,
	        kernelspecs: kernelspecs,
	    };
	}
	exports.validateSpecModels = validateSpecModels;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var iteration_1 = __webpack_require__(28);
	var json_1 = __webpack_require__(39);
	var searching_1 = __webpack_require__(29);
	var signaling_1 = __webpack_require__(21);
	var utils = __webpack_require__(6);
	var kernel_1 = __webpack_require__(26);
	/**
	 * An implementation of a kernel manager.
	 */
	var KernelManager = (function () {
	    /**
	     * Construct a new kernel manager.
	     *
	     * @param options - The default options for kernel.
	     */
	    function KernelManager(options) {
	        var _this = this;
	        if (options === void 0) { options = {}; }
	        this._baseUrl = '';
	        this._wsUrl = '';
	        this._token = '';
	        this._ajaxSettings = '';
	        this._running = [];
	        this._specs = null;
	        this._isDisposed = false;
	        this._runningTimer = -1;
	        this._specsTimer = -1;
	        this._isReady = false;
	        this._baseUrl = options.baseUrl || utils.getBaseUrl();
	        this._wsUrl = options.wsUrl || utils.getWsUrl(this._baseUrl);
	        this._token = options.token || utils.getConfigOption('token');
	        this._ajaxSettings = JSON.stringify(utils.ajaxSettingsWithToken(options.ajaxSettings, options.token));
	        // Initialize internal data.
	        this._readyPromise = this._refreshSpecs().then(function () {
	            return _this._refreshRunning();
	        });
	        // Set up polling.
	        this._runningTimer = setInterval(function () {
	            _this._refreshRunning();
	        }, 10000);
	        this._specsTimer = setInterval(function () {
	            _this._refreshSpecs();
	        }, 61000);
	    }
	    Object.defineProperty(KernelManager.prototype, "isDisposed", {
	        /**
	         * Test whether the terminal manager is disposed.
	         */
	        get: function () {
	            return this._isDisposed;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Dispose of the resources used by the manager.
	     */
	    KernelManager.prototype.dispose = function () {
	        if (this.isDisposed) {
	            return;
	        }
	        this._isDisposed = true;
	        clearInterval(this._runningTimer);
	        clearInterval(this._specsTimer);
	        signaling_1.clearSignalData(this);
	        this._specs = null;
	        this._running = [];
	    };
	    Object.defineProperty(KernelManager.prototype, "baseUrl", {
	        /**
	         * Get the base url of the manager.
	         */
	        get: function () {
	            return this._baseUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelManager.prototype, "wsUrl", {
	        /**
	         * Get the ws url of the manager.
	         */
	        get: function () {
	            return this._wsUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelManager.prototype, "ajaxSettings", {
	        /**
	         * The default ajax settings for the manager.
	         */
	        get: function () {
	            return JSON.parse(this._ajaxSettings);
	        },
	        /**
	         * Set the default ajax settings for the manager.
	         */
	        set: function (value) {
	            this._ajaxSettings = JSON.stringify(value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelManager.prototype, "specs", {
	        /**
	         * Get the most recently fetched kernel specs.
	         */
	        get: function () {
	            return this._specs;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelManager.prototype, "isReady", {
	        /**
	         * Test whether the manager is ready.
	         */
	        get: function () {
	            return this._isReady;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(KernelManager.prototype, "ready", {
	        /**
	         * A promise that fulfills when the manager is ready.
	         */
	        get: function () {
	            return this._readyPromise;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Create an iterator over the most recent running kernels.
	     *
	     * @returns A new iterator over the running kernels.
	     */
	    KernelManager.prototype.running = function () {
	        return iteration_1.iter(this._running);
	    };
	    /**
	     * Force a refresh of the specs from the server.
	     *
	     * @returns A promise that resolves when the specs are fetched.
	     *
	     * #### Notes
	     * This is intended to be called only in response to a user action,
	     * since the manager maintains its internal state.
	     */
	    KernelManager.prototype.refreshSpecs = function () {
	        return this._refreshSpecs();
	    };
	    /**
	     * Force a refresh of the running kernels.
	     *
	     * @returns A promise that with the list of running sessions.
	     *
	     * #### Notes
	     * This is not typically meant to be called by the user, since the
	     * manager maintains its own internal state.
	     */
	    KernelManager.prototype.refreshRunning = function () {
	        return this._refreshRunning();
	    };
	    /**
	     * Start a new kernel.  See also [[startNewKernel]].
	     *
	     * @param options - Overrides for the default options.
	     */
	    KernelManager.prototype.startNew = function (options) {
	        var _this = this;
	        return kernel_1.Kernel.startNew(this._getOptions(options)).then(function (kernel) {
	            _this._onStarted(kernel);
	            return kernel;
	        });
	    };
	    /**
	     * Find a kernel by id.
	     *
	     * @param options - Overrides for the default options.
	     */
	    KernelManager.prototype.findById = function (id, options) {
	        return kernel_1.Kernel.findById(id, this._getOptions(options));
	    };
	    /**
	     * Connect to a running kernel.  See also [[connectToKernel]].
	     *
	     * @param options - Overrides for the default options.
	     */
	    KernelManager.prototype.connectTo = function (id, options) {
	        var _this = this;
	        return kernel_1.Kernel.connectTo(id, this._getOptions(options)).then(function (kernel) {
	            _this._onStarted(kernel);
	            return kernel;
	        });
	    };
	    /**
	     * Shut down a kernel by id.
	     *
	     * @param options - Overrides for the default options.
	     *
	     * #### Notes
	     * This will emit [[runningChanged]] if the running kernels list
	     * changes.
	     */
	    KernelManager.prototype.shutdown = function (id, options) {
	        var _this = this;
	        return kernel_1.Kernel.shutdown(id, this._getOptions(options)).then(function () {
	            _this._onTerminated(id);
	        });
	    };
	    /**
	     * Handle a kernel terminating.
	     */
	    KernelManager.prototype._onTerminated = function (id) {
	        var index = searching_1.findIndex(this._running, function (value) { return value.id === id; });
	        if (index !== -1) {
	            this._running.splice(index, 1);
	            this.runningChanged.emit(this._running.slice());
	        }
	    };
	    /**
	     * Handle a kernel starting.
	     */
	    KernelManager.prototype._onStarted = function (kernel) {
	        var _this = this;
	        var id = kernel.id;
	        var index = searching_1.findIndex(this._running, function (value) { return value.id === id; });
	        if (index === -1) {
	            this._running.push(kernel.model);
	            this.runningChanged.emit(this._running.slice());
	        }
	        kernel.terminated.connect(function () {
	            _this._onTerminated(id);
	        });
	    };
	    /**
	     * Refresh the specs.
	     */
	    KernelManager.prototype._refreshSpecs = function () {
	        var _this = this;
	        var options = {
	            baseUrl: this._baseUrl,
	            token: this._token,
	            ajaxSettings: this.ajaxSettings
	        };
	        return kernel_1.Kernel.getSpecs(options).then(function (specs) {
	            if (!json_1.deepEqual(specs, _this._specs)) {
	                _this._specs = specs;
	                _this.specsChanged.emit(specs);
	            }
	        });
	    };
	    /**
	     * Refresh the running sessions.
	     */
	    KernelManager.prototype._refreshRunning = function () {
	        var _this = this;
	        return kernel_1.Kernel.listRunning(this._getOptions({})).then(function (running) {
	            _this._isReady = true;
	            if (!json_1.deepEqual(running, _this._running)) {
	                _this._running = running.slice();
	                _this.runningChanged.emit(running);
	            }
	        });
	    };
	    /**
	     * Get optionally overidden options.
	     */
	    KernelManager.prototype._getOptions = function (options) {
	        if (options === void 0) { options = {}; }
	        options.baseUrl = this._baseUrl;
	        options.wsUrl = this._wsUrl;
	        options.token = this._token;
	        options.ajaxSettings = options.ajaxSettings || this.ajaxSettings;
	        return options;
	    };
	    return KernelManager;
	}());
	exports.KernelManager = KernelManager;
	// Define the signal for the `KernelManager` class.
	signaling_1.defineSignal(KernelManager.prototype, 'specsChanged');
	signaling_1.defineSignal(KernelManager.prototype, 'runningChanged');


/***/ },
/* 39 */
/***/ function(module, exports) {

	/*-----------------------------------------------------------------------------
	| Copyright (c) 2014-2016, PhosphorJS Contributors
	|
	| Distributed under the terms of the BSD 3-Clause License.
	|
	| The full license is in the file LICENSE, distributed with this software.
	|----------------------------------------------------------------------------*/
	"use strict";
	/**
	 * Test whether a JSON value is a primitive.
	 *
	 * @param value - The JSON value of interest.
	 *
	 * @returns `true` if the value is a primitive or `null`,
	 *   `false` otherwise.
	 */
	function isPrimitive(value) {
	    return (value === null ||
	        typeof value === 'boolean' ||
	        typeof value === 'number' ||
	        typeof value === 'string');
	}
	exports.isPrimitive = isPrimitive;
	/**
	 * Test whether a JSON value is an array.
	 *
	 * @param value - The JSON value of interest.
	 *
	 * @returns `true` if the value is a an array, `false` otherwise.
	 */
	function isArray(value) {
	    return Array.isArray(value);
	}
	exports.isArray = isArray;
	/**
	 * Test whether a JSON value is an object.
	 *
	 * @param value - The JSON value of interest.
	 *
	 * @returns `true` if the value is a an object, `false` otherwise.
	 */
	function isObject(value) {
	    return !isPrimitive(value) && !isArray(value);
	}
	exports.isObject = isObject;
	/**
	 * Compare two JSON values for deep equality.
	 *
	 * @param first - The first JSON value of interest.
	 *
	 * @param second - The second JSON value of interest.
	 *
	 * @returns `true` if the values are equivalent, `false` otherwise.
	 */
	function deepEqual(first, second) {
	    // Check referential and primitive equality first.
	    if (first === second) {
	        return true;
	    }
	    // If one is a primitive, the `===` check ruled out the other.
	    if (isPrimitive(first) || isPrimitive(second)) {
	        return false;
	    }
	    // Bail if either is `undefined`.
	    if (!first || !second) {
	        return false;
	    }
	    // Test whether they are arrays.
	    var a1 = isArray(first);
	    var a2 = isArray(second);
	    // Bail if the types are different.
	    if (a1 !== a2) {
	        return false;
	    }
	    // If they are both arrays, compare them.
	    if (a1 && a2) {
	        return Private.arrayEqual(first, second);
	    }
	    // At this point, they must both be objects.
	    return Private.objectEqual(first, second);
	}
	exports.deepEqual = deepEqual;
	/**
	 * The namespace for the private module data.
	 */
	var Private;
	(function (Private) {
	    /**
	     * Compare two JSON arrays for deep equality.
	     */
	    function arrayEqual(first, second) {
	        // Test the arrays for equal length.
	        if (first.length !== second.length) {
	            return false;
	        }
	        // Compare the values for equality.
	        for (var i = 0, n = first.length; i < n; ++i) {
	            if (!deepEqual(first[i], second[i])) {
	                return false;
	            }
	        }
	        // At this point, the arrays are equal.
	        return true;
	    }
	    Private.arrayEqual = arrayEqual;
	    /**
	     * Compare two JSON objects for deep equality.
	     */
	    function objectEqual(first, second) {
	        // Get the keys for each object.
	        var k1 = Object.keys(first);
	        var k2 = Object.keys(second);
	        // Test the keys for equal length.
	        if (k1.length !== k2.length) {
	            return false;
	        }
	        // Sort the keys for equivalent order.
	        k1.sort();
	        k2.sort();
	        // Compare the keys for equality.
	        for (var i = 0, n = k1.length; i < n; ++i) {
	            if (k1[i] !== k2[i]) {
	                return false;
	            }
	        }
	        // Compare the values for equality.
	        for (var i = 0, n = k1.length; i < n; ++i) {
	            if (!deepEqual(first[k1[i]], second[k1[i]])) {
	                return false;
	            }
	        }
	        // At this point, the objects are equal.
	        return true;
	    }
	    Private.objectEqual = objectEqual;
	})(Private || (Private = {}));


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var signaling_1 = __webpack_require__(21);
	var contents_1 = __webpack_require__(16);
	var session_1 = __webpack_require__(41);
	var terminal_1 = __webpack_require__(46);
	var utils_1 = __webpack_require__(6);
	/**
	 * A Jupyter services manager.
	 */
	var ServiceManager = (function () {
	    /**
	     * Construct a new services provider.
	     */
	    function ServiceManager(options) {
	        var _this = this;
	        this._sessionManager = null;
	        this._contentsManager = null;
	        this._terminalManager = null;
	        this._isDisposed = false;
	        options = options || {};
	        options.wsUrl = options.wsUrl || utils_1.getWsUrl();
	        options.baseUrl = options.baseUrl || utils_1.getBaseUrl();
	        options.ajaxSettings = utils_1.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        this._sessionManager = new session_1.SessionManager(options);
	        this._contentsManager = new contents_1.ContentsManager(options);
	        this._terminalManager = new terminal_1.TerminalManager(options);
	        this._sessionManager.specsChanged.connect(function (sender, specs) {
	            _this.specsChanged.emit(specs);
	        });
	        this._readyPromise = this._sessionManager.ready.then(function () {
	            if (_this._terminalManager.isAvailable()) {
	                return _this._terminalManager.ready;
	            }
	        });
	    }
	    Object.defineProperty(ServiceManager.prototype, "isDisposed", {
	        /**
	         * Test whether the terminal manager is disposed.
	         */
	        get: function () {
	            return this._isDisposed;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Dispose of the resources used by the manager.
	     */
	    ServiceManager.prototype.dispose = function () {
	        if (this.isDisposed) {
	            return;
	        }
	        this._isDisposed = true;
	        signaling_1.clearSignalData(this);
	        this._sessionManager.dispose();
	        this._contentsManager.dispose();
	        this._sessionManager.dispose();
	    };
	    Object.defineProperty(ServiceManager.prototype, "specs", {
	        /**
	         * The kernel spec models.
	         */
	        get: function () {
	            return this._sessionManager.specs;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(ServiceManager.prototype, "baseUrl", {
	        /**
	         * Get the base url of the server.
	         */
	        get: function () {
	            return this._sessionManager.baseUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(ServiceManager.prototype, "sessions", {
	        /**
	         * Get the session manager instance.
	         */
	        get: function () {
	            return this._sessionManager;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(ServiceManager.prototype, "contents", {
	        /**
	         * Get the contents manager instance.
	         */
	        get: function () {
	            return this._contentsManager;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(ServiceManager.prototype, "terminals", {
	        /**
	         * Get the terminal manager instance.
	         */
	        get: function () {
	            return this._terminalManager;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(ServiceManager.prototype, "isReady", {
	        /**
	         * Test whether the manager is ready.
	         */
	        get: function () {
	            return this._sessionManager.isReady || this._terminalManager.isReady;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(ServiceManager.prototype, "ready", {
	        /**
	         * A promise that fulfills when the manager is ready.
	         */
	        get: function () {
	            return this._readyPromise;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return ServiceManager;
	}());
	exports.ServiceManager = ServiceManager;
	// Define the signals for the `ServiceManager` class.
	signaling_1.defineSignal(ServiceManager.prototype, 'specsChanged');


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(42));
	__export(__webpack_require__(43));


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var iteration_1 = __webpack_require__(28);
	var json_1 = __webpack_require__(39);
	var searching_1 = __webpack_require__(29);
	var signaling_1 = __webpack_require__(21);
	var kernel_1 = __webpack_require__(25);
	var utils = __webpack_require__(6);
	var session_1 = __webpack_require__(43);
	/**
	 * An implementation of a session manager.
	 */
	var SessionManager = (function () {
	    /**
	     * Construct a new session manager.
	     *
	     * @param options - The default options for each session.
	     */
	    function SessionManager(options) {
	        var _this = this;
	        if (options === void 0) { options = {}; }
	        this._baseUrl = '';
	        this._wsUrl = '';
	        this._ajaxSettings = '';
	        this._isDisposed = false;
	        this._running = [];
	        this._specs = null;
	        this._runningTimer = -1;
	        this._specsTimer = -1;
	        this._baseUrl = options.baseUrl || utils.getBaseUrl();
	        this._wsUrl = options.wsUrl || utils.getWsUrl(this._baseUrl);
	        this._ajaxSettings = JSON.stringify(options.ajaxSettings || {});
	        // Initialize internal data.
	        this._readyPromise = this._refreshSpecs().then(function () {
	            return _this._refreshRunning();
	        });
	        // Set up polling.
	        this._runningTimer = setInterval(function () {
	            _this._refreshRunning();
	        }, 10000);
	        this._specsTimer = setInterval(function () {
	            _this._refreshSpecs();
	        }, 61000);
	    }
	    Object.defineProperty(SessionManager.prototype, "isDisposed", {
	        /**
	         * Test whether the terminal manager is disposed.
	         */
	        get: function () {
	            return this._isDisposed;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Dispose of the resources used by the manager.
	     */
	    SessionManager.prototype.dispose = function () {
	        if (this.isDisposed) {
	            return;
	        }
	        this._isDisposed = true;
	        clearInterval(this._runningTimer);
	        clearInterval(this._specsTimer);
	        signaling_1.clearSignalData(this);
	        this._running = [];
	    };
	    Object.defineProperty(SessionManager.prototype, "baseUrl", {
	        /**
	         * The base url of the manager.
	         */
	        get: function () {
	            return this._baseUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SessionManager.prototype, "wsUrl", {
	        /**
	         * The base ws url of the manager.
	         */
	        get: function () {
	            return this._wsUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SessionManager.prototype, "ajaxSettings", {
	        /**
	         * The default ajax settings for the manager.
	         */
	        get: function () {
	            return JSON.parse(this._ajaxSettings);
	        },
	        /**
	         * Set the default ajax settings for the manager.
	         */
	        set: function (value) {
	            this._ajaxSettings = JSON.stringify(value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SessionManager.prototype, "specs", {
	        /**
	         * Get the most recently fetched kernel specs.
	         */
	        get: function () {
	            return this._specs;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SessionManager.prototype, "isReady", {
	        /**
	         * Test whether the manager is ready.
	         */
	        get: function () {
	            return this._specs !== null;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SessionManager.prototype, "ready", {
	        /**
	         * A promise that fulfills when the manager is ready.
	         */
	        get: function () {
	            return this._readyPromise;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Create an iterator over the most recent running sessions.
	     *
	     * @returns A new iterator over the running sessions.
	     */
	    SessionManager.prototype.running = function () {
	        return iteration_1.iter(this._running);
	    };
	    /**
	     * Force a refresh of the specs from the server.
	     *
	     * @returns A promise that resolves when the specs are fetched.
	     *
	     * #### Notes
	     * This is intended to be called only in response to a user action,
	     * since the manager maintains its internal state.
	     */
	    SessionManager.prototype.refreshSpecs = function () {
	        return this._refreshSpecs();
	    };
	    /**
	     * Force a refresh of the running sessions.
	     *
	     * @returns A promise that with the list of running sessions.
	     *
	     * #### Notes
	     * This is not typically meant to be called by the user, since the
	     * manager maintains its own internal state.
	     */
	    SessionManager.prototype.refreshRunning = function () {
	        return this._refreshRunning();
	    };
	    /**
	     * Start a new session.  See also [[startNewSession]].
	     *
	     * @param options - Overrides for the default options, must include a
	     *   `'path'`.
	     */
	    SessionManager.prototype.startNew = function (options) {
	        var _this = this;
	        return session_1.Session.startNew(this._getOptions(options)).then(function (session) {
	            _this._onStarted(session);
	            return session;
	        });
	    };
	    /**
	     * Find a session by id.
	     */
	    SessionManager.prototype.findById = function (id, options) {
	        return session_1.Session.findById(id, this._getOptions(options));
	    };
	    /**
	     * Find a session by path.
	     */
	    SessionManager.prototype.findByPath = function (path, options) {
	        return session_1.Session.findByPath(path, this._getOptions(options));
	    };
	    /*
	     * Connect to a running session.  See also [[connectToSession]].
	     */
	    SessionManager.prototype.connectTo = function (id, options) {
	        var _this = this;
	        return session_1.Session.connectTo(id, this._getOptions(options)).then(function (session) {
	            _this._onStarted(session);
	            return session;
	        });
	    };
	    /**
	     * Shut down a session by id.
	     */
	    SessionManager.prototype.shutdown = function (id, options) {
	        var _this = this;
	        return session_1.Session.shutdown(id, this._getOptions(options)).then(function () {
	            _this._onTerminated(id);
	        });
	    };
	    /**
	     * Get optionally overidden options.
	     */
	    SessionManager.prototype._getOptions = function (options) {
	        if (options === void 0) { options = {}; }
	        options.baseUrl = this._baseUrl;
	        options.wsUrl = this._wsUrl;
	        options.ajaxSettings = options.ajaxSettings || this.ajaxSettings;
	        return options;
	    };
	    /**
	     * Handle a session terminating.
	     */
	    SessionManager.prototype._onTerminated = function (id) {
	        var index = searching_1.findIndex(this._running, function (value) { return value.id === id; });
	        if (index !== -1) {
	            this._running.splice(index, 1);
	            this.runningChanged.emit(this._running.slice());
	        }
	    };
	    /**
	     * Handle a session starting.
	     */
	    SessionManager.prototype._onStarted = function (session) {
	        var _this = this;
	        var id = session.id;
	        var index = searching_1.findIndex(this._running, function (value) { return value.id === id; });
	        if (index === -1) {
	            this._running.push(session.model);
	            this.runningChanged.emit(this._running.slice());
	        }
	        session.terminated.connect(function () {
	            _this._onTerminated(id);
	        });
	        session.pathChanged.connect(function () {
	            _this._onChanged(session.model);
	        });
	        session.kernelChanged.connect(function () {
	            _this._onChanged(session.model);
	        });
	    };
	    /**
	     * Handle a change to a session.
	     */
	    SessionManager.prototype._onChanged = function (model) {
	        var index = searching_1.findIndex(this._running, function (value) { return value.id === model.id; });
	        if (index !== -1) {
	            this._running[index] = model;
	            this.runningChanged.emit(this._running.slice());
	        }
	    };
	    /**
	     * Refresh the specs.
	     */
	    SessionManager.prototype._refreshSpecs = function () {
	        var _this = this;
	        var options = {
	            baseUrl: this._baseUrl,
	            ajaxSettings: this.ajaxSettings
	        };
	        return kernel_1.Kernel.getSpecs(options).then(function (specs) {
	            if (!json_1.deepEqual(specs, _this._specs)) {
	                _this._specs = specs;
	                _this.specsChanged.emit(specs);
	            }
	        });
	    };
	    /**
	     * Refresh the running sessions.
	     */
	    SessionManager.prototype._refreshRunning = function () {
	        var _this = this;
	        return session_1.Session.listRunning(this._getOptions({})).then(function (running) {
	            if (!json_1.deepEqual(running, _this._running)) {
	                _this._running = running.slice();
	                _this.runningChanged.emit(running);
	            }
	        });
	    };
	    return SessionManager;
	}());
	exports.SessionManager = SessionManager;
	// Define the signals for the `SessionManager` class.
	signaling_1.defineSignal(SessionManager.prototype, 'specsChanged');
	signaling_1.defineSignal(SessionManager.prototype, 'runningChanged');


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var default_1 = __webpack_require__(44);
	/**
	 * A namespace for session interfaces and factory functions.
	 */
	var Session;
	(function (Session) {
	    /**
	     * List the running sessions.
	     *
	     * @param options - The options used for the request.
	     *
	     * @returns A promise that resolves with the list of session models.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/sessions), and validates the response.
	     *
	     * All client-side sessions are updated with current information.
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     */
	    function listRunning(options) {
	        return default_1.DefaultSession.listRunning(options);
	    }
	    Session.listRunning = listRunning;
	    /**
	     * Start a new session.
	     *
	     * @param options - The options used to start the session.
	     *
	     * @returns A promise that resolves with the session instance.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/sessions), and validates the response.
	     *
	     * A path must be provided.  If a kernel id is given, it will
	     * connect to an existing kernel.  If no kernel id or name is given,
	     * the server will start the default kernel type.
	     *
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     *
	     * Wrap the result in an Session object. The promise is fulfilled
	     * when the session is created on the server, otherwise the promise is
	     * rejected.
	     */
	    function startNew(options) {
	        return default_1.DefaultSession.startNew(options);
	    }
	    Session.startNew = startNew;
	    /**
	     * Find a session by id.
	     *
	     * @param id - The id of the target session.
	     *
	     * @param options - The options used to fetch the session.
	     *
	     * @returns A promise that resolves with the session model.
	     *
	     * #### Notes
	     * If the session was already started via `startNew`, the existing
	     * Session object's information is used in the fulfillment value.
	     *
	     * Otherwise, if `options` are given, we attempt to find to the existing
	     * session.
	     * The promise is fulfilled when the session is found,
	     * otherwise the promise is rejected.
	     */
	    function findById(id, options) {
	        return default_1.DefaultSession.findById(id, options);
	    }
	    Session.findById = findById;
	    /**
	     * Find a session by path.
	     *
	     * @param path - The path of the target session.
	     *
	     * @param options - The options used to fetch the session.
	     *
	     * @returns A promise that resolves with the session model.
	     *
	     * #### Notes
	     * If the session was already started via `startNewSession`, the existing
	     * Session object's info is used in the fulfillment value.
	     *
	     * Otherwise, if `options` are given, we attempt to find to the existing
	     * session using [listRunningSessions].
	     * The promise is fulfilled when the session is found,
	     * otherwise the promise is rejected.
	     *
	     * If the session was not already started and no `options` are given,
	     * the promise is rejected.
	     */
	    function findByPath(path, options) {
	        return default_1.DefaultSession.findByPath(path, options);
	    }
	    Session.findByPath = findByPath;
	    /**
	     * Connect to a running session.
	     *
	     * @param id - The id of the target session.
	     *
	     * @param options - The options used to fetch the session.
	     *
	     * @returns A promise that resolves with the session instance.
	     *
	     * #### Notes
	     * If the session was already started via `startNew`, the existing
	     * Session object is used as the fulfillment value.
	     *
	     * Otherwise, if `options` are given, we attempt to connect to the existing
	     * session.
	     * The promise is fulfilled when the session is ready on the server,
	     * otherwise the promise is rejected.
	     *
	     * If the session was not already started and no `options` are given,
	     * the promise is rejected.
	     */
	    function connectTo(id, options) {
	        return default_1.DefaultSession.connectTo(id, options);
	    }
	    Session.connectTo = connectTo;
	    /**
	     * Shut down a session by id.
	     *
	     * @param id - The id of the target session.
	     *
	     * @param options - The options used to fetch the session.
	     *
	     * @returns A promise that resolves when the session is shut down.
	     *
	     */
	    function shutdown(id, options) {
	        if (options === void 0) { options = {}; }
	        return default_1.DefaultSession.shutdown(id, options);
	    }
	    Session.shutdown = shutdown;
	})(Session = exports.Session || (exports.Session = {}));


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var iteration_1 = __webpack_require__(28);
	var searching_1 = __webpack_require__(29);
	var vector_1 = __webpack_require__(31);
	var signaling_1 = __webpack_require__(21);
	var kernel_1 = __webpack_require__(25);
	var utils = __webpack_require__(6);
	var validate = __webpack_require__(45);
	/**
	 * The url for the session service.
	 */
	var SESSION_SERVICE_URL = 'api/sessions';
	/**
	 * Session object for accessing the session REST api. The session
	 * should be used to start kernels and then shut them down -- for
	 * all other operations, the kernel object should be used.
	 */
	var DefaultSession = (function () {
	    /**
	     * Construct a new session.
	     */
	    function DefaultSession(options, id, kernel) {
	        this._id = '';
	        this._path = '';
	        this._ajaxSettings = '';
	        this._token = '';
	        this._kernel = null;
	        this._uuid = '';
	        this._baseUrl = '';
	        this._options = null;
	        this._updating = false;
	        this._id = id;
	        this._path = options.path;
	        this._baseUrl = options.baseUrl || utils.getBaseUrl();
	        this._uuid = utils.uuid();
	        this._ajaxSettings = JSON.stringify(utils.ajaxSettingsWithToken(options.ajaxSettings || {}, options.token));
	        this._token = options.token || utils.getConfigOption('token');
	        Private.runningSessions.pushBack(this);
	        this.setupKernel(kernel);
	        this._options = utils.copy(options);
	    }
	    Object.defineProperty(DefaultSession.prototype, "id", {
	        /**
	         * Get the session id.
	         */
	        get: function () {
	            return this._id;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultSession.prototype, "kernel", {
	        /**
	         * Get the session kernel object.
	         *
	         * #### Notes
	         * This is a read-only property, and can be altered by [changeKernel].
	         * Use the [statusChanged] and [unhandledMessage] signals on the session
	         * instead of the ones on the kernel.
	         */
	        get: function () {
	            return this._kernel;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultSession.prototype, "path", {
	        /**
	         * Get the session path.
	         */
	        get: function () {
	            return this._path;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultSession.prototype, "model", {
	        /**
	         * Get the model associated with the session.
	         */
	        get: function () {
	            return {
	                id: this.id,
	                kernel: this.kernel.model,
	                notebook: {
	                    path: this.path
	                }
	            };
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultSession.prototype, "status", {
	        /**
	         * The current status of the session.
	         *
	         * #### Notes
	         * This is a delegate to the kernel status.
	         */
	        get: function () {
	            return this._kernel ? this._kernel.status : 'dead';
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultSession.prototype, "baseUrl", {
	        /**
	         * Get the base url of the session.
	         */
	        get: function () {
	            return this._baseUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultSession.prototype, "ajaxSettings", {
	        /**
	         * Get a copy of the default ajax settings for the session.
	         */
	        get: function () {
	            return JSON.parse(this._ajaxSettings);
	        },
	        /**
	         * Set the default ajax settings for the session.
	         */
	        set: function (value) {
	            this._ajaxSettings = JSON.stringify(value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultSession.prototype, "isDisposed", {
	        /**
	         * Test whether the session has been disposed.
	         */
	        get: function () {
	            return this._options === null;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Clone the current session with a new clientId.
	     */
	    DefaultSession.prototype.clone = function () {
	        var _this = this;
	        var options = this._getKernelOptions();
	        return kernel_1.Kernel.connectTo(this.kernel.id, options).then(function (kernel) {
	            options = utils.copy(_this._options);
	            options.ajaxSettings = _this.ajaxSettings;
	            return new DefaultSession(options, _this._id, kernel);
	        });
	    };
	    /**
	     * Update the session based on a session model from the server.
	     */
	    DefaultSession.prototype.update = function (model) {
	        var _this = this;
	        // Avoid a race condition if we are waiting for a REST call return.
	        if (this._updating) {
	            return Promise.resolve(void 0);
	        }
	        if (this._path !== model.notebook.path) {
	            this.pathChanged.emit(model.notebook.path);
	        }
	        this._path = model.notebook.path;
	        if (this._kernel.isDisposed || model.kernel.id !== this._kernel.id) {
	            var options = this._getKernelOptions();
	            options.name = model.kernel.name;
	            return kernel_1.Kernel.connectTo(model.kernel.id, options).then(function (kernel) {
	                _this.setupKernel(kernel);
	                _this.kernelChanged.emit(kernel);
	            });
	        }
	        return Promise.resolve(void 0);
	    };
	    /**
	     * Dispose of the resources held by the session.
	     */
	    DefaultSession.prototype.dispose = function () {
	        if (this.isDisposed) {
	            return;
	        }
	        this._options = null;
	        if (this._kernel) {
	            this._kernel.dispose();
	        }
	        Private.runningSessions.remove(this);
	        this._kernel = null;
	        signaling_1.clearSignalData(this);
	    };
	    /**
	     * Change the session path.
	     *
	     * @param path - The new session path.
	     *
	     * #### Notes
	     * This uses the Jupyter REST API, and the response is validated.
	     * The promise is fulfilled on a valid response and rejected otherwise.
	     */
	    DefaultSession.prototype.rename = function (path) {
	        if (this.isDisposed) {
	            return Promise.reject(new Error('Session is disposed'));
	        }
	        var data = JSON.stringify({
	            notebook: { path: path }
	        });
	        return this._patch(data).then(function () { return void 0; });
	    };
	    /**
	     * Change the kernel.
	     *
	     * @params options - The name or id of the new kernel.
	     *
	     * #### Notes
	     * This shuts down the existing kernel and creates a new kernel,
	     * keeping the existing session ID and session path.
	     */
	    DefaultSession.prototype.changeKernel = function (options) {
	        var _this = this;
	        if (this.isDisposed) {
	            return Promise.reject(new Error('Session is disposed'));
	        }
	        this._kernel.dispose();
	        var data = JSON.stringify({ kernel: options });
	        return this._patch(data).then(function () {
	            return _this.kernel;
	        });
	    };
	    /**
	     * Kill the kernel and shutdown the session.
	     *
	     * @returns - The promise fulfilled on a valid response from the server.
	     *
	     * #### Notes
	     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/sessions), and validates the response.
	     * Emits a [sessionDied] signal on success.
	     */
	    DefaultSession.prototype.shutdown = function () {
	        if (this.isDisposed) {
	            return Promise.reject(new Error('Session is disposed'));
	        }
	        return Private.shutdownSession(this.id, this._baseUrl, this.ajaxSettings);
	    };
	    /**
	     * Handle connections to a kernel.
	     */
	    DefaultSession.prototype.setupKernel = function (kernel) {
	        this._kernel = kernel;
	        kernel.statusChanged.connect(this.onKernelStatus, this);
	        kernel.unhandledMessage.connect(this.onUnhandledMessage, this);
	        kernel.iopubMessage.connect(this.onIOPubMessage, this);
	    };
	    /**
	     * Handle to changes in the Kernel status.
	     */
	    DefaultSession.prototype.onKernelStatus = function (sender, state) {
	        this.statusChanged.emit(state);
	    };
	    /**
	     * Handle iopub kernel messages.
	     */
	    DefaultSession.prototype.onIOPubMessage = function (sender, msg) {
	        this.iopubMessage.emit(msg);
	    };
	    /**
	     * Handle unhandled kernel messages.
	     */
	    DefaultSession.prototype.onUnhandledMessage = function (sender, msg) {
	        this.unhandledMessage.emit(msg);
	    };
	    /**
	     * Get the options used to create a new kernel.
	     */
	    DefaultSession.prototype._getKernelOptions = function () {
	        return {
	            baseUrl: this._options.baseUrl,
	            wsUrl: this._options.wsUrl,
	            username: this.kernel.username,
	            ajaxSettings: this.ajaxSettings
	        };
	    };
	    /**
	     * Send a PATCH to the server, updating the session path or the kernel.
	     */
	    DefaultSession.prototype._patch = function (data) {
	        var _this = this;
	        var url = Private.getSessionUrl(this._baseUrl, this._id);
	        var ajaxSettings = this.ajaxSettings;
	        ajaxSettings.method = 'PATCH';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.data = data;
	        ajaxSettings.contentType = 'application/json';
	        ajaxSettings.cache = false;
	        this._updating = true;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            _this._updating = false;
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            var value = success.data;
	            try {
	                validate.validateModel(value);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            return Private.updateFromServer(value);
	        }, function (error) {
	            _this._updating = false;
	            return Private.onSessionError(error);
	        });
	    };
	    return DefaultSession;
	}());
	exports.DefaultSession = DefaultSession;
	// Define the signals for the `DefaultSession` class.
	signaling_1.defineSignal(DefaultSession.prototype, 'terminated');
	signaling_1.defineSignal(DefaultSession.prototype, 'kernelChanged');
	signaling_1.defineSignal(DefaultSession.prototype, 'statusChanged');
	signaling_1.defineSignal(DefaultSession.prototype, 'iopubMessage');
	signaling_1.defineSignal(DefaultSession.prototype, 'unhandledMessage');
	signaling_1.defineSignal(DefaultSession.prototype, 'pathChanged');
	/**
	 * The namespace for `DefaultSession` statics.
	 */
	var DefaultSession;
	(function (DefaultSession) {
	    /**
	     * List the running sessions.
	     */
	    function listRunning(options) {
	        return Private.listRunning(options);
	    }
	    DefaultSession.listRunning = listRunning;
	    /**
	     * Start a new session.
	     */
	    function startNew(options) {
	        return Private.startNew(options);
	    }
	    DefaultSession.startNew = startNew;
	    /**
	     * Find a session by id.
	     */
	    function findById(id, options) {
	        return Private.findById(id, options);
	    }
	    DefaultSession.findById = findById;
	    /**
	     * Find a session by path.
	     */
	    function findByPath(path, options) {
	        return Private.findByPath(path, options);
	    }
	    DefaultSession.findByPath = findByPath;
	    /**
	     * Connect to a running session.
	     */
	    function connectTo(id, options) {
	        return Private.connectTo(id, options);
	    }
	    DefaultSession.connectTo = connectTo;
	    /**
	     * Shut down a session by id.
	     */
	    function shutdown(id, options) {
	        if (options === void 0) { options = {}; }
	        return Private.shutdown(id, options);
	    }
	    DefaultSession.shutdown = shutdown;
	})(DefaultSession = exports.DefaultSession || (exports.DefaultSession = {}));
	/**
	 * A namespace for session private data.
	 */
	var Private;
	(function (Private) {
	    /**
	     * The running sessions.
	     */
	    Private.runningSessions = new vector_1.Vector();
	    /**
	     * List the running sessions.
	     */
	    function listRunning(options) {
	        if (options === void 0) { options = {}; }
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var url = utils.urlPathJoin(baseUrl, SESSION_SERVICE_URL);
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'GET';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            var data = success.data;
	            if (!Array.isArray(success.data)) {
	                return utils.makeAjaxError(success, 'Invalid Session list');
	            }
	            for (var i = 0; i < data.length; i++) {
	                try {
	                    validate.validateModel(data[i]);
	                }
	                catch (err) {
	                    return utils.makeAjaxError(success, err.message);
	                }
	            }
	            return updateRunningSessions(data);
	        }, Private.onSessionError);
	    }
	    Private.listRunning = listRunning;
	    /**
	     * Start a new session.
	     */
	    function startNew(options) {
	        if (options.path === void 0) {
	            return Promise.reject(new Error('Must specify a path'));
	        }
	        return startSession(options).then(function (model) {
	            return createSession(model, options);
	        });
	    }
	    Private.startNew = startNew;
	    /**
	     * Find a session by id.
	     */
	    function findById(id, options) {
	        if (options === void 0) { options = {}; }
	        var session = searching_1.find(Private.runningSessions, function (value) { return value.id === id; });
	        if (session) {
	            return Promise.resolve(session.model);
	        }
	        return getSessionModel(id, options).catch(function () {
	            var msg = "No running session for id: " + id;
	            return typedThrow(msg);
	        });
	    }
	    Private.findById = findById;
	    /**
	     * Find a session by path.
	     */
	    function findByPath(path, options) {
	        if (options === void 0) { options = {}; }
	        var session = searching_1.find(Private.runningSessions, function (value) { return value.path === path; });
	        if (session) {
	            return Promise.resolve(session.model);
	        }
	        return listRunning(options).then(function (models) {
	            var model = searching_1.find(models, function (value) {
	                return value.notebook.path === path;
	            });
	            if (model) {
	                return model;
	            }
	            var msg = "No running session for path: " + path;
	            return typedThrow(msg);
	        });
	    }
	    Private.findByPath = findByPath;
	    /**
	     * Connect to a running session.
	     */
	    function connectTo(id, options) {
	        if (options === void 0) { options = {}; }
	        var session = searching_1.find(Private.runningSessions, function (value) { return value.id === id; });
	        if (session) {
	            return Promise.resolve(session.clone());
	        }
	        return getSessionModel(id, options).then(function (model) {
	            return createSession(model, options);
	        }).catch(function () {
	            var msg = "No running session with id: " + id;
	            return typedThrow(msg);
	        });
	    }
	    Private.connectTo = connectTo;
	    /**
	     * Shut down a session by id.
	     */
	    function shutdown(id, options) {
	        if (options === void 0) { options = {}; }
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        return shutdownSession(id, baseUrl, ajaxSettings);
	    }
	    Private.shutdown = shutdown;
	    /**
	     * Create a new session, or return an existing session if a session if
	     * the session path already exists
	     */
	    function startSession(options) {
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var url = utils.urlPathJoin(baseUrl, SESSION_SERVICE_URL);
	        var model = {
	            kernel: { name: options.kernelName, id: options.kernelId },
	            notebook: { path: options.path }
	        };
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'POST';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.data = JSON.stringify(model);
	        ajaxSettings.contentType = 'application/json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 201) {
	                return utils.makeAjaxError(success);
	            }
	            try {
	                validate.validateModel(success.data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            var data = success.data;
	            return updateFromServer(data);
	        }, onSessionError);
	    }
	    Private.startSession = startSession;
	    /**
	     * Create a Promise for a kernel object given a session model and options.
	     */
	    function createKernel(options) {
	        var kernelOptions = {
	            name: options.kernelName,
	            baseUrl: options.baseUrl || utils.getBaseUrl(),
	            wsUrl: options.wsUrl,
	            username: options.username,
	            clientId: options.clientId,
	            token: options.token,
	            ajaxSettings: options.ajaxSettings
	        };
	        return kernel_1.Kernel.connectTo(options.kernelId, kernelOptions);
	    }
	    /**
	     * Create a Session object.
	     *
	     * @returns - A promise that resolves with a started session.
	     */
	    function createSession(model, options) {
	        options.kernelName = model.kernel.name;
	        options.kernelId = model.kernel.id;
	        options.path = model.notebook.path;
	        return createKernel(options).then(function (kernel) {
	            return new DefaultSession(options, model.id, kernel);
	        }).catch(function (error) {
	            return typedThrow('Session failed to start: ' + error.message);
	        });
	    }
	    Private.createSession = createSession;
	    /**
	     * Get a full session model from the server by session id string.
	     */
	    function getSessionModel(id, options) {
	        options = options || {};
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var url = getSessionUrl(baseUrl, id);
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'GET';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            var data = success.data;
	            try {
	                validate.validateModel(data);
	            }
	            catch (err) {
	                return utils.makeAjaxError(success, err.message);
	            }
	            return updateFromServer(data);
	        }, Private.onSessionError);
	    }
	    Private.getSessionModel = getSessionModel;
	    /**
	     * Update the running sessions based on new data from the server.
	     */
	    function updateRunningSessions(sessions) {
	        var promises = [];
	        iteration_1.each(Private.runningSessions, function (session) {
	            var updated = searching_1.find(sessions, function (sId) {
	                if (session.id === sId.id) {
	                    promises.push(session.update(sId));
	                    return true;
	                }
	            });
	            // If session is no longer running on disk, emit dead signal.
	            if (!updated && session.status !== 'dead') {
	                session.terminated.emit(void 0);
	            }
	        });
	        return Promise.all(promises).then(function () { return sessions; });
	    }
	    Private.updateRunningSessions = updateRunningSessions;
	    /**
	     * Update the running sessions given an updated session Id.
	     */
	    function updateFromServer(model) {
	        var promises = [];
	        iteration_1.each(Private.runningSessions, function (session) {
	            if (session.id === model.id) {
	                promises.push(session.update(model));
	            }
	        });
	        return Promise.all(promises).then(function () { return model; });
	    }
	    Private.updateFromServer = updateFromServer;
	    /**
	     * Shut down a session by id.
	     */
	    function shutdownSession(id, baseUrl, ajaxSettings) {
	        if (ajaxSettings === void 0) { ajaxSettings = {}; }
	        var url = getSessionUrl(baseUrl, id);
	        ajaxSettings.method = 'DELETE';
	        ajaxSettings.dataType = 'json';
	        ajaxSettings.cache = false;
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 204) {
	                return utils.makeAjaxError(success);
	            }
	            killSessions(id);
	        }, function (err) {
	            if (err.xhr.status === 404) {
	                var response = JSON.parse(err.xhr.responseText);
	                console.warn(response['message']);
	                killSessions(id);
	                return;
	            }
	            if (err.xhr.status === 410) {
	                err.throwError = 'The kernel was deleted but the session was not';
	            }
	            return onSessionError(err);
	        });
	    }
	    Private.shutdownSession = shutdownSession;
	    /**
	     * Kill the sessions by id.
	     */
	    function killSessions(id) {
	        iteration_1.each(iteration_1.toArray(Private.runningSessions), function (session) {
	            if (session.id === id) {
	                session.terminated.emit(void 0);
	                session.dispose();
	            }
	        });
	    }
	    /**
	     * Get a session url.
	     */
	    function getSessionUrl(baseUrl, id) {
	        return utils.urlPathJoin(baseUrl, SESSION_SERVICE_URL, id);
	    }
	    Private.getSessionUrl = getSessionUrl;
	    /**
	     * Handle an error on a session Ajax call.
	     */
	    function onSessionError(error) {
	        var text = (error.throwError ||
	            error.xhr.statusText ||
	            error.xhr.responseText);
	        var msg = "API request failed: " + text;
	        console.error(msg);
	        return Promise.reject(error);
	    }
	    Private.onSessionError = onSessionError;
	    /**
	     * Throw a typed error.
	     */
	    function typedThrow(msg) {
	        throw new Error(msg);
	    }
	    Private.typedThrow = typedThrow;
	})(Private || (Private = {}));


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var validate_1 = __webpack_require__(37);
	/**
	 * Validate a property as being on an object, and optionally
	 * of a given type.
	 */
	function validateProperty(object, name, typeName) {
	    if (!object.hasOwnProperty(name)) {
	        throw Error("Missing property '" + name + "'");
	    }
	    if (typeName !== void 0) {
	        var valid = true;
	        var value = object[name];
	        switch (typeName) {
	            case 'array':
	                valid = Array.isArray(value);
	                break;
	            case 'object':
	                valid = typeof value !== 'undefined';
	                break;
	            default:
	                valid = typeof value === typeName;
	        }
	        if (!valid) {
	            throw new Error("Property '" + name + "' is not of type '" + typeName);
	        }
	    }
	}
	/**
	 * Validate an `Session.IModel` object.
	 */
	function validateModel(model) {
	    validateProperty(model, 'id', 'string');
	    validateProperty(model, 'notebook', 'object');
	    validateProperty(model, 'kernel', 'object');
	    validate_1.validateModel(model.kernel);
	    validateProperty(model.notebook, 'path', 'string');
	}
	exports.validateModel = validateModel;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(47));
	__export(__webpack_require__(48));


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var iteration_1 = __webpack_require__(28);
	var json_1 = __webpack_require__(39);
	var searching_1 = __webpack_require__(29);
	var signaling_1 = __webpack_require__(21);
	var utils = __webpack_require__(6);
	var terminal_1 = __webpack_require__(48);
	/**
	 * A terminal session manager.
	 */
	var TerminalManager = (function () {
	    /**
	     * Construct a new terminal manager.
	     */
	    function TerminalManager(options) {
	        var _this = this;
	        if (options === void 0) { options = {}; }
	        this._baseUrl = '';
	        this._wsUrl = '';
	        this._ajaxSettings = '';
	        this._running = [];
	        this._isDisposed = false;
	        this._isReady = false;
	        this._refreshTimer = -1;
	        this._baseUrl = options.baseUrl || utils.getBaseUrl();
	        this._wsUrl = options.wsUrl || utils.getWsUrl(this._baseUrl);
	        this._ajaxSettings = JSON.stringify(options.ajaxSettings || {});
	        // Set up state handling if terminals are available.
	        if (terminal_1.TerminalSession.isAvailable()) {
	            // Initialize internal data.
	            this._readyPromise = this._refreshRunning();
	            // Set up polling.
	            this._refreshTimer = setInterval(function () {
	                _this._refreshRunning();
	            }, 10000);
	        }
	    }
	    Object.defineProperty(TerminalManager.prototype, "isDisposed", {
	        /**
	         * Test whether the terminal manager is disposed.
	         */
	        get: function () {
	            return this._isDisposed;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TerminalManager.prototype, "baseUrl", {
	        /**
	         * The base url of the manager.
	         */
	        get: function () {
	            return this._baseUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TerminalManager.prototype, "wsUrl", {
	        /**
	         * The base ws url of the manager.
	         */
	        get: function () {
	            return this._wsUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TerminalManager.prototype, "ajaxSettings", {
	        /**
	         * The default ajax settings for the manager.
	         */
	        get: function () {
	            return JSON.parse(this._ajaxSettings);
	        },
	        /**
	         * Set the default ajax settings for the manager.
	         */
	        set: function (value) {
	            this._ajaxSettings = JSON.stringify(value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TerminalManager.prototype, "isReady", {
	        /**
	         * Test whether the manger is ready.
	         */
	        get: function () {
	            return this._isReady;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Dispose of the resources used by the manager.
	     */
	    TerminalManager.prototype.dispose = function () {
	        if (this.isDisposed) {
	            return;
	        }
	        this._isDisposed = true;
	        clearInterval(this._refreshTimer);
	        signaling_1.clearSignalData(this);
	        this._running = [];
	    };
	    Object.defineProperty(TerminalManager.prototype, "ready", {
	        /**
	         * A promise that fulfills when the manager is ready.
	         */
	        get: function () {
	            return this._readyPromise || Promise.reject('Terminals unavailable');
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Whether the terminal service is available.
	     */
	    TerminalManager.prototype.isAvailable = function () {
	        return terminal_1.TerminalSession.isAvailable();
	    };
	    /**
	     * Create an iterator over the most recent running terminals.
	     *
	     * @returns A new iterator over the running terminals.
	     */
	    TerminalManager.prototype.running = function () {
	        return iteration_1.iter(this._running);
	    };
	    /**
	     * Create a new terminal session.
	     *
	     * @param ajaxSettings - The ajaxSettings to use, overrides manager
	     *   settings.
	     *
	     * @returns A promise that resolves with the terminal instance.
	     *
	     * #### Notes
	     * The baseUrl and wsUrl of the options will be forced
	     * to the ones used by the manager. The ajaxSettings of the manager
	     * will be used unless overridden.
	     */
	    TerminalManager.prototype.startNew = function (options) {
	        var _this = this;
	        return terminal_1.TerminalSession.startNew(this._getOptions(options)).then(function (session) {
	            _this._onStarted(session);
	            return session;
	        });
	    };
	    /*
	     * Connect to a running session.
	     *
	     * @param name - The name of the target session.
	     *
	     * @param ajaxSettings - The ajaxSettings to use, overrides manager
	     *   settings.
	     *
	     * @returns A promise that resolves with the new session instance.
	     *
	     * #### Notes
	     * The baseUrl and wsUrl of the options will be forced
	     * to the ones used by the manager. The ajaxSettings of the manager
	     * will be used unless overridden.
	     */
	    TerminalManager.prototype.connectTo = function (name, options) {
	        var _this = this;
	        return terminal_1.TerminalSession.connectTo(name, this._getOptions(options)).then(function (session) {
	            _this._onStarted(session);
	            return session;
	        });
	    };
	    /**
	     * Shut down a terminal session by name.
	     */
	    TerminalManager.prototype.shutdown = function (name) {
	        var _this = this;
	        return terminal_1.TerminalSession.shutdown(name, this._getOptions()).then(function () {
	            _this._onTerminated(name);
	        });
	    };
	    /**
	     * Force a refresh of the running sessions.
	     *
	     * @returns A promise that with the list of running sessions.
	     *
	     * #### Notes
	     * This is not typically meant to be called by the user, since the
	     * manager maintains its own internal state.
	     */
	    TerminalManager.prototype.refreshRunning = function () {
	        return this._refreshRunning();
	    };
	    /**
	     * Handle a session terminating.
	     */
	    TerminalManager.prototype._onTerminated = function (name) {
	        var index = searching_1.findIndex(this._running, function (value) { return value.name === name; });
	        if (index !== -1) {
	            this._running.splice(index, 1);
	            this.runningChanged.emit(this._running.slice());
	        }
	    };
	    /**
	     * Handle a session starting.
	     */
	    TerminalManager.prototype._onStarted = function (session) {
	        var _this = this;
	        var name = session.name;
	        var index = searching_1.findIndex(this._running, function (value) { return value.name === name; });
	        if (index === -1) {
	            this._running.push(session.model);
	            this.runningChanged.emit(this._running.slice());
	        }
	        session.terminated.connect(function () {
	            _this._onTerminated(name);
	        });
	    };
	    /**
	     * Refresh the running sessions.
	     */
	    TerminalManager.prototype._refreshRunning = function () {
	        var _this = this;
	        return terminal_1.TerminalSession.listRunning(this._getOptions({})).then(function (running) {
	            _this._isReady = true;
	            if (!json_1.deepEqual(running, _this._running)) {
	                _this._running = running.slice();
	                _this.runningChanged.emit(running);
	            }
	        });
	    };
	    /**
	     * Get a set of options to pass.
	     */
	    TerminalManager.prototype._getOptions = function (options) {
	        if (options === void 0) { options = {}; }
	        options.baseUrl = this.baseUrl;
	        options.wsUrl = this.wsUrl;
	        options.ajaxSettings = options.ajaxSettings || this.ajaxSettings;
	        return options;
	    };
	    return TerminalManager;
	}());
	exports.TerminalManager = TerminalManager;
	// Define the signals for the `TerminalManager` class.
	signaling_1.defineSignal(TerminalManager.prototype, 'runningChanged');


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var default_1 = __webpack_require__(49);
	/**
	 * The namespace for ISession statics.
	 */
	var TerminalSession;
	(function (TerminalSession) {
	    /**
	     * Test whether the terminal service is available.
	     */
	    function isAvailable() {
	        return default_1.DefaultTerminalSession.isAvailable();
	    }
	    TerminalSession.isAvailable = isAvailable;
	    /**
	     * Start a new terminal session.
	     *
	     * @options - The session options to use.
	     *
	     * @returns A promise that resolves with the session instance.
	     */
	    function startNew(options) {
	        return default_1.DefaultTerminalSession.startNew(options);
	    }
	    TerminalSession.startNew = startNew;
	    /*
	     * Connect to a running session.
	     *
	     * @param name - The name of the target session.
	     *
	     * @param options - The session options to use.
	     *
	     * @returns A promise that resolves with the new session instance.
	     *
	     * #### Notes
	     * If the session was already started via `startNew`, the existing
	     * session object is used as the fulfillment value.
	     *
	     * Otherwise, if `options` are given, we attempt to connect to the existing
	     * session.
	     * The promise is fulfilled when the session is ready on the server,
	     * otherwise the promise is rejected.
	     *
	     * If the session was not already started and no `options` are given,
	     * the promise is rejected.
	     */
	    function connectTo(name, options) {
	        return default_1.DefaultTerminalSession.connectTo(name, options);
	    }
	    TerminalSession.connectTo = connectTo;
	    /**
	     * List the running terminal sessions.
	     *
	     * @param options - The session options to use.
	     *
	     * @returns A promise that resolves with the list of running session models.
	     */
	    function listRunning(options) {
	        return default_1.DefaultTerminalSession.listRunning(options);
	    }
	    TerminalSession.listRunning = listRunning;
	    /**
	     * Shut down a terminal session by name.
	     *
	     * @param name - The name of the target session.
	     *
	     * @param options - The session options to use.
	     *
	     * @returns A promise that resolves when the session is shut down.
	     */
	    function shutdown(name, options) {
	        return default_1.DefaultTerminalSession.shutdown(name, options);
	    }
	    TerminalSession.shutdown = shutdown;
	})(TerminalSession = exports.TerminalSession || (exports.TerminalSession = {}));


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	var iteration_1 = __webpack_require__(28);
	var signaling_1 = __webpack_require__(21);
	var utils = __webpack_require__(6);
	var terminal_1 = __webpack_require__(48);
	/**
	 * The url for the terminal service.
	 */
	var TERMINAL_SERVICE_URL = 'api/terminals';
	/**
	 * An implementation of a terminal interface.
	 */
	var DefaultTerminalSession = (function () {
	    /**
	     * Construct a new terminal session.
	     */
	    function DefaultTerminalSession(name, options) {
	        if (options === void 0) { options = {}; }
	        this._token = '';
	        this._ajaxSettings = '';
	        this._ws = null;
	        this._isDisposed = false;
	        this._isReady = false;
	        this._name = name;
	        this._baseUrl = options.baseUrl || utils.getBaseUrl();
	        this._token = options.token || utils.getConfigOption('token');
	        this._ajaxSettings = JSON.stringify(utils.ajaxSettingsWithToken(options.ajaxSettings, this._token));
	        this._wsUrl = options.wsUrl || utils.getWsUrl(this._baseUrl);
	        this._readyPromise = this._initializeSocket();
	    }
	    Object.defineProperty(DefaultTerminalSession.prototype, "name", {
	        /**
	         * Get the name of the terminal session.
	         */
	        get: function () {
	            return this._name;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultTerminalSession.prototype, "model", {
	        /**
	         * Get the model for the terminal session.
	         */
	        get: function () {
	            return { name: this._name };
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultTerminalSession.prototype, "baseUrl", {
	        /**
	         * The base url of the terminal.
	         */
	        get: function () {
	            return this._baseUrl;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultTerminalSession.prototype, "ajaxSettings", {
	        /**
	         * Get a copy of the default ajax settings for the terminal.
	         */
	        get: function () {
	            return JSON.parse(this._ajaxSettings);
	        },
	        /**
	         * Set the default ajax settings for the terminal.
	         */
	        set: function (value) {
	            this._ajaxSettings = JSON.stringify(value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultTerminalSession.prototype, "isReady", {
	        /**
	         * Test whether the session is ready.
	         */
	        get: function () {
	            return this._isReady;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultTerminalSession.prototype, "ready", {
	        /**
	         * A promise that fulfills when the manager is ready.
	         */
	        get: function () {
	            return this._readyPromise;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DefaultTerminalSession.prototype, "isDisposed", {
	        /**
	         * Test whether the session is disposed.
	         */
	        get: function () {
	            return this._isDisposed;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Dispose of the resources held by the session.
	     */
	    DefaultTerminalSession.prototype.dispose = function () {
	        if (this.isDisposed) {
	            return;
	        }
	        this._isDisposed = true;
	        if (this._ws) {
	            this._ws.close();
	            this._ws = null;
	        }
	        delete Private.running[this._url];
	        this._readyPromise = null;
	        signaling_1.clearSignalData(this);
	    };
	    /**
	     * Send a message to the terminal session.
	     */
	    DefaultTerminalSession.prototype.send = function (message) {
	        var _this = this;
	        var msg = [message.type];
	        msg.push.apply(msg, message.content);
	        var value = JSON.stringify(msg);
	        if (this._isReady) {
	            this._ws.send(value);
	            return;
	        }
	        this.ready.then(function () {
	            _this._ws.send(value);
	        });
	    };
	    /**
	     * Shut down the terminal session.
	     */
	    DefaultTerminalSession.prototype.shutdown = function () {
	        var options = {
	            baseUrl: this._baseUrl,
	            ajaxSettings: this.ajaxSettings
	        };
	        return DefaultTerminalSession.shutdown(this.name, options);
	    };
	    /**
	     * Connect to the websocket.
	     */
	    DefaultTerminalSession.prototype._initializeSocket = function () {
	        var _this = this;
	        var name = this._name;
	        this._url = Private.getTermUrl(this._baseUrl, this._name);
	        Private.running[this._url] = this;
	        var wsUrl = utils.urlPathJoin(this._wsUrl, "terminals/websocket/" + name);
	        if (this._token) {
	            wsUrl = wsUrl + ("?token=" + this._token);
	        }
	        this._ws = new WebSocket(wsUrl);
	        this._ws.onmessage = function (event) {
	            var data = JSON.parse(event.data);
	            _this.messageReceived.emit({
	                type: data[0],
	                content: data.slice(1)
	            });
	        };
	        return new Promise(function (resolve, reject) {
	            _this._ws.onopen = function (event) {
	                _this._isReady = true;
	                resolve(void 0);
	            };
	            _this._ws.onerror = function (event) {
	                reject(event);
	            };
	        });
	    };
	    return DefaultTerminalSession;
	}());
	exports.DefaultTerminalSession = DefaultTerminalSession;
	/**
	 * The static namespace for `DefaultTerminalSession`.
	 */
	var DefaultTerminalSession;
	(function (DefaultTerminalSession) {
	    /**
	     * Whether the terminal service is available.
	     */
	    function isAvailable() {
	        return utils.getConfigOption('terminalsAvailable') === 'True';
	    }
	    DefaultTerminalSession.isAvailable = isAvailable;
	    /**
	     * Start a new terminal session.
	     *
	     * @options - The session options to use.
	     *
	     * @returns A promise that resolves with the session instance.
	     */
	    function startNew(options) {
	        if (options === void 0) { options = {}; }
	        if (!terminal_1.TerminalSession.isAvailable()) {
	            return Private.unavailable();
	        }
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var url = Private.getBaseUrl(baseUrl);
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'POST';
	        ajaxSettings.dataType = 'json';
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            var name = success.data.name;
	            return new DefaultTerminalSession(name, options);
	        });
	    }
	    DefaultTerminalSession.startNew = startNew;
	    /*
	     * Connect to a running session.
	     *
	     * @param name - The name of the target session.
	     *
	     * @param options - The session options to use.
	     *
	     * @returns A promise that resolves with the new session instance.
	     *
	     * #### Notes
	     * If the session was already started via `startNew`, the existing
	     * session object is used as the fulfillment value.
	     *
	     * Otherwise, if `options` are given, we attempt to connect to the existing
	     * session.
	     * The promise is fulfilled when the session is ready on the server,
	     * otherwise the promise is rejected.
	     *
	     * If the session was not already started and no `options` are given,
	     * the promise is rejected.
	     */
	    function connectTo(name, options) {
	        if (options === void 0) { options = {}; }
	        if (!terminal_1.TerminalSession.isAvailable()) {
	            return Private.unavailable();
	        }
	        var baseUrl = options.baseUrl || utils.getBaseUrl();
	        var url = Private.getTermUrl(baseUrl, name);
	        if (url in Private.running) {
	            return Promise.resolve(Private.running[url]);
	        }
	        var session = new DefaultTerminalSession(name, options);
	        return Promise.resolve(session);
	    }
	    DefaultTerminalSession.connectTo = connectTo;
	    /**
	     * List the running terminal sessions.
	     *
	     * @param options - The session options to use.
	     *
	     * @returns A promise that resolves with the list of running session models.
	     */
	    function listRunning(options) {
	        if (options === void 0) { options = {}; }
	        if (!terminal_1.TerminalSession.isAvailable()) {
	            return Private.unavailable();
	        }
	        var url = Private.getBaseUrl(options.baseUrl);
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'GET';
	        ajaxSettings.dataType = 'json';
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 200) {
	                return utils.makeAjaxError(success);
	            }
	            var data = success.data;
	            if (!Array.isArray(data)) {
	                return utils.makeAjaxError(success, 'Invalid terminal data');
	            }
	            // Update the local data store.
	            var urls = iteration_1.toArray(iteration_1.map(data, function (item) {
	                return utils.urlPathJoin(url, item.name);
	            }));
	            iteration_1.each(Object.keys(Private.running), function (runningUrl) {
	                if (urls.indexOf(runningUrl) === -1) {
	                    var session = Private.running[runningUrl];
	                    session.terminated.emit(void 0);
	                    session.dispose();
	                }
	            });
	            return data;
	        });
	    }
	    DefaultTerminalSession.listRunning = listRunning;
	    /**
	     * Shut down a terminal session by name.
	     *
	     * @param name - The name of the target session.
	     *
	     * @param options - The session options to use.
	     *
	     * @returns A promise that resolves when the session is shut down.
	     */
	    function shutdown(name, options) {
	        if (options === void 0) { options = {}; }
	        if (!terminal_1.TerminalSession.isAvailable()) {
	            return Private.unavailable();
	        }
	        var url = Private.getTermUrl(options.baseUrl, name);
	        var ajaxSettings = utils.ajaxSettingsWithToken(options.ajaxSettings, options.token);
	        ajaxSettings.method = 'DELETE';
	        return utils.ajaxRequest(url, ajaxSettings).then(function (success) {
	            if (success.xhr.status !== 204) {
	                return utils.makeAjaxError(success);
	            }
	            Private.killTerminal(url);
	        }, function (err) {
	            if (err.xhr.status === 404) {
	                var response = JSON.parse(err.xhr.responseText);
	                console.warn(response['message']);
	                Private.killTerminal(url);
	                return;
	            }
	            return Promise.reject(err);
	        });
	    }
	    DefaultTerminalSession.shutdown = shutdown;
	})(DefaultTerminalSession = exports.DefaultTerminalSession || (exports.DefaultTerminalSession = {}));
	// Define the signals for the `DefaultTerminalSession` class.
	signaling_1.defineSignal(DefaultTerminalSession.prototype, 'terminated');
	signaling_1.defineSignal(DefaultTerminalSession.prototype, 'messageReceived');
	/**
	 * A namespace for private data.
	 */
	var Private;
	(function (Private) {
	    /**
	     * A mapping of running terminals by url.
	     */
	    Private.running = Object.create(null);
	    /**
	     * A promise returned for when terminals are unavailable.
	     */
	    function unavailable() {
	        return Promise.reject('Terminals Unavailable');
	    }
	    Private.unavailable = unavailable;
	    /**
	     * Get the url for a terminal.
	     */
	    function getTermUrl(baseUrl, name) {
	        return utils.urlPathJoin(baseUrl, TERMINAL_SERVICE_URL, name);
	    }
	    Private.getTermUrl = getTermUrl;
	    /**
	     * Get the base url.
	     */
	    function getBaseUrl(baseUrl) {
	        return utils.urlPathJoin(baseUrl, TERMINAL_SERVICE_URL);
	    }
	    Private.getBaseUrl = getBaseUrl;
	    /**
	     * Kill a terminal by url.
	     */
	    function killTerminal(url) {
	        // Update the local data store.
	        if (Private.running[url]) {
	            var session = Private.running[url];
	            session.terminated.emit(void 0);
	            session.dispose();
	        }
	    }
	    Private.killTerminal = killTerminal;
	})(Private || (Private = {}));


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	"use strict";
	// Notebook format interfaces
	// https://nbformat.readthedocs.io/en/latest/format_description.html
	// https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json
	var json_1 = __webpack_require__(39);
	/**
	 * A namespace for nbformat interfaces.
	 */
	var nbformat;
	(function (nbformat) {
	    /**
	     * The major version of the notebook format.
	     */
	    nbformat.MAJOR_VERSION = 4;
	    /**
	     * The minor version of the notebook format.
	     */
	    nbformat.MINOR_VERSION = 1;
	    /**
	     * Validate a mime type/value pair.
	     *
	     * @param type - The mimetype name.
	     *
	     * @param value - The value associated with the type.
	     *
	     * @returns Whether the type/value pair are valid.
	     */
	    function validateMimeValue(type, value) {
	        // Check if "application/json" or "application/foo+json"
	        var jsonTest = /^application\/(.*?)+\+json$/;
	        var isJSONType = type === 'application/json' || jsonTest.test(type);
	        var isString = function (x) {
	            return Object.prototype.toString.call(x) === '[object String]';
	        };
	        // If it is an array, make sure if is not a JSON type and it is an
	        // array of strings.
	        if (Array.isArray(value)) {
	            if (isJSONType) {
	                return false;
	            }
	            var valid_1 = true;
	            value.forEach(function (v) {
	                if (!isString(v)) {
	                    valid_1 = false;
	                }
	            });
	            return valid_1;
	        }
	        // If it is a string, make sure we are not a JSON type.
	        if (isString(value)) {
	            return !isJSONType;
	        }
	        // It is not a string, make sure it is a JSON type.
	        if (!isJSONType) {
	            return false;
	        }
	        // It is a JSON type, make sure it is a valid JSON object.
	        return json_1.isObject(value);
	    }
	    nbformat.validateMimeValue = validateMimeValue;
	})(nbformat = exports.nbformat || (exports.nbformat = {}));


/***/ }
/******/ ]);