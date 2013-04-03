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
     * Unit tests for fluid.uiOptions.textFont
     *******************************************************************************/
    var classnameMap = {
            "textFont": {
                "default": "",
                "times": "fl-font-uio-times",
                "comic": "fl-font-uio-comic-sans",
                "arial": "fl-font-uio-arial",
                "verdana": "fl-font-uio-verdana"
            },
            "theme": {
                "default": "fl-uio-default-theme",
                "bw": "fl-theme-uio-bw fl-theme-bw",
                "wb": "fl-theme-uio-wb fl-theme-wb",
                "by": "fl-theme-uio-by fl-theme-by",
                "yb": "fl-theme-uio-yb fl-theme-yb"
            }
        };

    /*******************************************************************************
     * Functions shared by panels
     *******************************************************************************/
    fluid.tests.changeSelection = function (element, newValue) {
        element.val(newValue).change();
    };
    
    fluid.tests.checkModel = function (path, expectedValue) {
        return function (newModel) {
            var newval = fluid.get(newModel, path);
            jqUnit.assertEquals("Expected model value " + expectedValue + " at path " + path, expectedValue , newval);  
        };
    };
    
    /*******************************************************************************
     * textFontPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.textFontPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            textFont: {
                type: "fluid.uiOptions.textFont",
                container: ".flc-textFont",
                options: {
                    classnameMap: classnameMap,
                }
            },
            textFontTester: {
                type: "fluid.tests.textFontTester"
            }
        }
    });

    fluid.tests.testSelected = function (that, expectedNumOfOptions, expectedFont) {
        return function () {
            var options = that.container.find("option");
            jqUnit.assertEquals("There are " + expectedNumOfOptions + " text fonts in the control", expectedNumOfOptions, options.length);
            jqUnit.assertEquals("The first text font is " + expectedFont, expectedFont, options.filter(":selected").val());
        };
    };
    
    fluid.defaults("fluid.tests.textFontTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedNumOfOptions: 5,
            defaultValue: "default",
            newValue: "comic"
        },
        modules: [{
            name: "Test the text font settings panel",
            tests: [{
                expect: 3,
                name: "Test the rendering of the text font panel",
                sequence: [{
                    func: "{textFont}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.testSelected",
                    makerArgs: ["{textFont}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{textFont}.events.afterRender"
                }, {
                    func: "fluid.tests.changeSelection",
                    args: ["{textFont}.dom.textFont", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{textFont}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Contrast
     *******************************************************************************/
    fluid.defaults("fluid.tests.contrastPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            contrast: {
                type: "fluid.uiOptions.contrast",
                container: ".flc-contrast",
                options: {
                    classnameMap: classnameMap,
                }
            },
            textFontTester: {
                type: "fluid.tests.contrastTester"
            }
        }
    });

    fluid.tests.testChecked = function (that, expectedNumOfOptions, expectedContrast) {
        return function () {
            console.log("testChecked");
            var inputs = that.container.find("input");
            jqUnit.assertEquals("There are " + expectedNumOfOptions + " contrast selections in the control", expectedNumOfOptions, inputs.length);
            jqUnit.assertEquals("The first contrast is " + expectedContrast, expectedContrast, inputs.filter(":checked").val());
        };
    };
    
    fluid.defaults("fluid.tests.contrastTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedNumOfOptions: 5,
            defaultValue: "default",
            newValue: "bw"
        },
        modules: [{
            name: "Test the contrast settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the contrast panel",
                sequence: [{
                    func: "{contrast}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.testChecked",
                    makerArgs: ["{contrast}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{contrast}.events.afterRender"
                }/*, {
                    func: "fluid.tests.changeSelection",
                    args: ["{contrast}.dom.textFont", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{contrast}.applier.modelChanged"
                }*/]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.textFontPanel",
            "fluid.tests.contrastPanel"
        ]);
    });

})(jQuery);
