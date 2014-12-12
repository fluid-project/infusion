/*

 Copyright 2010-2011 Lucendo Development Ltd.

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 */

// Declare dependencies
/* global fluid, jqUnit */

(function () {
    "use strict";

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
        invokers: {
            makeSound: "fluid.tests.cat.makeSound"
        }
    });

    fluid.tests.cat.makeSound = function () {
        return "meow";
    };

    /** Test Case Holder - holds declarative representation of test cases **/

    fluid.defaults("fluid.tests.catTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        invokers: {
            testMeow: "fluid.tests.globalCatTest"
        },
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

    fluid.defaults("fluid.tests.initTree", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
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

    fluid.defaults("fluid.tests.dynamicCATT", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        catts: ["catt1", "catt2"],
        dynamicComponents: {
            catts: {
                sources: "{that}.options.catts",
                type: "fluid.tests.cat"
            }
        }
    });

    fluid.defaults("fluid.tests.sourceTester", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            tree: {
                type: "fluid.tests.dynamicCATT"
            },
            fixtures: {
                type: "fluid.test.testCaseHolder",
                options: {
                    moduleSource: {
                        funcName: "fluid.tests.cattModuleSource",
                        args: "{sourceTester}.tree"
                    }
                }
            }
        }
    });

    fluid.tests.cattModuleSource = function (dynamic) {
        var sequence = [];
        fluid.visitComponentChildren(dynamic, function (child) {
            sequence.push({
                name: "Test Meow " + (sequence.length + 1),
                type: "test",
                func: "fluid.tests.globalCatTest",
                args: child
            });
        }, {});
        return {
            name: "Dynamic module source tests",
            tests: {
                name: "Dynamic CATT tests",
                sequence: sequence
            }
        };
    };
    
    fluid.tests.cancelOrDie = function (that) {
        that.timer = setTimeout(function () {
            fluid.fail("Hang timer did not execute before 2000ms");
        }, 2000);
    };
    
    fluid.tests.cancelTimer = function (that) {
        jqUnit.assert("Successfully cancelled hang timer");
        clearTimeout(that.timer);
        that.events.onUnhang.fire();
    };
    
    fluid.defaults("fluid.tests.hangTester", { // tests FLUID-5252
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        hangWait: 1000, // speed up the test run by detecting a hang after only 1000ms
        events: {
            onUnhang: null
        },
        listeners: {
            onSequenceHang: {
                funcName: "fluid.tests.cancelTimer",
                args: "{that}"
            }
        },
        components: {
            fixtures: {
                type: "fluid.test.testCaseHolder",
                options: {
                    modules: [ {
                        name: "Hang test case",
                        tests: [{
                            name: "Hang test sequence",
                            expect: 1,
                            sequence: [{
                                funcName: "fluid.tests.cancelOrDie",
                                args: "{testEnvironment}"
                            }, {
                                event: "{testEnvironment}.events.onUnhang"
                            }]
                        }]
                    }]
                }
            }
        }
    });
    
    fluid.tests.pushListenerReport = function (arg1, that) {
        that.listenerReport = [arg1];
    };
    
    fluid.tests.expectedListenerArg = ["Direct argument"];
    
    fluid.defaults("fluid.tests.listenerArg", { // tests FLUID-5496
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        events: {
            onPush: null
        },
        components: {
            fixtures: {
                type: "fluid.test.testCaseHolder",
                options: {
                    modules: [ {
                        name: "Listener arg tester",
                        tests: [{
                            name: "Listener arg sequence",
                            expect: 1,
                            sequence: [{
                                func: "{testEnvironment}.events.onPush.fire",
                                args: "{testEnvironment}"
                            }, {
                                event: "{testEnvironment}.events.onPush",
                                listener: "fluid.tests.pushListenerReport",
                                args: ["Direct argument", "{arguments}.0"]
                            }, {
                                func: "jqUnit.assertDeepEq",
                                args: ["Reporter should have fired", fluid.tests.expectedListenerArg, "{testEnvironment}.listenerReport"]
                            }]
                        }]
                    }]
                }
            }
        }
    });

    if (!fluid.defaults("fluid.viewComponent")) {
        return;
    }
    
    // FLUID-5497 model listener priority
    
    fluid.tests.storeListenedValue = function (that, value) {
        that.listenedValue = value;
    };
    
    fluid.tests.makePriorityChangeChecker = function (that, expectedCurrent, expectedListener) {
        return function () {
            jqUnit.assertEquals("Current value expected in model", expectedCurrent, that.model);
            jqUnit.assertEquals("Old value expected in component", expectedListener, that.listenedValue);
        };
    };

    fluid.defaults("fluid.tests.modelTestTree", {
        gradeNames: ["fluid.test.testEnvironment", "fluid.standardRelayComponent", "autoInit"],
        model: 0,
        members: {
            listenedValue: 0
        },
        modelListeners: {
            "": {
                funcName: "fluid.tests.storeListenedValue",
                args: ["{that}", "{change}.value"],
                priority: 0 // Weak priority - note that larger numbers are serviced earlier
            }
        },
        components: {
            testCases: {
                type: "fluid.tests.modelPriorityCases"
            }
        }
    });

    fluid.defaults("fluid.tests.modelPriorityCases", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [ {
            name: "FLUID-5497 Model listener priority tests",
            tests: [{
                name: "Model priority sequence",
                expect: 4,
                sequence: [ {
                    func: "{modelTestTree}.applier.change",
                    args: ["", 1]
                }, {
                    listenerMaker: "fluid.tests.makePriorityChangeChecker",
                    makerArgs: ["{modelTestTree}", 1, 0], // listener lags behind us
                    spec: {path: "", priority: 10}, // higher priority than listener
                    changeEvent: "{modelTestTree}.applier.modelChanged"
                }, {
                    func: "{modelTestTree}.applier.change",
                    args: ["", 2]
                }, {
                    listenerMaker: "fluid.tests.makePriorityChangeChecker",
                    makerArgs: ["{modelTestTree}", 2, 2], // listener is ahead of us
                    spec: {path: "", priority: "last"},
                    changeEvent: "{modelTestTree}.applier.modelChanged"
                }]
            }]
        }]
    });
    
    // FLUID-5559 double firing of onTestCaseStart
    
    // in presence of the bug, we will get two firings of onTestCaseStart and hence an extra onCreate of the component,
    // and hence one extra assertion
    
    fluid.defaults("fluid.tests.onTestCaseStart.tree", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            targetTree: {
                type: "fluid.eventedComponent",
                createOnEvent: "{testCases}.events.onTestCaseStart"
            },
            testCases: {
                type: "fluid.test.testCaseHolder"
            }
        }
    });
    
    fluid.defaults("fluid.tests.fluid5559Tree", {
        gradeNames: ["fluid.tests.onTestCaseStart.tree", "autoInit"],
        components: {
            testCases: {
                options: {
                    modules: [ {
                        name: "FLUID-5559 Double firing of onTestCaseStart",
                        tests: [{
                            name: "FLUID-5559 sequence",
                            expect: 2,
                            sequence: [ {
                                // Must use IoCSS here - see discussion on FLUID-4929 - must avoid triggering construction
                                event: "{fluid5559Tree targetTree}.events.onCreate",
                                listener: "fluid.tests.onTestCaseStart.assertOnce"
                            }, {
                                func: "fluid.tests.onTestCaseStart.assertOnce",
                                args: "{targetTree}"
                            }]
                        }]
                    }]
                }
            }
        }
    });
    
    fluid.tests.onTestCaseStart.assertOnce = function (arg) {
        jqUnit.assertValue("Received value", arg);
    };
    
    // FLUID-5575 late firing of onTestCaseStart
    
    // In this variant, we attach the onCreate listener directly, and refer to the
    // component eagerly - with the FLUID-5266 fix, this will now trigger an error if the event is late
    
    fluid.tests.onTestCaseStart.moduleSource = function (name) {
        var modules = [{
            name: "FLUID-5575 Late firing of onTestCaseStart - " + name,
            tests: [{
                name: "FLUID-5575 sequence"
            }]
        }];
        var sequence = fluid.getGlobalValue(name);
        modules[0].tests[0] = $.extend(true, modules[0].tests[0], sequence);
        return modules;
    };
    
    fluid.defaults("fluid.tests.fluid5575Tree", {
        gradeNames: ["fluid.tests.onTestCaseStart.tree", "autoInit"],
        components: {
            targetTree: {
                options: {
                    events: {
                        triggerable: null // used in "activePassive" case
                    },
                    listeners: {
                        onCreate: "fluid.tests.onTestCaseStart.assertOnce"
                    }
                }
            },
            testCases: {
                options: {
                    moduleSource: {
                        func: "fluid.tests.onTestCaseStart.moduleSource",
                        args: "{testEnvironment}.options.sequenceName"
                    }
                }
            }
        }
    });
        
    fluid.tests.onTestCaseStart.singleActive = {
        expect: 2,
        sequence: [{
            func: "fluid.tests.onTestCaseStart.assertOnce",
            args: "{targetTree}"
        }]
    };
    
    fluid.defaults("fluid.tests.fluid5575Tree.singleActive", {
        gradeNames: ["fluid.tests.fluid5575Tree", "autoInit"],
        sequenceName: "fluid.tests.onTestCaseStart.singleActive"
    });
    
    fluid.tests.onTestCaseStart.doubleActive = {
        expect: 3,
        sequence: [{
            func: "fluid.tests.onTestCaseStart.assertOnce",
            args: "{targetTree}"
        }, {
            func: "fluid.tests.onTestCaseStart.assertOnce",
            args: "{targetTree}"
        }]
    };

    fluid.defaults("fluid.tests.fluid5575Tree.doubleActive", {
        gradeNames: ["fluid.tests.fluid5575Tree", "autoInit"],
        sequenceName: "fluid.tests.onTestCaseStart.doubleActive"
    });
    
    // This case occurs in metadata feedback tests - "decodeEvent" for the upcoming passive fixture
    // would itself trigger creation before active starts
    fluid.tests.onTestCaseStart.activePassive = {
        expect: 2,
        sequence: [{
            func: "{targetTree}.events.triggerable.fire",
            args: "{targetTree}"
        }, {
            event: "{targetTree}.events.triggerable",
            listener: "fluid.tests.onTestCaseStart.assertOnce"
        }]
    };
    
    fluid.defaults("fluid.tests.fluid5575Tree.activePassive", {
        gradeNames: ["fluid.tests.fluid5575Tree", "autoInit"],
        sequenceName: "fluid.tests.onTestCaseStart.activePassive"
    });
    
    /**** VIEW-AWARE TESTS FROM HERE ONWARDS ****/

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
    
    // FLUID-5375: Use of IoC testing framework together with new relay grades
    fluid.defaults("fluid.tests.asyncTestRelayTree", {
        gradeNames: ["fluid.tests.asyncTestTree", "autoInit"],
        components: {
            asyncTest: {
                options: {
                    gradeNames: "fluid.modelRelayComponent"
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
                    // TODO: simplify once old ChangeApplier is removed
                    makerArgs: ["{asyncTester}.options.newTextValue", "{asyncTest}", "textValue"],
                    path: "textValue",
                    changeEvent: "{asyncTest}.applier.modelChanged"
                }, {
                    func: "fluid.tests.changeField",
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

    fluid.tests.changeField = function (field, value) {
        field.val(value).change();
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
        // Test restartable running API
        fluid.test.runTests(["fluid.tests.asyncTestRelayTree"]);
        fluid.invokeLater(function () {
            fluid.test.runTests([
                "fluid.tests.sourceTester",
                "fluid.tests.hangTester",
                "fluid.tests.listenerArg",
                "fluid.tests.modelTestTree",
                "fluid.tests.fluid5559Tree",
                "fluid.tests.fluid5575Tree.singleActive",
                "fluid.tests.fluid5575Tree.doubleActive",
                "fluid.tests.fluid5575Tree.activePassive"
            ]);
        });
    };
})();
