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
/* eslint-env node */
"use strict";

var fluid = require("../../src/module/fluid.js"),
    path = require("path");

fluid.loadTestingSupport();

var QUnit = fluid.registerNamespace("QUnit");
var jqUnit = fluid.registerNamespace("jqUnit");

fluid.registerNamespace("fluid.tests");

// Number of expected assertions
fluid.tests.expectedAsserts = 22;
// Number of expected test cases - used in tap-reporting.js
fluid.tests.expectedTestCases = 12;

require("./tap-reporting");

fluid.setLogging(true);

fluid.tests.getTestMessage = function (data) {
    return "Test concluded - " + data.name + ": " + data.passed + " assertion(s) passed, " + data.failed + " assertion(s) failed";
};

QUnit.testDone(function (data) {
    fluid.log(fluid.tests.getTestMessage(data));
});

QUnit.done(function (data) {
    fluid.log("Infusion node.js internal tests " +
        (fluid.tests.expectedAsserts === data.passed && data.failed === 0 ? "PASSED" : "FAILED") +
        " - " + data.passed + "/" + (fluid.tests.expectedAsserts + data.failed) + " assertions passed");

    // Set the process to return a non-0 exit code if any tests failed,
    // or the number of expected tests is not the same as the number of passed
    // tests; this allows basic usage in CI
    if (data.failed > 0 || data.passed < fluid.tests.expectedAsserts) {
        process.exitCode = 1;
    }
});

QUnit.log(function (details) {
    if (details.source) { // "white-box" inspection of qunit.js shows that it sets this field on error
        fluid.log("Message: " + details.message + "\nSource: " + details.source);
        if (details.expected !== undefined) {
            /* eslint-disable no-console */
            console.log("Expected: ", JSON.stringify(details.expected, null, 4));
            console.log("Actual: ", JSON.stringify(details.actual, null, 4));
            /* eslint-enable no-console */
        }
    }
});

fluid.tests.expectFailure = false;

fluid.tests.addLogListener = function (listener) {
    fluid.onUncaughtException.addListener(listener, "log",
        fluid.handlerPriorities.uncaughtException.log);
};

fluid.onUncaughtException.addListener(function () {
    if (fluid.tests.expectFailure) {
        fluid.tests.expectFailure = false;
    } else {
        process.exit(1);
    }
}, "fail", fluid.handlerPriorities.uncaughtException.fail);

/****
 * TEST FIXTURES BEGIN HERE
 ****/

var testModuleBase = __dirname + path.sep + "node_modules" + path.sep + "test-module" + path.sep;

fluid.module.preInspect(testModuleBase);

// We must store this NOW since it will be overwritten when the module is genuinely loaded - the test
// fixture will run long afterwards
var preInspected = fluid.module.modules["test-module"].baseDir;

jqUnit.test("Test early inspection of test module", function () {
    jqUnit.assertEquals("Test that base directory of test module has been successfully pre-inspected", fluid.module.canonPath(testModuleBase), preInspected);
});

fluid.require("test-module", require, "test-module");

// test FLUID-6188 idempotency of fluid.loadTestingSupport();

var oldQUnit = QUnit;
fluid.loadTestingSupport();
QUnit = fluid.registerNamespace("QUnit");

jqUnit.test("FLUID-6188 test: fluid.loadTestingSupport is idempotent and will only create one QUnit object", function () {
    if (oldQUnit !== QUnit) {
    // We don't use jqUnit here since in this case the QUnit configuration is unusably hosed
        fluid.fail("FLUID-6188 test failed: Failure of idempotency of fluid.loadTestingSupport");
    }
    jqUnit.assert("fluid.loadTestingSupport is idempotent");
});

fluid.loadInContext("../../tests/test-core/testTests/js/IoCTestingTests.js");

fluid.test.runTests(["fluid.tests.myTestTree"]);

jqUnit.module("Non IoC tests");

