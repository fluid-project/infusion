/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

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

        /*******************
         * Textfield Tests *
         *******************/

        jqUnit.module("Textfield Tests");

        fluid.defaults("fluid.tests.textfield", {
            gradeNames: ["fluid.textfield"],
            model: {
                value: "default value"
            },
            strings: {
                "label": "Aria Label"
            },
            attrs: {
                "aria-labelledby": "label-textfield",
                "aria-label": "{that}.options.strings.label"
            }
        });

        jqUnit.test("Test Init", function () {
            jqUnit.expect(4);
            var that = fluid.tests.textfield(".flc-textfield");

            fluid.tests.textfieldControl.assertTextfieldInit(that, {model: {value: "default value"}});
        });

        jqUnit.test("Change Value", function () {
            var that = fluid.tests.textfield(".flc-textfield");

            // update from model
            var newModelValue = "new from model";
            that.applier.change("value", newModelValue);
            jqUnit.assertEquals("The textfield value should have updated", newModelValue, that.container.val());

            // update from textfield
            var newTextfieldEntry = "textfield entry";
            fluid.changeElementValue(that.container, newTextfieldEntry);
            jqUnit.assertEquals("The model value should have udpated", newTextfieldEntry, that.model.value);
        });

        /************************************
         * TextField Range Controller Tests *
         ************************************/

        jqUnit.module("TextField Range Controller Tests");

        fluid.defaults("fluid.tests.textfield.rangeController", {
            gradeNames: ["fluid.textfield.rangeController"],
            strings: {
                "label": "Aria self-labeling"
            },
            model: {
                value: 0
            },
            attrs: {
                "aria-labelledby": "label-nativeHTML",
                "aria-label": "{that}.options.strings.label"
            },
            // this distribution would typically be handled through a model relay
            // by a parent component, such as fluid.textfieldStepper
            distributeOptions: {
                source: "{that}.options.model.range",
                target: "{that controller}.options.model.range"
            }
        });

        jqUnit.test("Test Init", function () {
            jqUnit.expect(5);
            var options = {
                model: {
                    value: 8,
                    range: {
                        max: 10,
                        min: 1
                    }
                }
            };
            var that = fluid.tests.textfield.rangeController(".flc-textfield-rangeController", options);
            fluid.tests.textfieldControl.assertRangeControlledTextfieldInit(that, options);
        });

        fluid.tests.textfield.rangeController.testInputField = function (valToTest, expected, that) {
            var textfield = that.container;

            fluid.changeElementValue(textfield, valToTest);

            jqUnit.assertEquals("Textfield value should be " + expected, expected, +textfield.val());
            jqUnit.assertEquals("Model value should be " + expected, expected, +that.model.value);
            jqUnit.assertEquals("Controller model value should be " + expected, expected, that.model.value);
        };

        fluid.each(fluid.tests.textfieldControl.testCases, function (currentCase) {
            jqUnit.test(currentCase.message, function () {
                var that = fluid.tests.textfield.rangeController(".flc-textfield-rangeController", currentCase.componentOptions);
                var textfield = that.container;

                fluid.each(currentCase.tests, function (currentTest) {
                    fluid.tests.textfieldControl.assertTextfieldEntry(currentTest.input, currentTest.expected, that, textfield);
                });
            });
        });

    });
})(jQuery);
