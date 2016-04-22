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

        fluid.tests.textfieldSlider.createTextfieldSlider = function (options) {
            return fluid.textfieldSlider(".fl-textfield-slider", options);
        };

        jqUnit.test("Test Init", function () {
            jqUnit.expect(8);
            var that = fluid.tests.textfieldSlider.createTextfieldSlider({model: {value: 15}});

            var slider = that.locate("slider");

            jqUnit.assertEquals("Slider value is set to input value", 15, +slider.val());
            jqUnit.assertEquals("Textfield value is set", 15, +$(".flc-textfieldSlider-field").val());
            jqUnit.assertEquals("The model should be set", 15, that.model.value);
            jqUnit.assertEquals("Min should be the default", 0, that.options.range.min);
            jqUnit.assertEquals("Max should be the default", 100, that.options.range.max);

            // Check range slider attributes
            jqUnit.assertEquals("The value now should be 15", 15, +slider.val());
            jqUnit.assertEquals("The max should be 100", 100, +slider.attr("max"));
            jqUnit.assertEquals("The min should be 0", 0, +slider.attr("min"));
        });

        fluid.tests.textfieldSlider.testInputField = function (valToTest, expected, that) {

            var slider = that.locate("slider");
            var textfield = $(".flc-textfieldSlider-field");

            fluid.changeElementValue(textfield, valToTest);

            jqUnit.assertEquals("Textfield value should be the " + expected, expected, +textfield.val());

            jqUnit.assertEquals("Slider value should be " + expected, expected, +slider.val());
        };

        fluid.tests.textfieldSlider.testSlider = function (valToTest, expected, that) {
            var slider = that.locate("slider");

            fluid.changeElementValue(slider, valToTest);
            jqUnit.assertEquals("Slider value should be " + expected, expected, +slider.val());
        };

        fluid.tests.textfieldSlider.testAll = function (valToTest, expected, that) {
            fluid.tests.textfieldSlider.testSlider(valToTest, expected, that);
            fluid.tests.textfieldSlider.testInputField(valToTest, expected, that);
        };

        jqUnit.test("Test Min/Max Size", function () {
            jqUnit.expect(18);

            var that = fluid.tests.textfieldSlider.createTextfieldSlider({range: {min: 5, max: 55}});
            fluid.tests.textfieldSlider.testAll(56, 55, that);
            fluid.tests.textfieldSlider.testAll(55, 55, that);
            fluid.tests.textfieldSlider.testAll(4, 5, that);
            fluid.tests.textfieldSlider.testAll(25, 25, that);
            fluid.tests.textfieldSlider.testAll(-5, 5, that);
            fluid.tests.textfieldSlider.testAll(5, 5, that);
        });

        jqUnit.test("Test Negative Scale", function () {
            jqUnit.expect(15);

            var that = fluid.tests.textfieldSlider.createTextfieldSlider({range: {min: -15, max: -5}});
            fluid.tests.textfieldSlider.testAll(56, -5, that);
            fluid.tests.textfieldSlider.testAll(-10, -10, that);
            fluid.tests.textfieldSlider.testAll(-16, -15, that);
            fluid.tests.textfieldSlider.testAll(-15, -15, that);
            fluid.tests.textfieldSlider.testAll(-5, -5, that);
        });

        jqUnit.test("Test Invalid Values", function () {
            jqUnit.expect(4);

            var that = fluid.tests.textfieldSlider.createTextfieldSlider({
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
