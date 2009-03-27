/*

 Copyright 2008-2009 University of Toronto

 Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.

*/

var jqUnit = jqUnit || {};

(function ($) {
    
    /************************
     * Deep equality assert *
     ************************/
    
    function path(el) {
        return el? "path " + el: "root path";
    }
    
    function reportType(obj) {
        var type = typeof(obj);
        return type === "string" || type === "number" || type === "boolean"? type + " ("+obj+")"
          : type;
    }
    
    function deepEqImpl(thing1, thing2, basename) {
        basename = basename || "";
        
        if (typeof(thing1) !== typeof(thing2)) {
            return "Type mismatch at " + path(basename) + ": " + reportType(thing1) + " to " + reportType(thing2);
        }
        
        if (thing1 === null ^ thing2 === null) {
            return "Unexpected null value at " + path(basename);
        }
        
        if (typeof(thing1) !== 'object') {
            if (thing1 !== thing2) {
                return "Primitive mismatch at " + path(basename) + ": " + thing1 + " to " + thing2;
            }
        } else {
            for (var name in thing1) {
                var n1 = thing1[name];
                var n2 = thing2[name];
                var neq = deepEqDiag(n1, n2, (basename? basename + ".": "") + name);
                if (neq) {
                    return neq;
                }
            }
        }
        
        return null;
    }

    function deepEqDiag(thing1, thing2, basename) {
        var diag1 = deepEqImpl(thing1, thing2, basename);
        if (diag1) {
            return diag1;
        }
        
        var diag2 = deepEqImpl(thing2, thing1, basename);
        if (diag2) {
            return diag2;
        }
        
        return null;    
    }
    
    jqUnit.deepEq = function (thing1, thing2) {
        return !deepEqImpl(thing1, thing2) && !deepEqImpl(thing2, thing1);
    };
      
    jqUnit.deepEqDiag = function (thing1, thing2) {
        return deepEqDiag(thing1, thing2);
    };
    
    /**
     * Keeps track of the order of function invocations. The transcript contains information about
     * each invocation, including its name and the arguments that were supplied to it.
     */
    jqUnit.invocationTracker = function () {
        var that = {};
        
        /**
         * An array containing an ordered list of details about each function invocation.
         */
        that.transcript = [];
        
        /**
         * Called to listen for a function's invocation and record its details in the transcript.
         * 
         * @param {Object} fnName the function name to listen for
         * @param {Object} onObject the object on which to invoke the method
         */
        that.intercept = function (fnName, onObject) {
            onObject = onObject || window;
            
            var wrappedFn = onObject[fnName];
            onObject[fnName] = function () {
                that.transcript.push({
                    name: fnName,
                    args: arguments
                });
                wrappedFn.apply(onObject, arguments);
            };
        };
        
        /**
         * Intercepts all the functions on the specified object.
         * 
         * @param {Object} obj
         */
        that.interceptAll = function (obj) {
            for (fnName in obj) {
                that.intercept(fnName, obj);
            }
        };
        
        that.clearTranscript = function () {
            that.transcript = [];
        };
        
        return that;
    };


    /***********************
     * xUnit Compatibility *
     ***********************/
    
    var jsUnitCompat = {
        assertEquals: function (msg, expected, actual) {
            equals(actual, expected, msg);
        },
        
        assertNotEquals: function (msg, value1, value2) {
            ok(value1 != value2, msg);
        },

        assertTrue: function (msg, value) {
            ok(value, msg);
        },

        assertFalse: function (msg, value) {
            ok(!value, msg);
        },

        assertUndefined: function (msg, value) {
            ok(typeof value === 'undefined', msg);
        },

        assertNotUndefined: function (msg, value) {
            ok(typeof value !== 'undefined', msg);
        },

        assertValue: function (msg, value) {
            ok(value !== null && value !== undefined, msg);
        },
        
        assertNull: function (msg, value) {
            equals(value, null, msg);
        },

        assertNotNull: function (msg, value) {
            ok(value !== null, msg);
        },
        
        assertDeepEq: function (msg, expected, actual) {
            var diag = deepEqDiag(expected, actual);
            ok(diag === null, msg + (diag === null? "" : ": " + diag));
        },
        
        assertDeepNeq: function (msg, unexpected, actual) {
            var diag = deepEqDiag(unexpected, actual);
            ok(diag !== null, msg);
        }
    };

    // Mix these compatibility functions into the jqUnit namespace.
    $.extend(jqUnit, jsUnitCompat);


    /***************************
     * Other helpful functions *
     ***************************/
    
    var testFns = {
        isVisible: function (msg, selector) {
            ok($(selector).is(':visible'), msg);
        },
        
        notVisible: function (msg, selector) {
            ok($(selector).is(':hidden'), msg);
        },
        
        exists: function (msg, selector) {
            ok($(selector)[0], msg);
        },
        
        notExists: function (msg, selector) {
            ok(!$(selector)[0], msg);
        },
        
        // Overrides jQuery's animation routines to be synchronous. Careful!
        subvertAnimations: function () {
            $.fn.fadeIn = function (speed, callback) {
                this.show();
                if (callback) {
                    callback();
                }
            };
            
            $.fn.fadeOut = function (speed, callback) {
                this.hide();
                if (callback) {
                    callback();
                }
            };
        }
    };
    
    // Mix these test functions into the jqUnit namespace.
    $.extend(jqUnit, testFns);
    
    
    /*******************
     * TestCase object *
     *******************/
    
    function TestCase(moduleName, setUpFn, tearDownFn) {

        module(moduleName, {
            setup: setUpFn || function () {},
            teardown: tearDownFn || function () {}
        });
    }

    TestCase.prototype.test = function (string, testFn) {

        test(string, testFn);
    };

    //  Mix the TestCase type into the jqUnit namespace.
    $.extend(jqUnit, {TestCase: TestCase});
})(jQuery);
