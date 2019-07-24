/*
IoC Testing Framework View-aware Tests

Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* eslint strict: ["error", "global"] */
/* global fluid, jqUnit */

"use strict";

fluid.registerNamespace("fluid.tests");

fluid.defaults("fluid.tests.initTree", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
// natural place for this configuration is here - however, moved into driver to test FLUID-5132
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
    gradeNames: ["fluid.component"],
    events: {
        onReady: null
    },
    listeners: {
        onCreate: "{that}.initialSetup"
    },
    invokers: {
        initialSetup: "fluid.tests.setup"
    }
});

fluid.defaults("fluid.tests.initTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
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

fluid.defaults("fluid.tests.asyncTest", {
    gradeNames: ["fluid.rendererComponent"],
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
    gradeNames: ["fluid.viewComponent"],
    events: {
        buttonClicked: "{asyncTest}.events.buttonClicked"
    },
    listeners: {
        onCreate: "fluid.tests.buttonChild.bindClick"
    }
});

fluid.tests.buttonChild.bindClick = function (that) {
    that.container.click(function () {
        setTimeout(that.events.buttonClicked.fire, 1);
    });
};

fluid.defaults("fluid.tests.asyncTestTree", {
    gradeNames: ["fluid.test.testEnvironment"],
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

// FLUID-5375: Use of IoC testing framework together with new relay grades
fluid.defaults("fluid.tests.asyncTestRelayTree", {
    gradeNames: ["fluid.tests.asyncTestTree"],
    components: {
        asyncTest: {
            options: {
                gradeNames: "fluid.modelComponent"
            }
        },
        asyncTester: {
            options: {
                modules: [ {
                    name: "Async test case with model relay"
                }]
            }
        }
    }
});

fluid.defaults("fluid.tests.asyncTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
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
                func: "fluid.changeElementValue",
                args: ["{asyncTest}.dom.textField", "{asyncTester}.options.newTextValue"]
            }, {
                listenerMaker: "fluid.tests.makeChangeChecker",
                // TODO: simplify once old ChangeApplier is removed
                makerArgs: ["{asyncTester}.options.newTextValue", "{asyncTest}", "textValue"],
                path: "textValue",
                changeEvent: "{asyncTest}.applier.modelChanged"
            }, {
                func: "fluid.changeElementValue",
                args: ["{asyncTest}.dom.textField", "{asyncTester}.options.furtherTextValue"]
            }, {
                listenerMaker: "fluid.tests.makeChangeChecker",
                makerArgs: ["{asyncTester}.options.furtherTextValue", "{asyncTest}", "textValue"],
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

fluid.tests.makeChangeChecker = function (toCheck, component, path) {
    return function () {
        var newModel = component.model;
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

/** Global driver function **/

fluid.tests.IoCTestingViewTests = function () {
    fluid.test.runTests([
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
    // Test restartable running API
    fluid.test.runTests(["fluid.tests.asyncTestRelayTree"]);
};
