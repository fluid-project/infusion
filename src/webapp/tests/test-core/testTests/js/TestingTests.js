/*

 Copyright 2010-2011 Lucendo Development Ltd.
 
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

fluid.registerNamespace("fluid.tests");

/** Testing environment - holds both fixtures as well as components under test, exposes global test driver **/

fluid.defaults("fluid.tests.myTestTree", {
    gradeNames: ["fluid.test.testEnvironment", "autoInit"],
    components: {
        cat: {
            type: "fluid.tests.cat"
        },
        catTester: {
            type: "fluid.tests.catTester"
        }
    }
});

/** Component under test **/

fluid.defaults("fluid.tests.cat", {
    gradeNames: ["fluid.littleComponent", "autoInit"],
});

fluid.tests.cat.preInit = function (that) {
    that.makeSound = function () {
        return "meow";
    };
};

/** Test Case Holder - holds declarative representation of test cases **/

fluid.defaults("fluid.tests.catTester", {
    gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
    testCases: [ /* declarative specification of tests */ {
        name: "Cat test case",
        tests: [{
            expect: 1,
            name: "Test Meow",
            type: "test",
            path: "{that}.testMeow",
            args: "{cat}"
        }, {
            expect: 1,
            name: "Test Global Meow",
            type: "test",
            path: "fluid.tests.globalCatTest",
            args: "{cat}"
        }
        ]
    }]
});

fluid.tests.globalCatTest = function (catt) {
    jqUnit.assertEquals("Sound", "meow", catt.makeSound());
}; 

fluid.tests.catTester.preInit = function (that) {
    that.testMeow = fluid.tests.globalCatTest;
};

/** Global driver function **/

fluid.tests.testTests = function () {
    fluid.tests.myTestTree();
};