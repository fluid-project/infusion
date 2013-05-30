/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.registerNamespace("fluid.tests");

    /************************************************************************************
     * Unit tests for globalBundle, a global message holder for fluid.uiOptions.messages
     ************************************************************************************/

    fluid.defaults("fluid.tests.globalBundleInstance", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        strings: {
            textFont: "{globalBundle}.options.messageBase.textFont",
            multiplier: "{globalBundle}.options.messageBase.multiplier"
        },
        parentBundle: "{globalBundle}"
    });

    fluid.defaults("fluid.tests.globalBundleTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            messenger: {
                type: "fluid.tests.globalBundleInstance"
            },
            styleElementsTester: {
                type: "fluid.tests.globalBundleTester"
            }
        }
    });
    
    fluid.tests.testGlobalBundle = function (messenger, expectedNumOfTextFont, expectedFirstTextFontValue, expectedMultiplierValue) {
        jqUnit.assertEquals("There are " + expectedNumOfTextFont + " values in the text font message", expectedNumOfTextFont, messenger.options.strings.textFont.length);
        jqUnit.assertEquals("The first value in the text font message is " + expectedFirstTextFontValue, expectedFirstTextFontValue, messenger.options.strings.textFont[0]);
        jqUnit.assertEquals("The value of the multiplier message is " + expectedMultiplierValue, expectedMultiplierValue, messenger.options.strings.multiplier);
    };
    
    fluid.defaults("fluid.tests.globalBundleTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedNumOfTextFont: 5,
            expectedFirstTextFontValue: "Default",
            expectedMultiplierValue: "times"
        },
        modules: [{
            name: "Test style element component",
            tests: [{
                expect: 3,
                name: "Validate the default array and string messages",
                type: "test",
                func: "fluid.tests.testGlobalBundle",
                args: ["{messenger}", "{that}.options.testOptions.expectedNumOfTextFont", "{that}.options.testOptions.expectedFirstTextFontValue", "{that}.options.testOptions.expectedMultiplierValue"]
            }]
        }]
    });

    /*******************************************************************************************
     * Integration test to make sure globalBundle messenger works well with renderer components
     *******************************************************************************************/

    fluid.defaults("fluid.tests.globalBundledRendererComponent", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        selectors: {
            multiplier: ".flc-multiplier"
        },
        protoTree: {
            multiplier: {messagekey: "multiplier"}
        },
        strings: {},
        parentBundle: "{globalBundle}"
    });
    
    fluid.defaults("fluid.tests.globalBundledRendererTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            globalBundledRenderer: {
                type: "fluid.tests.globalBundledRendererComponent",
                container: "#flc-renderer-test"
            },
            globalBundledRendererTester: {
                type: "fluid.tests.globalBundledRendererTester"
            }
        }
    });

    fluid.tests.testRendering = function (that, expectedValue) {
        return function () {
            var inputField = that.locate("multiplier");
            jqUnit.assertEquals("The rendered text is " + expectedValue, expectedValue, inputField.html());
        };
    };
    
    fluid.defaults("fluid.tests.globalBundledRendererTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedValue: "times"
        },
        modules: [{
            name: "Test the global bundled messenger with a renderer component",
            tests: [{
                expect: 1,
                name: "Test the rendering of the message from the global bundle",
                sequence: [{
                    func: "{globalBundledRenderer}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.testRendering",
                    makerArgs: ["{globalBundledRenderer}", "{that}.options.testOptions.expectedValue"],
                    spec: {priority: "last"},
                    event: "{globalBundledRenderer}.events.afterRender"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.globalBundleTests",
            "fluid.tests.globalBundledRendererTests"
        ]);
    });

})(jQuery);
