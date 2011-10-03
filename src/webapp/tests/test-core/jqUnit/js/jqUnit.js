/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2010 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2010-2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global window, jqUnit, asyncTest, equals, jQuery, module, ok, test*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var jqUnit = jqUnit || {};

// A function to load the testswarm agent if running in the testswarm environment
// This code was derived from testsuite.js ( http://code.google.com/p/jquery-ui/source/browse/trunk/tests/unit/testsuite.js )
(function () {
    var param = "swarmURL=";
    var url = window.location.search;
    url = decodeURIComponent(url.slice(url.indexOf(param) + param.length));
    
    if (url && url.indexOf("http") === 0) {
        var injectPath = window.location.protocol + "//" + window.location.host + "/js/inject.js";
        document.write("<scr" + "ipt src='" + injectPath + "?" + (new Date()).getTime() + "'></scr" + "ipt>");
    }
})();

(function ($) {

    /**
     * Keeps track of the order of function invocations. The transcript contains information about
     * each invocation, including its name and the arguments that were supplied to it.
     */
    jqUnit.invocationTracker = function (options) {
        var that = {};
        that.runTestsOnFunctionNamed = options ? options.runTestsOnFunctionNamed : undefined;
        that.testBody = options ? options.testBody : undefined;
        
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
                
                if (fnName === that.runTestsOnFunctionNamed) {
                    that.testBody(that.transcript);
                }
            };
        };
        
        /**
         * Intercepts all the functions on the specified object.
         * 
         * @param {Object} obj
         */
        that.interceptAll = function (obj) {
            for (var fnName in obj) {
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
        assert: function(msg) {
            ok(true, msg);  
        },
        
        assertEquals: function (msg, expected, actual) {
            equals(actual, expected, msg);
        },
        
        assertNotEquals: function (msg, value1, value2) {
            ok(value1 !== value2, msg);
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
        
        assertNoValue: function (msg, value) {
            ok(value === null || value === undefined, msg);
        },
        
        assertNull: function (msg, value) {
            equals(value, null, msg);
        },

        assertNotNull: function (msg, value) {
            ok(value !== null, msg);
        },
        
        assertDeepEq: function (msg, expected, actual) {
            QUnit.deepEqual(actual, expected, msg);
        },
        
        assertDeepNeq: function (msg, unexpected, actual) {
            QUnit.notDeepEqual(actual, unexpected, msg);
        },
        // Namespaced version of "expect" for civilization
        expect: function(number) {
            expect(number);
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
    
    /**
     * Synchronously loads an HTML document via Ajax. This is roughly similar to jQuery.load but without the asynchrony.
     * 
     * @param {jQueryable} container the element into which you want put the loaded HTML
     * @param {String} url the location of the HTML document. This can include a selector after the URL, separated by a space
     * @param {Function} callback the callback function to run upon successful load
     */
    var loadSync = function (container, url, callback) {        
        var idx = url.indexOf(" ");
        var sel = "body";
        if (idx >= 0) {
            sel = url.slice(idx, url.length);
            url = url.slice(0, idx);
        }
        
        var injectFragment = function (container, sel, docTxt) {
            var docFrag = $("<div/>").append(docTxt.replace(/<script(.|\s)*?\/script>/g, ""));
            container.empty().append($(sel, docFrag));
        };
        
        $.ajax({
            url: url,
            type: "GET",
            dataType: "html",
            async: false,
            complete: function (res, status) {
                if (status === "success" || status === "notmodified") {
                    injectFragment(container, sel, res.responseText);
                    callback.apply(null, [container, res.responseText, status, res]);
                }   
            }
        });
    };
    
    /***************************************************
     * TestCase constructor for backward compatibility *
     ***************************************************/
    
    jqUnit.TestCase = function (moduleName, setUpFn, tearDownFn) {
        return jqUnit.testCase(moduleName, setUpFn, tearDownFn);  
    };
      
    /******************************
     * TestCase creator function
     * @param {Object} moduleName
     * @param {Object} setUpFn
     * @param {Object} tearDownFn
     */  
    jqUnit.testCase = function (moduleName, setUpFn, tearDownFn) {
        var that = {};
        that.fetchedTemplates = [];
        
        /**
         * Fetches a template synchronously using AJAX if it was never fetched before and stores it in that.fetchedTemplates
         * @param {Object} templateURL URL to the document to be fetched
         * @param {Object} selector A selector which finds the piece of the document to be fetched 
         * @param {Object} container The container where the fetched content will be appended - default to the element with the id 'main'
         */
        that.fetchTemplate = function (templateURL, selector, container) {
            container = container || $("#main");
            var selectorToFetch = templateURL + " " + selector;
            
            if (!that.fetchedTemplates[selectorToFetch]) {
                loadSync(container, selectorToFetch, function () {
                    that.fetchedTemplates[selectorToFetch] = $(container).clone();
                });
            } else {
                container.append($(selector, that.fetchedTemplates[selectorToFetch].clone()));
            }
        };

        that.test = function (string, testFn) {
            test(string, testFn);
        };
        
        that.asyncTest = function (string, testFn) {
            asyncTest(string, testFn);
        };
        
        module(moduleName, {
            setup: setUpFn || function () {},
            teardown: tearDownFn || function () {}
        });
        
        return that;
    };
    
})(jQuery);
