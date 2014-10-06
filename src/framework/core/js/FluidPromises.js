/*!
 Copyright unscriptable.com / John Hann 2011
 Copyright Lucendo Development Ltd. 2014
 
 License MIT
*/
/* jshint expr: true */

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

// Light fluidification of minimal promises library. See original gist at
// https://gist.github.com/unscriptable/814052 for limitations and commentary

// This implementation provides what could be described as "flat promises" with
// no support for structure programming idioms involving promise chaining or composition.
// It provides what a proponent of mainstream promises would describe as 
// a "glorified callback aggregator"

    fluid.promise = function () {
        var that = {
            thens: []
            // disposition
            // value
        };
        that.then = function (onResolve, onReject) {
            if (that.disposition === "resolve") {
                onResolve && onResolve(that.value);
            } else if (that.disposition === "reject") {
                onReject && onReject(that.value);
            } else {
                that.thens.push({resolve: onResolve, reject: onReject});
            }
        };
        that.resolve = function (value) {
            if (that.disposition) {
                fluid.fail("Error: resolving promise ", that,
                    " which has received \"" + that.disposition + "\"");
            } else {
                that.complete("resolve", value);
            }
        };
        that.reject = function (reason) {
            if (that.disposition) {
                fluid.fail("Error: rejecting promise ", that,
                    "which has received \"" + that.disposition + "\"");
            } else {
                that.complete("reject", reason);
            }
        };
        that.complete = function (which, arg) {
            that.disposition = which;
            that.value = arg;
            for (var i = 0; i < that.thens.length; ++ i) {
                var aThen = that.thens[i];
                aThen[which] && aThen[which](arg);
            }
            delete that.thens;
        };
        return that;
    };
    
    /** Any object with a member <code>then</code> of type <code>function</code> passes this test.
     * This includes essentially every known variety, including jQuery promises.
     */
    fluid.isPromise = function (totest) {
        return totest && typeof(totest.then) === "function";
    };
    
    /** Chains the resolution methods of one promise (target) so that they follow those of another (source).
      * That is, whenever source resolves, target will resolve, or when source rejects, target will reject, with the
      * same payloads in each case.
      */
    fluid.promise.follow = function (source, target) {
        source.then(target.resolve, target.reject);
    };
    
    /** Returns a promise whose resolved value is mapped from the source promise or value by the supplied function.
     * @param source {Object|Promise} An object or promise whose value is to be mapped
     * @param func {Function} A function which will map the resolved promise value
     * @return {Promise} A promise for the resolved mapped value.
     */ 
    fluid.promise.map = function (source, func) {
        var togo = fluid.promise();
        if (fluid.isPromise(source)) {
            source.then(function (value) {
                var mapped = func(value);
                togo.resolve(mapped);
            }, function (error) {
                togo.reject(error)
            });
        } else {
            togo.resolve(func(source));
        }
        return togo;
    };
    
    // TRANSFORM ALGORITHM APPLYING PROMISES
    
    // Construct a "mini-object" managing the process of a sequence of transforms,
    // each of which may be synchronous or return a promise
    fluid.promise.makeTransformer = function (listeners, payload, options) {
        listeners.unshift({listener:
            function () {
                return payload;
            }
        });
        return {
            listeners: listeners,
            index: 0,
            options: options,
            payloads: [null], // first transformer is dummy returning initial payload
            promise: fluid.promise()
        };
    };
    
    fluid.promise.progressTransform = function (that, retValue) {
        that.payloads.push(retValue);
        that.index++;
        // No we dun't have no tail recursion elimination
        fluid.promise.resumeTransform(that);
    };
    
    fluid.promise.resumeTransform = function (that) {
        var payload = that.payloads[that.index];
        if (that.index === that.listeners.length) {
            that.promise.resolve(payload);
        } else {
            var lisrec = that.listeners[that.index];
            lisrec.listener = fluid.event.resolveListener(lisrec.listener);
            var listener = lisrec.listener;
            var value = listener(payload, that.options);
            if (fluid.isPromise(value)) {
                value.then(function (retValue) {
                    fluid.promise.progressTransform(that, retValue);
                }, function (error) {
                    that.promise.reject(error);
                });
            } else {
                fluid.promise.progressTransform(that, value);
            }
        }
    };
    
    fluid.promise.filterNamespaces = function (listeners, namespaces) {
        if (!namespaces) {
            return listeners;
        }
        return fluid.remove_if(fluid.makeArray(listeners), function (element) {
            return element.namespace && !element.softNamespace && !fluid.contains(namespaces, element.namespace);
        });
    };

   /** Top-level API to operate a Fluid event which manages a sequence of 
     * chained transforms. Rather than being a standard listener accepting the
     * same payload, each listener to the event accepts the payload returned by the
     * previous listener, and returns either a transformed payload or else a promise
     * yielding such a payload.
     * @param event {fluid.eventFirer} A Fluid event to which the listeners are to be interpreted as 
     * elements cooperating in a chained transform. Each listener will receive arguments <code>(payload, options)</code> where <code>payload</code>
     * is the (successful, resolved) return value of the previous listener, and <code>options</code> is the final argument to this function
     * @param payload {Object|Promise} The initial payload input to the transform chain
     * @param options {Object} A free object containing options governing the transform. Fields interpreted at this top level are:
     *     reverse {Boolean}: <code>true</code> if the listeners are to be called in reverse order of priority (typically the case for an inverse transform)
     *     filterTransforms {Array}: An array of listener namespaces. If this field is set, only the transform elements whose listener namespaces listed in this array will be applied. 
     * @return {fluid.promise} A promise which will yield either the final transformed value, or the response of the first transform which fails.
     */
    
    fluid.promise.fireTransformEvent = function (event, payload, options) {
        options = options || {};
        var listeners = options.reverse ? fluid.makeArray(event.sortedListeners).reverse() :
                fluid.makeArray(event.sortedListeners);
        listeners = fluid.promise.filterNamespaces(listeners, options.filterNamespaces);
        var transformer = fluid.promise.makeTransformer(listeners, payload, options);
        fluid.promise.resumeTransform(transformer);
        return transformer.promise;
    };
    
    
})(jQuery, fluid_2_0);