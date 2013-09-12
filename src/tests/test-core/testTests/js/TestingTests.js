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
    gradeNames: ["fluid.littleComponent", "autoInit"]
});

fluid.tests.cat.preInit = function (that) {
    that.makeSound = function () {
        return "meow";
    };
};

/** Test Case Holder - holds declarative representation of test cases **/

fluid.defaults("fluid.tests.catTester", {
    gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
    modules: [ /* declarative specification of tests */ {
        name: "Cat test case",
        tests: [{
            expect: 1,
            name: "Test Meow",
            type: "test",
            func: "{that}.testMeow",
            args: "{cat}"
        }, {
            expect: 1,
            name: "Test Global Meow",
            type: "test",
            func: "fluid.tests.globalCatTest",
            args: "{cat}"
        }]
    }]
});

fluid.tests.globalCatTest = function (catt) {
    jqUnit.assertEquals("Sound", "meow", catt.makeSound());
}; 

fluid.tests.catTester.preInit = function (that) {
    that.testMeow = fluid.tests.globalCatTest;
};

fluid.defaults("fluid.tests.asyncTest", {
    gradeNames: ["fluid.rendererComponent", "autoInit"],
    model: {
        textValue: "initialValue"
    },
    selectors: {
        button: ".flc-async-button",
        textField: ".flc-async-text"
    },
    events: {
        buttonClicked: null  
    },
    protoTree: {
        textField: "${textValue}",
        button: {
            decorators: {
                type: "fluid",
                func: "fluid.tests.buttonChild"
            }
        }
    }
});

fluid.defaults("fluid.tests.buttonChild", {
    gradeNames: ["fluid.viewComponent", "autoInit"],
    events: {
        buttonClicked: "{asyncTest}.events.buttonClicked"
    }
});

fluid.tests.buttonChild.postInit = function (that) {
    that.container.click(function () {
        setTimeout(that.events.buttonClicked.fire, 1);
    });
};

fluid.defaults("fluid.tests.asyncTestTree", {
    gradeNames: ["fluid.test.testEnvironment", "autoInit"],
    markupFixture: ".flc-async-root",
    components: {
        asyncTest: {
            type: "fluid.tests.asyncTest",
            container: ".flc-async-root"
        },
        asyncTester: {
            type: "fluid.tests.asyncTester"
        }
    }
});

fluid.defaults("fluid.tests.asyncTester", {
    gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
    newTextValue:     "newTextValue",
    furtherTextValue: "furtherTextValue",
    modules: [ {
        name: "Async test case",
        tests: [{
            name: "Rendering sequence",
            expect: 7,
            sequence: [ {
                func: "fluid.tests.startRendering",
                args: ["{asyncTest}", "{instantiator}"]
            }, {
                listener: "fluid.tests.checkEvent",
                event: "{asyncTest}.events.buttonClicked"
            }, { // manually click on the button  
                jQueryTrigger: "click",
                element: "{asyncTest}.dom.button"
            }, {
                listener: "fluid.tests.checkEvent",
                event: "{asyncTest}.events.buttonClicked"
            }, { // Issue two requests via UI to change field, and check model update
                func: "fluid.tests.changeField",
                args: ["{asyncTest}.dom.textField", "{asyncTester}.options.newTextValue"]  
            }, {
                listenerMaker: "fluid.tests.makeChangeChecker",
                makerArgs: ["{asyncTester}.options.newTextValue", "textValue"],
                path: "textValue",
                changeEvent: "{asyncTest}.applier.modelChanged"
            }, {
                func: "fluid.tests.changeField",
                args: ["{asyncTest}.dom.textField", "{asyncTester}.options.furtherTextValue"]  
            }, {
                listenerMaker: "fluid.tests.makeChangeChecker",
                makerArgs: ["{asyncTester}.options.furtherTextValue", "textValue"],
                // alternate style for registering listener
                spec: {path: "textValue", priority: "last"},
                changeEvent: "{asyncTest}.applier.modelChanged"
            }, {
                func: "jqUnit.assertEquals",
                args: ["Model updated", "{asyncTester}.options.furtherTextValue",
                    "{asyncTest}.model.textValue"]  
            }, { // manually click on the button a final time with direct listener
                jQueryTrigger: "click",
                element: "{asyncTest}.dom.button"
            }, {
                jQueryBind: "click",
                element: "{asyncTest}.dom.button",
                listener: "fluid.tests.checkEvent"
            }]
        }]
    }]
});

fluid.tests.checkEvent = function () {
    jqUnit.assert("Button event relayed");
};

fluid.tests.changeField = function (field, value) {
    field.val(value).change();
};

fluid.tests.makeChangeChecker = function (toCheck, path) {
    return function (newModel) {
        var newval = fluid.get(newModel, path);
        jqUnit.assertEquals("Expected model value " + toCheck + " at path " + path, toCheck, newval);
    };
};

fluid.tests.startRendering = function (asyncTest, instantiator) {
    asyncTest.refreshView();
    var decorators = fluid.renderer.getDecoratorComponents(asyncTest, instantiator);
    var decArray = fluid.values(decorators);
    jqUnit.assertEquals("Constructed one component", 1, decArray.length);
    asyncTest.locate("button").click();
};

fluid.defaults("fluid.tests.initTree", {
    gradeNames: ["fluid.test.testEnvironment", "autoInit"],
    components: {
// moved into driver to test FLUID-5132
//        initTest: {
//            type: "fluid.tests.initTest",
//            createOnEvent: "{initTester}.events.onTestCaseStart"
//        },
        initTester: {
            type: "fluid.tests.initTester"
        }
    }
});

fluid.tests.setup = function (that) {
    // do some setup, for test purpose just fire onReady
    that.events.onReady.fire();
};

fluid.defaults("fluid.tests.initTest", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    events: {
        onReady: null
    },
    listeners: {
        onCreate: "{that}.initialSetup"
    },
    invokers: {
        initialSetup: "fluid.tests.setup",
        args: ["{that}"]
    }
});

fluid.defaults("fluid.tests.initTester", {
    gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
    modules: [ {
        name: "Init test case",
        tests: [{
            name: "Init sequence",
            expect: 1,
            sequence: [{
                listener: "fluid.tests.checkEvent",
                event: "{initTree initTest}.events.onReady"
            }]
        }]
    }]
});

/** Global driver function **/

fluid.tests.testTests = function () {
    fluid.test.runTests([
        "fluid.tests.myTestTree",
        "fluid.tests.asyncTestTree", {
            type: "fluid.tests.initTree",
            options: {
                components: {
                    initTest: {
                        type: "fluid.tests.initTest",
                        createOnEvent: "{initTester}.events.onTestCaseStart"
                    }
                }  
            }
        }
    ]);
};