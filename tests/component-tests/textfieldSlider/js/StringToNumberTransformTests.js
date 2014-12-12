/*
Copyright 2009 University of Toronto
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {
        jqUnit.module("String To Number Transform Tests");

        jqUnit.test("String To Number", function () {
            var data = [{
                model: {
                    stringValue: "10"
                },
                expected: {
                    value: 10
                }
            }, {
                model: {
                    stringValue: "1.5"
                },
                expected: {
                    value: 1.5
                }
            }, {
                model: {
                    stringValue: "aaa"
                },
                expected: {}
            }, {
                model: {
                    stringValue: NaN
                },
                expected: {}
            }];

            var transform = {
                value: {
                    transform: {
                        type: "fluid.transforms.stringToNumber",
                        inputPath: "stringValue"
                    }
                }
            };

            fluid.each(data, function (aCase) {
                var transformed = fluid.model.transform(aCase.model, transform);
                jqUnit.assertDeepEq("The transformed result is expected", aCase.expected, transformed);

                var actualValue = fluid.get(transformed, "value");
                if (actualValue) {
                    jqUnit.assertTrue("The transformed value is numeric", !isNaN(actualValue));
                }
            });
        });
    });
})(jQuery);
