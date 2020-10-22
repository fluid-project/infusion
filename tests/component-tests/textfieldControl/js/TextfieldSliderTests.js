/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        jqUnit.module("TextfieldSlider Tests");

        fluid.defaults("fluid.tests.textfieldSlider", {
            gradeNames: ["fluid.textfieldSlider"],
            attrs: {
                "aria-labelledby": "label-nativeHTML",
                "aria-label": "{that}.options.strings.label"
            },
            strings: {
                "label": "Aria self-labeling"
            }
        });

        jqUnit.test("Test Init", function () {
            jqUnit.expect(10);
            var options = {
                model: {
                    value: 15,
                    range: {
                        min: 10,
                        max: 20
                    }
                }
            };
            var that = fluid.tests.textfieldSlider(".fl-textfield-slider", options);

            fluid.tests.textfieldControl.assertRangeControlledTextfieldInit(that.textfield, options);

            var slider = that.locate("slider");
            jqUnit.assertEquals("The value now should be " + options.model.value, options.model.value, +slider.val());
            jqUnit.assertEquals("The max should be " + options.model.range.max, options.model.range.max, +slider.attr("max"));
            jqUnit.assertEquals("The min should be " + options.model.range.min, options.model.range.min, +slider.attr("min"));
            jqUnit.assertEquals("Slider has user-supplied aria-label value", that.options.strings.label, slider.attr("aria-label"));
            jqUnit.assertEquals("Slider has user-supplied aria-labelled value", that.options.attrs["aria-labelledby"], slider.attr("aria-labelledby"));
        });

        fluid.tests.textfieldSlider.assertTextfieldEntry = function (valToTest, expected, that) {
            fluid.tests.textfieldControl.assertTextfieldEntry(valToTest, expected, that, that.locate("textfield"));
            jqUnit.assertEquals("Slider value should be " + expected, expected, +that.locate("slider").val());
        };

        fluid.tests.textfieldSlider.assertSliderEntry = function (valToTest, expected, that) {
            that.slider.container.val(valToTest).change();
            jqUnit.assertEquals("Textfield value should be " + expected, expected, +that.locate("textfield").val());
            jqUnit.assertEquals("Model value should be " + expected, expected, that.model.value);
        };

        fluid.each(fluid.tests.textfieldControl.testCases, function (currentCase) {
            jqUnit.test("textfield - " + currentCase.message, function () {
                var that = fluid.tests.textfieldSlider(".fl-textfield-slider", currentCase.componentOptions);

                fluid.each(currentCase.tests, function (currentTest) {
                    fluid.tests.textfieldSlider.assertTextfieldEntry(currentTest.input, currentTest.expected, that);
                });
            });
        });

        // override the invalid test case to update the tests because the
        // expected value for the slider in an invalid input is different
        // than the textfield entry.
        fluid.tests.textfieldSlider.testCases = fluid.copy(fluid.tests.textfieldControl.testCases);
        fluid.tests.textfieldSlider.testCases.invalid.tests = [
            {input: "aaa", expected: 0},
            {input: null, expected: 0}
        ];

        fluid.each(fluid.tests.textfieldSlider.testCases, function (currentCase) {
            jqUnit.test("slider - " + currentCase.message, function () {
                var that = fluid.tests.textfieldSlider(".fl-textfield-slider", currentCase.componentOptions);

                fluid.each(currentCase.tests, function (currentTest) {
                    fluid.tests.textfieldSlider.assertSliderEntry(currentTest.input, currentTest.expected, that);
                });
            });
        });
    });
})(jQuery);
