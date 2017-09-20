/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 Lucendo Development Ltd.
Copyright 2012-2014 Raising the Floor - US
Copyright 2014 OCAD University
Copyright 2015-2016 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.setLogging(true);

    fluid.registerNamespace("fluid.tests");

    jqUnit.module("Data Binding Tests");

    jqUnit.test("PathUtil", function () {
        var path = "path1.path2.path3";

        // TODO: Only these will survive as the unescaped, high-performance utilities used in IoC
        jqUnit.assertEquals("getTailPath", "path3", fluid.model.getTailPath(path));
        jqUnit.assertEquals("getToTailPath", "path1.path2", fluid.model.getToTailPath(path));
    });


    var customStrategy = function (root, segment, i, segs) {
        return fluid.pathUtil.matchSegments(["path3"], segs, 0, i) ? fluid.NO_VALUE : undefined;
    };

    jqUnit.test("getBeanValue with custom strategy", function () {
        var model = {path3: "thing", path4: "otherThing"};
        var value = fluid.get(model, "path3", {strategies: [customStrategy, fluid.model.defaultFetchStrategy]});
        jqUnit.assertUndefined("path3 value censored", value);
        var value2 = fluid.get(model, "path4", {strategies: [customStrategy, fluid.model.defaultFetchStrategy]});
        jqUnit.assertEquals("path4 value uncensored", model.path4, value2);
    });

    fluid.tests.childMatchResolver = function (valueSeg, options, trundler) {
        valueSeg = trundler(valueSeg, options.queryPath);
        return fluid.find(valueSeg.root, function (value, key) {
            var trundleKey = trundler(valueSeg, key);
            var trundleChild = trundler(trundleKey, options.childPath);
            if (trundleChild.root === options.value) {
                return trundleKey;
            }
        });
    };
    // Unpacks a string encoded in triples into an array of objects, where the first digit encodes whether
    // _primary is true or false, and the following two encode the values of properties "a" and "b"
    fluid.tests.generateRepeatableThing = function (gens) {
        var togo = [];
        for (var i = 0; i < gens.length; i += 3) {
            togo.push({
                _primary: !!Number(gens.charAt(i)),
                value: {
                    a: Number(gens.charAt(i + 1)),
                    b: Number(gens.charAt(i + 2))
                }
            });
        }
        return togo;
    };

    fluid.tests.basicResolverModel = {
        fields: {
            repeatableThing: fluid.tests.generateRepeatableThing("001123")
        }
    };

    jqUnit.test("getBeanValue with resolver", function () {
        var model = fluid.copy(fluid.tests.basicResolverModel);
        var config = $.extend(true, {}, fluid.model.defaultGetConfig, {
            resolvers: {
                childMatch: fluid.tests.childMatchResolver
            }
        });
        var el = {
            type: "childMatch",
            queryPath: "fields.repeatableThing",
            childPath: "_primary",
            value: true,
            path: "value.a"
        };
        var resolved = fluid.get(model, el, config);
        jqUnit.assertEquals("Queried resolved value", 2, resolved);
        model.fields.repeatableThing = [{}];
        el.path = "value";
        resolved = fluid.get(model, el, config);
        jqUnit.assertUndefined("Queried resolved value", resolved);
    });

    fluid.tests.repeatableModifyingStrategy = function (toMatch) {
        var matchSegs = fluid.model.parseEL(toMatch);
        return function (root, segment, i, segs) {
            return fluid.pathUtil.matchSegments(matchSegs, segs, 0, i) ?
                    fluid.tests.generateRepeatableThing("145") : undefined;
        };
    };

    jqUnit.test("Complex resolving and strategising", function () {
        var model = fluid.copy(fluid.tests.basicResolverModel);
        model.fields.repeatableThing[1].value = fluid.tests.generateRepeatableThing("045167089");
        var el = {
            type: "childMatch",
            queryPath: "fields.repeatableThing",
            childPath: "_primary",
            value: true,
            path: {
                type: "childMatch",
                queryPath: "value",
                childPath: "_primary",
                value: true,
                path: "value.a"
            }
        };
        var config = $.extend(true, {}, fluid.model.defaultGetConfig, {
            resolvers: {
                childMatch: fluid.tests.childMatchResolver
            }
        });
        var resolved = fluid.get(model, el, config);
        jqUnit.assertEquals("Queried resolved value", 6, resolved);
        var config2 = {
            resolvers: {
                childMatch: fluid.tests.childMatchResolver
            },
            strategies: [fluid.tests.repeatableModifyingStrategy("fields.repeatableThing.1.value")].concat(fluid.model.defaultGetConfig.strategies)
        };
        var resolved2 = fluid.get(model, el, config2);
        jqUnit.assertEquals("Queried resolved and strategised value", 4, resolved2);
    });

    jqUnit.test("FLUID-3729 test: application into nothing", function () {
        var model = {};
        var holder = {model: model};

        var applyHolderChange = function (request) {
            request.segs = fluid.model.parseEL(request.path);
            fluid.model.applyHolderChangeRequest(holder, request);
        };

        function applyTests(applyFunc) {
            applyFunc({type: "ADD", path: "path1.nonexistent", value: "value"});
            jqUnit.assertEquals("Application 2 levels into nothing", "value", model.path1.nonexistent);


            applyFunc({type: "ADD", path: "path1.nonexistent2", value: "value2"});
            jqUnit.assertEquals("Application 1 level into nothing", "value2", model.path1.nonexistent2);
        }
        applyTests(applyHolderChange);
    });

    // These "new tests" start with the same cases as for the "old applier" written in declarative form,
    // but in many cases the expected results are different.

    fluid.tests.changeTests = [{
        message: "Added at root: cautious application", // note change of meaning from old model - previously "add + clear"
        model: {a: 1, b: 2},
        request: {type: "ADD", path: "", value: {c: 3}},
        expected: {a: 1, b: 2, c: 3},
        changes: 1,
        changeMap: {c: "ADD"}
    }, {
        message: "Delete root: true destruction", // note change of meaning from old model - previously "clear"
        model: {a: 1, b: 2},
        request: {type: "DELETE", path: ""},
        expected: undefined,
        changes: 1,
        changeMap: "DELETE"
    }, {
        message: "Add at trunk",
        model: {a: 1, b: 2, c: {a: 1, b: 2}},
        request: {type: "ADD", path: "c", value: {c: 3}},
        expected: {a: 1, b: 2, c: {a: 1, b: 2, c: 3}},
        changes: 1,
        changeMap: {c: {c: "ADD"}}
    }, {
        message: "Add into nothing",
        model: {a: 1, b: 2},
        request: {type: "ADD", path: "c", value: {c: 3}},
        expected: {a: 1, b: 2, c: {c: 3}},
        changes: 1,
        changeMap: {c: "ADD"}
    }, {
        message: "Add primitive into nothing",
        model: {a: 1, b: 2},
        request: {type: "ADD", path: "c.c", value: 3},
        expected: {a: 1, b: 2, c: {c: 3}},
        changes: 1,
        changeMap: {c: "ADD"}
    }, {
        message: "Delete into nothing",
        model: {a: 1, b: 2},
        request: {type: "DELETE", path: "c.c"},
        expected: {a: 1, b: 2},
        changes: 0,
        changeMap: {}
    }, {
        message: "Delete deeper into nothing",
        model: {a: 1, b: 2},
        request: {type: "DELETE", path: "c.c.c"},
        expected: {a: 1, b: 2},
        changes: 0,
        changeMap: {}
    }, {
        message: "Add primitive at empty root",
        model: undefined,
        request: {type: "ADD", path: "", value: false},
        expected: false,
        changes: 1,
        changeMap: "ADD"
    }, {
        message: "Add primitive into nothing at empty root",
        model: undefined,
        request: {type: "ADD", path: "c", value: false},
        expected: {c: false},
        changes: 1,
        changeMap: "ADD"
    }, {
        message: "Add non-primitive at empty root",
        model: undefined,
        request: {type: "ADD", path: "", value: {a: 3, b: 2}},
        expected: {a: 3, b: 2},
        changes: 1,
        changeMap: "ADD"
    }, {
        message: "Add array at empty root",
        model: undefined,
        request: {type: "ADD", path: "", value: [1, false]},
        expected: [1, false],
        changes: 1,
        changeMap: "ADD"
    }, {
        message: "Add primitive near trunk",
        model: {a: 1, b: 2},
        request: {type: "ADD", path: "c", value: 3},
        expected: {a: 1, b: 2, c: 3},
        changes: 1,
        changeMap: {c: "ADD"}
    }, {
        message: "Add recursive to empty",
        model: undefined,
        request: {type: "ADD", path: "", value: {a: {b: {c: 3}}}},
        expected: {a: {b: {c: 3}}},
        changes: 1,
        changeMap: "ADD"
    }, {
        message: "Add object on top of primitive",
        model: {v: false},
        request: {type: "ADD", path: "v", value: {a: 1}},
        expected: {v: {a: 1}},
        changes: 1,
        changeMap: {v: "ADD"}
    }, {
        message: "Array on array - avoid mouse droppings",
        model: [{a: 1}, {b: 2}],
        request: {type: "ADD", path: "", value: [{b: 2}]},
        expected: [{b: 2}],
        changes: 1,
        changeMap: "ADD"
    }
    ];

    jqUnit.test("ApplyHolderChangeRequest - cautious application + invalidation", function () {
        for (var i = 0; i < fluid.tests.changeTests.length; ++i) {
            var test = fluid.tests.changeTests[i];
            var holder = {model: fluid.copy(test.model)};
            var options = {changeMap: {}, changes: 0};
            test.request.segs = fluid.model.parseEL(test.request.path);
            fluid.model.applyHolderChangeRequest(holder, test.request, options);
            var message = "index " + i + ": " + test.message;
            jqUnit.assertDeepEq(message + ": model contents", test.expected, holder.model);
            if (test.changes !== undefined) {
                jqUnit.assertEquals(message + ": changes", test.changes, options.changes);
                jqUnit.assertDeepEq(message + ": changeMap", test.changeMap, options.changeMap);
            }
        }
    });


    fluid.tests.testExternalTrans = function (applierMaker, name) {
        jqUnit.test("Transactional ChangeApplier - external transactions: " + name, function () {
            var model = {a: 1, b: 2};
            var holder = {model: model};
            var applier = applierMaker(holder);
            var initModel = fluid.copy(model);

            var transApp = applier.initiate();
            transApp.change("c", 3);
            jqUnit.assertDeepEq("Observable model unchanged", initModel, holder.model);
            transApp.change("d", 4);
            jqUnit.assertDeepEq("Observable model unchanged", initModel, holder.model);
            transApp.commit();
            jqUnit.assertDeepEq("All changes applied", {a: 1, b: 2, c: 3, d: 4}, holder.model);
        });
    };

    fluid.tests.testExternalTrans(fluid.makeHolderChangeApplier, "new applier");

    fluid.defaults("fluid.tests.FLUID4633root", {
        gradeNames: "fluid.modelComponent",
        model: {
            property1: 1,
            property2: 2
        }
    });


    jqUnit.test("FLUID-4633 test - source tracking", function () {
        var that = fluid.tests.FLUID4633root();
        var applier = that.applier;
        // This complex malarky is achieved automatically in the declarative system. The ancient source tracking system used
        // to use the call stack which we can no longer rely on now model relay will become asynchronous
        applier.modelChanged.addListener("property1", function (newValue, oldValue, path, changeRequest, transaction) {
            applier.change("property2", newValue, "ADD", ["indirectSource"].concat(Object.keys(transaction.sources)));
        });
        var listenerFired = false;
        applier.modelChanged.addListener({
            path: "property2",
            excludeSource: "originalSource"
        }, function (newValue, oldValue, path, changeRequest, transaction) {
            listenerFired = transaction.hasChangeSource("indirectSource");
        });
        applier.change("property1", 2, "ADD", "originalSource");
        jqUnit.assertFalse("Recurrence censored from originalSource", listenerFired);
        applier.change("property1", 3, "ADD", "alternateSource");
        jqUnit.assertTrue("Recurrence propagated from alternate source", listenerFired);


    });

    jqUnit.test("FLUID-4625 test: Over-broad changes", function () {
        // This tests FLUID-4625 - we don't test at the utility level of matchPath since this is the functional
        // behaviour required. In practice we may want a better implementation which explodes composite changes into
        // smaller increments so that we can avoid unnecessary notifications, but this at least covers the case
        // of missed notifications
        var model = {
            selections: {
                lineSpace: 1.0
            }
        };
        var applier = fluid.makeHolderChangeApplier({model: model});
        var notified = false;
        applier.modelChanged.addListener("selections.lineSpace", function () {
            notified = true;
        });
        applier.change("selections", {lineSpace: 1.5});
        jqUnit.assertTrue("Over-broad change triggers listener", notified);
    });


    /** FLUID-3674: New model semantic tests **/

    fluid.tests.recordChange = function (fireRecord, path, value, oldValue) {
        fireRecord.push({path: path, value: value, oldValue: oldValue});
    };

    fluid.defaults("fluid.tests.changeRecorder", {
        gradeNames: ["fluid.component"],
        members: {
            fireRecord: []
        },
        invokers: {
            record: "fluid.tests.recordChange({that}.fireRecord, {arguments}.0, {arguments}.1, {arguments}.2)"
        }
    });

    fluid.defaults("fluid.tests.fluid4258head", {
        gradeNames: ["fluid.modelComponent", "fluid.tests.changeRecorder"],
        model: {
            thing1: {
                nest1: 2,
                nest2: false
            },
            thing2: 3
        },
        events: {
            createEvent: null
        },
        invokers: {
            changeNest2: {
                changePath: "thing1.nest2",
                value: "{arguments}.0"
            },
            changeThing2: {
                changePath: "thing2",
                source: "internalSource",
                value: "{arguments}.0"
            }
        },
        components: {
            child: {
                type: "fluid.modelComponent",
                createOnEvent: "createEvent",
                options: {
                    modelListeners: {
                        "{fluid4258head}.model.thing1.nest2": {
                            excludeSource: "init",
                            func: "{fluid4258head}.record",
                            args: ["{change}.path", "{change}.value", "{change}.oldValue"]
                        }
                    },
                    invokers: {
                        changeNest2: {
                            changePath: "{fluid4258head}.model.thing1.nest2",
                            value: "{arguments}.0"
                        }
                    }
                }
            }
        },
        modelListeners: {
            "thing1.nest1": {
                func: "{that}.record",
                args: ["{change}.path", "{change}.value", "{change}.oldValue"],
                excludeSource: "init"
            },
            "thing2": {
                func: "{that}.record",
                args: "{change}.value",
                excludeSource: ["init", "internalSource"]
            }
        }
    });

    jqUnit.test("FLUID-4258 declarative listener test", function () {
        var that = fluid.tests.fluid4258head();
        function assertListenerCount(count) {
            // blatant white-box testing - make sure that the outer applier has the expected number of listeners
            jqUnit.assertEquals("Expected external model listener count ", count, that.applier.transListeners.sortedListeners.length);
        }
        assertListenerCount(2);
        that.applier.change("thing1.nest1", 3);
        jqUnit.assertDeepEq("Single change correctly reported to same component's listener",
            [{path: ["thing1", "nest1"], value: 3, oldValue: 2}], that.fireRecord);
        for (var i = 0; i < 2; ++i) {
            that.fireRecord.length = 0;
            that.events.createEvent.fire();
            assertListenerCount(3); // Make sure that 1 old listener was removed and one was added (2nd time round)
            that.changeNest2(true);
            jqUnit.assertDeepEq("Change reported to subcomponent's listener to root model - time " + (i + 1),
                [{path: ["thing1", "nest2"], value: true, oldValue: false}], that.fireRecord);
            that.child.changeNest2(false);
        }
        that.fireRecord.length = 0;
        that.changeThing2(5);
        jqUnit.assertDeepEq("Source guarded change not reported", [], that.fireRecord);
    });

    fluid.defaults("fluid.tests.changer", {
        gradeNames: ["fluid.component"],
        invokers: {
            change: {
                changePath: "{arguments}.0",
                value: "{arguments.1"
            }
        }
    });
    fluid.setLogging(true);

    fluid.defaults("fluid.tests.fluid3674head", {
        gradeNames: ["fluid.modelComponent", "fluid.tests.changer", "fluid.tests.changeRecorder"],
        model: { // test forward reference as well as transactional initialisation
            innerModel: "{child}.model.nested1"
        },
        modelListeners: {
            "innerModel": "{that}.record({change}.path, {change}.value, {change}.oldValue)"
        },
        components: {
            child: {
                type: "fluid.tests.changer",
                options: {
                    gradeNames: ["fluid.modelComponent"],
                    model: {
                        nested1: {
                            nested2: "thing"
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-3674 basic model relay test", function () {
        fluid.begun = true;
        var that = fluid.tests.fluid3674head();
        var expected = {
            innerModel: {
                nested2: "thing"
            }
        };
        jqUnit.assertDeepEq("Model successfully resolved on init", expected, that.model);
        var expected2 = {
            nested1: {
                nested2: "thing"
            }
        };
        jqUnit.assertDeepEq("Inner model successfully initialised", expected2, that.child.model);

        var expected3 = [{
            path: ["innerModel"],
            oldValue: undefined,
            value: {nested2: "thing"}
        }];
        jqUnit.assertDeepEq("Registered initial change", expected3, that.fireRecord);
        that.applier.change("innerModel", "exterior thing");
        var expected4 = {
            nested1: "exterior thing"
        };
        jqUnit.assertDeepEq("Propagated change inwards", expected4, that.child.model);
        that.child.applier.change("nested1", "interior thing");
        var expected5 = {
            innerModel: "interior thing"
        };
        jqUnit.assertDeepEq("Propagated change outwards", expected5, that.model);
    });


    fluid.tests.fluid3674childRecord = function (that, newModel) {
        that.parentInitModel = newModel;
    };

    fluid.defaults("fluid.tests.fluid3674eventHead", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            outerModel: "outerValue"
        },
        events: {
            createEvent: null
        },
        components: {
            child: {
                type: "fluid.modelComponent",
                createOnEvent: "createEvent",
                options: {
                    model: "{fluid3674eventHead}.model.outerModel"
                }
            },
            child2: {
                type: "fluid.modelComponent",
                options: {
                    modelListeners: {
                        "{fluid3674eventHead}.model": "fluid.tests.fluid3674childRecord({that}, {change}.value)"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-3674 event coordination test", function () {
        var that = fluid.tests.fluid3674eventHead();
        that.events.createEvent.fire();
        var child = that.child;
        jqUnit.assertEquals("Outer model propagated inwards on creation", "outerValue", child.model);
        jqUnit.assertDeepEq("Outer model propagated to bare listener inwards on creation", that.model, that.child2.parentInitModel);

        that.applier.change("outerModel", "exterior thing");
        jqUnit.assertEquals("Propagated change inwards through relay", "exterior thing", child.model);
        child.applier.change("", "interior thing");
        jqUnit.assertDeepEq("Propagated change outwards through relay", {outerModel: "interior thing"}, that.model);
        child.destroy();
        that.applier.change("outerModel", "exterior thing 2");
        jqUnit.assertEquals("No change propagated inwards to destroyed component", "interior thing", child.model);
        child.applier.change("", "interior thing 2");
        jqUnit.assertDeepEq("No change propagated outwards from destroyed component", {outerModel: "exterior thing 2"}, that.model);
    });

    fluid.defaults("fluid.tests.allChangeRecorder", {
        gradeNames: "fluid.tests.changeRecorder",
        modelListeners: {
            "": "{that}.record({change}.path, {change}.value, {change}.oldValue)"
        }
    });

    fluid.defaults("fluid.tests.fluid5024head", {
        gradeNames: ["fluid.component"],
        components: {
            child1: {
                type: "fluid.modelComponent",
                options: {
                    gradeNames: ["fluid.tests.allChangeRecorder"],
                    model: {
                        celsius: 22
                    },
                    modelRelay: {
                        source: "{that}.model.celsius",
                        target: "{child2}.model.fahrenheit",
                        singleTransform: {
                            type: "fluid.transforms.linearScale",
                            factor: 9 / 5,
                            offset: 32
                        }
                    }
                }
            },
            child2: {
                type: "fluid.modelComponent",
                options: { // no options: model will be initialised via relay
                    gradeNames: ["fluid.tests.allChangeRecorder"]
                }
            }
        }
    });

    fluid.tests.checkNearSuperset = function (model1, model2) {
        var holder1 = {model: fluid.copy(model1)};
        var request = {type: "ADD", segs: [], value: fluid.copy(model2)};
        var options = {changes: 0, changeMap: {}};
        fluid.model.applyHolderChangeRequest(holder1, request, options);
        return $.isEmptyObject(options.changeMap);
    };

    // This utility applies the same "floating point slop" testing as the ChangeApplier in order to determine that models
    // holding approximately equal numerical values are deep equal
    fluid.tests.checkNearEquality = function (message, model1, model2) {
        var supersetL = fluid.tests.checkNearSuperset(model1, model2);
        var supersetR = fluid.tests.checkNearSuperset(model2, model1);
        var equal = supersetL && supersetR;
        jqUnit.assertTrue(message + " expected: " + JSON.stringify(model1) + " actual: " + JSON.stringify(model2), equal);
    };

    fluid.tests.fluid5024clear = function (that) {
        that.child1.fireRecord.length = 0;
        that.child2.fireRecord.length = 0;
        if (that.child3) {
            that.child3.fireRecord.length = 0;
        }
    };

    fluid.tests.assertTransactionsConcluded = function (that) {
        // White box testing: use knowledge of the ChangeApplier's implementation to determine that all transactions have been cleaned up
        var instantiator = fluid.getInstantiator(that);
        var anyKeys;
        var key;
        for (key in instantiator.modelTransactions) {
            if (key !== "init") {
                anyKeys = key;
            }
        }
        for (key in instantiator.modelTransactions.init) {
            anyKeys = key;
        }

        jqUnit.assertNoValue("All model transactions concluded", anyKeys);
    };

    jqUnit.test("FLUID-5024: Model relay with model transformation", function () {
        var that = fluid.tests.fluid5024head();
        fluid.tests.assertTransactionsConcluded(that);

        function expectChanges(message, child1Record, child2Record) {
            fluid.tests.checkNearEquality(message + " change record child 1", child1Record, that.child1.fireRecord);
            fluid.tests.checkNearEquality(message + " change record child 2", child2Record, that.child2.fireRecord);
            fluid.tests.fluid5024clear(that);
        }

        var ttInF = 22 * 9 / 5 + 32;
        jqUnit.assertEquals("Transformed celsius into fahrenheit on init", ttInF, that.child2.model.fahrenheit);
        expectChanges("Acquired initial",
            [{path: [], value: {celsius: 22}, oldValue: undefined}],
            [{path: [], value: {fahrenheit: ttInF}, oldValue: undefined}]);

        that.child2.applier.change("fahrenheit", 451);
        var ffoInC = (451 - 32) * 5 / 9;
        expectChanges("Reverse transform propagated",
            [{path: [], value: {celsius: ffoInC}, oldValue: {celsius: 22}}],
            [{path: [], value: {fahrenheit: 451}, oldValue: {fahrenheit: ttInF}}]);
        jqUnit.assertTrue("Reverse transformed value arrived", fluid.model.isSameValue(ffoInC, that.child1.model.celsius));

        that.child1.applier.change("celsius", 20);
        expectChanges("Reverse transform propagated",
            [{path: [], value: {celsius: 20}, oldValue: {celsius: ffoInC}}],
            [{path: [], value: {fahrenheit: 68}, oldValue: {fahrenheit: 451}}]);
        jqUnit.assertEquals("Forward transformed value arrived", 68, that.child2.model.fahrenheit);

        fluid.tests.assertTransactionsConcluded(that);
    });

    /** FLUID-5361 listener order notification test **/

    fluid.tests.priorityRecorder = function (that, priority) {
        that.priorityLog.push(priority);
    };

    fluid.tests.recordAndDestroy = function (head, priority, that) {
        head.priorityLog.push(priority);
        if (head.destroyNow) {
            that.applier.modelChanged.removeListener("priority2");
        }
    };

    fluid.defaults("fluid.tests.fluid5361head", {
        gradeNames: ["fluid.tests.fluid5024head"],
        members: {
            priorityLog: []
        },
        invokers: {
            recordPriority: "fluid.tests.priorityRecorder"
        },
        components: {
            child1: {
                options: {
                    modelListeners: {
                        celsius: [{
                            func: "{fluid5361head}.recordPriority",
                            priority: 1,
                            namespace: "priority1",
                            args: ["{fluid5361head}", 1, "{that}"]
                        }, {
                            func: "{fluid5361head}.recordPriority",
                            priority: 2,
                            namespace: "priority2",
                            args: ["{fluid5361head}", 2, "{that}"]
                        }, {
                            func: "{fluid5361head}.recordPriority",
                            priority: "last",
                            args: ["{fluid5361head}", "last", "{that}"]
                        }
                        ]
                    }
                }
            },
            child2: {
                options: {
                    modelListeners: {
                        "fahrenheit": [{
                            func: "{fluid5361head}.recordPriority",
                            priority: 1,
                            args: ["{fluid5361head}", 1, "{that}"]
                        }, {
                            func: "{fluid5361head}.recordPriority",
                            priority: 2,
                            namespace: "priority2",
                            args: ["{fluid5361head}", 2, "{that}"]
                        }, {
                            func: "{fluid5361head}.recordPriority",
                            priority: "last",
                            args: ["{fluid5361head}", "last", "{that}"]
                        }
                        ]
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5361destroyingHead", {
        gradeNames: ["fluid.tests.fluid5361head"],
        invokers: {
            recordPriority: "fluid.tests.recordAndDestroy"
        }
    });

    jqUnit.test("FLUID-5361: Global sorting of listeners by priority", function () {
        var that = fluid.tests.fluid5361head();
        that.priorityLog = [];
        that.child1.applier.change("celsius", 25);
        var expected = [2, 2, 1, 1, "last", "last"];
        jqUnit.assertDeepEq("Model notifications globally sorted by priority", expected, that.priorityLog);

        var that2 = fluid.tests.fluid5361destroyingHead();
        that2.priorityLog = [];
        that2.destroyNow = true;
        that2.child1.applier.change("celsius", 25);

        jqUnit.assertDeepEq("Model notifications globally sorted by priority, with frozen listener removal", expected, that2.priorityLog);
        that2.priorityLog = [];
        that2.child1.applier.change("celsius", 30);
        var expected2 = [1, 1, "last", "last"];
        jqUnit.assertDeepEq("Model notifications globally sorted by priority, with actioned listener removal", expected2, that2.priorityLog);
    });

    /** FLUID-5886: Deduplication of listeners by namespace at a single applier **/

    fluid.defaults("fluid.tests.fluid5886head", {
        gradeNames: "fluid.modelComponent",
        members: {
            listenerCount: 0
        },
        modelListeners: {
            target: [{
                namespace: "deduplicate",
                funcName: "fluid.tests.fluid5886count",
                args: "{that}"
            }, {
                namespace: "deduplicate",
                funcName: "fluid.tests.fluid5886count",
                args: "{that}"
            }]
        }
    });

    fluid.tests.fluid5886count = function (that) {
        that.listenerCount++;
    };

    jqUnit.test("FLUID-5886: Deduplication of model listeners by namespace at single applier", function () {
        var that = fluid.tests.fluid5886head();
        that.applier.change("target", true);
        jqUnit.assertEquals("Just one listener registered", 1, that.listenerCount);
    });

    /** FLUID-6111: Model merging with numeric property named "length" **/

    fluid.defaults("fluid.tests.fluid6111head", {
        gradeNames: "fluid.modelComponent",
        model: {
            name: "ABCD",
            length: 14
        }
    });

    jqUnit.test("FLUID-6111: Model merging with numeric property named \"length\"", function () {
        var that = fluid.tests.fluid6111head({
            model: {
                duration: 34
            }
        });
        var baseModel = {
            name: "ABCD",
            length: 14
        };
        jqUnit.assertLeftHand("Expected original model contents", baseModel, that.model);
    });

    /** FLUID-5695: New-style multiple paths and namespaces for model listeners **/

    fluid.defaults("fluid.tests.fluid5695root", {
        gradeNames: "fluid.modelComponent",
        model: {
            position: 30,
            irrelevantValue: false,
            windowHolders: {
                mainWindow: {
                    x: 20,
                    y: 30
                },
                otherWindow: {
                    x: 30,
                    y: 90
                }
            }
        },
        modelListeners: {
            checkBefore: {
                path: "position",
                priority: "before:layoutListener",
                excludeSource: "init",
                listener: "fluid.tests.fluid5695checkBefore",
                args: "{that}"
            },
            notifyExternal: {
                path: "windowHolders.mainWindow.x",
                excludeSource: "init",
                listener: "fluid.tests.fluid5695checkAfter",
                args: "{that}"
            },
            layoutListener: { // This becomes the namespace of the listener
                path: [
                    "position", {
                        segs: ["windowHolders", "{that}.options.ourWindow"]
                    }
                ],
                priority: "before:notifyExternal",
                func: "{that}.refreshView",
                args: ["{change}.value", "{change}.oldValue"]
            }
        },
        members: {
            refreshes: 0
        },
        invokers: {
            refreshView: "fluid.tests.fluid5695record({that}, {arguments}.0)"
        },
        ourWindow: "mainWindow"
    });

    fluid.tests.fluid5695record = function (that, newValue) {
        that.refreshes ++;
        that.frozenModel = fluid.copy(newValue);
    };

    fluid.tests.fluid5695checkBefore = function (that) {
        jqUnit.assertEquals("Notified before refreshView in priority order", 1, that.refreshes);
    };

    fluid.tests.fluid5695checkAfter = function (that) {
        jqUnit.assertEquals("Notified after refreshView in priority order", 3, that.refreshes);
    };

    jqUnit.test("FLUID-5695: Complex specification of paths and namespaces for model listeners", function () {
        jqUnit.expect(7);
        var that = fluid.tests.fluid5695root();
        jqUnit.assertEquals("Captured initial transition for initial transaction", 1, that.refreshes);
        that.applier.change("position", 40);
        jqUnit.assertEquals("Invalidated by change in position field", 2, that.refreshes);
        jqUnit.assertLeftHand("Captured model by argument", {position: 40}, that.frozenModel);
        that.applier.change("windowHolders.mainWindow.x", 30);
        jqUnit.assertEquals("Invalidated by change in position field", 3, that.refreshes);
        jqUnit.assertDeepEq("Captured model by argument", {x: 30, y: 30}, that.frozenModel.windowHolders.mainWindow);
    });

    /** FLUID-6127: Wildcards in modelListeners, and support for deletion **/

    fluid.defaults("fluid.tests.fluid6127root", {
        gradeNames: ["fluid.modelComponent", "fluid.tests.changeRecorder"],
        modelListeners: {
            wildcardy: {
                path: "idToPath.*",
                excludeSource: "init",
                listener: "{that}.record", // TODO: support compact form here
                args: ["{change}.path", "{change}.value", "{change}.oldValue"]
            }
        },
        model: {
            idToPath: {
                first: 1
            }
        }
    });

    fluid.tests.fluid6127fixtures = [{
        change: {
            type: "ADD",
            path: "",
            value: {
                idToPath: {
                    first: 2,
                    second: 2
                }
            }
        },
        expected: [{
            path: ["idToPath", "first"],
            oldValue: 1,
            value: 2
        }, {
            path: ["idToPath", "second"],
            oldValue: undefined,
            value: 2
        }]
    }, {
        change: {
            type: "DELETE",
            path: ""
        },
        expected: [{
            path: ["idToPath", "first"],
            oldValue: 1,
            value: undefined
        }]
    }, {
        change: {
            type: "DELETE",
            path: "idToPath.first"
        },
        expected: [{
            path: ["idToPath", "first"],
            oldValue: 1,
            value: undefined
        }]
    }, {
        initialModel: {
            idToPath: {
                second: 2
            }
        },
        change: {
            type: "DELETE",
            path: ""
        },
        expected: [{
            path: ["idToPath", "first"],
            oldValue: 1,
            value: undefined
        }, {
            path: ["idToPath", "second"],
            oldValue: 2,
            value: undefined
        }]
    }];

    jqUnit.test("FLUID-6127: Wildcards in modelListeners, with deletion support", function () {
        fluid.each(fluid.tests.fluid6127fixtures, function (fixture, index) {
            var root = fluid.tests.fluid6127root({
                model: fixture.initialModel
            });
            root.applier.fireChangeRequest(fixture.change);
            jqUnit.assertDeepEq("Expected fire record for fixture " + index, fixture.expected, root.fireRecord);
            root.destroy();
        });
    });

    /** FLUID-5866: Global priorities mediated without "priorityHolder" component **/

    fluid.defaults("fluid.tests.fluid5866root", {
        gradeNames: "fluid.modelComponent",
        components: {
            notifier: {
                type: "fluid.modelComponent",
                options: {
                    model: {
                        position: "{fluid5866root}.model.position"
                    },
                    modelListeners: {
                        position: {
                            priority: "after:repaint",
                            namespace: "notifyExternal",
                            func: "fluid.tests.recordFire",
                            excludeSource: "init",
                            args: ["{fluid5866root}", "notifyExternal"]
                        }
                    }
                }
            },
            computer: {
                type: "fluid.modelComponent",
                options: {
                    model: {
                        position: "{fluid5866root}.model.position"
                    },
                    modelListeners: {
                        position: {
                            namespace: "compute",
                            priority: "before:repaint",
                            func: "fluid.tests.recordFire",
                            excludeSource: "init",
                            args: ["{fluid5866root}", "compute"]
                        }
                    }
                }
            }
        },
        members: {
            fireRecord: []
        },
        model: {
            position: 10
        },
        modelListeners: {
            position: {
                namespace: "repaint",
                func: "fluid.tests.recordFire",
                excludeSource: "init",
                args: ["{that}", "repaint"]
            }
        }
    });

    jqUnit.test("FLUID-5866: Global priorities mediated without \"priorityHolder\" component", function () {
        var that = fluid.tests.fluid5866root();
        that.applier.change("position", 20);
        jqUnit.assertDeepEq("Global listeners notified in priority order",
            ["compute", "repaint", "notifyExternal"], that.fireRecord);
    });

    /** FLUID-5865: Priorities for relay rules **/

    fluid.defaults("fluid.tests.fluid5865.root", {
        gradeNames: "fluid.modelComponent",
        model: {
            position: 50,
            screenChaundles: 100,
            visWindow: {
                start: 500,
                end: 1500,
                step: 10
            },
            dataRange: {
                start: 0,
                end: 2000,
                step: "{that}.model.visWindow.step"
            }
        },
        modelRelay: {
            positionToVis: {
                target: "visWindow",
                singleTransform: {
                    type: "fluid.tests.fluid5865.positionToVis",
                    input: {
                        screenChaundles: "{that}.model.screenChaundles",
                        position: "{that}.model.position",
                        dataRange: "{that}.model.dataRange"
                    }
                }
            },
            rescalePosition: {
                target: "position",
                singleTransform: {
                    type: "fluid.tests.fluid5865.rescalePosition",
                    input: {
                        screenChaundles: "{that}.model.screenChaundles",
                        visWindow: "{that}.model.visWindow",
                        dataRange: "{that}.model.dataRange"
                    }
                },
                priority: "before:positionToVis"
            }
        }
    });

    fluid.tests.getWindowMidpoint = function (w) {
        return (w.start + w.end) / 2;
    };

    fluid.tests.fluid5865.positionToVis = function (model) {
        var dataRange = model.dataRange,
            position = model.position;
        // that.model.position holds scrollbar's index, which is between 0 and dataRange width / step
        if (!dataRange || dataRange.start === undefined) {
            return;
        }
        var visStart = dataRange.start + position * dataRange.step;
        var visWindow = {
            start: visStart,
            end: visStart + dataRange.step * model.screenChaundles,
            step: dataRange.step
        };
        return visWindow;
    };

    fluid.tests.fluid5865.rescalePosition = function (model) {
        if (model.visWindow) {
            var dataRange = model.dataRange;
            var midpoint = fluid.tests.getWindowMidpoint(model.visWindow);
            var newStart = midpoint - dataRange.step * model.screenChaundles / 2;
            var newPosition = (newStart - dataRange.start) / dataRange.step;
            return newPosition;
        }
    };

    jqUnit.test("FLUID-5865: Priorities and namespaces for model relay rules", function () {
        var that = fluid.tests.fluid5865.root();
        that.applier.change("dataRange.step", 20);
        var expected = {
            position: 0,
            visWindow: {
                start: 0,
                end: 2000,
                step: 20
            }
        };
        jqUnit.assertLeftHand("Model updated in coordinated way", expected, that.model);
    });

    /** FLUID-5869: Error when recreating model relay component during existing transaction **/

    fluid.defaults("fluid.tests.fluid5869.root", {
        gradeNames: "fluid.modelComponent",
        model: {
            sharedValue: 35,
            reactiveValue: 10
        },
        modelListeners: {
            "": "fluid.tests.fluid5869.recreate({that})"
        },
        events: {
            createRelay: null
        },
        components: {
            relayHolder: {
                type: "fluid.modelComponent",
                createOnEvent: "createRelay",
                options: {
                    model: {
                        sharedValue: 55
                    },
                    modelRelay: {
                        source: "{root}.model.sharedValue",
                        target: "sharedValue",
                        singleTransform: {
                            type: "fluid.transforms.identity"
                        }
                    },
                    components: {
                        nestedHolder: {
                            type: "fluid.modelComponent",
                            options: {
                                model: {
                                    nestedValue: "{root}.model.sharedValue"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.tests.fluid5869.recreate = function (that) {
        that.events.createRelay.fire(); // The aim here is to create a self-reaction during the init transaction of the recreated component
    };

    jqUnit.test("FLUID-5869: Error when recreating model relay component during transaction", function () {
        var that = fluid.tests.fluid5869.root();
        that.events.createRelay.fire();
        that.applier.change("sharedValue", null, "DELETE");
        jqUnit.assertEquals("Successfully relayed back nested default model value", 55, that.model.sharedValue);
        jqUnit.assertEquals("Successfully relayed inwards nested default model value", 55, that.relayHolder.nestedHolder.model.nestedValue);
    });

    /** FLUID-5848: Detect indirect references to component models (at components nested one or more levels below context of reference) **/

    fluid.defaults("fluid.tests.fluid5848root", {
        gradeNames: "fluid.modelComponent",
        model: {
            value: "{that}.childModel.model.value"
        },
        members: {
            changes: 0
        },
        modelListeners: {
            "{that}.childModel.model.value": "fluid.tests.fluid5848record({that})"
        },
        components: {
            childModel: {
                type: "fluid.modelComponent",
                options: {
                    model: {
                        value: 20
                    }
                }
            }
        }
    });

    fluid.tests.fluid5848record = function (that) {
        ++that.changes;
    };

    jqUnit.test("FLUID-5848: Model reference using indirect context", function () {
        var that = fluid.tests.fluid5848root();
        jqUnit.assertEquals("Synchronised value on startup", 20, that.model.value);
        jqUnit.assertEquals("One change on startup", 1, that.changes);
        that.childModel.applier.change("value", 30);
        jqUnit.assertEquals("Relay relationship set up via indirect context", 30, that.model.value);
        jqUnit.assertEquals("Two changes after change", 2, that.changes);
    });

    /** FLUID-5847: Relay transforms which have both "source" and a transform model dependency **/

    fluid.defaults("fluid.tests.fluid5847.root", {
        gradeNames: "fluid.modelComponent",
        model: {
            source: 35,
            sideValue: 50
        },
        modelRelay: {
            source: "source",
            target: "target",
            singleTransform: {
                type: "fluid.transforms.identity",
                sideValue: "{that}.model.sideValue"
            }
        }
    });

    jqUnit.test("FLUID-5847: Relay transforms with both \"source\" and transform model dependency", function () {
        // TODO: in theory, we could detect this at fluid.defaults() time, with a lot more work
        jqUnit.expectFrameworkDiagnostic("Framework diagnostic for relay with both source and transform model dependency", function () {
            fluid.tests.fluid5847.root();
        }, "source");
    });

    /** Demonstrate resolving a set of model references which is cyclic in components (although not in values), as well as
     * double relay and longer "transform" form of relay specification */

    fluid.defaults("fluid.tests.fluid5024cycleHead", {
        gradeNames: ["fluid.component"],
        components: {
            child1: {
                type: "fluid.modelComponent",
                options : {
                    gradeNames: ["fluid.tests.allChangeRecorder"],
                    model: {
                        forwardValue: "{child2}.model.child2Area",
                        backwardValue: 97
                    }
                }
            },
            child2: {
                type: "fluid.modelComponent",
                options : {
                    gradeNames: ["fluid.tests.allChangeRecorder"],
                    model: {
                    },
                    modelRelay: {
                        source: "{that}.model.child2Area",
                        target: "{child3}.model.lastArea",
                        transform: {
                            transform: {
                                inputPath: "",
                                type: "fluid.transforms.linearScale",
                                factor: 10
                            }
                        }
                    }
                }
            },
            child3: {
                type: "fluid.modelComponent",
                options : {
                    gradeNames: ["fluid.tests.allChangeRecorder"],
                    model: {
                        lastArea: 35,
                        backwardRef: "{child1}.model.backwardValue"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5024: Resolving references which are cyclic in components", function () {
        var that = fluid.tests.fluid5024cycleHead();

        function expectChanges(message, child1Record, child2Record, child3Record) {
            fluid.tests.checkNearEquality(message + " change record child 1", child1Record, that.child1.fireRecord);
            fluid.tests.checkNearEquality(message + " change record child 2", child2Record, that.child2.fireRecord);
            fluid.tests.checkNearEquality(message + " change record child 3", child3Record, that.child3.fireRecord);
            fluid.tests.fluid5024clear(that);
        }

        expectChanges("Initial values", [{
            path: [],
            value: {forwardValue: 3.5, backwardValue: 97},
            oldValue: undefined
        }], [{
            path: [],
            value: {child2Area: 3.5},
            oldValue: undefined
        }], [{
            path: [],
            value: {lastArea: 35, backwardRef: 97},
            oldValue: undefined
        }]);

        that.child3.applier.change("lastArea", 25);

        expectChanges("Propagated linked change", [{
            path: [],
            value: {forwardValue: 2.5, backwardValue: 97},
            oldValue: {forwardValue: 3.5, backwardValue: 97}
        }], [{
            path: [],
            value: {child2Area: 2.5},
            oldValue: {child2Area: 3.5}
        }], [{
            path: [],
            value: {lastArea: 25, backwardRef: 97},
            oldValue: {lastArea: 35, backwardRef: 97}
        }]);

        that.child1.applier.change("backwardValue", 77);

        expectChanges("Propagated backward change", [{
            path: [],
            value: {forwardValue: 2.5, backwardValue: 77},
            oldValue: {forwardValue: 2.5, backwardValue: 97}
        }],
        [],
        [{
            path: [],
            value: {lastArea: 25, backwardRef: 77},
            oldValue: {lastArea: 25, backwardRef: 97}
        }]);
    });

    jqUnit.test("FLUID-5151: One single listener function hooked up for multiple model paths only has the last call registered succesfully", function () {
        var holder = {
            model:  {
                path1: null,
                path2: null
            }
        };
        var applier = fluid.makeHolderChangeApplier(holder);

        var currentPath = null;
        var listenerToFire = function (newModel, oldModel, path) {
            currentPath = path;
        };

        applier.modelChanged.addListener("path1", listenerToFire);
        applier.modelChanged.addListener("path2", listenerToFire);

        var triggerChangeRequest = function (fireOn) {
            applier.change(fireOn, fireOn);
            jqUnit.assertDeepEq("The listener registered for model path " + fireOn + " has been fired", [fireOn], currentPath);
        };

        triggerChangeRequest("path1");
        triggerChangeRequest("path2");
    });

    /** FLUID-5045: model transformation documents contextualised by IoC expressions for model relay **/

    // This tests replicates the setup for the Pager's model which historically was implemented using (and drove the
    // development of) the old broken "guards/postGuards" validation-semantic system

    // Taken from Pager.js
    // 10 -> 1, 11 -> 2
    fluid.tests.computePageCount = function (model) {
        return Math.max(1, Math.floor((model.totalRange - 1) / model.pageSize) + 1);
    };

    fluid.defaults("fluid.tests.fluid5045root", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            pageIndex: 0,
            pageSize: 10,
            totalRange: 75
        },
        modelRelay: [{
            target: "pageCount",
            singleTransform: {
                type: "fluid.transforms.free",
                args: {
                    "totalRange": "{that}.model.totalRange",
                    "pageSize": "{that}.model.pageSize"
                },
                func: "fluid.tests.computePageCount"
            }
        }, {
            target: "pageIndex",
            singleTransform: {
                type: "fluid.transforms.limitRange",
                input: "{that}.model.pageIndex",
                min: 0,
                max: "{that}.model.pageCount",
                excludeMax: 1
            }
        }
        ]
    });

    jqUnit.test("FLUID-5045: Model transformation documents contextualised by IoC expressions for model relay", function () {
        var that = fluid.tests.fluid5045root();
        var expected = {pageIndex: 0, pageSize: 10, totalRange: 75, pageCount: 8};
        jqUnit.assertDeepEq("pageCount computed correctly on init", expected, that.model);
        fluid.tests.assertTransactionsConcluded(that);

        that.applier.change("pageIndex", -1);
        jqUnit.assertDeepEq("pageIndex clamped to 0", expected, that.model);
        fluid.tests.assertTransactionsConcluded(that);

        that.applier.change("pageIndex", -1);
        jqUnit.assertDeepEq("pageIndex clamped to 0 second time", expected, that.model);
        fluid.tests.assertTransactionsConcluded(that);

        that.applier.change("pageIndex", 8);
        var expected2 = {pageIndex: 7, pageSize: 10, totalRange: 75, pageCount: 8};
        jqUnit.assertDeepEq("pageIndex clamped to pageCount - 1", expected2, that.model);
        that.applier.change("totalRange", 30);
        var expected3 = {pageIndex: 2, pageSize: 10, totalRange: 30, pageCount: 3};
        jqUnit.assertDeepEq("Recalculation of pageCount and invalidation of pageIndex", expected3, that.model);
        that.applier.change("", {pageIndex: 20, totalRange: 25, pageSize: 5, pageCount: 99});
        var expected4 = {pageCount: 5, pageIndex: 4, totalRange: 25, pageSize:5};
        jqUnit.assertDeepEq("Total invalidation", expected4, that.model);
    });

    /** FLUID-5397: Mouse droppings within relay documents in complex cases **/

    fluid.defaults("fluid.tests.fluid5397root", {
        gradeNames: ["fluid.tests.fluid5045root"],
        model: {
            pageSize: 20,
            totalRange: 164
        }
    });

    jqUnit.test("FLUID-5397: Mouse droppings within relay documents accrete over time", function () {
        var that = fluid.tests.fluid5397root();
        that.applier.change("pageSize", 10);
        that.applier.change("pageSize", 20);
        that.applier.change("pageSize", 10);
        that.applier.change("pageIndex", 16);
        fluid.tests.assertTransactionsConcluded(that);
        var expected = {
            pageIndex: 16,
            pageCount: 17,
            pageSize: 10,
            totalRange: 164
        };
        jqUnit.assertDeepEq("Model allows last page", expected, that.model);
    });

    // FLUID-5270: The model is not transformed when the "modelRelay" option is defined in the target component
    fluid.defaults("fluid.tests.fluid5270OnSource", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            celsius: 22
        },
        modelRelay: {
            source: "{that}.model.celsius",
            target: "{sub}.model.fahrenheit",
            singleTransform: {
                type: "fluid.transforms.linearScale",
                factor: 9 / 5,
                offset: 32
            }
        },
        components: {
            sub: {
                type: "fluid.modelComponent"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5270OnTarget", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            celsius: 22
        },
        components: {
            sub: {
                type: "fluid.modelComponent",
                options: {
                    modelRelay: {
                        source: "{fluid5270OnTarget}.model.celsius",
                        target: "{that}.model.fahrenheit",
                        singleTransform: {
                            type: "fluid.transforms.linearScale",
                            factor: 9 / 5,
                            offset: 32
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5270: Transforming relay from child to parent", function () {
        var thatOnSource = fluid.tests.fluid5270OnSource();
        var thatOnTarget = fluid.tests.fluid5270OnTarget(),
            expectedValue = 22 * 9 / 5 + 32;

        jqUnit.assertDeepEq("The target model is transformed properly - modelRelay on the source component", expectedValue, thatOnSource.sub.model.fahrenheit);
        jqUnit.assertDeepEq("The target model is transformed properly - modelRelay on the target component", expectedValue, thatOnTarget.sub.model.fahrenheit);
    });

    // FLUID-5293: The model relay using "fluid.transforms.arrayToSetMembership" isn't transformed properly
    fluid.defaults("fluid.tests.fluid5293", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            accessibilityHazard: []
        },
        modelRelay: [{
            source: "{that}.model.accessibilityHazard",
            target: "{that}.model.modelInTransit",
            singleTransform: {
                type: "fluid.transforms.arrayToSetMembership",
                options: {
                    "flashing": "flashing",
                    "noflashing": "noflashing"
                }
            }
        }],
        components: {
            sub: {
                type: "fluid.modelComponent",
                options: {
                    model: {
                        accessibilityHazard: "{fluid5293}.model.accessibilityHazard",
                        highContrast: "{fluid5293}.model.modelInTransit.flashing",
                        signLanguage: "{fluid5293}.model.modelInTransit.noflashing"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5293: Model relay and transformation for array elements", function () {
        var that = fluid.tests.fluid5293();
        var expectedModel = {
            accessibilityHazard: [],
            modelInTransit: {
                flashing: false,
                noflashing: false
            }
        };

        jqUnit.assertDeepEq("The initial forward transformation is performed properly", expectedModel, that.model);

        var expectedModelAfterChangeRequest = {
            accessibilityHazard: ["flashing", "noflashing"],
            modelInTransit: {
                flashing: true,
                noflashing: true
            }
        };

        that.applier.change("modelInTransit.flashing", true);
        that.applier.change("modelInTransit.noflashing", true);
        jqUnit.assertDeepEq("The backward transformation to add array values is performed properly", expectedModelAfterChangeRequest, that.model);

        that.applier.change("modelInTransit.flashing", false);
        that.applier.change("modelInTransit.noflashing", false);
        jqUnit.assertDeepEq("The backward transformation to remove array values is performed properly", expectedModel, that.model);

        var expectedSubcomponentModel = {
            accessibilityHazard: ["flashing", "noflashing"],
            highContrast: true,
            signLanguage: true
        };
        that.applier.change("accessibilityHazard", ["flashing", "noflashing"]);
        jqUnit.assertDeepEq("The transformation from array elements to the intermediary object is performed properly", expectedModelAfterChangeRequest, that.model);
        jqUnit.assertDeepEq("The change request on the model array element is properly relayed and transformed to the subcomponent", expectedSubcomponentModel, that.sub.model);
    });

    /** FLUID-5358 - Use of arbitrary functions and fluid.transforms.identity **/

    fluid.tests.fluid5358Multiply = function (a) {
        return a * 2;
    };

    fluid.defaults("fluid.tests.fluid5358root", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            baseValue: 1,
            identityValue: 2
        },
        modelRelay: [{
            source: "baseValue",
            target: "{sub}.model.multipliedValue",
            singleTransform: {
                type: "fluid.tests.fluid5358Multiply"
            }
        }, {
            source: "identityValue",
            target: "{sub}.model.identityValue",
            singleTransform: {
                type: "fluid.transforms.identity"
            }
        }
        ],
        components: {
            sub: {
                type: "fluid.modelComponent"
            }
        }
    });

    jqUnit.test("FLUID-5358: Use of arbitrary functions for relay and fluid.transforms.identity", function () {
        var that = fluid.tests.fluid5358root();
        jqUnit.assertEquals("Transformed using free multiply", 2, that.sub.model.multipliedValue);
        that.sub.applier.change("multipliedValue", 4);
        jqUnit.assertEquals("No corruption of linked value for noninvertible transform", 1, that.model.baseValue);
        jqUnit.assertEquals("Transformed using identity relay", 2, that.sub.model.identityValue);
        that.sub.applier.change("identityValue", 1);
        jqUnit.assertEquals("Identity relay inverted correctly", 1, that.model.identityValue);
    });

    // FLUID-5368: Using "fluid.transforms.arrayToSetMembership" with any other transforms in modelRelay option causes the source array value to be missing

    fluid.defaults("fluid.tests.fluid5368root", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            forArrayToSetMembership: ["value1"],
            forIdentity: ["value2"]
        },
        modelRelay: [{
            source: "forIdentity",
            target: "modelInTransit.forIdentity",
            singleTransform: {
                type: "fluid.transforms.identity"
            }
        }, {
            source: "forArrayToSetMembership",
            target: "modelInTransit",
            backward: "liveOnly",
            singleTransform: {
                type: "fluid.transforms.arrayToSetMembership",
                options: {
                    "value1": "value1"
                }
            }
        }]
    });

    jqUnit.test("FLUID-5368: Using fluid.transforms.arrayToSetMembership with other transformations in modelRelay option", function () {
        var that = fluid.tests.fluid5368root();

        var expectedModel = {
            forArrayToSetMembership: ["value1"],
            forIdentity: ["value2"],
            modelInTransit: {
                value1: true,
                forIdentity: ["value2"]
            }
        };

        jqUnit.assertDeepEq("The input model is merged with the default model", expectedModel, that.model);
    });

    // FLUID-5371: Model relay directives "forward" and "backward"

    fluid.defaults("fluid.tests.fluid5371root", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            forwardOnly: 3,
            forwardOnlyTarget: 3.5,
            backwardOnly: 5,
            backwardOnlySource: 5.5,
            liveOnly: 7
        },
        modelRelay: [{
            source: "forwardOnly",
            target: "forwardOnlyTarget",
            backward: "never",
            singleTransform: {
                type: "fluid.transforms.identity"
            }
        }, {
            source: "backwardOnlySource",
            target: "backwardOnly",
            forward: "never",
            singleTransform: {
                type: "fluid.transforms.identity"
            }
        }, {
            source: "liveOnly",
            target: "liveOnlyTarget",
            forward: "liveOnly",
            singleTransform: {
                type: "fluid.transforms.identity"
            }
        }]
    });

    jqUnit.test("FLUID-5371: Model relay directives \"forward\" and \"backward\"", function () {
        var that = fluid.tests.fluid5371root();
        jqUnit.assertEquals("Forward init relay with backward never", 3, that.model.forwardOnlyTarget);
        that.applier.change("forwardOnly", 4);
        jqUnit.assertEquals("Forward live relay with backward never", 4, that.model.forwardOnlyTarget);
        jqUnit.assertEquals("No init relay with liveOnly forward", undefined, that.model.liveOnlyTarget);

        that.applier.change("forwardOnlyTarget", 4.5);
        jqUnit.assert("No backward live relay with backward never", 4, that.model.forwardOnly);

        jqUnit.assertEquals("Backward init relay with forward never", 5, that.model.backwardOnlySource);
        that.applier.change("backwardOnly", 6);
        jqUnit.assert("Backward live relay with forward never", 6, that.model.backwardOnlySource);

        that.applier.change("backwardOnlySource", 6.5);
        jqUnit.assert("No forward live relay with forward never", 6, that.model.backwardOnly);

        that.applier.change("liveOnly", 8);
        jqUnit.assertEquals("Forward relay with liveOnly forward", 8, that.model.liveOnlyTarget);
        that.applier.change("liveOnlyTarget", 9);
        jqUnit.assertEquals("Backward relay with liveOnly forward", 9, that.model.liveOnly);
    });

    // FLUID-5489: Avoid all cases of notifying listeners of changes which are null from their point of view

    fluid.tests.fluid5489diff = [ {
        modela: undefined,
        modelb: "thing",
        eq: false,
        options: {
            changeMap: "ADD",
            changes: 1
        }
    }, {
        modela: "thing",
        modelb: undefined,
        eq: false,
        options: {
            changeMap: "DELETE",
            changes: 1
        }
    }, {
        modela: "thing",
        modelb: "thing",
        eq: true,
        options: {
            changeMap: {},
            changes: 0
        }
    }, {
        modela: 1,
        modelb: 1 + 1e-13, // test standard floating point slop
        eq: true,
        options: {
            changeMap: {},
            changes: 0
        }
    }, {
        modela: {
            a: {
            }
        },
        modelb: {
            a: {
                b: 1
            }
        },
        eq: false,
        options: {
            changes: 1,
            changeMap: {
                a: {
                    b: "ADD"
                }
            }
        }
    }, {
        modela: {
            a: {
                b: 1
            }
        },
        modelb: {
            a: {
            }
        },
        eq: false,
        options: {
            changes: 1,
            changeMap: {
                a: {
                    b: "DELETE"
                }
            }
        }
    }, {
        modela: {
            a: {
                a: 1,
                b: 1
            }
        },
        modelb: {
            a: {
                b: 2,
                c: 3
            }
        },
        eq: false,
        options: {
            changes: 3,
            changeMap: {
                a: {
                    a: "DELETE",
                    b: "ADD",
                    c: "ADD"
                }
            }
        }
    }, {
        modela: {
            a: [0, 1, false]
        },
        modelb: {
            a: [false, 2]
        },
        eq: false,
        options: { // Currently we report invalidation of arrays en bloc
            changes: 1,
            changeMap: {
                a: "ADD"
            }
        }
    }
    ];

    jqUnit.test("FLUID-5489: Test fluid.model.diff", function () {
        fluid.each(fluid.tests.fluid5489diff, function (fixture, index) {
            var options = {
                changeMap: {},
                changes: 0
            };
            var eq = fluid.model.diff(fixture.modela, fixture.modelb, options);
            var fixtureLabel = "index " + index + " modela " + JSON.stringify(fixture.modela) + " modelb " + JSON.stringify(fixture.modelb);
            jqUnit.assertEquals("Correct result from diff for fixture " + fixtureLabel, fixture.eq, eq);
            jqUnit.assertLeftHand("Correct change summary from diff for fixture " + fixtureLabel, fixture.options, options);
        });
    });

    fluid.tests.recordFire = function (that, value) {
        that.fireRecord.push(value);
    };

    fluid.defaults("fluid.tests.fluid5489root", {
        gradeNames: ["fluid.modelComponent"],
        model: {},
        members: {
            fireRecord: []
        },
        modelListeners: {
            innerPath: {
                funcName: "fluid.tests.fireRecord",
                args: ["{that}", true]
            }
        }
    });


    jqUnit.test("FLUID-5489: Do not notify null changes for listeners to overbroad", function () {
        var that = fluid.tests.fluid5489root();
        jqUnit.assertDeepEq("No firings for no change of member during init", [], that.fireRecord);
    });

    // FLUID-5490: New source guarding for changes

    fluid.defaults("fluid.tests.fluid5490root", {
        gradeNames: ["fluid.modelComponent"],
        model: {},
        members: {
            fireRecord: []
        },
        modelListeners: {
            "": [{
                funcName: "fluid.tests.recordFire",
                args: ["{that}", "excludeInit"],
                excludeSource: "init"
            }, {
                funcName: "fluid.tests.recordFire",
                args: ["{that}", "includeInit"],
                includeSource: "init"
            }, {
                funcName: "fluid.tests.recordFire",
                args: ["{that}", "excludeRelay"],
                excludeSource: "relay"
            }, {
                funcName: "fluid.tests.recordFire",
                args: ["{that}", "includeRelay"],
                includeSource: "relay"
            }, {
                funcName: "fluid.tests.recordFire",
                args: ["{that}", "excludeLocal"],
                excludeSource: "local"
            }, {
                funcName: "fluid.tests.recordFire",
                args: ["{that}", "includeLocal"],
                includeSource: "local"
            }]
        },
        components: {
            child: {
                type: "fluid.modelComponent",
                options: {
                    model: "{fluid5490root}.model"
                }
            }
        }
    });

    jqUnit.test("FLUID-5490: Inclusion and exclusion of sources for model listeners", function () {
        var that = fluid.tests.fluid5490root();
        var expected = ["includeInit", "excludeRelay", "excludeLocal"];
        jqUnit.assertDeepEq("Correct firing record on init", expected, that.fireRecord);
        that.fireRecord = [];
        var expected2 = ["excludeInit", "excludeRelay", "includeLocal"];
        that.applier.change("innerPath1", "value1");
        jqUnit.assertDeepEq("Correct firing record after local change", expected2, that.fireRecord);
        that.fireRecord = [];
        var expected3 = ["excludeInit", "includeRelay", "excludeLocal"];
        that.child.applier.change("innerPath2", "value2");
        jqUnit.assertDeepEq("Correct firing record after relay change", expected3, that.fireRecord);
    });

    /** FLUID-5490: New-style source tracking in ChangeApplier **/

    fluid.defaults("fluid.tests.fluid5490root2", {
        gradeNames: "fluid.modelComponent",
        model: {
            position: 10
        },
        modelRelay: {
            source: "position",
            target: "{that}.dodgyScrollbar.model.position",
            singleTransform: {
                type: "fluid.transforms.round"
            },
            forward: {
                excludeSource: "scrollbar"
            }
        },
        components: {
            dodgyScrollbar: {
                type: "fluid.modelComponent",
                options: {
                    invokers: {
                        scrollToPosition: {
                            changePath: "position",
                            value: "{arguments}.0",
                            source: "scrollbar"
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5490: Source tracking for model relay", function () {
        var that = fluid.tests.fluid5490root2();
        that.applier.change("position", 3.35);
        jqUnit.assertEquals("Updated base model from direct change", 3, that.model.position);
        jqUnit.assertEquals("Updated rounded model", 3, that.dodgyScrollbar.model.position);
        that.dodgyScrollbar.scrollToPosition(3.88);
        jqUnit.assertEquals("Updated base model via backward relay from sourced change", 3.88, that.model.position);
        jqUnit.assertEquals("Rounded model has not self-reacted", 3.88, that.dodgyScrollbar.model.position);
    });

    /** FLUID-5490: Cascade of new-style source tracking through back-to-back listeners **/

    fluid.defaults("fluid.tests.fluid5490root3", {
        gradeNames: "fluid.modelComponent",
        model: {
            position: 10
        },
        members: {
            fireRecord: []
        },
        modelListeners: {
            position: {
                changePath: "oldPosition",
                value: "{change}.value"
            },
            oldPosition: {
                excludeSource: ["originalSource", "init"],
                funcName: "fluid.tests.recordFire",
                args: ["{that}", "notOriginalSource"]
            }
        }
    });

    jqUnit.test("FLUID-5490: Automatic cascade of source tracking through back-to-back model listeners", function () {
        var that = fluid.tests.fluid5490root3();
        that.applier.change("position", 20, "ADD", "originalSource");
        jqUnit.assertDeepEq("No notification due to original source excluded", [], that.fireRecord);
        jqUnit.assertDeepEq("Model updated via listeners", {position: 20, oldPosition: 20}, that.model);
    });

    /** FLUID-5586 - variant records for "changePath" including source tracking, falsy changePath and DELETE records **/

    fluid.defaults("fluid.tests.fluid5586", {
        gradeNames: "fluid.modelComponent",
        model: {
            position: 10
        },
        members: {
            fireRecord: []
        },
        invokers: {
            clearPosition: {
                changePath: "position",
                type: "DELETE" // tests FLUID-5586
            },
            clearAll: {
                changePath: "", // tests another part of FLUID-5586
                type: "DELETE"
            },
            changeRoot: {
                changePath: {
                    segs: []
                },
                value: {
                    position: 9.5
                },
                source: "scrollbar"
            }
        },
        modelListeners: {
            position: {
                excludeSource: ["scrollbar", "init"],
                funcName: "fluid.tests.recordFire",
                args: ["{that}", "positionListen"]
            }
        }
    });

    jqUnit.test("FLUID-5586: Source tracking for model listeners", function () {
        var that = fluid.tests.fluid5586();
        that.applier.change("position", 3.35, "ADD", "scrollbar");
        jqUnit.assertDeepEq("No notification for excluded source", [], that.fireRecord);
        jqUnit.assertEquals("Model updated", 3.35, that.model.position);
        that.clearPosition();
        jqUnit.assertDeepEq("Notification for non-excluded source", ["positionListen"], that.fireRecord);
        jqUnit.assertEquals("Model updated", undefined, that.model.position);
        that.clearAll();
        jqUnit.assertDeepEq("No notification for undefined-undefined transition", ["positionListen"], that.fireRecord);
        jqUnit.assertEquals("Model updated", undefined, that.model);
        that.changeRoot();
        jqUnit.assertDeepEq("No notification for excluded source", ["positionListen"], that.fireRecord);
        jqUnit.assertEquals("Model updated", 9.5, that.model.position);
    });


    // FLUID-5479: Compound values for valueMapper transform - example from metadata editor

    fluid.defaults("fluid.tests.fluid5479root", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            accessibilityHazard: []
        },
        modelRelay: [{
            source: "accessibilityHazard",
            target: "flashingHash",
            singleTransform: {
                type: "fluid.transforms.arrayToSetMembership",
                options: {
                    "flashing": "flashing",
                    "noFlashingHazard": "noFlashingHazard"
                }
            }
        }, {
            source: "flashingHash",
            target: "flashingRender",
            singleTransform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "",
                match: [{ // slightly modified from version in ModelTransformationTests.js to test a variant expression of the same rules (all are compound here)
                    inputValue: {
                        "flashing": true,
                        "noFlashingHazard": false
                    },
                    outputValue: "yes"
                }, {
                    inputValue: {
                        "flashing": false,
                        "noFlashingHazard": true
                    },
                    outputValue: "no"
                }, {
                    inputValue: {
                        "flashing": false,
                        "noFlashingHazard": false
                    },
                    outputValue: "unknown"
                }
            ]
            }
        }]
    });

    jqUnit.test("FLUID-5479: Model relay with compound valueMapper values - metadata editor example", function () {
        var that = fluid.tests.fluid5479root();
        var expectedInitial = {
            accessibilityHazard: [],
            flashingHash: {
                "flashing": false,
                "noFlashingHazard": false
            },
            flashingRender: "unknown"
        };
        jqUnit.assertDeepEq("Initial model synchronised", expectedInitial, that.model);
        that.applier.change("flashingRender", "yes");
        jqUnit.assertDeepEq("Propagated flashing to upstream model", ["flashing"], that.model.accessibilityHazard);
        that.applier.change("flashingRender", "no");
        jqUnit.assertDeepEq("Propagated no flashing to upstream model", ["noFlashingHazard"], that.model.accessibilityHazard);
        that.applier.change("flashingRender", "unknown");
        jqUnit.assertDeepEq("Propagated unknown to upstream model", [], that.model.accessibilityHazard);
    });

    fluid.defaults("fluid.tests.fluid5504root", {
        gradeNames: ["fluid.modelComponent"],
        listeners: {
            onCreate: "{sub}.subInvoker"
        },
        components: {
            sub: {
                type: "fluid.modelComponent",
                options: {
                    model: {
                        root: "{fluid5504root}.model"
                    },
                    invokers: {
                        subInvoker: "fluid.identity({that}.model, {arguments}.0)"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5504: Test for non-ginger access to applier in relay", function () {
        var that = fluid.tests.fluid5504root();
        jqUnit.assertValue("Applier must be created", that.applier);
        that.applier.change("value", 42);
        jqUnit.assertEquals("Relay must be established", 42, that.sub.model.root.value);
    });

    fluid.registerNamespace("fluid.tests.fluid5585");

    fluid.tests.fluid5585fixtures = {
        case0: undefined,
        case1: {
            a: true,
            b: true,
            c: {
                d: true
            }
        },
        case2: {
            a: true,
            b: true,
            c: {}
        },
        case3: {
            a: true
        }
    };

    fluid.defaults("fluid.tests.fluid5585.explicitRelay", {
        gradeNames: ["fluid.modelComponent"],
        modelRelay: {
            source: "{that}.model",
            target: "{root}.model.subModel",
            singleTransform: {
                type: "fluid.transforms.identity"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5585.implicitRelay", {
        gradeNames: ["fluid.modelComponent"],
        model: "{root}.model.subModel"
    });

    /* FLUID-5585:  Removal from the model is not relayed in any case*/
    fluid.defaults("fluid.tests.fluid5585.root", {
        gradeNames: ["fluid.modelComponent"],
        members: {
            relayedModelValue: null,
            initialModelValue: {
                a: true,
                b: true
            }
        },
        model: {
            subModel: "{that}.initialModelValue"
        },
        modelListeners: {
            "subModel": {
                listener: "fluid.set",
                args: ["{that}", "relayedModelValue", "{change}.value"]
            }
        },
        components: {
            sub: {
                type: "fluid.modelComponent",
                options: {
                    listeners: {
                        onCreate: { // Do this in onCreate so we can test implicit relay separately
                            changePath: "",
                            value: "{root}.initialModelValue"
                        }
                    }
                }
            }
        }
    });

    fluid.tests.fluid5585.verifyBackwardRelay = function (that, testCases) {
        jqUnit.expect(fluid.keys(testCases).length);
        fluid.each(testCases, function (newModel, caseName) {
            that.sub.applier.fireChangeRequest({path: "", type: "DELETE"});
            that.sub.applier.change("", newModel);
            jqUnit.assertDeepEq("The new model value has been relayed properly for " + caseName, newModel, that.relayedModelValue);
        });
    };

    fluid.tests.fluid5585.verifyForwardRelay = function (that, testCases) {
        jqUnit.expect(fluid.keys(testCases).length);
        fluid.each(testCases, function (newModel, caseName) {
            that.applier.fireChangeRequest({path: "subModel", type: "DELETE"});
            that.applier.change("subModel", newModel);
            jqUnit.assertDeepEq("The new model value has been relayed properly for " + caseName, newModel, that.sub.model);
        });
    };

    fluid.tests.fluid5585.verifyForwardPartialDeleteRelay = function (that) {
        jqUnit.expect(1);
        that.applier.fireChangeRequest({path: "subModel.b", type: "DELETE"});
        jqUnit.assertDeepEq("The new model value has been relayed properly for partial deletion", {a: true}, that.sub.model);
    };

    fluid.tests.fluid5585.verifyBackwardPartialDeleteRelay = function (that) {
        jqUnit.expect(1);
        that.sub.applier.fireChangeRequest({path: "b", type: "DELETE"});
        jqUnit.assertDeepEq("The new model value has been relayed properly for partial deletion", {a: true}, that.model.subModel);
    };

    fluid.tests.fluid5585.runOneConfiguration = function (gradeName, verifyFunc) {
        jqUnit.test("FLUID-5585 - " + gradeName + " with " + verifyFunc + ": model relay for removing all or part of source value nodes", function () {
            jqUnit.expect(2);
            var that = fluid.tests.fluid5585.root({
                components: {
                    sub: {
                        options: {
                            gradeNames: gradeName
                        }
                    }
                }
            });
            jqUnit.assertDeepEq(gradeName + ": the initial model value on the source component is set correctly", that.initialModelValue, that.sub.model);
            jqUnit.assertDeepEq(gradeName + ": the initial model value on the target component is set correctly", that.initialModelValue, that.model.subModel);
            fluid.invokeGlobalFunction(verifyFunc, [that, fluid.tests.fluid5585fixtures]);
        });
    };

    fluid.tests.fluid5585.fixtureFuncs = [
        "fluid.tests.fluid5585.verifyBackwardRelay",
        "fluid.tests.fluid5585.verifyForwardRelay",
        "fluid.tests.fluid5585.verifyForwardPartialDeleteRelay",
        "fluid.tests.fluid5585.verifyBackwardPartialDeleteRelay"
    ];

    fluid.each(fluid.tests.fluid5585.fixtureFuncs, function (fixtureFunc) {
        fluid.tests.fluid5585.runOneConfiguration("fluid.tests.fluid5585.implicitRelay", fixtureFunc);
        fluid.tests.fluid5585.runOneConfiguration("fluid.tests.fluid5585.explicitRelay", fixtureFunc);
    });

    /* FLUID-5586: change records of type DELETE and root path */
    fluid.defaults("fluid.tests.fluid5586root", {
        gradeNames: ["fluid.modelComponent"],
        model: 973,
        listeners: {
            onCreate: {
                changePath: "",
                type: "DELETE"
            }
        }
    });

    /* FLUID-5586: change records of type DELETE */
    fluid.defaults("fluid.tests.fluid5586root2", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            initialValue: "CRATON CHATON"
        },
        listeners: {
            onCreate: {
                changePath: "initialValue",
                type: "DELETE"
            }
        }
    });

    jqUnit.test("FLUID-5586 - Support for all kinds of changes as change records", function () {
        var that = fluid.tests.fluid5586root();
        jqUnit.assertDeepEq("Model should have been deleted on startup", undefined, that.model); // We can't achieve utter deletion of model due to copying model
        var that2 = fluid.tests.fluid5586root2();
        jqUnit.assertFalse("Property should have been deleted on startup", "initialValue" in that2.model);
    });

    // FLUID-5592: Error received using model relay to destroyed component

    fluid.tests.fluid5592destruct = function (that, value) {
        if (value === 2) { // do not destroy on init relay, but only on manual change
            that.child.destroy();
        }
    };

    fluid.defaults("fluid.tests.fluid5592root", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            value: 1
        },
        modelListeners: {
            value: {
                funcName: "fluid.tests.fluid5592destruct",
                priority: "first",
                args: ["{that}", "{change}.value"]
            }
        },
        components: {
            child: {
                type: "fluid.tests.fluid5592child"
            }
        }
    });


    fluid.defaults("fluid.tests.fluid5592child", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            renderValue: "{fluid5592root}.model.value"
        },
        modelListeners: {
            renderValue: { // this listener will explode on resolution due to destruction of subcomponent by first listener
                funcName: "fluid.identity",
                args: ["{change}.value"]
            }
        }
    });

    jqUnit.test("FLUID-5592: Error received using model relay to destroyed component", function () {
        var that = fluid.tests.fluid5592root();
        jqUnit.assertValue("The initial model relay has set the target model value", 1, that.child.renderValue);

        // manual registration of changeListeners exercises notification via different pathways that avoid fluid.resolveModelListener
        that.child.applier.modelChanged.addListener("renderValue", function () {
            jqUnit.fail("This listener should not be notified if the component is destroyed");
        });

        that.applier.change("value", 2);
        jqUnit.assertNoValue("The change request has destroyed the child component", that.child);
    });

    fluid.defaults("fluid.tests.fluid5632root1", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            value1: NaN,
            value2: "{that}.model.value1"
        }
    });

    fluid.tests.isNaN = function (value) { // replicate for Number.isNaN which is not supported on IE or Safari
        return typeof(value) === "number" && value !== value;
    };

    jqUnit.test("FLUID-5632: Model value of NaN causes infinite recursion", function () {
        var that = fluid.tests.fluid5632root1();
        jqUnit.assertTrue("Model successfully initialised with NaN value", fluid.tests.isNaN(that.model.value1));
        jqUnit.assertTrue("Model successfully relays NaN value", fluid.tests.isNaN(that.model.value2));
    });

    fluid.defaults("fluid.tests.fluid5632root2", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            value: 1
        },
        modelRelay: {
            source: "value",
            target: "value",
            singleTransform: {
                type: "fluid.tests.badRelayRule"
            }
        }
    });

    fluid.tests.badRelayRule = function (value) { // A bad relay rule which causes a non-stabilising model
        return value + 1;
    };

    jqUnit.test("FLUID-5632: Bad relay rule triggers framework diagnostic", function () {
        jqUnit.expectFrameworkDiagnostic("Diagnostic from infinite relay rule", function () {
            fluid.tests.fluid5632root2();
        }, "settling");
    });

    // FLUID-5885: Correct context for indirect model relay

    fluid.defaults("fluid.tests.fluid5885root", {
        gradeNames: "fluid.modelComponent",
        components: {
            innerModel: {
                type: "fluid.modelComponent"
            }
        },
        modelListeners: {
            "{that}.innerModel.model.pressed": {
                funcName: "fluid.tests.fluid5885listener",
                args: ["{that}", "{fluid.tests.fluid5885root}"]
            }
        }
    });

    fluid.tests.fluid5885listener = function (actualThat, expectedThat) {
        jqUnit.assertEquals("Context \"that\" should be site of definition", expectedThat, actualThat);
    };

    jqUnit.test("FLUID-5885: Proper contextualisation of \"that\" during indirect model listener", function () {
        jqUnit.expect(1);
        var that = fluid.tests.fluid5885root();
        that.innerModel.applier.change("pressed", true);
    });

    // FLUID-6158

    fluid.tests.modelPairToChanges = [
        {
            description: "Value and oldValue are undefined",
            value: undefined,
            oldValue: undefined,
            expected: [],
            changePathPrefix: "path1.path2",
            expectedWithPrefix: []
        },
        {
            description: "Two empty objects",
            value: {},
            oldValue: {},
            expected: [],
            changePathPrefix: "path1.path2",
            expectedWithPrefix: []
        },
        {
            description: "New value is an object with properties and oldValue is undefined",
            value: {
                a: "Alice",
                b: "Bob"
            },
            oldValue: undefined,
            expected: [
                {
                    path: [],
                    value: {
                        a: "Alice",
                        b: "Bob"
                    },
                    type: "ADD"
                }
            ],
            changePathPrefix: "path1.path2",
            expectedWithPrefix: [
                {
                    path: ["path1", "path2"],
                    value: {
                        a: "Alice",
                        b: "Bob"
                    },
                    type: "ADD"
                }
            ]
        },
        {
            description: "New value is undefined and oldValue is an object with properties",
            value: undefined,
            oldValue: {
                a: "Alice",
                b: "Bob"
            },
            expected: [
                {
                    path: [],
                    value: null,
                    type: "DELETE"
                }
            ],
            changePathPrefix: "path1.path2",
            expectedWithPrefix: [
                {
                    path: ["path1", "path2"],
                    value: null,
                    type: "DELETE"
                }
            ]
        },
        {
            description: "Add properties to an empty object",
            value: {
                a: "Alice",
                b: "Bob"
            },
            oldValue: {},
            expected: [
                {
                    path: ["a"],
                    value: "Alice",
                    type: "ADD"
                },
                {
                    path: ["b"],
                    value: "Bob",
                    type: "ADD"
                }
            ],
            changePathPrefix: "path1.path2",
            expectedWithPrefix: [
                {
                    path: ["path1", "path2", "a"],
                    value: "Alice",
                    type: "ADD"
                },
                {
                    path: ["path1", "path2", "b"],
                    value: "Bob",
                    type: "ADD"
                }
            ]
        },
        {
            description: "Remove all properties from an object",
            value: {},
            oldValue: {
                a: "Alice",
                b: "Bob"
            },
            expected: [
                {
                    path: ["a"],
                    value: null,
                    type: "DELETE"
                },
                {
                    path: ["b"],
                    value: null,
                    type: "DELETE"
                }
            ],
            changePathPrefix: "path1.path2",
            expectedWithPrefix: [
                {
                    path: ["path1", "path2", "a"],
                    value: null,
                    type: "DELETE"
                },
                {
                    path: ["path1", "path2", "b"],
                    value: null,
                    type: "DELETE"
                }
            ]
        },
        {
            description: "Add an object property not at the root",
            value: {
                people: {
                    a: "Alice",
                    b: "Bob"
                }
            },
            oldValue: {
                people: {
                    a: "Alice"
                }
            },
            expected: [
                {
                    path: ["people", "b"],
                    value: "Bob",
                    type: "ADD"
                }
            ],
            changePathPrefix: "path1.path2",
            expectedWithPrefix: [
                {
                    path: ["path1", "path2", "people", "b"],
                    value: "Bob",
                    type: "ADD"
                }
            ]
        },
        {
            description: "Add elements to an empty array",
            value: [10, 42],
            oldValue: [],
            expected: [
                {
                    path: [],
                    value: [10, 42],
                    type: "ADD"
                }
            ],
            changePathPrefix: "path1.path2",
            expectedWithPrefix: [
                {
                    path: ["path1", "path2"],
                    value: [10, 42],
                    type: "ADD"
                }
            ]
        },
        {
            description: "Add elements to a non-empty array",
            value: [10, 42, 314],
            oldValue: [10],
            expected: [
                {
                    path: [],
                    value: [10, 42, 314],
                    type: "ADD"
                }
            ],
            changePathPrefix: "path1.path2",
            expectedWithPrefix: [
                {
                    path: ["path1", "path2"],
                    value: [10, 42, 314],
                    type: "ADD"
                }
            ]
        }
    ];

    jqUnit.test("modelPairToChanges", function () {
        jqUnit.expect(18);
        fluid.each(fluid.tests.modelPairToChanges, function (testcase) {
            // Test first without a path prefix
            var changesWithoutPrefix = fluid.modelPairToChanges(testcase.value,
                testcase.oldValue);
            jqUnit.assertDeepEq(testcase.description + "; without prefix",
                testcase.expected, changesWithoutPrefix);

            // And then test with a path prefix
            var changesWithPrefix = fluid.modelPairToChanges(testcase.value,
                testcase.oldValue, testcase.changePathPrefix);
            jqUnit.assertDeepEq(testcase.description + "; with prefix: " + testcase.changePathPrefix,
                testcase.expectedWithPrefix, changesWithPrefix);
        });
    });

    // FLUID-5659: Saturating relay counts through back-to-back transactions

    fluid.defaults("fluid.tests.fluid5659relay", {
        gradeNames: "fluid.modelComponent",
        model: {
            lang: "none"
        },
        lang: ["en", "fr", "es", "de", "ne", "sv"],
        modelRelay: [{
            target: "langIndex",
            singleTransform: {
                type: "fluid.transforms.indexOf",
                array: "{that}.options.lang",
                input: "{that}.model.lang",
                offset: 1
            }
        }, {
            target: "firstLangSelected",
            singleTransform: {
                type: "fluid.transforms.binaryOp",
                left: "{that}.model.langIndex",
                operator: "===",
                right: 1
            }
        }, {
            target: "lastLangSelected",
            singleTransform: {
                type: "fluid.transforms.binaryOp",
                left: "{that}.model.langIndex",
                operator: "===",
                right: "{that}.options.lang.length"
            }
        }]
    });

    fluid.defaults("fluid.tests.fluid5659root", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            relayComponent: {
                type: "fluid.tests.fluid5659relay"
            },
            testCaseHolder: {
                type: "fluid.test.testCaseHolder",
                options: {
                    moduleSource: {
                        funcName: "fluid.tests.fluid5659source",
                        args: ["{fluid5659relay}.options.lang"]
                    }
                }
            }
        }
    });

    fluid.tests.fluid5659modules = {
        name: "FLUID-5659 repeated relay test",
        tests: {
            name: "relay test",
            expect: 1,
            sequence: []
        }
    };

    fluid.tests.fluid5659verify = function (model, langs, lang) {
        var index = langs.indexOf(lang) + 1;
        var firstLangSelected = index === 1;
        var lastLangSelected = index === langs.length;
        var expected = {
            lang: lang,
            langIndex: index,
            firstLangSelected: firstLangSelected,
            lastLangSelected: lastLangSelected
        };
        jqUnit.assertDeepEq("Expected model for selected language " + lang, expected, model);
    };

    fluid.tests.fluid5659sequence = [{
        func: "{fluid5659relay}.applier.change",
        args: ["lang", "fr"]
    }, {
        listener: "fluid.tests.fluid5659verify",
        args: ["{fluid5659relay}.model", "{fluid5659relay}.options.lang", "fr"],
        spec: {path: "lang", priority: "last"},
        changeEvent: "{fluid5659relay}.applier.modelChanged"
    }];

    fluid.tests.fluid5659source = function (langs) {
        var togo = fluid.copy(fluid.tests.fluid5659modules);
        togo.tests.expect = langs.length;
        var sequence = fluid.transform(langs, function (lang) {
            var pair = fluid.copy(fluid.tests.fluid5659sequence);
            pair[0].args[1] = lang;
            pair[1].args[2] = lang;
            return pair;
        });
        togo.tests.sequence = fluid.flatten(sequence);
        return togo;
    };

    fluid.test.runTests(["fluid.tests.fluid5659root"]);

})(jQuery);
