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
                "en": "Climate changes are underway in the United States and are projected to grow.",
                "es": "Los cambios climáticos están en marcha en los Estados Unidos y se prevé que crezcan."
            },
            syllabified: {
                "en-US": [{
                    type: Node.TEXT_NODE,
                    text: "Cli"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "mate changes are un"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "der"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "way in the Unit"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "ed States and are pro"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "ject"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "ed to grow."
                }],
                "en-GB": [{
                    type: Node.TEXT_NODE,
                    text: "Cli"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "mate changes are un"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "der"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "way in the United States and are pro"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "jec"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "ted to grow."
                }],
                "es": [{
                    type: Node.TEXT_NODE,
                    text: "Los cambios climáticos están en marcha en los Estados Unidos y se prevé que crezcan."
                }]
            },
            existing: {
                ".flc-syllabification-parentLang": {
                    text: "{that}.options.testOpts.text.en",
                    syllabified: "{that}.options.testOpts.syllabified.en-US",
                    separatorCount: 6
                },
                ".flc-syllabification-otherRegion": {
                    text: "{that}.options.testOpts.text.en",
                    syllabified: "{that}.options.testOpts.syllabified.en-GB",
                    separatorCount: 5
                },
                ".flc-syllabification-generic": {
                    text: "{that}.options.testOpts.text.en",
                    syllabified: "{that}.options.testOpts.syllabified.en-US",
                    separatorCount: 6
                },
                ".flc-syllabification-fallback": {
                    text: "{that}.options.testOpts.text.en",
                    syllabified: "{that}.options.testOpts.syllabified.en-US",
                    separatorCount: 6
                },
                ".flc-syllabification-notAvailable": {
                    text: "{that}.options.testOpts.text.es",
                    syllabified: "{that}.options.testOpts.syllabified.es",
                    separatorCount: 0
                }
            },
            injected: {
                disabled: {
                    ".flc-syllabification-injectWhenDisabled": {
                        text: "{that}.options.testOpts.text.en",
                        syllabified: "{that}.options.testOpts.syllabified.en-US",
                        separatorCount: 6
                    }
                },
                enabled: {
                    ".flc-syllabification-injectWhenEnabled": {
                        text: "{that}.options.testOpts.text.en",
                        syllabified: "{that}.options.testOpts.syllabified.en-US",
                        separatorCount: 6
                    }
                },
                combined: {
                    ".flc-syllabification-injectWhenDisabled": "{that}.options.testOpts.injected.disabled.\.flc-syllabification-injectWhenDisabled",
                    ".flc-syllabification-injectWhenEnabled": "{that}.options.testOpts.injected.disabled.\.flc-syllabification-injectWhenEnabled"
                }
            },
            markup: {
                injectWhenDisabled: "<p class=\"flc-syllabification-injectWhenDisabled\">Climate changes are underway in the United States and are projected to grow.</p>",
                injectWhenEnabled: "<p class=\"flc-syllabification-injectWhenEnabled\">Climate changes are underway in the United States and are projected to grow.</p>"
            }
        },
        modules: [{
            name: "fluid.prefs.enactor.syllabification",
            tests: [{
                expect: 11,
                name: "Initial State",
                sequence: [{
                    // init, before syllabification
                    funcName: "fluid.tests.syllabificationTester.verifyUnsyllabified",
                    args: ["Init", "{syllabification}", "{that}.options.testOpts.existing"]
                }]
            }, {
                expect: 119,
                name: "Add/Remove syllabification",
                sequence: [{
                    // enabled syllabification
                    func: "{syllabification}.applier.change",
                    args: ["enabled", true]
                }, {
                    event: "{syllabification}.events.afterSyllabification",
                    listener: "fluid.tests.syllabificationTester.verifySyllabified",
                    priority: "last:testing",
                    args: ["Syllabified", "{syllabification}", "{that}.options.testOpts.existing"]
                }, {
                    // disable syllabification
                    func: "{syllabification}.applier.change",
                    args: ["enabled", false]
                }, {
                    changeEvent: "{syllabification}.applier.modelChanged",
                    listener: "fluid.tests.syllabificationTester.verifyUnsyllabified",
                    spec: {path: "enabled", priority: "last:testing"},
                    args: ["Syllabification Removed", "{syllabification}", "{that}.options.testOpts.existing"]
                }]
            }, {
                expect: 57,
                name: "Injected Content",
                sequence: [{
                    // inject content, then enable syllabification
                    func: "fluid.tests.syllabificationTester.injectContent",
                    args: ["{syllabification}.container", "{that}.options.testOpts.markup.injectWhenDisabled"]
                }, {
                    func: "{syllabification}.applier.change",
                    args: ["enabled", true]
                }, {
                    event: "{syllabification}.events.afterSyllabification",
                    listener: "fluid.tests.syllabificationTester.verifySyllabified",
                    priority: "last:testing",
                    args: ["Injected when disabled", "{syllabification}", "{that}.options.testOpts.injected.disabled", 23]
                }, {
                    // inject content when enabled
                    func: "fluid.tests.syllabificationTester.injectContent",
                    args: ["{syllabification}.container", "{that}.options.testOpts.markup.injectWhenEnabled"]
                }, {
                    event: "{syllabification}.events.afterSyllabification",
                    listener: "fluid.tests.syllabificationTester.verifySyllabified",
                    priority: "last:testing",
                    args: ["Injected when disabled", "{syllabification}", "{that}.options.testOpts.injected.enabled", 29]
                }, {
                    // disable syllabification
                    func: "{syllabification}.applier.change",
                    args: ["enabled", false]
                }, {
                    changeEvent: "{syllabification}.applier.modelChanged",
                    listener: "fluid.tests.syllabificationTester.verifyUnsyllabified",
                    spec: {path: "enabled", priority: "last:testing"},
                    args: ["Syllabification Removed from Injected", "{syllabification}", "{that}.options.testOpts.injected.combined"]
                }]
            }]
        }]
    });

    fluid.tests.syllabificationTester.injectContent = function (container, markup) {
        $(container).append(markup);
    };

    fluid.tests.syllabificationTester.verifySeparatorCount = function (prefix, that, expected) {
        var separators = that.locate("separator");
        jqUnit.assertEquals(prefix + ": The correct number of separator elements found.", expected, separators.length);
    };

    fluid.tests.syllabificationTester.verifySyllabified = function (prefix, that, testCases, separatorCount) {
        // Specify an initial separatorCount for cases where the test cases do not cover all of the text that is being
        // syllabified. For example when testing injected content.
        separatorCount = separatorCount || 0;

        fluid.each(testCases, function (testCase, selector) {
            var childNodes = $(selector)[0].childNodes;
            separatorCount += testCase.separatorCount;
            jqUnit.assertEquals(prefix + ": The text for " + selector + " is returned correctly");

            fluid.each(testCase.syllabified, function (expected, index) {
                var childNode = childNodes[index];
                jqUnit.assertEquals(prefix + ": The childNode of " + selector + ", at index \"" + index + "\", is the correct node type", expected.type, childNode.nodeType);

                if (expected.type === Node.TEXT_NODE) {
                    jqUnit.assertEquals(prefix + ": The childNode of " + selector + ", at index \"" + index + "\", has the correct text content", expected.text, childNode.textContent);
                } else {
                    jqUnit.assertTrue(prefix + ": The childNode of " + selector + ", at index \"" + index + "\", is a separator", $(childNode).is(that.options.selectors.separator));
                }
            });
        });

        fluid.tests.syllabificationTester.verifySeparatorCount("Syllabified", that, separatorCount);
    };

    fluid.tests.syllabificationTester.verifyUnsyllabified = function (prefix, that, testCases) {
        fluid.tests.syllabificationTester.verifySeparatorCount(prefix, that, 0);

        fluid.each(testCases, function (testCase, selector) {
            var childNodes = $(selector)[0].childNodes;
            jqUnit.assertEquals(prefix + ": " + selector + " should only have one child node", 1, childNodes.length);
            jqUnit.assertEquals(prefix + ": " + selector + " should have the correct textcontent", testCase.text, childNodes[0].textContent);
        });
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.syllabificationTests"
        ]);
    });

})(jQuery);
