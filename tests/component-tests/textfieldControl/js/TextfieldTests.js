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
                "aria-label": "Aria Label"
            },
            ariaOptions: {
                "aria-labelledby": "label-textfield"
            },
            invokers: {
                // TODO: after FLUID-6136 has been addressed. Can use the default invoker in the test
                setModel: {
                    changePath: "value",
                    value: "{arguments}.0.target.value"
                }
            }
        });

        jqUnit.test("Test Init", function () {
            jqUnit.expect(4);
            var that = fluid.tests.textfield(".flc-textfield");

            fluid.tests.textfieldControl.assertTextfieldInit(that, {model: {value: "default value"}}, that.container, true);
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

        //
        // fluid.tests.textfield.testCase = {
        //     message: "Test Valid Values",
        //     expected: 8,
        //     tests: [
        //         {input: 5, expected: 5},
        //         {input: 0, expected: 0},
        //         {input: 100, expected: 100},
        //         {input: -5, expected: -5}
        //     ]
        // };
        //
        // jqUnit.test(fluid.tests.textfield.testCase.message, function () {
        //     jqUnit.expect(fluid.tests.textfield.testCase.expected);
        //     var that = fluid.tests.textfield(".flc-textfield", fluid.tests.textfield.testCase.componentOptions);
        //     var textfield = that.container;
        //
        //     fluid.each(fluid.tests.textfield.testCase.tests, function (currentTest) {
        //         fluid.tests.textfieldControl.assertTextfieldEntry(currentTest.input, currentTest.expected, that, textfield);
        //     });
        // });

        // /***************************
        //  * Textfield Control Tests *
        //  ***************************/
        //
        //
        // jqUnit.module("Textfield Control Tests");
        //
        // fluid.defaults("fluid.tests.textfieldControl", {
        //     gradeNames: ["fluid.textfieldControl"],
        //     strings: {
        //         "aria-label": "Aria self-labeling"
        //     },
        //     model: {
        //         value: 0
        //     },
        //     ariaOptions: {
        //         "aria-labelledby": "label-nativeHTML"
        //     }
        // });
        //
        // jqUnit.test("Test Init", function () {
        //     jqUnit.expect(6);
        //     var options = {
        //         model: {
        //             value: 8
        //         },
        //         range: {
        //             max: 10,
        //             min: 1
        //         }
        //     };
        //     var that = fluid.tests.textfieldControl(".flc-textfieldControl", options);
        //
        //     fluid.tests.textfieldControl.assertTextfieldControlInit(that, options);
        // });
        //
        // fluid.tests.textfieldControl.testInputField = function (valToTest, expected, that) {
        //     var textfield = that.locate("textfield");
        //
        //     fluid.changeElementValue(textfield, valToTest);
        //
        //     jqUnit.assertEquals("Textfield value should be " + expected, expected, +textfield.val());
        //     jqUnit.assertEquals("Model value should be " + expected, expected, that.model.value);
        // };
        //
        // fluid.each(fluid.tests.textfieldControl.testCases, function (currentCase) {
        //     jqUnit.test(currentCase.message, function () {
        //         var that = fluid.tests.textfieldControl(".flc-textfieldControl", currentCase.componentOptions);
        //         var textfield = that.locate("textfield");
        //
        //         fluid.each(currentCase.tests, function (currentTest) {
        //             fluid.tests.textfieldControl.assertTextfieldEntry(currentTest.input, currentTest.expected, that, textfield);
        //         });
        //     });
        // });

    });
})(jQuery);
