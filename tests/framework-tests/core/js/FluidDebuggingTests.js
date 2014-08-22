/*
Copyright 2014 Lucendo Development Ltd.

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

    fluid.setLogging(true);

    fluid.registerNamespace("fluid.tests");

    jqUnit.module("Fluid Debugging JS Tests");
    
    jqUnit.test("fluid.prettyPrintJSON", function () {
        jqUnit.assertEquals("Render null", "null", fluid.prettyPrintJSON(null));
        jqUnit.assertEquals("Render undefined", "undefined", fluid.prettyPrintJSON(undefined));
        var circular = {};
        circular.field = circular;
        var renderCircular = fluid.prettyPrintJSON(circular);
        jqUnit.assertValue("Render circular: " + renderCircular, circular);
        
        var functionHolder = function () {};
        functionHolder.listableProperty = 1;
        var renderFunction = fluid.prettyPrintJSON(functionHolder);
        jqUnit.assertTrue("Function is annotated", renderFunction.indexOf("Function") !== -1);
        jqUnit.assertTrue("Function property is listed", renderFunction.indexOf("listableProperty") !== -1);
        
        var complex = {
            "null": null,
            "boolean": true,
            "number": 3.5,
            fields: {
                a: 3,
                b: {
                    c: [],
                    d: [1, false]
                }
            }
        };
        var renderedComplex = fluid.prettyPrintJSON(complex);
        var reparsed = JSON.parse(renderedComplex);
        jqUnit.assertDeepEq("Round-tripping complex object", complex, reparsed);
        
        function Synthetic () {}
        var proto = { b: 3 };
        Synthetic.prototype = proto;
        var synthetic = new Synthetic();
        
        var renderedSynthetic = fluid.prettyPrintJSON(synthetic);
        jqUnit.assertTrue("Caught synthetic property", renderedSynthetic.indexOf("[Synthetic property]") !== -1);
    });
})();