jqUnit.test("Rendering truncation test", function () {
    var rendered = fluid.renderLoggingArg(fluid);
    jqUnit.assertTrue("Large object truncated", rendered.length < fluid.logObjectRenderChars + 100); // small allowance for extra diagnostic
    console.log("Large log rendering object truncated to " + rendered.length + " chars"); // eslint-disable-line no-console
});

jqUnit.test("Test fluid.require support", function () {
    var testModule = fluid.registerNamespace("test-module");
    jqUnit.assertEquals("Loaded module as Fluid namespace", "Export from test-module", testModule.value);
    jqUnit.assertEquals("Loaded module as Fluid global entry", "Export from test-module", fluid.global["test-module"].value);
});

jqUnit.test("Test fluid.require diagnostics and FLUID-5906 loading", function () {
    jqUnit.expect(1);
    jqUnit.expectFrameworkDiagnostic("Module name for unloaded modules", function () {
        fluid.require("%test-module3");
    }, ["Module test-module3 has not been loaded and could not be loaded"]);
    var testModule2 = fluid.require("%test-module2");
    var rawTestModule2 = require("test-module2");
    jqUnit.assertEquals("Same module resolvable via fluid.require and require ", rawTestModule2, testModule2);
});

jqUnit.test("Test propagation of standard globals", function () {
    var expectedGlobals = ["console.log", "setTimeout", "clearTimeout", "setInterval", "clearInterval"];

    fluid.each(expectedGlobals, function (oneGlobal) {
        var type = typeof(fluid.get(fluid.global, oneGlobal));
        jqUnit.assertEquals("Global " + oneGlobal + " has type function", "function", type);
    });
});

jqUnit.test("Test module resolvePath", function () {
    var resolved = fluid.module.resolvePath("%infusion/src/components/tableOfContents/html/TableOfContents.html");
    var expected = fluid.module.canonPath(path.resolve(__dirname, "../../src/components/tableOfContents/html/TableOfContents.html"));
    jqUnit.assertEquals("Resolved path into infusion module", expected, resolved);

    var pkg = fluid.require("%test-module/package.json");
    jqUnit.assertEquals("Loaded package.json via resolved path directly via fluid.require", "test-module", pkg.name);
});


fluid.tests.benignLogger = function () {
    fluid.log("Expected global failure received in test case");
    jqUnit.assert("Expected global failure");
};

fluid.tests.onUncaughtException = function () {
    jqUnit.assertEquals("Expected failure in uncaught exception handler",
        true, fluid.tests.expectFailure);
    fluid.onUncaughtException.removeListener("test-uncaught"); // remove ourselves - registered by the test below
    fluid.onUncaughtException.removeListener("log"); // remove "benignLogger" and restore the original listener
    fluid.invokeLater(function () { // apply this later to avoid nesting uncaught exception handler
        console.log("Restarting jqUnit in nested handler"); // eslint-disable-line no-console
        jqUnit.start();
    });
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

jqUnit.test("FLUID-5807 noncorrupt framework stack traces", function () {
    var error = new fluid.FluidError("thing");
    jqUnit.assertTrue("Framework error is an error (from its own perspective)", error instanceof fluid.Error);
    jqUnit.assertTrue("Framework error is an instance of itself", error instanceof fluid.FluidError);
    var stack = error.stack.toString();
    jqUnit.assertTrue("Our own filename must appear in the stack", stack.indexOf("basic-node-tests") !== -1);
});

jqUnit.test("FLUID-6178 fluid.prettyPrintJSON with exploding synthetic properties", function () {
    var exploding = {};
    Object.defineProperty(exploding, "explode", {
        configurable: true,
        enumerable: true,
        get: function () {
            "This function should not be called".explode();
        }
    });
    var rendered = fluid.prettyPrintJSON(exploding);
    var expected = "{\n    \"explode\": [Synthetic property]\n}";
    jqUnit.assertEquals("Exploding property should be safely bypassed", expected, rendered);
});

QUnit.load();
