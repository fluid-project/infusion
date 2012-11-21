/*
Copyright 2010-2012 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.test");

fluid.defaults("fluid.test.testEnvironment", {
    gradeNames: ["fluid.littleComponent", "autoInit"],
    components: {
        instantiator: "{instantiator}"
    }
});

fluid.test.testEnvironment.finalInit = function (that) {
    var visitOptions = {
        instantiator: that.instantiator
    };
    that.testCases = [];
    var visitor = function (component) {
        if (fluid.hasGrade(component.options, "fluid.test.testCaseHolder")) {
            that.testCases.push(component);
        }
    }
    fluid.visitComponentChildren(that, visitor, visitOptions, "");
    fluid.each(that.testCases, function(testCase) {
        fluid.test.processTestCaseHolder(that, that.instantiator, testCase);  
    });
};

fluid.defaults("fluid.test.testCaseHolder", {
    gradeNames: ["fluid.littleComponent", "autoInit"],
    mergePolicy: {
        testCases: "noexpand"
    }
});


fluid.test.processTestCase = function (root, instantiator, testCaseHolder, testCase) {
    var jCase = new jqUnit.TestCase(testCase.name);
    var fixtures = testCase.tests;
    fluid.each(fixtures, function (fixture) {
        var expanded = fluid.withInstantiator(testCaseHolder, 
            function() {
                return fluid.expandOptions(fixture, testCaseHolder);
            }, "Expanding Test Case", instantiator);
        var testFunc = expanded.path;
        if (typeof(testFunc) === "string") {
            testFunc = fluid.getGlobalValue(testFunc);
        }
        var testType = expanded.type || "test";
        jCase[testType](expanded.name, function() {
            if (expanded.expect !== undefined) {
               jqUnit.expect(expanded.expect);
            }
            testFunc(expanded.args);
        });
    });
}

fluid.test.processTestCaseHolder = function (root, instantiator, testCaseHolder) {
    var cases = testCaseHolder.options.testCases;
    fluid.each(cases, function (testCase) {
        fluid.test.processTestCase (root, instantiator, testCaseHolder, testCase);  
    });
};