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

/* eslint strict: ["error", "global"] */
/* global jqUnit */

"use strict";

fluid.registerNamespace("fluid.tests");

/** Testing environment - holds both fixtures as well as components under test, exposes global test driver **/

fluid.defaults("fluid.tests.myTestTree", {
    gradeNames: ["fluid.test.testEnvironment"],
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
    gradeNames: ["fluid.component"],
    invokers: {
        makeSound: "fluid.tests.cat.makeSound"
    }
});

fluid.tests.cat.makeSound = function () {
    return "meow";
};

/** Test Case Holder - holds declarative representation of test cases **/

fluid.defaults("fluid.tests.catTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
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

fluid.defaults("fluid.tests.dynamicCATT", {
    gradeNames: ["fluid.modelComponent"],
    catts: ["catt1", "catt2"],
    dynamicComponents: {
        catts: {
            sources: "{that}.options.catts",
            type: "fluid.tests.cat"
        }
    }
});

fluid.defaults("fluid.tests.sourceTester", {
    gradeNames: ["fluid.test.testEnvironment"],
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
    gradeNames: ["fluid.test.testEnvironment"],
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

fluid.tests.pushFixedListenerReport = function (that) {
    that.environment.listenerReport.push("Fixed argument");
};

fluid.defaults("fluid.tests.listenerArg", { // tests FLUID-5496
    gradeNames: ["fluid.test.testEnvironment"],
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
                        expect: 2,
                        sequence: [{
                            func: "{testEnvironment}.events.onPush.fire",
                            args: "{testEnvironment}"
                        }, {
                            event: "{testEnvironment}.events.onPush",
                            listener: "fluid.tests.pushListenerReport",
                            args: ["Direct argument", "{arguments}.0"]
                        }, {
                            func: "jqUnit.assertDeepEq",
                            args: ["Reporter should have fired", ["Direct argument"], "{testEnvironment}.listenerReport"]
                        }, {
                            func: "{testEnvironment}.events.onPush.fire",
                            args: "{testEnvironment}"
                        }, {
                            event: "{testEnvironment}.events.onPush",
                            listener: "fluid.tests.pushFixedListenerReport",
                            args: {
                                environment: "{arguments}.0" // tests FLUID-5583
                            }
                        }, {
                            func: "jqUnit.assertDeepEq",
                            args: ["Reporter should have fired", ["Direct argument", "Fixed argument"], "{testEnvironment}.listenerReport"]
                        }]
                    }]
                }]
            }
        }
    }
});

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
    gradeNames: ["fluid.test.testEnvironment", "fluid.modelComponent"],
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
    gradeNames: ["fluid.test.testCaseHolder"],
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
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        targetTree: {
            type: "fluid.component",
            options: {
                events: {
                    "hearIt": null
                },
                listeners: {
                    "onCreate.hearIt": {
                        listener: "{that}.events.hearIt.fire"
                    }
                }
            },
            createOnEvent: "{testCases}.events.onTestCaseStart"
        },
        testCases: {
            type: "fluid.test.testCaseHolder"
        }
    }
});

fluid.defaults("fluid.tests.fluid5559Tree", {
    gradeNames: ["fluid.tests.onTestCaseStart.tree"],
    components: {
        testCases: {
            options: {
                modules: [ {
                    name: "FLUID-5559 Double firing of onTestCaseStart and FLUID-5633 listener deregistration",
                    tests: [{
                        name: "FLUID-5559 sequence",
                        expect: 4,
                        sequence: [{
                            // Must use IoCSS here - see discussion on FLUID-4929 - must avoid triggering construction
                            event: "{fluid5559Tree targetTree}.events.hearIt",
                            // Use a bare listener this first time to test one variant of fluid.test.findListenerId
                            listener: "fluid.tests.onTestCaseStart.assertValue"
                        }, {
                            func: "fluid.tests.onTestCaseStart.assertValue",
                            args: "{targetTree}"
                        }, { // Try firing the event again in order to test FLUID-5633
                            func: "{fluid5559Tree}.targetTree.events.hearIt.fire",
                            args: 5
                        }, {
                            event: "{fluid5559Tree targetTree}.events.hearIt",
                            listener: "jqUnit.assertEquals",
                            args: ["Resolved value from 2nd firing", 5, "{arguments}.0"]
                        },  { // Try firing the event again in order to test FLUID-5633 further
                            func: "{fluid5559Tree}.targetTree.events.hearIt.fire",
                            args: true
                        }, {
                            event: "{fluid5559Tree targetTree}.events.hearIt",
                            listener: "jqUnit.assertEquals",
                            args: ["Resolved value from 3rd firing", true, "{arguments}.0"]
                        }]
                    }]
                }]
            }
        }
    }
});

