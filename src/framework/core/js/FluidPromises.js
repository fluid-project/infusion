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
})(jQuery, fluid_2_0);