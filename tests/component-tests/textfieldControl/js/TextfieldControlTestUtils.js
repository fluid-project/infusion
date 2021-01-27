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

/* global jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.textfieldControl");

    fluid.tests.textfieldControl.createKeyEvent = function (keyEvent, key) {
        var event = $.Event(keyEvent);
        event.which = key;
        return event;
    };

    fluid.tests.textfieldControl.assertTextfieldInit = function (that, expected) {
        var textfield = that.container;
        jqUnit.assertEquals("Textfield value is set", expected.model.value, textfield.val());
        jqUnit.assertEquals("The model should be set", expected.model.value, that.model.value);
        jqUnit.assertEquals("The aria-label should be set", that.options.strings.label, textfield.attr("aria-label"));
        jqUnit.assertEquals("The aria-labelledby should be set", that.options.attrs["aria-labelledby"], textfield.attr("aria-labelledby"));
    };

    fluid.tests.textfieldControl.assertRangeControlledTextfieldInit = function (that, expected) {
        var textfield = that.container;
        // values with a "+" are coerced from a string to number.
        jqUnit.assertEquals("Textfield value is set", expected.model.value, +textfield.val());
        jqUnit.assertEquals("The model should be set", expected.model.value, +that.model.value);
        jqUnit.assertEquals("The controller model should be set", expected.model.value, that.controller.model.value);
        jqUnit.assertEquals("The aria-label should be set", that.options.strings.label, textfield.attr("aria-label"));
        jqUnit.assertEquals("The aria-labelledby should be set", that.options.attrs["aria-labelledby"], textfield.attr("aria-labelledby"));
    };

    fluid.tests.textfieldControl.assertTextfieldEntry = function (valToTest, expected, that, textfield) {
        fluid.changeElementValue(textfield, valToTest);

        // values with a "+" are coerced from a string to number.
        jqUnit.assertEquals("Textfield value should be " + expected, expected, +textfield.val());
        jqUnit.assertEquals("Model value should be " + expected, expected, +that.model.value);
    };

    fluid.tests.textfieldControl.testCases = {
        valid: {
            message: "Test Min/Max Size",
            componentOptions: {
                model: {
                    range: {
                        min: 5,
                        max: 55
                    }
                }
            },
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
            componentOptions: {
                model: {
                    range: {
                        min: -15,
                        max: -5
                    }
                }
            },
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
                model: {
                    value: 1,
                    range: {
                        min: -5,
                        max: 5
                    }
                }
            },
            tests: [
                {input: "aaa", expected: 1},
                {input: null, expected: 0}
            ]
        }
    };

})();
