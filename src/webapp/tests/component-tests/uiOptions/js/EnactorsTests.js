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
     * Unit tests for fluid.uiOptions.styleElementsEnactor
     *******************************************************************************/

    fluid.defaults("fluid.tests.styleElementsEnactor", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        expectedCssClass: "fl-style-test",
        expectedFlagFalse: false,
        expectedFlagTrue: true,
        applyStyleContainer: ".flc-styleElementsEnactor-true",
        removeStyleContainer: ".flc-styleElementsEnactor-false",
        components: {
            applyStyle: {
                type: "fluid.uiOptions.actionAnts.styleElementsEnactor",
                options: {
                    setting: true,
                    cssClass: "fl-style-test",
                    invokers: {
                        getElements: {
                            funcName: "fluid.tests.getElements",
                            args: [".flc-styleElementsEnactor-true"]
                        }
                    }
                }
            },
            removeStyle: {
                type: "fluid.uiOptions.actionAnts.styleElementsEnactor",
                options: {
                    setting: false,
                    cssClass: "fl-style-test",
                    invokers: {
                        getElements: {
                            funcName: "fluid.tests.getElements",
                            args: [".flc-styleElementsEnactor-false"]
                        }
                    }
                }
            },
            emphasizeLinksEnactorTester: {
                type: "fluid.tests.styleElementsEnactorTester"
            }
        }
    });

    fluid.tests.getElements = function (container) {
        return $(container).children();
    };
    
    fluid.tests.testStyleElementsEnactor = function (that, desc, container, expectedFlag, expectedCssClass, expectedActualStyle) {
        var elements = fluid.tests.getElements(container);
        
        jqUnit.assertEquals("Expected flag - " + desc + ": " + expectedFlag, expectedFlag, that.options.setting);
        jqUnit.assertEquals("Expected css class - " + desc + ": " + expectedCssClass, expectedCssClass, that.options.cssClass);
        jqUnit.assertEquals("Actual applied css class" + ": " + expectedActualStyle, expectedActualStyle, elements.attr("class"));
    }; 

    fluid.defaults("fluid.tests.styleElementsEnactorTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test style element component",
            tests: [{
                expect: 3,
                name: "Apply style",
                type: "test",
                func: "fluid.tests.testStyleElementsEnactor",
                args: ["{applyStyle}", "apply style", "{fluid.tests.styleElementsEnactor}.options.applyStyleContainer", "{fluid.tests.styleElementsEnactor}.options.expectedFlagTrue", "{fluid.tests.styleElementsEnactor}.options.expectedCssClass", "{fluid.tests.styleElementsEnactor}.options.expectedCssClass"]
            }, {
                expect: 3,
                name: "Remove style",
                type: "test",
                func: "fluid.tests.testStyleElementsEnactor",
                args: ["{removeStyle}", "remove style", "{fluid.tests.styleElementsEnactor}.options.removeStyleContainer", "{fluid.tests.styleElementsEnactor}.options.expectedFlagFalse", "{fluid.tests.styleElementsEnactor}.options.expectedCssClass", undefined]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.actionAnts.emphasizeLinksEnactor
     *******************************************************************************/

    fluid.defaults("fluid.tests.emphasizeLinksEnactor", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        expectedEmphasizeLinksClass: "fl-emphasizeLinks-test",
        expectedFlagFalse: false,
        expectedFlagTrue: true,
        expectedDefaultCssStyle: "fl-link-enhanced",
        components: {
            emphasizeLinksEnactorDefault: {
                type: "fluid.uiOptions.actionAnts.emphasizeLinksEnactor",
                options: {
                    container: ".flc-emphasizeLinksEnactor-default"
                }
            },
            emphasizeLinksEnactorInTrue: {
                type: "fluid.uiOptions.actionAnts.emphasizeLinksEnactor",
                options: {
                    container: ".flc-emphasizeLinksEnactor-true",
                    setting: true,
                    cssClass: "fl-emphasizeLinks-test"
                }
            },
            emphasizeLinksEnactorInFalse: {
                type: "fluid.uiOptions.actionAnts.emphasizeLinksEnactor",
                options: {
                    container: ".flc-emphasizeLinksEnactor-false",
                    setting: false,
                    cssClass: "fl-emphasizeLinks-test"
                }
            },
            emphasizeLinksEnactorTester: {
                type: "fluid.tests.emphasizeLinksEnactorTester"
            }
        }
    });

    fluid.tests.testEmphasizeLinks = function (that, desc, expectedFlag, expectedCssClass, expectedActualStyle) {
        var elements = fluid.uiOptions.actionAnts.emphasizeLinksEnactor.getLinks(that.options.container);
        
        jqUnit.assertEquals("Expected flag - " + desc + ": " + expectedFlag, expectedFlag, that.options.setting);
        jqUnit.assertEquals("Expected css class - " + desc + ": " + expectedCssClass, expectedCssClass, that.options.cssClass);
        jqUnit.assertEquals("Actual applied css class" + ": " + expectedActualStyle, expectedActualStyle, elements.attr("class"));
    }; 

    fluid.defaults("fluid.tests.emphasizeLinksEnactorTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test emphasize links enactor",
            tests: [{
                expect: 3,
                name: "Defaults",
                type: "test",
                func: "fluid.tests.testEmphasizeLinks",
                args: ["{emphasizeLinksEnactorDefault}", "default", "{fluid.tests.emphasizeLinksEnactor}.options.expectedFlagFalse", "{fluid.tests.emphasizeLinksEnactor}.options.expectedDefaultCssStyle", undefined]
            }, {
                expect: 3,
                name: "Apply emphasized links",
                type: "test",
                func: "fluid.tests.testEmphasizeLinks",
                args: ["{emphasizeLinksEnactorInTrue}", "true condition", "{fluid.tests.emphasizeLinksEnactor}.options.expectedFlagTrue", "{fluid.tests.emphasizeLinksEnactor}.options.expectedEmphasizeLinksClass", "{fluid.tests.emphasizeLinksEnactor}.options.expectedEmphasizeLinksClass"]
            }, {
                expect: 3,
                name: "Remove emphasized links",
                type: "test",
                func: "fluid.tests.testEmphasizeLinks",
                args: ["{emphasizeLinksEnactorInFalse}", "false condition", "{fluid.tests.emphasizeLinksEnactor}.options.expectedFlagFalse", "{fluid.tests.emphasizeLinksEnactor}.options.expectedEmphasizeLinksClass", undefined]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.actionAnts.inputsLargerEnactor
     *******************************************************************************/

    fluid.defaults("fluid.tests.inputsLargerEnactor", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        expectedInputsLargerClass: "fl-inputsLarger-test",
        expectedFlagFalse: false,
        expectedFlagTrue: true,
        expectedDefaultCssStyle: "fl-text-larger",
        components: {
            inputsLargerEnactorDefault: {
                type: "fluid.uiOptions.actionAnts.inputsLargerEnactor",
                options: {
                    container: ".flc-inputsLargerEnactor-default"
                }
            },
            inputsLargerEnactorInTrue: {
                type: "fluid.uiOptions.actionAnts.inputsLargerEnactor",
                options: {
                    container: ".flc-inputsLargerEnactor-true",
                    setting: true,
                    cssClass: "fl-inputsLarger-test"
                }
            },
            inputsLargerEnactorInFalse: {
                type: "fluid.uiOptions.actionAnts.inputsLargerEnactor",
                options: {
                    container: ".flc-inputsLargerEnactor-false",
                    setting: false,
                    cssClass: "fl-inputsLarger-test"
                }
            },
            inputsLargerEnactorTester: {
                type: "fluid.tests.inputsLargerEnactorTester"
            }
        }
    });

    fluid.tests.testInputsLarger = function (that, desc, expectedFlag, expectedCssClass, expectedActualStyle) {
        var elements = fluid.uiOptions.actionAnts.inputsLargerEnactor.getInputs(that.options.container);
        
        jqUnit.assertEquals("Expected flag - " + desc + ": " + expectedFlag, expectedFlag, that.options.setting);
        jqUnit.assertEquals("Expected css class - " + desc + ": " + expectedCssClass, expectedCssClass, that.options.cssClass);
        jqUnit.assertEquals("Actual applied css class" + ": " + expectedActualStyle, expectedActualStyle, elements.attr("class"));
    }; 

    fluid.defaults("fluid.tests.inputsLargerEnactorTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test inputs larger enactor",
            tests: [{
                expect: 3,
                name: "Defaults",
                type: "test",
                func: "fluid.tests.testInputsLarger",
                args: ["{inputsLargerEnactorDefault}", "default", "{fluid.tests.inputsLargerEnactor}.options.expectedFlagFalse", "{fluid.tests.inputsLargerEnactor}.options.expectedDefaultCssStyle", undefined]
            }, {
                expect: 3,
                name: "Apply larger inputs",
                type: "test",
                func: "fluid.tests.testInputsLarger",
                args: ["{inputsLargerEnactorInTrue}", "true condition", "{fluid.tests.inputsLargerEnactor}.options.expectedFlagTrue", "{fluid.tests.inputsLargerEnactor}.options.expectedInputsLargerClass", "{fluid.tests.inputsLargerEnactor}.options.expectedInputsLargerClass"]
            }, {
                expect: 3,
                name: "Remove larger inputs",
                type: "test",
                func: "fluid.tests.testInputsLarger",
                args: ["{inputsLargerEnactorInFalse}", "false condition", "{fluid.tests.inputsLargerEnactor}.options.expectedFlagFalse", "{fluid.tests.inputsLargerEnactor}.options.expectedInputsLargerClass", undefined]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.styleElementsEnactor",
            "fluid.tests.emphasizeLinksEnactor",
            "fluid.tests.inputsLargerEnactor"
        ]);
    });

})(jQuery);
