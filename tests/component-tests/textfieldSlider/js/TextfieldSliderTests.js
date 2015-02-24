/*
Copyright 2009 University of Toronto
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        fluid.registerNamespace("fluid.tests.textfieldSlider");

        jqUnit.module("TextfieldSlider Tests");

        fluid.tests.textfieldSlider.createTextfieldSlider = function (options) {
            return fluid.textfieldSlider(".fl-textfield-slider", options);
        };

        jqUnit.test("Test Init", function () {
            jqUnit.expect(8);
            var textfieldSlider = fluid.tests.textfieldSlider.createTextfieldSlider({model: {value: 15}});
            jqUnit.assertEquals("Slider value is set to input value", 15, $(".flc-textfieldSlider-slider").slider("value"));
            jqUnit.assertEquals("Textfield value is set", 15, $(".flc-textfieldSlider-field").val());
            jqUnit.assertEquals("The model should be set", 15, textfieldSlider.model.value);
            jqUnit.assertEquals("Min should be the default", 0, textfieldSlider.options.range.min);
            jqUnit.assertEquals("Max should be the default", 100, textfieldSlider.options.range.max);

            // Check ARIA defaults
            var thumb = $(".ui-slider-handle");
            jqUnit.assertEquals("The ARIA value now should be 15", 15, thumb.attr("aria-valuenow"));
            jqUnit.assertEquals("The ARIA max should be 100", 100, thumb.attr("aria-valuemax"));
            jqUnit.assertEquals("The ARIA min should be 0", 0, thumb.attr("aria-valuemin"));
        });

        fluid.tests.textfieldSlider.testInputField = function (valToTest, expected) {
            var slider = $(".flc-textfieldSlider-slider");
            var textfield = $(".flc-textfieldSlider-field");
            var thumb = $(".ui-slider-handle");

            textfield.val(valToTest);
            textfield.change();
            jqUnit.assertEquals("Textfield value should be the " + expected, expected, textfield.val());
            jqUnit.assertEquals("The ARIA value now should be " + expected, expected, thumb.attr("aria-valuenow"));
            jqUnit.assertEquals("Slider value should be " + expected, expected, slider.slider("value"));
        };

        fluid.tests.textfieldSlider.testSlider = function (valToTest, expected) {
            var slider = $(".flc-textfieldSlider-slider");

            slider.slider("value", valToTest);
            jqUnit.assertEquals("Slider value should be " + expected, expected, slider.slider("value"));
        };

        fluid.tests.textfieldSlider.testAll = function (valToTest, expected) {
            fluid.tests.textfieldSlider.testSlider(valToTest, expected);
            fluid.tests.textfieldSlider.testInputField(valToTest, expected);
        };

        jqUnit.test("Test Min/Max Size", function () {
            jqUnit.expect(24);

            var that = fluid.tests.textfieldSlider.createTextfieldSlider({range: {min: 5, max: 55}});
            fluid.tests.textfieldSlider.testAll(56, 55, that);
            fluid.tests.textfieldSlider.testAll(55, 55, that);
            fluid.tests.textfieldSlider.testAll(4, 5, that);
            fluid.tests.textfieldSlider.testAll(25, 25, that);
            fluid.tests.textfieldSlider.testAll(-5, 5, that);
            fluid.tests.textfieldSlider.testAll(5, 5, that);
        });

        jqUnit.test("Test Negative Scale", function () {
            jqUnit.expect(20);

            fluid.tests.textfieldSlider.createTextfieldSlider({range: {min: -15, max: -5}});
            fluid.tests.textfieldSlider.testAll(56, -5);
            fluid.tests.textfieldSlider.testAll(-10, -10);
            fluid.tests.textfieldSlider.testAll(-16, -15);
            fluid.tests.textfieldSlider.testAll(-15, -15);
            fluid.tests.textfieldSlider.testAll(-5, -5);
        });

        jqUnit.test("Test Invalid Values", function () {
            jqUnit.expect(6);

            fluid.tests.textfieldSlider.createTextfieldSlider({
                range: {
                    min: -5,
                    max: 5
                },
                model: {
                    value: 1
                }
            });
            fluid.tests.textfieldSlider.testInputField("aaa", 1);
            fluid.tests.textfieldSlider.testInputField(null, 0);
        });
    });
})(jQuery);
