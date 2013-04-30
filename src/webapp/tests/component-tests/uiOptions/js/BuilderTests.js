/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.accessorDefaults", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        schema: {
            fontSize: {
                "id": "http://gpii.net/common/fontSize",
                "type": "number",
                "default": 1,
                "minimum": 1,
                "maximum": 2,
                "divisibleBy": 0.1
            },
            "setting": {
                "type": "object",
                "properties": {
                    "nested": {
                        "type": "number",
                        "default": 1
                    }
                }
            }
        },
        components: {
            accessorDefaults: {
                type: "fluid.uiOptions.accessor.defaults",
                options: {
                    schema: "{fluid.tests.accessorDefaults}.options.schema"
                }
            },
            accessorDefaultsTester: {
                type: "fluid.tests.accessorDefaultsTester"
            }
        }
    });

    fluid.tests.getDefault = function (accessor) {
        jqUnit.assertEquals("Font size should be inferred from defaults", 1,
            accessor.get("fontSize"));
        jqUnit.assertUndefined("Not found field should be undefined",
            accessor.get("notFound"));
        jqUnit.assertEquals("Nested setting should be inferred from defaults", 1,
            accessor.get("setting.nested"));
        jqUnit.assertUndefined("Not found nested field should be undefined",
            accessor.get("setting.notFound"));
    }; 

    fluid.defaults("fluid.tests.accessorDefaultsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test get default",
            tests: [{
                expect: 4,
                name: "Test get fontSize",
                type: "test",
                func: "fluid.tests.getDefault",
                args: "{accessorDefaults}"
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.accessorDefaults"
        ]);
    });

})(jQuery);
