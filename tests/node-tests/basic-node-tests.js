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
    
    var fluid = require("../../src/module/fluid.js"),
        path = require("path");
    
    fluid.loadTestingSupport();
    
    fluid.registerNamespace("fluid.tests");
    
    fluid.loadInContext("../../tests/test-core/testTests/js/TestingTests.js");
    
    fluid.require("test-module", require, "test-module");
    
    var QUnit = fluid.registerNamespace("QUnit");
    var jqUnit = fluid.registerNamespace("jqUnit");
    
    fluid.setLogging(true);
    
    QUnit.testDone(function (data) {
        fluid.log("Test concluded - " + data.name + ": " + data.passed + " passed");
    });
    
    var expected = 14;
    
    QUnit.done(function (data) {
        fluid.log("Infusion node.js internal tests " +
            (expected === data.passed && data.failed === 0? "OK" : "FAILED") +
            " - " + data.passed + "/" + (expected + data.failed) + " tests passed");
    });
    
    QUnit.log(function (details) {
        if (details.source) { // "white-box" inspection of qunit.js shows that it sets this field on error
            fluid.log("Message: " + details.message + "\nSource: " + details.source);
            if (details.expected !== undefined) {
                console.log("Expected: ", JSON.stringify(details.expected, null, 4));
                console.log("Actual: ", JSON.stringify(details.actual, null, 4));
            }
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
    
    jqUnit.test("Test module resolvePath", function () {
        var resolved = fluid.module.resolvePath("${infusion}/src/components/tableOfContents/html/TableOfContents.html");
        var expected = fluid.module.canonPath(path.resolve(__dirname, "../../src/components/tableOfContents/html/TableOfContents.html"));
        jqUnit.assertEquals("Resolved path into infusion module", expected, resolved);
        
        var pkg = fluid.require("${test-module}/package.json");
        jqUnit.assertEquals("Loaded package.json via resolved path directly via fluid.require", "test-module", pkg.name);
    });
    
    fluid.tests.expectFailure = false;
    
    fluid.tests.addLogListener = function (listener) {
        fluid.onUncaughtException.addListener(listener, "log", null,
            fluid.handlerPriorities.uncaughtException.log);
    };
    
    fluid.tests.onUncaughtException = function () {
        jqUnit.assertEquals("Expected failure in uncaught exception handler",
            true, fluid.tests.expectFailure);
        fluid.onUncaughtException.removeListener("test-uncaught");
        fluid.onUncaughtException.removeListener("log");
        fluid.tests.addLogListener(fluid.identity);
        fluid.tests.expectFailure = false;
        fluid.invokeLater(function () { // apply this later to avoid nesting uncaught exception handler
            fluid.invokeLater(function () {
                fluid.onUncaughtException.removeListener("log"); // restore the original listener
                console.log("Restarting jqUnit in nested handler");
                jqUnit.start();
            });
            "string".fail(); // provoke a further global uncaught error - should be a no-op
        });
    };
    
    fluid.tests.benignLogger = function () {
        fluid.log("Expected global failure received in test case");
        jqUnit.assert("Expected global failure");
    };
    
    jqUnit.asyncTest("Test uncaught exception handler registration and deregistration", function () {
        jqUnit.expect(2);
        fluid.onUncaughtException.addListener(fluid.tests.onUncaughtException, "test-uncaught");
        fluid.tests.addLogListener(fluid.tests.benignLogger);
        fluid.tests.expectFailure = true;
        fluid.invokeLater(function () { // put this in a timeout to avoid bombing QUnit's exception handler
            "string".fail(); // provoke a global uncaught error
        });
    });
    
    QUnit.load();
    
})();