fluid.tests.onTestCaseStart.assertValue = function (arg) {
    jqUnit.assertValue("Received value", arg);
};

fluid.defaults("fluid.tests.fluid5633Tree", {
    gradeNames: ["fluid.test.testEnvironment", "fluid.test.testCaseHolder"],
    events: {
        createIt: null
    },
    components: {
        dynamic: {
            type: "fluid.component",
            createOnEvent: "createIt",
            options: {
                value: "{arguments}.0"
            }
        }
    },
    modules: [{
        name: "FLUID-5633 Deregistration of IoCSS listeners",
        tests: [{
            name: "FLUID-5633 sequence",
            expect: 3,
            sequence: [{
                func: "{fluid5633Tree}.events.createIt.fire",
                args: 1
            }, {
                event: "{fluid5633Tree dynamic}.events.onCreate",
                listener: "fluid.tests.onTestCaseStart.assertValue"
            }, {
                func: "{fluid5633Tree}.events.createIt.fire",
                args: 2
            }, {
                event: "{fluid5633Tree dynamic}.events.onCreate",
                // Use a different listener handle here to test for accumulation
                listener: "fluid.tests.fluid5633Tree.assertValue2"
            }, {
                func: "{fluid5633Tree}.events.createIt.fire",
                args: 2
            }, {
                event: "{fluid5633Tree dynamic}.events.onCreate",
                listener: "jqUnit.assertEquals",
                args: ["Resolved value from 3rd firing", 2, "{arguments}.0.options.value"]
            }]
        }]
    }]
});

fluid.tests.fluid5633Tree.assertValue2 = function (that) {
    jqUnit.assertEquals("Received argument from 2nd event firing", 2, that.options.value);
};

// More ambitious test tree to flush out further cases observed by gmoss -
// i) multi-component IoCSS selector
// ii) injected event receiving listener
// iii) selector matching by member name rather than context name

