/*
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.textfieldControl");

    fluid.tests.textfieldControl.assertTextfieldInit = function (that, expected, textfield, expectString) {
        var value = expectString ? textfield.val() : +textfield.val();
        jqUnit.assertEquals("Textfield value is set", expected.model.value, value);
        jqUnit.assertEquals("The model should be set", expected.model.value, that.model.value);
        jqUnit.assertEquals("The aria-label should be set", that.options.strings["aria-label"], textfield.attr("aria-label"));
        jqUnit.assertEquals("The aria-labelledby should be set", that.options.ariaOptions["aria-labelledby"], textfield.attr("aria-labelledby"));
    };

    fluid.tests.textfieldControl.assertTextfieldControlInit = function (textfieldControl, expected) {
        var textfield = textfieldControl.locate("textfield");
        fluid.tests.textfieldControl.assertTextfieldInit(textfieldControl, expected, textfield);
        jqUnit.assertEquals("Min should be the default", expected.range.min, textfieldControl.options.range.min);
        jqUnit.assertEquals("Max should be the default", expected.range.max, textfieldControl.options.range.max);
    };

    fluid.tests.textfieldControl.assertTextfieldEntry = function (valToTest, expected, that, textfield) {
        fluid.changeElementValue(textfield, valToTest);

        jqUnit.assertEquals("Textfield value should be " + expected, expected, +textfield.val());
        jqUnit.assertEquals("Model value should be " + expected, expected, that.model.value);
    };

    fluid.tests.textfieldControl.testCases = {
        valid: {
            message: "Test Min/Max Size",
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
        negative: {
            message: "Test Negative Scale",
            componentOptions: {range: {min: -15, max: -5}},
            tests: [
                {input: 56, expected: -5},
                {input: -10, expected: -10},
                {input: -16, expected: -15},
                {input: -15, expected: -15},
                {input: -5, expected: -5}
            ]
        },
        invalid: {
            message: "Test Invalid Values",
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
        }
    };

})();
