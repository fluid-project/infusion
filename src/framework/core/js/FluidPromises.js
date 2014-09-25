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
            that.thens.length = 0;
        };
        return that;
    };
    
    fluid.isPromise = function (totest) {
        return totest && typeof(totest.then) === "function";
    };
    
    // TRANSFORM ALGORITHM APPLYING PROMISES
    
    // Construct a "mini-object" managing the process of a sequence of transforms,
    // each of which may be synchronous or return a promise
    fluid.promise.makeTransformer = function (listeners, payload) {
        return {
            listeners: listeners,
            index: 0,
            payloads: [payload],
            promise: fluid.promise()
        };
    };
    
    fluid.promise.progressTransform = function (that, retValue) {
        that.payloads.push(retValue);
        that.index++;
        // No we dun't have no tail recursion
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
            var value = listener(payload);
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

   /** Top-level API to operate a Fluid event which manages a sequence of 
     * chained transforms. Rather than being a standard listener accepting the
     * same payload, each listener to the event accepts the payload returned by the
     * previous listener, and returns either a transformed payload or else a promise
     * yielding such a payload.
     * @param event {fluid.eventFirer} A Fluid event to which the listeners are to be interpreted as 
     * elements cooperating in a chained transform.
     * @param payload {Object} The initial payload input to the transform chain
     * @param reverse {Boolean} <code>true</code> if the listeners are to be called in
     * reverse order of priority (typically the case for an inverse transform)
     * @return {fluid.promise} A promise which will yield either the final transformed
     * value, or the response of the first transform which fails.
     */
    
    fluid.promise.fireTransformEvent = function (event, payload, reverse) {
        var listeners = reverse ? fluid.makeArray(event.sortedListeners).reverse() :
                event.sortedListeners;
        var transformer = fluid.promise.makeTransformer(listeners, payload);
        fluid.promise.resumeTransform(transformer);
        return transformer.promise;
    };
    
    
})(jQuery, fluid_2_0);