fluid.defaults("fluid.tests.fluid5633Tree_2", {
    gradeNames: ["fluid.test.testEnvironment", "fluid.test.testCaseHolder"],
    events: {
        createAndBind: null
    },
    components: {
        fluid5633top: {
            type: "fluid.component",
            options: {
                events: {
                    createIt: null,
                    bindIt: null
                },
                components: {
                    fluid5633middle: {
                        type: "fluid.component",
                        createOnEvent: "createIt",
                        options: {
                            components: {
                                fluid5633bottom: {
                                    type: "fluid.component",
                                    options: {
                                        events: {
                                            bindIt: "{fluid5633top}.events.bindIt"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    listeners: {
        createAndBind: "fluid.tests.fluid5633Tree_2.createAndBind"
    },
    modules: [{
        name: "FLUID-5633 strikes back: Deregistration of IoCSS listeners",
        tests: [{
            name: "FLUID-5633 strikes back sequence",
            expect: 2,
            sequence: [{
                func: "{fluid5633Tree_2}.events.createAndBind.fire",
                args: "{fluid5633Tree_2}"
            }, {
                event: "{fluid5633Tree_2 fluid5633middle fluid5633bottom}.events.bindIt",
                listener: "jqUnit.assertEquals",
                args: 42
            }, {
                func: "{fluid5633Tree_2}.fluid5633top.events.bindIt.fire",
                args: 43
            }, {
                event: "{fluid5633Tree_2 fluid5633middle fluid5633bottom}.events.bindIt",
                listener: "jqUnit.assertEquals",
                args: 43
            }]
        }]
    }]
});

fluid.tests.fluid5633Tree_2.createAndBind = function (that) {
    that.fluid5633top.events.createIt.fire();
    that.fluid5633top.events.bindIt.fire(42);
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
    gradeNames: ["fluid.tests.onTestCaseStart.tree"],
    components: {
        targetTree: {
            options: {
                events: {
                    triggerable: null // used in "activePassive" case
                },
                listeners: {
                    onCreate: "fluid.tests.onTestCaseStart.assertValue"
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
        func: "fluid.tests.onTestCaseStart.assertValue",
        args: "{targetTree}"
    }]
};

fluid.defaults("fluid.tests.fluid5575Tree.singleActive", {
    gradeNames: ["fluid.tests.fluid5575Tree"],
    sequenceName: "fluid.tests.onTestCaseStart.singleActive"
});

fluid.tests.onTestCaseStart.doubleActive = {
    expect: 3,
    sequence: [{
        func: "fluid.tests.onTestCaseStart.assertValue",
        args: "{targetTree}"
    }, {
        func: "fluid.tests.onTestCaseStart.assertValue",
        args: "{targetTree}"
    }]
};

fluid.defaults("fluid.tests.fluid5575Tree.doubleActive", {
    gradeNames: ["fluid.tests.fluid5575Tree"],
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
        listener: "fluid.tests.onTestCaseStart.assertValue"
    }]
};

fluid.defaults("fluid.tests.fluid5575Tree.activePassive", {
    gradeNames: ["fluid.tests.fluid5575Tree"],
    sequenceName: "fluid.tests.onTestCaseStart.activePassive"
});


/** FLUID-5753, FLUID-5949: promise/task support and coincident environment and testCaseHolder **/

fluid.defaults("fluid.tests.taskTester", {
    gradeNames: ["fluid.test.testEnvironment", "fluid.test.testCaseHolder"],
    invokers: {
        resolvedPromiseDispenser: "fluid.tests.promiseDispenser({arguments}.0, resolve)",
        rejectedPromiseDispenser: "fluid.tests.promiseDispenser({arguments}.0, reject)"
    },
    modules: [{
        name: "FLUID-5949 Task/promise-based testing",
        tests: [{
            name: "Sequence with single resolve member",
            expect: 1,
            sequence: [{
                task: "{taskTester}.resolvedPromiseDispenser",
                args: 42,
                resolve: "fluid.tests.expect42"
            }]
        }, {
            name: "Sequence with resolve and reject with their own args",
            expect: 3,
            sequence: [{
                task: "{taskTester}.resolvedPromiseDispenser",
                args: 42,
                resolve: "jqUnit.assertDeepEq",
                resolveArgs: ["The resolve argument is 42", 42, "{arguments}.0"]
            }, {
                task: "{taskTester}.rejectedPromiseDispenser",
                args: 42,
                reject: "jqUnit.assertDeepEq",
                rejectArgs: ["The totality of the reject arguments is 42", [42], "{arguments}"]
            }, {
                task: "{taskTester}.resolvedPromiseDispenser",
                args: [[true, false]],
                resolve: "jqUnit.assertDeepEq",
                resolveArgs: ["The resolve argument is [true, false]", [true, false], "{arguments}.0"]
            }]
        }, {
            name: "Failing tests: resolve for reject and reject for resolve",
            expect: 2,
            sequence: [{
                funcName: "fluid.test.failingSetup"
            }, {
                task: "{taskTester}.rejectedPromiseDispenser",
                args: 42,
                resolve: "fluid.fail",
                resolveArgs: "This should never run"
            }, {
                task: "{taskTester}.resolvedPromiseDispenser",
                args: 42,
                reject: "fluid.fail",
                rejectArgs: "This should never run"
            }, {
                funcName: "fluid.test.failingTeardown"
            }]
        }]
    }]
});

fluid.tests.expect42 = function () {
    jqUnit.assertDeepEq("The totality of the arguments is 42", [42], fluid.makeArray(arguments));
};

fluid.tests.promiseDispenser = function (arg, method) {
    var togo = fluid.promise();
    fluid.invokeLater(function () {
        togo[method](arg);
    });
    return togo;
};

/** FLUID-5903: Priority-driven "grade budding system" **/

fluid.defaults("fluid.tests.elementPriority.beginning", {
    gradeNames: "fluid.test.sequenceElement",
    sequence: [{
        func: "{testCaseHolder}.pushRecord(beginning)"
    }]
});

fluid.defaults("fluid.tests.elementPriority.postBeginning", {
    gradeNames: "fluid.test.sequenceElement",
    sequence: [{
        func: "{testCaseHolder}.pushRecord(postBeginning)"
    }]
});


fluid.defaults("fluid.tests.elementPriority.end", {
    gradeNames: "fluid.test.sequenceElement",
    sequence: [{
        func: "{testCaseHolder}.pushRecord(end)"
    }]
});

fluid.defaults("fluid.tests.elementPriority.check", {
    gradeNames: "fluid.test.sequenceElement",
    mergePolicy: {
        targetComponent: "noexpand"
    },
    // A placeholder reference to test possibility for recursive context references
    targetComponent: "{placeHolder}",
    sequence: [{
        func: "fluid.tests.elementPriority.checkSequence({{that}.options.targetComponent}.record)"
    }]
});

fluid.tests.elementPriority.checkSequence = function (record) {
    jqUnit.assertDeepEq("Sequence elements executed in correct order",
        ["beginning", "postBeginning", "sequence", "end"], record);
};

fluid.defaults("fluid.tests.elementPrioritySequence", {
    gradeNames: "fluid.test.sequence",
    sequenceElements: {
        check: {
            gradeNames: "fluid.tests.elementPriority.check",
            options: {
                targetComponent: "{testCaseHolder}"
            },
            priority: "after:end"
        },
        end: {
            gradeNames: "fluid.tests.elementPriority.end",
            priority: "after:sequence"
        },
        postBeginning: {
            gradeNames: "fluid.tests.elementPriority.postBeginning",
            priority: "after:beginning"
        },
        beginning: {
            gradeNames: "fluid.tests.elementPriority.beginning",
            priority: "before:sequence"
        }
    }
});

fluid.tests.elementPriority.pushRecord = function (record, toPush) {
    record.push(toPush);
};

fluid.defaults("fluid.tests.elementPriority", {
    gradeNames: ["fluid.test.testEnvironment", "fluid.test.testCaseHolder"],
    members: {
        record: []
    },
    invokers: {
        pushRecord: "fluid.tests.elementPriority.pushRecord({testCaseHolder}.record, {arguments}.0)"
    },
    modules: [{
        name: "FLUID-5903: Priority-driven grade budding",
        tests: [{
            expect: 1,
            name: "Simple sequence of 4 active elements",
            sequenceGrade: "fluid.tests.elementPrioritySequence",
            sequence: [{
                func: "{testCaseHolder}.pushRecord(sequence)"
            }]
        }
        ]
    }]
});

/** Global driver function **/

fluid.tests.IoCTestingTests = function () {
    fluid.test.runTests([
        "fluid.tests.myTestTree"
    ]);
    fluid.invokeLater(function () {
        fluid.test.runTests([
            "fluid.tests.sourceTester",
            "fluid.tests.hangTester",
            "fluid.tests.listenerArg",
            "fluid.tests.modelTestTree",
            "fluid.tests.fluid5559Tree",
            "fluid.tests.fluid5633Tree",
            "fluid.tests.fluid5633Tree_2",
            "fluid.tests.fluid5575Tree.singleActive",
            "fluid.tests.fluid5575Tree.doubleActive",
            "fluid.tests.fluid5575Tree.activePassive",
            "fluid.tests.taskTester",
            "fluid.tests.elementPriority"
        ]);
    });
};
