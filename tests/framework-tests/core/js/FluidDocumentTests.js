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

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    jqUnit.module("Fluid Document Tests");

    jqUnit.asyncTest("fluid.changeElementValue()", function () {
        jqUnit.expect(2);

        var node = $("#flc-changeElementValue");
        var value = "Value";

        node.on("change", function (evt) {
            jqUnit.assertTrue("The change event is fired", true);
            jqUnit.assertTrue("The value has been set correctly", value, evt.target.value);
            jqUnit.start();
        });

        fluid.changeElementValue(node, value);
    });

})(jQuery);
