/*
Copyright 2017 OCAD University

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


        fluid.registerNamespace("fluid.tests.textfieldControl");

        fluid.tests.textfieldControl.assertTextfieldInit = function (that, expected, textfield) {
            jqUnit.assertEquals("Textfield value is set", expected.model.value, +textfield.val());
            jqUnit.assertEquals("The model should be set", expected.model.value, that.model.value);
            jqUnit.assertEquals("The aria-label should be set", that.options.strings["aria-label"], textfield.attr("aria-label"));
            jqUnit.assertEquals("The aria-labelledby should be set", that.options.ariaOptions["aria-labelledby"], textfield.attr("aria-labelledby"));
        };

        fluid.tests.textfieldControl.assertTextfieldEntry = function (valToTest, expected, that, textfield) {
            fluid.changeElementValue(textfield, valToTest);

            jqUnit.assertEquals("Textfield value should be " + expected, expected, +textfield.val());
            jqUnit.assertEquals("Model value should be " + expected, expected, that.model.value);
        };

    });
})(jQuery);
