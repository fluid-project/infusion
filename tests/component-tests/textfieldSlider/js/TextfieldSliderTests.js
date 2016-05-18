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

        fluid.defaults("fluid.tests.textfieldSlider.nativeHTML", {
            gradeNames: ["fluid.textfieldSlider"],
            invokers: {
                "getSliderValue": {
                    "this": "{that}.slider.container",
                    "method": "val"
                },
                "setSliderValue": {
                    "this": "{that}.slider.container",
                    "method": "val",
                    args: ["{arguments}.0"]
                }
            }
        });

        fluid.defaults("fluid.tests.textfieldSlider.jQueryUI", {
            gradeNames: ["fluid.textfieldSlider"],
            invokers: {
                "getSliderValue": {
                    "this": "{that}.slider.slider",
                    "method": "slider",
                    args: ["value"]
                },
                "setSliderValue": {
                    "this": "{that}.slider",
                    "method": "setSliderValue",
                    args: ["{arguments}.0"]
                }
            }
        });

        fluid.tests.textfieldSlider.createTextfieldSliderNativeHTML = function (options) {
            // Make sure we're using the native widget
            fluid.contextAware.makeChecks({
                "fluid.prefsWidgetType": {
                    value: "nativeHTML"
                }
            });
            return fluid.tests.textfieldSlider.nativeHTML(".fl-textfield-slider-native", options);
        };

        fluid.tests.textfieldSlider.createTextfieldSliderJQueryUI = function (options) {
            // Override default native widget to use jQuery slider instead
            fluid.contextAware.makeChecks({
                "fluid.prefsWidgetType": {
                    value: "jQueryUI"
                }
            });

            return fluid.tests.textfieldSlider.jQueryUI(".fl-textfield-slider-jQuery", options);
        };

        fluid.tests.textfieldSlider.testCommonInit = function (textfieldSlider) {
            var that = textfieldSlider;

            jqUnit.assertEquals("Slider value is set to input value", 15, +textfieldSlider.getSliderValue());
            jqUnit.assertEquals("Textfield value is set", 15, +that.locate("textfield").val());
            jqUnit.assertEquals("The model should be set", 15, that.model.value);
            jqUnit.assertEquals("Min should be the default", 0, that.options.range.min);
            jqUnit.assertEquals("Max should be the default", 100, that.options.range.max);
        };

        jqUnit.test("Test Init (native slider)", function () {
            jqUnit.expect(8);
            var that = fluid.tests.textfieldSlider.createTextfieldSliderNativeHTML({model: {value: 15}});

            fluid.tests.textfieldSlider.testCommonInit(that);

            var slider = that.locate("slider");

            // Check range slider attributes
            jqUnit.assertEquals("The value now should be 15", 15, +that.getSliderValue());
            jqUnit.assertEquals("The max should be 100", 100, +slider.attr("max"));
            jqUnit.assertEquals("The min should be 0", 0, +slider.attr("min"));
        });

        jqUnit.test("Test Init (jQuery slider)", function () {
            jqUnit.expect(8);
            var that = fluid.tests.textfieldSlider.createTextfieldSliderJQueryUI({model: {value: 15}});

            fluid.tests.textfieldSlider.testCommonInit(that);

            // Check ARIA defaults
            var thumb = that.slider.locate("thumb");
            jqUnit.assertEquals("The ARIA value now should be 15", 15, +thumb.attr("aria-valuenow"));
            jqUnit.assertEquals("The ARIA max should be 100", 100, +thumb.attr("aria-valuemax"));
            jqUnit.assertEquals("The ARIA min should be 0", 0, +thumb.attr("aria-valuemin"));
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

        jqUnit.test("Test Min/Max Size (native)", function () {
            jqUnit.expect(18);
            var that = fluid.tests.textfieldSlider.createTextfieldSliderNativeHTML({range: {min: 5, max: 55}});
            fluid.tests.textfieldSlider.testMinMax(that);
        });

        jqUnit.test("Test Min/Max Size (jQuery)", function () {
            jqUnit.expect(18);
            var that = fluid.tests.textfieldSlider.createTextfieldSliderJQueryUI({range: {min: 5, max: 55}});
            fluid.tests.textfieldSlider.testMinMax(that);
        });

        jqUnit.test("Test Negative Scale (native)", function () {
            jqUnit.expect(15);

            var that = fluid.tests.textfieldSlider.createTextfieldSliderNativeHTML({range: {min: -15, max: -5}});
            fluid.tests.textfieldSlider.testNegativeScale(that);
        });

        jqUnit.test("Test Negative Scale (jQuery)", function () {
            jqUnit.expect(15);

            var that = fluid.tests.textfieldSlider.createTextfieldSliderJQueryUI({range: {min: -15, max: -5}});
            fluid.tests.textfieldSlider.testNegativeScale(that);
        });

        jqUnit.test("Test Invalid Values (native)", function () {
            jqUnit.expect(4);

            var that = fluid.tests.textfieldSlider.createTextfieldSliderNativeHTML({
                range: {
                    min: -5,
                    max: 5
                },
                model: {
                    value: 1
                }
            });
            fluid.tests.textfieldSlider.testInputField("aaa", 1, that);
            fluid.tests.textfieldSlider.testInputField(null, 0, that);
        });

        jqUnit.test("Test Invalid Values (jQuery)", function () {
            jqUnit.expect(4);

            var that = fluid.tests.textfieldSlider.createTextfieldSliderJQueryUI({
                range: {
                    min: -5,
                    max: 5
                },
                model: {
                    value: 1
                }
            });
            fluid.tests.textfieldSlider.testInputField("aaa", 1, that);
            fluid.tests.textfieldSlider.testInputField(null, 0, that);
        });


    });
})(jQuery);
