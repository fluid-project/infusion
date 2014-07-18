/*
Copyright 2012 OCAD University, Antranig Basman

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/
/* global require, console */

(function () {
    "use strict";
    
    var fluid = require("../../src/module/fluid.js");
    
    fluid.loadTestingSupport();
    
    fluid.registerNamespace("fluid.tests");
    
    fluid.loadInContext("../../tests/test-core/testTests/js/TestingTests.js");
    
    var QUnit = fluid.registerNamespace("QUnit");
    var jqUnit = fluid.registerNamespace("jqUnit");
    
    fluid.setLogging(true);
    
    QUnit.testDone(function (data) {
        fluid.log("Test concluded - " + data.name + ": " + data.passed + " passed");
    });
    
    var expected = 3;
    
    QUnit.done(function (data) {
        fluid.log((expected === data.passed ? "Self-test OK" : "Self-test FAILED") + " - " + data.passed + "/" + expected + " tests passed");
    });
    
    fluid.test.runTests(["fluid.tests.myTestTree"]);
    
    jqUnit.test("Rendering truncation test", function () {
        var rendered = fluid.renderLoggingArg(fluid);
        jqUnit.assertTrue("Large object truncated", rendered.length < fluid.logObjectRenderChars + 100);
        console.log("Large log rendering object truncated to " + rendered.length + " chars");
    });
    
    QUnit.load();
    
})();