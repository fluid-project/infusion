/*
Copyright 2014-2015 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

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

        function Derived() {}
        var proto = { protoProperty: 3 };
        Derived.prototype = proto;
        var derived = new Derived();

        var renderedDerived = fluid.prettyPrintJSON(derived);
        jqUnit.assertTrue("Caught prototype property", renderedDerived.indexOf("protoProperty") !== -1);

        var synthetic = {};
        Object.defineProperty(synthetic, "b", {
            enumerable: true,
            get: function () {
                return 3;
            }
        });

        var renderedSynthetic = fluid.prettyPrintJSON(synthetic);
        jqUnit.assertTrue("Caught synthetic property", renderedSynthetic.indexOf("\"b\": [Synthetic property]") !== -1);
    });

    // Generates an obnoxiously cross-linked object in the style we might meet, for example, in "express"
    fluid.tests.generateObnoxiousObject = function (depth, crosslinkAt) {
        var root = {index: 0};
        var levels = [[root]];
        for (var i = 0; i < depth; ++i) {
            var thisLevel = levels[i];
            var nextLevel = levels[i + 1] = [];
            for (var j = 0; j < thisLevel.length; ++j) {
                var parent = thisLevel[j];
                if (i === depth - 1) {
                    var crossLevel = levels[crosslinkAt];
                    var crossIndex = parent.index >> (i - crosslinkAt);
                    parent.left = parent.right = crossLevel[crossIndex + 1];
                } else {
                    parent.left = {index: parent.index * 2};
                    parent.right = {index: parent.index * 2 + 1};
                    nextLevel.push(parent.left);
                    nextLevel.push(parent.right);
                }
            }
        }
        return root;
    };

    jqUnit.test("fluid.prettyPrintJSON overflow (FLUID-5671)", function () {
        jqUnit.expect(1);
        var that = fluid.tests.generateObnoxiousObject(10, 2);
        // If this test fails, the browser will bomb with an error such as "RangeError: Invalid string length"
        // A typical maximum string length is 1 << 28 === 256MB
        fluid.prettyPrintJSON(that, {maxRenderChars: 2048});
        jqUnit.assert("Rendered obnoxious JS object without memory overflow");
    });

})();
