/*
Copyright 2013-2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.panels.utils");

    fluid.defaults("fluid.tests.panels.utils.defaultTestPanel", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        strings: {},
        testMessages: {},
        parentBundle: {
            expander: {
                funcName: "fluid.messageResolver",
                args: [{messageBase: "{that}.options.testMessages"}]
            }
        }
    });

    fluid.tests.panels.utils.checkModel = function (path, newModel, expectedValue) {
        var newval = fluid.get(newModel, path);
        jqUnit.assertEquals("Expected model value " + expectedValue + " at path " + path, expectedValue, newval);
    };

    fluid.tests.panels.utils.setCheckboxState = function (element, state) {
        element.prop("checked", state).change();
    };

    fluid.tests.panels.utils.verifyCheckboxState = function (message, expectedState, checkbox) {
        jqUnit.assertEquals(message, expectedState, checkbox.is(":checked"));
    };

})();
