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
     * Unit tests for fluid.uiOptions.messages, an UIO message holder grade component
     ************************************************************************************/

    fluid.tests.newTextFontLabel = "A test text style";

    fluid.defaults("fluid.tests.messagesInstance", {
        gradeNames: ["fluid.uiOptions.messages", "autoInit"],
            members: {
                messages: {
                    textFontLabel: fluid.tests.newTextFontLabel
                }
            }
    });

    fluid.defaults("fluid.tests.messagesTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            messenger: {
                type: "fluid.tests.messagesInstance"
            },
            styleElementsTester: {
                type: "fluid.tests.messagesTester"
            }
        }
    });
    
    fluid.tests.testMessages = function (messenger, expectedNumOfTextFont, expectedFirstTextFontValue, expectedMultiplierValue) {
        jqUnit.assertEquals("There are " + expectedNumOfTextFont + " values in the text font message", expectedNumOfTextFont, messenger.messages.textFont.length);
        jqUnit.assertEquals("The first value in the text font message is " + expectedFirstTextFontValue, expectedFirstTextFontValue, messenger.messages.textFont[0]);
        jqUnit.assertEquals("The value of the multiplier message is " + expectedMultiplierValue, expectedMultiplierValue, messenger.messages.multiplier);
        jqUnit.assertEquals("The value of the text font label is overwritten with the new value " + fluid.tests.newTextFontLabel, fluid.tests.newTextFontLabel, messenger.messages.textFontLabel);
    };
    
    fluid.defaults("fluid.tests.messagesTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedNumOfTextFont: 5,
            expectedFirstTextFontValue: "Default",
            expectedMultiplierValue: "times"
        },
        modules: [{
            name: "Test style element component",
            tests: [{
                expect: 4,
                name: "Validate the default array and string messages",
                type: "test",
                func: "fluid.tests.testMessages",
                args: ["{messenger}", "{that}.options.testOptions.expectedNumOfTextFont", "{that}.options.testOptions.expectedFirstTextFontValue", "{that}.options.testOptions.expectedMultiplierValue"]
            }]
        }]
    });

    /*******************************************************************************************
     * Integration test to make sure messages grade works well with renderer components
     *******************************************************************************************/

    fluid.defaults("fluid.tests.messagesRendererComponent", {
        gradeNames: ["fluid.rendererComponent", "fluid.uiOptions.messages", "autoInit"],
        selectors: {
            multiplier: ".flc-multiplier"
        },
        protoTree: {
            multiplier: {messagekey: "multiplier"}
        },
        strings: {},
        parentBundle: {
            expander: {
                funcName: "fluid.messageResolver",
                args: [{messageBase: "{that}.messages"}]
            }
        }
    });
    
    fluid.defaults("fluid.tests.messagesRendererTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            messagesRenderer: {
                type: "fluid.tests.messagesRendererComponent",
                container: "#flc-renderer-test"
            },
            messagesRendererTester: {
                type: "fluid.tests.messagesRendererTester"
            }
        }
    });

    fluid.tests.testRendering = function (that, expectedValue) {
        return function () {
            var inputField = that.locate("multiplier");
            jqUnit.assertEquals("The rendered text is " + expectedValue, expectedValue, inputField.html());
        };
    };
    
    fluid.defaults("fluid.tests.messagesRendererTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedValue: "times"
        },
        modules: [{
            name: "Test the messenger with a renderer component",
            tests: [{
                expect: 1,
                name: "Test the rendering of the message",
                sequence: [{
                    func: "{messagesRenderer}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.testRendering",
                    makerArgs: ["{messagesRenderer}", "{that}.options.testOptions.expectedValue"],
                    spec: {priority: "last"},
                    event: "{messagesRenderer}.events.afterRender"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.messagesTests",
            "fluid.tests.messagesRendererTests"
        ]);
    });

})(jQuery);
