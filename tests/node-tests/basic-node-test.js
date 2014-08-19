/*
Copyright 2014 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/
/* jshint node:true */

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
    
    var expected = 10;
    
    QUnit.done(function (data) {
        fluid.log((expected === data.passed && data.failed === 0? "Self-test OK" : "Self-test FAILED") + " - " + data.passed + "/" + (expected + data.failed) + " tests passed");
    });
    
    QUnit.log(function (details) {
        if (details.source) { // "white-box" inspection of qunit.js shows that it sets this field on error
            fluid.log("Message: " + details.message + "\nSource: " + details.source);
        }
    });
    
    fluid.test.runTests(["fluid.tests.myTestTree"]);
    
    jqUnit.module("Non IoC tests");
    
    jqUnit.test("Rendering truncation test", function () {
        var rendered = fluid.renderLoggingArg(fluid);
        jqUnit.assertTrue("Large object truncated", rendered.length < fluid.logObjectRenderChars + 100);
        console.log("Large log rendering object truncated to " + rendered.length + " chars");
    });
    
    jqUnit.test("Test fluid.require support", function () {
        fluid.require("test-module", require, "test-module");
        var testModule = fluid.registerNamespace("test-module");
        jqUnit.assertEquals("Loaded module as Fluid namespace", "Export from test-module", testModule.value);
        jqUnit.assertEquals("Loaded module as Fluid global entry", "Export from test-module", fluid.global["test-module"].value);
    });
    
    jqUnit.test("Test propagation of standard globals", function () {
        var expectedGlobals = ["console.log", "setTimeout", "clearTimeout", "setInterval", "clearInterval"];
        
        fluid.each(expectedGlobals, function (oneGlobal) {
            var type = typeof(fluid.get(fluid.global, oneGlobal));
            jqUnit.assertEquals("Global " + oneGlobal + " has type function", "function", type);
        });
    });
    
    QUnit.load();
    
})();