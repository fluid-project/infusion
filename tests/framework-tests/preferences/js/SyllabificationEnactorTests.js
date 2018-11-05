/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.prefs.enactor.syllabification");

    /**************************************************************************
     * fluid.prefs.enactor.syllabification.injectScript tests
     **************************************************************************/

    // We only test the success condition because when a failure occurs, the server may return a 404 error page.
    // If that happens, the browser attempts to interpret the HTML document as a script and throws the following error:
    // Uncaught SyntaxError: Unexpected token <
    jqUnit.asyncTest("Test fluid.prefs.enactor.syllabification.injectScript", function () {
        var injectionPromise = fluid.prefs.enactor.syllabification.injectScript("../js/SyllabificationInjectedScript.js");
        injectionPromise.then(function () {
            jqUnit.assertTrue("The promise resolved and the injected script is accessible", fluid.tests.prefs.enactor.syllabification.scriptInjected);
            jqUnit.start();
        }, function () {
            jqUnit.fail("The injection promise was rejected.");
            jqUnit.start();
        });
    });

    /**************************************************************************
     * fluid.prefs.enactor.syllabification.generateRegex tests
     **************************************************************************/

    fluid.prefs.enactor.syllabification.regexTestCases = [{
        pattern: "string",
        sample: "string to test with"
    }, {
        pattern: "STRING",
        flags: "i",
        sample: "string to test with"
    }, {
        pattern: "\\s",
        sample: "string to test with"
    }];

    jqUnit.test("Test fluid.prefs.enactor.syllabification.generateRegex", function () {
        fluid.each(fluid.prefs.enactor.syllabification.regexTestCases, function (testCase) {
            var regex = fluid.prefs.enactor.syllabification.generateRegex(testCase.pattern, testCase.flags);
            jqUnit.assertEquals("The pattern \"" + testCase.pattern + "\" is set correctly", testCase.pattern, regex.source);
            jqUnit.assertEquals("The flags \"" + testCase.flags + "\" are set correctly", testCase.flags || "", regex.flags);
            jqUnit.assertTrue("The regex found a match in the sample string.", regex.test(testCase.sample));
        });
    });

    /**************************************************************************
     * fluid.prefs.enactor.syllabification.removeSyllabification tests
     **************************************************************************/

    fluid.prefs.enactor.syllabification.removeSyllabificationTestCases = [{
        regex: /·/,
        sample: "syl·la·bles",
        expected: "sylla·bles"
    }, {
        regex: /·/g,
        sample: "syl·la·bles",
        expected: "syllables"
    }, {
        regex: new RegExp("·"),
        sample: "syl·la·bles",
        expected: "sylla·bles"
    }, {
        regex: new RegExp("·", "g"),
        sample: "syl·la·bles",
        expected: "syllables"
    }];

    jqUnit.test("Test fluid.prefs.enactor.syllabification.removeSyllabification", function () {
        fluid.each(fluid.prefs.enactor.syllabification.removeSyllabificationTestCases, function (testCase) {
            var node = {textContent: testCase.sample};
            fluid.prefs.enactor.syllabification.removeSyllabification(testCase.regex, node);
            jqUnit.assertEquals(
                "The syllabification was removed according to regex rules (pattern: " + testCase.regex.source + " flags: "  + testCase.regex.flags + ")",
                testCase.expected,
                node.textContent
            );
        });
    });

    /*******************************************************************************
     * IoC Unit tests for fluid.prefs.enactor.syllabification
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.syllabification", {
        gradeNames: ["fluid.prefs.enactor.syllabification"],
        model: {
            enabled: false
        },
        terms: {
            patternPrefix: "../../../../src/lib/hyphen"
        },
        // remove `es` from pattern config to test when configuration isn't available
        langConfigs: {
            es: null
        }
    });


    fluid.defaults("fluid.tests.syllabificationTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            syllabification: {
                type: "fluid.tests.prefs.enactor.syllabification",
                container: ".flc-syllabification"
            },
            syllabificationTester: {
                type: "fluid.tests.syllabificationTester"
            }
        }
    });

    fluid.defaults("fluid.tests.syllabificationTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            text: {
                default: {
                    "en": "Climate changes are underway in the United States and are projected to grow.",
                    "es": "Los cambios climáticos están en marcha en los Estados Unidos y se prevé que crezcan."
                },
                syllabified: {
                    "en-US": "Cli·mate changes are un·der·way in the Unit·ed States and are pro·ject·ed to grow.",
                    "en-GB": "Cli·mate changes are un·der·way in the United States and are pro·jec·ted to grow."
                }
            },
            default: {
                ".flc-syllabification-parentLang": ["default", "en"],
                ".flc-syllabification-otherRegion": ["default", "en"],
                ".flc-syllabification-generic": ["default", "en"],
                ".flc-syllabification-fallback": ["default", "en"],
                ".flc-syllabification-notAvailable": ["default", "es"]
            },
            syllabified: {
                ".flc-syllabification-parentLang": ["syllabified", "en-US"],
                ".flc-syllabification-otherRegion": ["syllabified", "en-GB"],
                ".flc-syllabification-generic": ["syllabified", "en-US"],
                ".flc-syllabification-fallback": ["syllabified", "en-US"],
                ".flc-syllabification-notAvailable": ["default", "es"]
            },
            injected: {
                disabled: {
                    markup: "<p class=\"flc-syllabification-injectWhenDisabled\">Climate changes are underway in the United States and are projected to grow.</p>",
                    default: {
                        ".flc-syllabification-injectWhenDisabled": ["default", "en"]
                    },
                    syllabified: {
                        ".flc-syllabification-injectWhenDisabled": ["syllabified", "en-US"]
                    }
                },
                enabled: {
                    markup: "<p class=\"flc-syllabification-injectWhenEnabled\">Climate changes are underway in the United States and are projected to grow.</p>",
                    default: {
                        ".flc-syllabification-injectWhenEnabled": ["default", "en"]
                    },
                    syllabified: {
                        ".flc-syllabification-injectWhenEnabled": ["syllabified", "en-US"]
                    }
                }
            }
        },
        modules: [{
            name: "fluid.prefs.enactor.syllabification",
            tests: [{
                expect: 19,
                name: "Add/Remove syllabification",
                sequence: [{
                    // init, before syllabification
                    funcName: "fluid.tests.syllabificationTester.verifyTextOutput",
                    args: ["Intial Text", "{that}.options.testOpts.text", "{that}.options.testOpts.default"]
                }, {
                    // enabled syllabification
                    func: "{syllabification}.applier.change",
                    args: ["enabled", true]
                }, {
                    event: "{syllabification}.events.afterSyllabification",
                    listener: "fluid.tests.syllabificationTester.verifyTextOutput",
                    priority: "last:testing",
                    args: ["Syllabified", "{that}.options.testOpts.text", "{that}.options.testOpts.syllabified"]
                }, {
                    // disable syllabification
                    func: "{syllabification}.applier.change",
                    args: ["enabled", false]
                }, {
                    event: "{syllabification}.events.afterSyllabification",
                    listener: "fluid.tests.syllabificationTester.verifyTextOutput",
                    priority: "last:testing",
                    args: ["Removed", "{that}.options.testOpts.text", "{that}.options.testOpts.default"]
                }, {
                    // inject content, then enable syllabification
                    func: "fluid.tests.syllabificationTester.injectContent",
                    args: ["{syllabification}.container", "{that}.options.testOpts.injected.disabled.markup"]
                }, {
                    func: "{syllabification}.applier.change",
                    args: ["enabled", true]
                }, {
                    event: "{syllabification}.events.afterSyllabification",
                    listener: "fluid.tests.syllabificationTester.verifyTextOutput",
                    priority: "last:testing",
                    args: ["Injected content - Disabled", "{that}.options.testOpts.text", "{that}.options.testOpts.injected.disabled.syllabified"]
                }, {
                    // inject content when enabled
                    func: "fluid.tests.syllabificationTester.injectContent",
                    args: ["{syllabification}.container", "{that}.options.testOpts.injected.enabled.markup"]
                }, {
                    event: "{syllabification}.events.afterSyllabification",
                    listener: "fluid.tests.syllabificationTester.verifyTextOutput",
                    priority: "last:testing",
                    args: ["Injected content - Enabled", "{that}.options.testOpts.text", "{that}.options.testOpts.injected.enabled.syllabified"]
                }, {
                    // disable syllabification
                    func: "{syllabification}.applier.change",
                    args: ["enabled", false]
                }, {
                    event: "{syllabification}.events.afterSyllabification",
                    listener: "fluid.tests.syllabificationTester.verifyTextOutput",
                    priority: "last:testing",
                    args: ["Injected content - Syllabification Removed", "{that}.options.testOpts.text", "{that}.options.testOpts.injected.disabled.default"]
                }, {
                    funcName: "fluid.tests.syllabificationTester.verifyTextOutput",
                    args: ["Injected content - Syllabification Removed", "{that}.options.testOpts.text", "{that}.options.testOpts.injected.enabled.default"]
                }]
            }]
        }]
    });

    fluid.tests.syllabificationTester.injectContent = function (container, markup) {
        $(container).append(markup);
    };

    fluid.tests.syllabificationTester.verifyTextOutput = function (prefix, textOutputs, map) {
        fluid.each(map, function (path, selector) {
            jqUnit.assertEquals(prefix + ": the text for " + selector + " is set correctly", fluid.get(textOutputs, path),$(selector).text());
        });
    };

    fluid.tests.syllabificationTester.verifyDynamicComponentsModel = function (that, componentNames, state) {
        fluid.each(componentNames, function (name) {
            jqUnit.assertEquals("The \"" + name + "\" dynamic component model is set correctly.", state, that[name].model.syllabification);
        });
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.syllabificationTests"
        ]);
    });

})(jQuery);
