/*
Copyright 2009 University of Toronto
Copyright 2011-2016 OCAD University

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

        fluid.registerNamespace("fluid.tests.textfieldSlider");

        jqUnit.module("TextfieldSlider Tests");

        fluid.defaults("fluid.tests.textfieldSlider", {
            strings: {
                "aria-label": "Aria self-labeling"
            }
        });

        fluid.defaults("fluid.tests.textfieldSlider", {
            gradeNames: ["fluid.tests.textfieldSlider", "fluid.textfieldSlider"],
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

        fluid.tests.textfieldSlider.createTextfieldSlider = function (options) {
            return fluid.tests.textfieldSlider(".fl-textfield-slider", options);
        };

        fluid.tests.textfieldSlider.testCommonInit = function (textfieldSlider) {
            var that = textfieldSlider;

            jqUnit.assertEquals("Slider value is set to input value", 15, +textfieldSlider.getSliderValue());
            jqUnit.assertEquals("Textfield value is set", 15, +that.locate("textfield").val());
            jqUnit.assertEquals("The model should be set", 15, that.model.value);
            jqUnit.assertEquals("Min should be the default", 0, that.options.range.min);
            jqUnit.assertEquals("Max should be the default", 100, that.options.range.max);

            jqUnit.assertEquals("Slider has user-supplied aria-label value", textfieldSlider.options.strings["aria-label"], textfieldSlider.getSliderAttr("aria-label"));

            jqUnit.assertEquals("Slider has user-supplied aria-labelled value", textfieldSlider.options.ariaOptions["aria-labelledby"], textfieldSlider.getSliderAttr("aria-labelledby"));

        };

        jqUnit.test("Test Init", function () {
            jqUnit.expect(10);
            var that = fluid.tests.textfieldSlider.createTextfieldSlider({model: {value: 15}});

            fluid.tests.textfieldSlider.testCommonInit(that);

            var slider = that.locate("slider");

            // Check range slider attributes
            jqUnit.assertEquals("The value now should be 15", 15, +that.getSliderValue());
            jqUnit.assertEquals("The max should be 100", 100, +slider.attr("max"));
            jqUnit.assertEquals("The min should be 0", 0, +slider.attr("min"));
        });

        fluid.tests.textfieldSlider.testInputField = function (valToTest, expected, that) {
            var textfield = that.locate("textfield");

            fluid.changeElementValue(textfield, valToTest);

            jqUnit.assertEquals("Textfield value should be the " + expected, expected, +textfield.val());

            jqUnit.assertEquals("Slider value should be " + expected, expected, +that.getSliderValue());
        };

        fluid.tests.textfieldSlider.testSlider = function (valToTest, expected, that) {
            that.setSliderValue(valToTest);
            jqUnit.assertEquals("Slider value should be " + expected, expected, +that.getSliderValue());
        };

        fluid.tests.textfieldSlider.testAll = function (valToTest, expected, that) {
            fluid.tests.textfieldSlider.testSlider(valToTest, expected, that);
            fluid.tests.textfieldSlider.testInputField(valToTest, expected, that);
        };

        fluid.tests.textfieldSlider.testMinMax = function (that) {
            fluid.tests.textfieldSlider.testAll(56, 55, that);
            fluid.tests.textfieldSlider.testAll(55, 55, that);
            fluid.tests.textfieldSlider.testAll(4, 5, that);
            fluid.tests.textfieldSlider.testAll(25, 25, that);
            fluid.tests.textfieldSlider.testAll(-5, 5, that);
            fluid.tests.textfieldSlider.testAll(5, 5, that);
        };

        fluid.tests.textfieldSlider.testNegativeScale = function (that) {
            fluid.tests.textfieldSlider.testAll(56, -5, that);
            fluid.tests.textfieldSlider.testAll(-10, -10, that);
            fluid.tests.textfieldSlider.testAll(-16, -15, that);
            fluid.tests.textfieldSlider.testAll(-15, -15, that);
            fluid.tests.textfieldSlider.testAll(-5, -5, that);
        };

        fluid.tests.textfieldSlider.testInvalidValues = function (that) {
            fluid.tests.textfieldSlider.testInputField("aaa", 1, that);
            fluid.tests.textfieldSlider.testInputField(null, 0, that);
        };

        var testCases = [
            {
                message: "Test Min/Max Size",
                expected: 18,
                componentOptions: {range: {min: 5, max: 55}},
                testFunction: fluid.tests.textfieldSlider.testMinMax
            },
            {
                message: "Test Negative Scale",
                expected: 15,
                componentOptions: {range: {min: -15, max: -5}},
                testFunction: fluid.tests.textfieldSlider.testNegativeScale
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
                testFunction: fluid.tests.textfieldSlider.testInvalidValues
            }
        ];

        fluid.each(testCases, function (currentCase) {
            jqUnit.test(currentCase.message, function () {
                jqUnit.expect(currentCase.expected);
                var that = fluid.tests.textfieldSlider.createTextfieldSlider(currentCase.componentOptions);
                currentCase.testFunction(that);
            });
        });

    });
})(jQuery);
