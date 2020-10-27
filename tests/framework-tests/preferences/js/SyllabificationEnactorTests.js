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

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests.prefs.enactor.syllabification");

    /**************************************************************************
     * fluid.prefs.enactor.syllabification.getPattern tests
     **************************************************************************/

    fluid.tests.prefs.enactor.syllabification.patterns = {
        en: "path/to/en.js",
        "en-us": "path/to/en-us.js"
    };

    jqUnit.test("Test fluid.prefs.enactor.syllabification.getPattern", function () {

        // Test matching language codes
        fluid.each(fluid.tests.prefs.enactor.syllabification.patterns, function (src, lang) {
            var expected = {
                lang: lang,
                src: src
            };
            var actual = fluid.prefs.enactor.syllabification.getPattern(lang, fluid.tests.prefs.enactor.syllabification.patterns);
            jqUnit.assertDeepEq("The pattern for '" + lang + "' should be returned correctly", expected, actual);
        });

        // Test fallback
        var langToFallback = "en-ca";
        var expectedFallbackPattern = {
            lang: "en",
            src: "path/to/en.js"
        };
        var fallback = fluid.prefs.enactor.syllabification.getPattern(langToFallback, fluid.tests.prefs.enactor.syllabification.patterns);
        jqUnit.assertDeepEq("The fallback language pattern for '" + langToFallback + "' should be returned correctly", expectedFallbackPattern,  fallback);

        // Test unavailable language patterns
        var unavailablePatterns = {
            "fr-ca": {
                lang: "fr",
                src: undefined
            },
            "fr": {
                lang: "fr",
                src: undefined
            }
        };
        fluid.each(unavailablePatterns, function (expected, lang) {
            var actual = fluid.prefs.enactor.syllabification.getPattern(lang, fluid.tests.prefs.enactor.syllabification.patterns);
            jqUnit.assertDeepEq("The unavailable pattern for '" + lang + "' should be returned in the correct format", expected, actual);
        });
    });

    fluid.prefs.enactor.syllabification.getPattern = function (lang, patterns) {
        var src = patterns[lang];

        if (!src) {
            lang = lang.split("-")[0];
            src = patterns[lang];
        }

        return {
            lang: lang,
            src: src
        };
    };
    /**************************************************************************
     * fluid.prefs.enactor.syllabification.insertIntoTextNode tests
     **************************************************************************/

    fluid.tests.prefs.enactor.syllabification.assertNode = function (nodeName, node, expectedType, expectedContent) {
        jqUnit.assertEquals("The " + nodeName + " node has type: " + expectedType, Node[expectedType], node.nodeType);
        jqUnit.assertEquals("The " + nodeName + " node has content: \"" + expectedContent + "\"", expectedContent, node.textContent);
    };

    jqUnit.test("Test fluid.prefs.enactor.syllabification.insertIntoTextNode", function () {
        var parent = $(".flc-syllabification-insertIntoTextNode")[0];
        var toInject = $("<span>inserted </span>")[0];

        jqUnit.assertEquals("The parent node originally only has a single child", 1, parent.childNodes.length);

        var newNode = fluid.prefs.enactor.syllabification.insertIntoTextNode(parent.childNodes[0], toInject, 5);

        // Returned node
        fluid.tests.prefs.enactor.syllabification.assertNode("returned", newNode, "TEXT_NODE", "Content");

        // Parent element
        jqUnit.assertEquals("The parent node now has three children", 3, parent.childNodes.length);
        fluid.tests.prefs.enactor.syllabification.assertNode("first", parent, "ELEMENT_NODE", "Text inserted Content");

        // First child
        fluid.tests.prefs.enactor.syllabification.assertNode("first", parent.childNodes[0], "TEXT_NODE", "Text ");

        // Inserted child
        fluid.tests.prefs.enactor.syllabification.assertNode("first", parent.childNodes[1], "ELEMENT_NODE", "inserted ");

        // Last child
        fluid.tests.prefs.enactor.syllabification.assertNode("first", parent.childNodes[2], "TEXT_NODE", "Content");
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
            patternPrefix: "../../../../src/lib/hypher/patterns"
        },
        // Remove `es` from pattern config to test when configuration isn't available.
        // Tests for patterns with broken paths or non-existent files are not tested because they
        // may cause a global failure if the server returns a 404 html page when we are expecting a JS file.
        patterns: {
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
                // Soft hyphens (\u00AD) included to test https://issues.fluidproject.org/browse/FLUID-6554
                "en": "Global tem\u00ADperature has in\u00ADcreased over the past 50 years.",
                "es": "La temperatura global ha aumentado en los últimos 50 años."
            },
            syllabified: {
                "en-US": [{
                    type: Node.TEXT_NODE,
                    text: "Global tem"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "separator"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "softHyphenPlaceholder"
                }, {
                    type: Node.TEXT_NODE,
                    text: "per"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "separator"
                }, {
                    type: Node.TEXT_NODE,
                    text: "a"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "separator"
                }, {
                    type: Node.TEXT_NODE,
                    text: "ture has in"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "separator"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "softHyphenPlaceholder"
                }, {
                    type: Node.TEXT_NODE,
                    text: "creased over the past 50 years."
                }],
                "en-GB": [{
                    type: Node.TEXT_NODE,
                    text: "Global tem"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "separator"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "softHyphenPlaceholder"
                }, {
                    type: Node.TEXT_NODE,
                    text: "per"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "separator"
                }, {
                    type: Node.TEXT_NODE,
                    text: "at"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "separator"
                }, {
                    type: Node.TEXT_NODE,
                    text: "ure has in"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "separator"
                }, {
                    type: Node.ELEMENT_NODE,
                    selector: "softHyphenPlaceholder"
                }, {
                    type: Node.TEXT_NODE,
                    text: "creased over the past 50 years."
                }],
                "es": [{
                    type: Node.TEXT_NODE,
                    text: "La temperatura global ha aumentado en los últimos 50 años."
                }]
            },
            existing: [{
                selector: ".flc-syllabification-parentLang",
                text: "{that}.options.testOpts.text.en",
                syllabified: "{that}.options.testOpts.syllabified.en-US",
                separatorCount: 4
            }, {
                selector: ".flc-syllabification-otherRegion",
                text: "{that}.options.testOpts.text.en",
                syllabified: "{that}.options.testOpts.syllabified.en-GB",
                separatorCount: 4
            }, {
                selector: ".flc-syllabification-generic",
                text: "{that}.options.testOpts.text.en",
                syllabified: "{that}.options.testOpts.syllabified.en-US",
                separatorCount: 4
            }, {
                selector: ".flc-syllabification-fallback",
                text: "{that}.options.testOpts.text.en",
                syllabified: "{that}.options.testOpts.syllabified.en-US",
                separatorCount: 4
            }, {
                selector: ".flc-syllabification-notAvailable",
                text: "{that}.options.testOpts.text.es",
                syllabified: "{that}.options.testOpts.syllabified.es",
                separatorCount: 0
            }],
            injected: {
                disabled: {
                    selector: ".flc-syllabification-injectWhenDisabled",
                    text: "{that}.options.testOpts.text.en",
                    syllabified: "{that}.options.testOpts.syllabified.en-US",
                    separatorCount: 4
                },
                enabled: {
                    selector: ".flc-syllabification-injectWhenEnabled",
                    text: "{that}.options.testOpts.text.en",
                    syllabified: "{that}.options.testOpts.syllabified.en-US",
                    separatorCount: 4
                },
                combined: [
                    "{that}.options.testOpts.injected.disabled",
                    "{that}.options.testOpts.injected.enabled"
                ]
            },
            // Soft hyphens (&shy;) included to test https://issues.fluidproject.org/browse/FLUID-6554
            markup: {
                injectWhenDisabled: "<p class=\"flc-syllabification-injectWhenDisabled\">Global tem&shy;perature has in&shy;creased over the past 50 years.</p>",
                injectWhenEnabled: "<p class=\"flc-syllabification-injectWhenEnabled\">Global tem&shy;perature has in&shy;creased over the past 50 years.</p>"
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
                expect: 107,
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
                expect: 53,
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
                    args: ["Injected when disabled", "{syllabification}", "{that}.options.testOpts.injected.disabled", 16]
                }, {
                    // inject content when enabled
                    func: "fluid.tests.syllabificationTester.injectContent",
                    args: ["{syllabification}.container", "{that}.options.testOpts.markup.injectWhenEnabled"]
                }, {
                    event: "{syllabification}.events.afterSyllabification",
                    listener: "fluid.tests.syllabificationTester.verifySyllabified",
                    priority: "last:testing",
                    args: ["Injected when disabled", "{syllabification}", "{that}.options.testOpts.injected.enabled", 20]
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
        testCases = fluid.makeArray(testCases);

        fluid.each(testCases, function (testCase) {
            var selector = testCase.selector;
            var elm = $(selector);
            var childNodes = elm[0].childNodes;
            separatorCount += testCase.separatorCount;

            // soft hyphens are removed from the text content when syllabification is enabled
            var expectedText = testCase.text.replace(/\u00AD/g, "");
            jqUnit.assertEquals(prefix + ": The text for " + selector + " is returned correctly", expectedText, elm.text());

            fluid.each(testCase.syllabified, function (expected, index) {
                var childNode = childNodes[index];
                jqUnit.assertEquals(prefix + ": The childNode of " + selector + ", at index \"" + index + "\", is the correct node type", expected.type, childNode.nodeType);

                if (expected.type === Node.TEXT_NODE) {
                    jqUnit.assertEquals(prefix + ": The childNode of " + selector + ", at index \"" + index + "\", has the correct text content", expected.text, childNode.textContent);
                } else {
                    jqUnit.assertTrue(prefix + ": The childNode of " + selector + ", at index \"" + index + "\", is a separator", $(childNode).is(that.options.selectors[expected.selector]));
                }
            });
        });

        fluid.tests.syllabificationTester.verifySeparatorCount("Syllabified", that, separatorCount);
    };

    fluid.tests.syllabificationTester.verifyUnsyllabified = function (prefix, that, testCases) {
        fluid.tests.syllabificationTester.verifySeparatorCount(prefix, that, 0);
        testCases = fluid.makeArray(testCases);

        fluid.each(testCases, function (testCase) {
            var selector = testCase.selector;
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
