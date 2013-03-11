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

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.modelRelay
     *******************************************************************************/

    var resultContainer = ".flc-modelRelay";
    
    fluid.defaults("fluid.tests.modelRelay", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            modelRelayWrapper: {
                type: "fluid.uiOptions.modelRelayWrapper"
            },
            modelRelayTester: {
                type: "fluid.tests.modelRelayTester"
            }
        }
    });

    fluid.defaults("fluid.uiOptions.modelRelayWrapper", {
        gradeNames: ["fluid.modelComponent", "fluid.eventedComponent", "autoInit"],
        model: {
            wrapperValue: null
        },
        components: {
            modelRelayImpl: {
                type: "fluid.uiOptions.modelRelay",
                options: {
                    container: resultContainer,
                    sourceApplier: "{modelRelayWrapper}.applier",
                    rules: {
                        "wrapperValue": "value"
                    },
                    model: {
                        value: null
                    },
                    finalInit: "fluid.uiOptions.modelRelay.finalInit"
                }
            }
        }
    });

    fluid.uiOptions.modelRelay.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            $(that.options.container).text(newModel.value);
        });
    };
    
    fluid.tests.checkResult = function (modelRelayImpl, newValue) {
        return function () {
            jqUnit.assertEquals("The model change request on the modelRelay has been fired", newValue, $(modelRelayImpl.options.container).text());
        };
    };
    
    fluid.defaults("fluid.tests.modelRelayTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newValue: "This is a test string."
        },
        modules: [{
            name: "Test model relay component",
            tests: [{
                expect: 1,
                name: "The applier change request on the modelRelay wrapper triggers the request on the modelRelay itself",
                sequence: [{
                    func: "{modelRelayWrapper}.applier.requestChange",
                    args: ["wrapperValue", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkResult",
                    makerArgs: ["{modelRelayWrapper}.modelRelayImpl", "{that}.options.testOptions.newValue"],
                    spec: {path: "wrapperValue", priority: "last"},
                    changeEvent: "{modelRelayWrapper}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.modelRelay"
        ]);
    });

})(jQuery);
