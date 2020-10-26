/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global fluid_3_0_0, QUnit */

var jqUnit = jqUnit || {};

(function ($, fluid) {
    "use strict";

    var QUnitPassthroughs = ["module", "test", "asyncTest", "throws", "raises", "start", "stop", "expect"];
    QUnit.config.reorder = false; // defeat this QUnit feature which frequently just causes confusion

    for (var i = 0; i < QUnitPassthroughs.length; ++i) {
        var method = QUnitPassthroughs[i];
        jqUnit[method] = QUnit[method];
        window[method] = undefined; // work around IE8 bug http://stackoverflow.com/questions/1073414/deleting-a-window-property-in-ie
    }

    jqUnit.failureHandler = function (args/*, activity*/) {
        if (QUnit.config.current) {
            QUnit.ok(false, "Assertion failure (see console.log for expanded message): ".concat(args));
        }
    };

    fluid.failureEvent.addListener(jqUnit.failureHandler, "jqUnit", "before:fail");

    // Helpful utility for creating multiple test target components compactly
    fluid.makeComponents = function (components) {
        fluid.each(components, function (value, key) {
            var options = {
                gradeNames: fluid.makeArray(value)
            };
            fluid.defaults(key, options);
        });
    };

    /*
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
         * @param {Object} obj - The object whose functions should be intercepted.
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

    var messageSuffix = "";
    var processMessage = function (message) {
        return message + messageSuffix;
    };

    var pok = function (condition, message) {
        QUnit.ok(condition, processMessage(message));
    };

    // unsupported, NON-API function
    jqUnit.okWithPrefix = pok;

    // unsupported, NON-API function
    jqUnit.setMessageSuffix = function (suffix) {
        messageSuffix = suffix;
    };

    /***********************
     * xUnit Compatibility *
     ***********************/

    var jsUnitCompat = {
        fail: function (msg) {
            pok(false, msg);
        },

        assert: function (msg) {
            pok(true, msg);
        },

        assertEquals: function (msg, expected, actual) {
            QUnit.strictEqual(actual, expected, processMessage(msg));
        },

        assertNotEquals: function (msg, unexpected, actual) {
            QUnit.notStrictEqual(actual, unexpected, msg);
        },

        assertTrue: function (msg, value) {
            pok(value, msg);
        },

        assertFalse: function (msg, value) {
            pok(!value, msg);
        },

        assertUndefined: function (msg, value) {
            pok(value === undefined, msg);
        },

        assertNotUndefined: function (msg, value) {
            pok(value !== undefined, msg);
        },

        assertValue: function (msg, value) {
            pok(value !== null && value !== undefined, msg);
        },

        assertNoValue: function (msg, value) {
            pok(value === null || value === undefined, msg);
        },

        assertNull: function (msg, value) {
            QUnit.equal(value, null, processMessage(msg));
        },

        assertNotNull: function (msg, value) {
            pok(value !== null, msg);
        },

        assertDeepEq: function (msg, expected, actual) {
            if (fluid.isPrimitive(expected) || fluid.isPrimitive(actual)) {
                jqUnit.assertEquals(msg, expected, actual);
            } else {
                QUnit.propEqual(actual, expected, processMessage(msg));
            }
        },

        assertDeepNeq: function (msg, unexpected, actual) {
            if (fluid.isPrimitive(unexpected) || fluid.isPrimitive(actual)) {
                jqUnit.assertNotEquals(msg, unexpected, actual);
            } else {
                QUnit.notPropEqual(actual, unexpected, processMessage(msg));
            }
        },
        // This version of "expect" offers the cumulative semantic we desire
        expect: function (number) {
            var oldExpect = QUnit.expect();
            QUnit.expect(number + oldExpect);
        }
    };

    // Mix these compatibility functions into the jqUnit namespace.
    $.extend(jqUnit, jsUnitCompat);


    /** Sort an old renderer component tree into canonical order, to facilitate comparison with
     * deepEq */

    jqUnit.sortOldRendererComponentTree = function (tree) {
        function comparator(ela, elb) {
            var ida = ela.ID || "";
            var idb = elb.ID || "";
            var cola = ida.indexOf(":") === -1;
            var colb = idb.indexOf(":") === -1;
            if (cola && colb) { // if neither has a colon, compare by IDs if they have IDs
                return ida.localeCompare(idb);
            }
            else {
                return cola - colb;
            }
        }
        if (fluid.isArrayable(tree)) {
            tree.sort(comparator);
        }
        fluid.each(tree, function (value) {
            if (!fluid.isPrimitive(value)) {
                jqUnit.sortOldRendererComponentTree(value);
            }
        });

    };

    /** The effect of jqUnit.flattenMergedSubcomponentOptions at the next level of nesting - assumes
     * that it is given an options block with `components` at the root
     */

    jqUnit.flattenMergedSubcomponents = function (components) {
        return fluid.transform(components, function (component) {
            return component[0];
        });
    };

    /** Undoes the effect of the new mergePolicy implemented post FLUID-5614, and flattens the array of
     * merged subcomponents to match the structure that is written in plain options. E.g. a structure
     * ```
     * {
     * someOption: 4,
     * components: {
     *     myComponent: [
     *         {
     *             type: "fluid.component"
     *         }
     *     ]
     * }
     * ```
     * will be flattened into
     * someOption: 4,
     * components: {
     *     myComponent: {
     *             type: "fluid.component"
     *     }
     * }
     * ```
     * @param {Object} tree - A tree of component options
     * @return {Object} A deep-cloned tree with arrays held in subcomponent entries flattened to hold their 0th entries
     */
    jqUnit.flattenMergedSubcomponentOptions = function (tree) {
        return fluid.transform(tree, function (value, key) {
            if (key !== "components") {
                return value;
            } else {
                return jqUnit.flattenMergedSubcomponents(value);
            }
        });
    };

    /** A canonicalisation function which will cause any functions encountered in the tree to compare as equal,
     * as sent to `jqUnit.assertCanoniseEqual`. This returns an deep cloned object tree where every function
     * encountered in the tree is replaced by `fluid.identity`
     * @param {Object} tree - The object tree to be canonicalised
     * @return {Object} A deep-cloned version of `tree` with every function handle replaced by `fluid.identity`
     */
    jqUnit.canonicaliseFunctions = function (tree) {
        return fluid.transform(tree, function (value) {
            if (fluid.isPrimitive(value)) {
                if (typeof(value) === "function") {
                    return fluid.identity;
                }
                else { return value; }
            }
            else { return jqUnit.canonicaliseFunctions(value); }
        });
    };

    /** Assert that two trees are equal after applying a "canonicalisation function". This can be used in
     * cases where the criterion for equivalence is looser than exact object equivalence - for example,
     * when using renderer trees, "jqUnit.sortOldRendererComponentTree" can be used for canonFunc", or in the case
     * of a resourceSpec, "jqUnit.canonicaliseFunctions". **/

    jqUnit.assertCanoniseEqual = function (message, expected, actual, canonFunc) {
        var expected2 = canonFunc(expected);
        var actual2 = canonFunc(actual);
        jqUnit.assertDeepEq(message, expected2, actual2);
    };

    /** Assert that the actual value object is a superset (considered in terms of shallow key coincidence) of the
     * expected value object (this method is the one that will be most often used in practice). "Left hand" (expected) is a subset of actual. **/

    jqUnit.assertLeftHand = function (message, expected, actual) {
        jqUnit.assertDeepEq(message, expected, fluid.filterKeys(actual, fluid.keys(expected)));
    };

    /** Assert that the actual value object is a subset of the expected value object **/

    jqUnit.assertRightHand = function (message, expected, actual) {
        jqUnit.assertDeepEq(message, fluid.filterKeys(expected, fluid.keys(actual)), actual);
    };

    /** Assert that the supplied callback will produce a framework diagnostic, containing the supplied text
     * somewhere in its error message - that is, the framework will invoke fluid.fail with a message containing
     * <code>errorText</code>.
     * @param message {String} The message prefix to be supplied for all the assertions this function issues
     * @param toInvoke {Function} A no-arg function holding the code to be tested for emission of the diagnostic
     * @param errorTexts {String} or {Array of String} Either a single string or array of strings which the <code>message</code> field
     * of the thrown exception will be tested against - each string must appear as a substring in the text
     */

    jqUnit.expectFrameworkDiagnostic = function (message, toInvoke, errorTexts) {
        errorTexts = fluid.makeArray(errorTexts);
        var gotFailure;
        var capturedActivity;
        var captureActivity = function (args, activity) {
            capturedActivity = fluid.renderActivity(activity).map(fluid.prettyPrintJSON).join("");
        };
        try {
            fluid.failureEvent.addListener(fluid.identity, "jqUnit");
            fluid.failureEvent.addListener(captureActivity, "captureActivity", "before:fail");
            jqUnit.expect(errorTexts.length);
            toInvoke();
        } catch (e) {
            gotFailure = true;
            if (!(e instanceof fluid.FluidError)) {
                jqUnit.fail(message + " - received non-framework exception");
                throw e;
            }
            var fullText = e.message + capturedActivity;
            fluid.each(errorTexts, function (errorText) {
                jqUnit.assertTrue(message + " - message text must contain " + errorText, fullText.indexOf(errorText) >= 0);
            });
        } finally {
            if (!gotFailure) {
                jqUnit.fail("No failure received for test " + message);
            }
            fluid.failureEvent.removeListener("jqUnit");
            fluid.failureEvent.removeListener("captureActivity");
        }
    };

})(jQuery, fluid_3_0_0);
