/*
Copyright 2009 University of Toronto
Copyright 2011-2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        /*************************************
         * Textfield Control Textfield Tests *
         *************************************/

        jqUnit.module("Textfield Control Textfield Tests");

        fluid.defaults("fluid.tests.textfieldControl.textfield", {
            gradeNames: ["fluid.textfieldControl.textfield"],
            model: {
                value: 5
            },
            strings: {
                "aria-label": "Aria Label"
            },
            ariaOptions: {
                "aria-labelledby": "label-textfield"
            }
        });

        jqUnit.test("Test Init", function () {
            jqUnit.expect(4);
            var that = fluid.tests.textfieldControl.textfield(".flc-textfieldControl-textfield");

            fluid.tests.textfieldControl.assertTextfieldInit(that, {model: {value: 5}}, that.container);
        });

        fluid.tests.textfieldControl.textfield.testCases = [{
            message: "Test Valid Values",
            expected: 8,
            tests: [
                {input: 5, expected: 5},
                {input: 0, expected: 0},
                {input: 100, expected: 100},
                {input: -5, expected: -5}
            ]
        }];

        fluid.each(fluid.tests.textfieldControl.textfield.testCases, function (currentCase) {
            jqUnit.test(currentCase.message, function () {
                jqUnit.expect(currentCase.expected);
                var that = fluid.tests.textfieldControl.textfield(".flc-textfieldControl-textfield", currentCase.componentOptions);
                var textfield = that.container;

                fluid.each(currentCase.tests, function (currentTest) {
                    fluid.tests.textfieldControl.assertTextfieldEntry(currentTest.input, currentTest.expected, that, textfield);
                });
            });
        });

        /***************************
         * Textfield Control Tests *
         ***************************/


        jqUnit.module("Textfield Control Tests");

        fluid.defaults("fluid.tests.textfieldControl", {
            gradeNames: ["fluid.tests.textfieldControl", "fluid.textfieldControl"],
            strings: {
                "aria-label": "Aria self-labeling"
            },
            model: {
                value: 0
            },
            ariaOptions: {
                "aria-labelledby": "label-nativeHTML"
            },
            invokers: {
                "getSliderValue": {
                    "this": "{that}.slider.container",
                    "method": "val"
                },
                "setSliderValue": {
                    "this": "{that}.slider.container",
                    "method": "val",
                    args: ["{arguments}.0"]
                },
                "getSliderAttr": {
                    "this": "{that}.slider.container",
                    "method": "attr",
                    "args": "{arguments}.0"
                }
            }
        });

        fluid.tests.textfieldControl.testCommonInit = function (textfieldControl, expected) {
            var textfield = textfieldControl.locate("textfield");
            fluid.tests.textfieldControl.assertTextfieldInit(textfieldControl, expected, textfield);
            jqUnit.assertEquals("Min should be the default", expected.range.min, textfieldControl.options.range.min);
            jqUnit.assertEquals("Max should be the default", expected.range.max, textfieldControl.options.range.max);
        };

        jqUnit.test("Test Init", function () {
            jqUnit.expect(6);
            var options = {
                model: {
                    value: 8
                },
                range: {
                    max: 10,
                    min: 1
                }
            };
            var that = fluid.tests.textfieldControl(".flc-textfieldControl", options);

            fluid.tests.textfieldControl.testCommonInit(that, options);
        });

        fluid.tests.textfieldControl.testInputField = function (valToTest, expected, that) {
            var textfield = that.locate("textfield");

            fluid.changeElementValue(textfield, valToTest);

            jqUnit.assertEquals("Textfield value should be " + expected, expected, +textfield.val());
            jqUnit.assertEquals("Model value should be " + expected, expected, that.model.value);
        };

        fluid.tests.textfieldControl.testCases = [{
            message: "Test Min/Max Size",
            expected: 12,
            componentOptions: {range: {min: 5, max: 55}},
            tests: [
                {input: 56, expected: 55},
                {input: 55, expected: 55},
                {input: 4, expected: 5},
                {input: 25, expected: 25},
                {input: -5, expected: 5},
                {input: 5, expected: 5}
            ]
        },
        {
            message: "Test Negative Scale",
            expected: 10,
            componentOptions: {range: {min: -15, max: -5}},
            tests: [
                {input: 56, expected: -5},
                {input: -10, expected: -10},
                {input: -16, expected: -15},
                {input: -15, expected: -15},
                {input: -5, expected: -5}
            ]
        },
        {
            message: "Test Invalid Values",
            expected: 4,
            componentOptions: {
                range: {
                    min: -5,
                    max: 5
                },
                model: {
                    value: 1
                }
            },
            tests: [
                {input: "aaa", expected: 1},
                {input: null, expected: 0}
            ]
        }];

        fluid.each(fluid.tests.textfieldControl.testCases, function (currentCase) {
            jqUnit.test(currentCase.message, function () {
                jqUnit.expect(currentCase.expected);
                var that = fluid.tests.textfieldControl(".flc-textfieldControl", currentCase.componentOptions);
                var textfield = that.locate("textfield");

                fluid.each(currentCase.tests, function (currentTest) {
                    fluid.tests.textfieldControl.assertTextfieldEntry(currentTest.input, currentTest.expected, that, textfield);
                });
            });
        });

    });
})(jQuery);
