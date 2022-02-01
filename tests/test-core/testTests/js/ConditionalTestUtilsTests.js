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

"use strict";

fluid.registerNamespace("fluid.tests.conditionalTestUtilsTests");

/** Tests for the conditional test utilities **/

// test fluid.test.conditionalTestUtils.chooseTestByPromiseResult
fluid.tests.conditionalTestUtilsTests.configurableTestPromise = function (shouldResolve) {
    var promise = fluid.promise();
    if (shouldResolve) {
        promise.resolve();
    } else {
        promise.reject();
    }
    return promise;
};

fluid.tests.conditionalTestUtilsTests.testOnPromiseResolve = function (message) {
    jqUnit.expect(1);
    jqUnit.assertEquals("Message indicates this is the test run for a resolved promise", "Promise resolved", message);
};

fluid.tests.conditionalTestUtilsTests.testOnPromiseReject = function (message) {
    jqUnit.expect(1);
    jqUnit.assertEquals("Message indicates this is the test run for a rejected promise", "Promise rejected", message);
};

fluid.tests.conditionalTestUtilsTests.testChooseTestByPromiseResult = function (message, shouldResolve) {
    fluid.test.conditionalTestUtils.chooseTestByPromiseResult(message,
        function () {
            return fluid.tests.conditionalTestUtilsTests.configurableTestPromise(shouldResolve);
        },
        fluid.tests.conditionalTestUtilsTests.testOnPromiseResolve,
        fluid.tests.conditionalTestUtilsTests.testOnPromiseReject,
        "Promise resolved",
        "Promise rejected");
};

// This should result in testOnPromiseResolve being run
fluid.tests.conditionalTestUtilsTests.testChooseTestByPromiseResult("Choose test by promise result - promise resolved case.", true);

// This should result in testOnPromiseReject being run
fluid.tests.conditionalTestUtilsTests.testChooseTestByPromiseResult("Choose test by promise result - promise rejected case.", false);

// test context-aware test runner

fluid.defaults("fluid.tests.conditionalTestUtilsTests.contextAwareTestRunner", {
    gradeNames: ["fluid.test.conditionalTestUtils.contextAwareTestRunner"],
    contextAwareness: {
        runAdditionalTests: {
            checks: {
                runAdditionalTestsTrue: {
                    contextValue: "{fluid.runAdditionalTests}",
                    equals: true,
                    gradeNames: ["fluid.tests.conditionalTestUtilsTests.runAdditionalTestsTrue"]
                },
                runAdditionalTestsFalse: {
                    contextValue: "{fluid.runAdditionalTests}",
                    equals: false,
                    gradeNames: ["fluid.tests.conditionalTestUtilsTests.runAdditionalTestsFalse"]
                }
            },
            defaultGradeNames: "fluid.tests.conditionalTestUtilsTests.runAdditionalTestsDefault"
        }
    },
    tests: {
        base: "fluid.tests.conditionalTestUtilsTests.contextBasicTest"
    }
});

fluid.tests.conditionalTestUtilsTests.contextBasicTest = function () {
    jqUnit.assert("This assertion should always be run because it's not context-dependent");
};

fluid.defaults("fluid.tests.conditionalTestUtilsTests.runAdditionalTestsTrue", {
    tests: {
        true: "fluid.tests.conditionalTestUtilsTests.contextTrueTest"
    }
});

fluid.tests.conditionalTestUtilsTests.contextTrueTest = function () {
    jqUnit.assert("This assertion should only be run if the  'fluid.runAdditionalTests' context value is boolean TRUE.");
};

fluid.defaults("fluid.tests.conditionalTestUtilsTests.runAdditionalTestsFalse", {
    tests: {
        false: "fluid.tests.conditionalTestUtilsTests.contextFalseTest"
    }
});

fluid.tests.conditionalTestUtilsTests.contextFalseTest = function () {
    jqUnit.assert("This assertion should only be run if the  'fluid.runAdditionalTests' context value is boolean FALSE.");
};

fluid.defaults("fluid.tests.conditionalTestUtilsTests.runAdditionalTestsDefault", {
    tests: {
        default: "fluid.tests.conditionalTestUtilsTests.contextDefaultTest"
    }
});

fluid.tests.conditionalTestUtilsTests.contextDefaultTest = function () {
    jqUnit.assert("This assertion should only be run if the  'fluid.runAdditionalTests' context is something other than false or true.");
};

fluid.tests.conditionalTestUtilsTests.testRunnerContainsExpectedGradeName = function (runner, expectedGradeName) {
    jqUnit.assertTrue("testRunner grade contains the expected gradeName of " + expectedGradeName, fluid.contains(runner.options.gradeNames, expectedGradeName));
};

fluid.tests.conditionalTestUtilsTests.testContextAwareTestRunner = function (message, checkValue, expectedGradeName) {
    jqUnit.test(message, function () {
        jqUnit.expect(3);

        // Register a context
        fluid.contextAware.makeChecks({
            "fluid.runAdditionalTests": {
                value: checkValue
            }
        });

        // Create test component
        var testRunner = fluid.tests.conditionalTestUtilsTests.contextAwareTestRunner();

        fluid.tests.conditionalTestUtilsTests.testRunnerContainsExpectedGradeName(testRunner, expectedGradeName);
    });
};

fluid.tests.conditionalTestUtilsTests.testContextAwareTestRunner("Test context-aware test runner - context value is TRUE (expecting context-aware TRUE grade)", true, "fluid.tests.conditionalTestUtilsTests.runAdditionalTestsTrue");

fluid.tests.conditionalTestUtilsTests.testContextAwareTestRunner("Test context-aware test runner - context value is FALSE (expecting context-aware FALSE grade)", false, "fluid.tests.conditionalTestUtilsTests.runAdditionalTestsFalse");

fluid.tests.conditionalTestUtilsTests.testContextAwareTestRunner("Test context-aware test runner - context value is 'hello world' (expecting context-aware default grade when value is not TRUE or FALSE)", "Hello", "fluid.tests.conditionalTestUtilsTests.runAdditionalTestsDefault");
