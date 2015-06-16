/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.setLogging(true);

    fluid.registerNamespace("fluid.tests");

    jqUnit.module("Data Binding Tests");

    jqUnit.test("PathUtil", function () {
        var path = "path1.path2.path3";
        jqUnit.assertEquals("getHeadPath", "path1", fluid.pathUtil.getHeadPath(path));
        jqUnit.assertEquals("getTailPath", "path3", fluid.pathUtil.getTailPath(path));
        jqUnit.assertEquals("getToTailPath", "path1.path2", fluid.pathUtil.getToTailPath(path));
        jqUnit.assertEquals("getFromHeadPath", "path2.path3", fluid.pathUtil.getFromHeadPath(path));

        jqUnit.assertDeepEq("Match empty", [], fluid.pathUtil.matchPath("", "thing"));
        jqUnit.assertDeepEq("Match *", ["thing"], fluid.pathUtil.matchPath("*", "thing"));
        jqUnit.assertDeepEq("Match thing", ["thing"], fluid.pathUtil.matchPath("thing", "thing"));
        jqUnit.assertDeepEq("Match thing", ["thing"], fluid.pathUtil.matchPath("thing", "thing.otherThing"));
        jqUnit.assertDeepEq("Match thing.*", ["thing", "otherThing"], fluid.pathUtil.matchPath("thing.*", "thing.otherThing"));
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


    function testPreservingMerge(name, preserve, defaultModel) {
        var defaults = { lala: "blalalha"};
        if (preserve) {
            defaults.mergePolicy = {model: "preserve"};
        }
        if (defaultModel !== undefined) {
            defaults.model = defaultModel;
        }
        fluid.defaults(name, defaults);
        fluid.setGlobalValue(name, function (options) {
            return fluid.initLittleComponent(name, options);
        });
        var model = { foo: "foo" };

        var comp = fluid.invokeGlobalFunction(name, [{model: model}]);

        var presString = name + (preserve ? " - preserve" : "");

        jqUnit.assertEquals("Identical model reference " + presString,
            preserve, comp.options.model === model);
        var mergedModel = $.extend(true, {}, model, defaultModel);

        jqUnit.assertDeepEq("Merged model contents " + presString, mergedModel, comp.options.model);
    }


    jqUnit.test("Merge model semantics - preserve", function () {
        testPreservingMerge("undef1", true);
        testPreservingMerge("undef2", false);
         // defaultModel of "null" tests FLUID-3768
        testPreservingMerge("null1", true, null);
        testPreservingMerge("null2", false, null);
        // populated defaultModel tests FLUID-3824
        var defaultModel = { roo: "roo"};
        testPreservingMerge("model1", true, defaultModel);
        testPreservingMerge("model2", false, defaultModel);
    });

    // NB - this implementation is in Fluid.js, but test is grouped with the one above
    jqUnit.test("FLUID 4585 test: mergeModel with nested model", function () {
        var defaults = {
            twoLevels: {
                one: 1,
                two: 2,
                three: 3
            }
        };
        var options = {
            twoLevels: {
                two: "two"
            }
        };
        var expected = {
            twoLevels: {
                one: 1,
                two: "two",
                three: 3
            }
        };
        var result = fluid.model.mergeModel(defaults, options);
        jqUnit.assertDeepEq("Model should be properly merged", expected, result);
    });

    jqUnit.test("FLUID-3729 test: application into nothing", function () {
        var model = {};
        var holder = {model: model};

        var applyOldChange = function (request) {
            fluid.model.applyChangeRequest(model, request);
        };
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
        applyTests(applyOldChange);
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
        for (var i = 0; i < fluid.tests.changeTests.length; ++ i) {
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

    jqUnit.test("ApplyChangeRequest - ADD, DELETE and MERGE", function () {
        var model = {a: 1, b: 2};
        var model2 = {c: 3};

        var testModel1 = fluid.copy(model);
        fluid.model.applyChangeRequest(testModel1, {type: "ADD", path: "", value: fluid.copy(model2)});
        jqUnit.assertDeepEq("Add at root === clear + add", {c: 3}, testModel1);

        var testModel2 = fluid.copy(model);
        fluid.model.applyChangeRequest(testModel2, {type: "DELETE", path: ""});
        jqUnit.assertDeepEq("Delete root", {}, testModel2);

        var testModel3 = fluid.copy(model);
        testModel3.c = fluid.copy(model);
        var testModel5 = fluid.copy(testModel3);
        fluid.model.applyChangeRequest(testModel3, {type: "MERGE", path: "c", value: fluid.copy(model2)});
        jqUnit.assertDeepEq("Merge at trunk", {a: 1, b: 2, c: {a: 1, b: 2, c: 3}}, testModel3);

        var testModel4 = fluid.copy(model);
        fluid.model.applyChangeRequest(testModel4, {type: "MERGE", path: "c", value: fluid.copy(model2)});
        jqUnit.assertDeepEq("Merge into nothing", {a: 1, b: 2, c: {c: 3}}, testModel4);

        fluid.model.applyChangeRequest(testModel5, {type: "ADD", path: "c", value: fluid.copy(model2)});
        jqUnit.assertDeepEq("Add at trunk", {a: 1, b: 2, c: {c: 3}}, testModel5);
    });

    fluid.tests.testExternalTrans = function (applierMaker, name) {
        jqUnit.test("Transactional ChangeApplier - external transactions: " + name, function () {
            var model = {a: 1, b: 2};
            var holder = {model: model};
            var applier = applierMaker(holder);
            var initModel = fluid.copy(model);

            var transApp = applier.initiate();
            transApp.requestChange("c", 3);
            jqUnit.assertDeepEq("Observable model unchanged", initModel, holder.model);
            transApp.requestChange("d", 4);
            jqUnit.assertDeepEq("Observable model unchanged", initModel, holder.model);
            transApp.commit();
            jqUnit.assertDeepEq("All changes applied", {a: 1, b: 2, c: 3, d: 4}, holder.model);
        });
    };

    fluid.tests.testExternalTrans(fluid.makeHolderChangeApplier, "old applier");
    fluid.tests.testExternalTrans(fluid.makeNewChangeApplier, "new applier");

    function makeTransTest(trans, thin) {
        jqUnit.test("Transactional ChangeApplier - Transactional: " +
            trans + " Thin: " + thin, function () {
                var model = {
                    outerProperty: false,
                    transWorld: {
                        innerPath1: 3,
                        innerPath2: 4
                    }
                };

                var modelChangedCheck = [];
                var pathsCheck = [];
                var guard1check = 0;

                function modelChanged(newModel, oldModel, changes, paths) {
                    if (trans) {
                        jqUnit.assertEquals("Changes after guard", 1, guard1check);
                    } else {
                        jqUnit.assertEquals("Changes wrt guard", modelChangedCheck.length, guard1check);
                    }
                    modelChangedCheck = modelChangedCheck.concat(changes);
                    pathsCheck.push(paths);
                }

                function transGuard1(innerModel, changeRequest, applier) {
                    if (changeRequest.path !== "transWorld.innerPath2") { // guard infinite recursion
                        applier.requestChange("transWorld.innerPath2", 5);
                    }
                    else {
                        return;
                    }
                    jqUnit.assertEquals("Change wrt transaction", trans && !thin ? 4 : 5, model.transWorld.innerPath2);
                    jqUnit.assertEquals("ModelChanged count", trans ? 0 : 1, modelChangedCheck.length);
                    guard1check++;
                }
                var applier = fluid.makeChangeApplier(model, {thin: thin});
                applier.guards.addListener((trans ? "!" : "") + "transWorld", transGuard1);
                applier.modelChanged.addListener("*", modelChanged);
                applier.requestChange("transWorld.innerPath1", 4);
                jqUnit.assertEquals("Guard 1 executed", 1, guard1check);
                jqUnit.assertDeepEq("Final model state", {innerPath1: 4, innerPath2: 5}, model.transWorld);
                jqUnit.assertEquals("2 changes received", 2, modelChangedCheck.length);
                var expectedPaths = trans? [["transWorld"]] : [["transWorld"], ["transWorld"]];
                jqUnit.assertDeepEq("Paths changed " + (trans ? "1 time" : "2 times"), expectedPaths, pathsCheck);
            }
        );
    }

    makeTransTest(true, false); // Old ChangeApplier no longer supports nontransactionality
    makeTransTest(true, true);

    jqUnit.test("Culling Applier", function () {
        var model = {
            outerProperty: false,
            transWorld: {
                innerPath1: 3,
                innerPath2: 4
            }
        };
        function nullingGuard(newModel, changeRequest) {
            if (changeRequest.path === "transWorld.innerPath2") {
                changeRequest.value = 4;
            }
        }
        var lowExecuted = false;
        function lowPriorityGuard() {
            lowExecuted = true;
        }
        var modelChangedCheck = false;
        function modelChanged() {
            modelChangedCheck = true;
        }
        var postGuardCheck = false;
        function postGuard() {
            postGuardCheck = true;
        }
        var applier = fluid.makeChangeApplier(model, {cullUnchanged: true});
        applier.guards.addListener({path: "transWorld", transactional: true, priority: 20}, lowPriorityGuard);
        applier.guards.addListener({path: "transWorld", transactional: true, priority: 10}, nullingGuard);
        applier.postGuards.addListener({path: "transWorld", transactional: true}, postGuard);
        applier.modelChanged.addListener("*", modelChanged);

        applier.requestChange("transWorld.innerPath2", 5);
        jqUnit.assertEquals("Final model state", 4, model.transWorld.innerPath2, 4);
        jqUnit.assertFalse("PostGuard culled", postGuardCheck);
        jqUnit.assertFalse("Model changed listener culled", modelChangedCheck);
        jqUnit.assertFalse("Low priority guard culled", lowExecuted);
    });

    jqUnit.test("PostGuards", function () {
        var model = {
            outerProperty: false,
            transWorld: {
                innerPath1: 3,
                innerPath2: 4
            }
        };
        function midGuard(newModel, changeRequest, applier) {
            if (changeRequest.path === "transWorld.innerPath2") {
                changeRequest.value = 6;
            }
            // Don't cause infinite recursion by firing a change that we react to
            if (changeRequest.path !== "transWorld.innerPath1") {
                applier.requestChange("transWorld.innerPath1", 4);
            }
        }
        var postGuardCheck = 0;
        function postGuard(newModel, changes) {
            jqUnit.assertEquals("PostGuard count", 0, postGuardCheck);
            jqUnit.assertDeepEq("PostGuard model state", newModel, {outerProperty: false, transWorld: {innerPath1: 4, innerPath2: 6}});
            jqUnit.assertEquals("PostGuard change count", 2, changes.length);
            ++postGuardCheck;
            return false;
        }
        var modelChangedCheck = false;
        function modelChanged() {
            modelChangedCheck = true;
        }
        var initModel = fluid.copy(model);
        var applier = fluid.makeChangeApplier(model);
        applier.guards.addListener({path: "transWorld", transactional: true}, midGuard);
        applier.postGuards.addListener({path: "transWorld", transactional: true}, postGuard);
        applier.modelChanged.addListener("*", modelChanged);

        applier.requestChange("transWorld.innerPath2", 5);

        jqUnit.assertDeepEq("Final model state", initModel, model);
        jqUnit.assertFalse("Model unchanged ", modelChangedCheck);
    });



    jqUnit.test("FLUID-4633 test - source tracking", function() {
        var model = {
            property1: 1,
            property2: 2
        };
        var applier = fluid.makeChangeApplier(model);

        var indirect = fluid.makeEventFirer();
        applier.modelChanged.addListener("property1", function() {
            indirect.fire();
        });
        indirect.addListener(function() {
            fluid.fireSourcedChange(applier, "property2", 3, "indirectSource");
        });
        var listenerFired = false;
        fluid.addSourceGuardedListener(applier, "property2", "originalSource", function() {
            listenerFired = applier.hasChangeSource("indirectSource");
        });
        fluid.fireSourcedChange(applier, "property1", 2, "originalSource");
        jqUnit.assertFalse("Recurrence censored from originalSource", listenerFired);
        fluid.fireSourcedChange(applier, "property1", 3, "alternateSource");
        jqUnit.assertTrue("Recurrence propagated from alternate source", listenerFired);


    });

    jqUnit.test("ChangeApplier", function () {
        var outerDAR = null;
        function checkingGuard(model, dar) {
            outerDAR = dar;
        }
        var outerNewModel, outerOldModel, outerdar;
        function observingListener(newModel, oldModel, dar) {
            outerNewModel = newModel;
            outerOldModel = oldModel;
            outerdar = dar; // immer dar!
        }
        var model = {
            outerProperty: false,
            innerProperty: {
                innerPath1: 3,
                innerPath2: "Owneriet"
            },
            arrayInnerProperty: [{a: "a", b: "b"}, {a: "A", b: "B"}]
        };
        var applier = fluid.makeChangeApplier(model);
        applier.guards.addListener("outerProperty", checkingGuard, "firstListener");
        applier.modelChanged.addListener("*", observingListener);
        applier.requestChange("outerProperty", true);

        jqUnit.assertLeftHand("Guard triggered", {
            path: "outerProperty",
            value: true,
            type: "ADD"
        }, outerDAR);
        jqUnit.assertEquals("Value applied", true, model.outerProperty);

        jqUnit.assertEquals("Outer listener old", false, outerOldModel.outerProperty);
        jqUnit.assertEquals("Outer listener new", true, outerNewModel.outerProperty);

        function preventingGuard() {
            return false;
        }

        applier.guards.addListener("innerProperty.innerPath2", preventingGuard, "preventingGuard");
        outerDAR = null;
        applier.requestChange("innerProperty.innerPath1", 5);
        jqUnit.assertNull("No collateral guard", outerDAR);

        var outerDAR2 = null;
        function checkingGuard2(model, dar) {
            outerDAR2 = dar;
        }

        applier.guards.addListener("innerProperty.*", checkingGuard2);
        applier.requestChange("innerProperty.innerPath1", 6);
        jqUnit.assertLeftHand("Guard2 triggered", {
            path: "innerProperty.innerPath1",
            value: 6,
            type: "ADD"
        }, outerDAR2);

        outerNewModel = null;
        applier.requestChange("innerProperty.innerPath2", "Disowneriet");
        jqUnit.assertEquals("Unchanged through veto", "Owneriet", model.innerProperty.innerPath2);
        jqUnit.assertNull("Model changed not fired through veto", outerNewModel);

        applier.guards.removeListener("preventingGuard");
        applier.requestChange("innerProperty.innerPath2", "Disowneriet");
        jqUnit.assertEquals("Changed since veto removed", "Disowneriet", model.innerProperty.innerPath2);
        jqUnit.assertEquals("Model changed through firing", "Disowneriet", outerNewModel.innerProperty.innerPath2);

        applier.fireChangeRequest({path: "innerProperty.innerPath2", type: "DELETE"});
        jqUnit.assertEquals("Removed via deletion", undefined, model.innerProperty.innerpath2);

        var guardPath = "arrayInnerProperty.0.a";

        function checkingGuard3(model, dar) {
            var excess = fluid.pathUtil.getExcessPath(dar.path, guardPath);
            var value = fluid.get(dar.value, excess);
            return value.length === 1;
        }
        // Tests FLUID-4869
        outerNewModel = null;
        applier.modelChanged.removeListener(observingListener);

        // Tests for FLUID-4739
        applier.guards.addListener(guardPath, checkingGuard3, "checkingGuard3");
        applier.requestChange("arrayInnerProperty.0.a", "new a");
        jqUnit.assertEquals("The model should have been guarded and not changed", "a", model.arrayInnerProperty[0].a);
        applier.requestChange("arrayInnerProperty.0.b", "new b");
        jqUnit.assertEquals("The model should have updated", "new b", model.arrayInnerProperty[0].b);
        var newArray = [{a: "a", b: "b", c: "c"}, {a: "A", b: "B", c: "C"}];
        applier.requestChange("arrayInnerProperty", newArray);
        jqUnit.assertDeepEq("The model should have updated", newArray, model.arrayInnerProperty);
        applier.guards.removeListener("checkingGuard3");

        jqUnit.assertEquals("Stopped observing model", null, outerNewModel);
    });

    jqUnit.test("FLUID-4625 test: Over-broad changes", function() {
        // This tests FLUID-4625 - we don't test at the utility level of matchPath since this is the functional
        // behaviour required. In practice we may want a better implementation which explodes composite changes into
        // smaller increments so that we can avoid unnecessary notifications, but this at least covers the case
        // of missed notifications
        var model = {
            selections: {
                lineSpace: 1.0
            }
        };
        var applier = fluid.makeChangeApplier(model);
        var notified = false;
        applier.modelChanged.addListener("selections.linespace", function() {
            notified = true;
        });
        applier.requestChange("selections", {lineSpace: 1.5});
        jqUnit.assertTrue("Over-broad change triggers listener", notified);
    });


    fluid.tests.initLifecycle = function (that) {
        that.initted = true;
    };

    fluid.defaults("fluid.tests.lifecycleTest", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        preInitFunction: "fluid.tests.initLifecycle"
    });

    jqUnit.test("Proper merging of lifecycle functions", function () {
        var model = { value: 3 };
        var that = fluid.tests.lifecycleTest({model: model});
        jqUnit.assertEquals("Grade preInit function fired", model, that.model);
        jqUnit.assertEquals("Custom preInit function fired", true, that.initted);
    });

    fluid.tests.initLifecycle1 = function (that) {
        that.initted = 1;
    };

    fluid.tests.initLifecycle2 = function (that) {
        that.initted = 2;
    };

    fluid.tests.initLifecycleM = function (that) {
        that.initMultiple = that.initMultiple || 0;
        that.initMultiple++;
    };

    fluid.defaults("fluid.tests.lifecycleTest2", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        preInitFunction: [{
            namespace: "preInitModelComponent",
            listener: "fluid.identity"
        }, {
            priority: 2,
            listener: "fluid.tests.initLifecycle2"
        }, {
            priority: 1,
            listener: "fluid.tests.initLifecycle1"
        }],
        postInitFunction: [ // This tests FLUID-4779
            "fluid.tests.initLifecycleM",
            "fluid.tests.initLifecycleM"
        ]
    });

    jqUnit.test("Detailed interaction of priority and namespacing with lifecycle functions", function () {
        var model = { value: 3 };
        var that = fluid.tests.lifecycleTest2({model: model});
        jqUnit.assertEquals("Priority order respected", 1, that.initted);
        jqUnit.assertEquals("Two global name listeners added", 2, that.initMultiple);
    });


    /** FLUID-3674: New model semantic tests **/

    fluid.tests.recordChange = function (fireRecord, path, value, oldValue) {
        fireRecord.push({path: path, value: value, oldValue: oldValue});
    };

    fluid.defaults("fluid.tests.changeRecorder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        members: {
            fireRecord: []
        },
        invokers: {
            record: "fluid.tests.recordChange({that}.fireRecord, {arguments}.0, {arguments}.1, {arguments}.2)"
        }
    });

    fluid.defaults("fluid.tests.fluid4258head", {
        gradeNames: ["fluid.standardComponent", "fluid.tests.changeRecorder", "autoInit"],
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
                type: "fluid.standardComponent",
                createOnEvent: "createEvent",
                options: {
                    modelListeners: {
                        "{fluid4258head}.model.thing1.nest2": {
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
            "thing1.nest1": "{that}.record({change}.path, {change}.value, {change}.oldValue)",
            "thing2": {
                func: "{that}.record",
                args: "{change}.value",
                guardSource: "internalSource"
            }
        }
    });

    jqUnit.test("FLUID-4258 declarative listener test", function () {
        var that = fluid.tests.fluid4258head();
        that.applier.requestChange("thing1.nest1", 3);
        jqUnit.assertDeepEq("Single change correctly reported to same component's listener",
            [{path: ["thing1", "nest1"], value: 3, oldValue: 2}], that.fireRecord);
        for (var i = 0; i < 2; ++ i) {
            that.fireRecord.length = 0;
            that.events.createEvent.fire();
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
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            change: {
                changePath: "{arguments}.0",
                value: "{arguments.1"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid3674head", {
        gradeNames: ["fluid.standardRelayComponent", "fluid.tests.changer", "fluid.tests.changeRecorder", "autoInit"],
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
                    gradeNames: ["fluid.standardRelayComponent"],
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
        that.applier.requestChange("innerModel", "exterior thing");
        var expected4 = {
            nested1: "exterior thing"
        };
        jqUnit.assertDeepEq("Propagated change inwards", expected4, that.child.model);
        that.child.applier.requestChange("nested1", "interior thing");
        var expected5 = {
            innerModel: "interior thing"
        };
        jqUnit.assertDeepEq("Propagated change outwards", expected5, that.model);
    });


    fluid.tests.fluid3674childRecord = function (that, newModel) {
        that.parentInitModel = newModel;
    };

    fluid.defaults("fluid.tests.fluid3674eventHead", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
        model: {
            outerModel: "outerValue"
        },
        events: {
            createEvent: null
        },
        components: {
            child: {
                type: "fluid.standardRelayComponent",
                createOnEvent: "createEvent",
                options: {
                    model: "{fluid3674eventHead}.model.outerModel"
                }
            },
            child2: {
                type: "fluid.standardRelayComponent",
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

        that.applier.requestChange("outerModel", "exterior thing");
        jqUnit.assertEquals("Propagated change inwards through relay", "exterior thing", child.model);
        child.applier.requestChange("", "interior thing");
        jqUnit.assertDeepEq("Propagated change outwards through relay", {outerModel: "interior thing"}, that.model);
        child.destroy();
        that.applier.requestChange("outerModel", "exterior thing 2");
        jqUnit.assertEquals("No change propagated inwards to destroyed component", "interior thing", child.model);
        child.applier.requestChange("", "interior thing 2");
        jqUnit.assertDeepEq("No change propagated outwards from destroyed component", {outerModel: "exterior thing 2"}, that.model);
    });

    fluid.defaults("fluid.tests.allChangeRecorder", {
        gradeNames: "fluid.tests.changeRecorder",
        modelListeners: {
            "": "{that}.record({change}.path, {change}.value, {change}.oldValue)"
        }
    });

    fluid.defaults("fluid.tests.fluid5024head", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            child1: {
                type: "fluid.standardRelayComponent",
                options: {
                    gradeNames: ["fluid.tests.allChangeRecorder", "autoInit"],
                    model: {
                        celsius: 22
                    },
                    modelRelay: {
                        source: "{that}.model.celsius",
                        target: "{child2}.model.fahrenheit",
                        singleTransform: {
                            type: "fluid.transforms.linearScale",
                            factor: 9/5,
                            offset: 32
                        }
                    }
                }
            },
            child2: {
                type: "fluid.standardRelayComponent",
                options: { // no options: model will be initialised via relay
                    gradeNames: ["fluid.tests.allChangeRecorder", "autoInit"]
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
        jqUnit.assertTrue(message + "expected: " + JSON.stringify(model1) + " actual: " + JSON.stringify(model2), equal);
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

        function expectChanges (message, child1Record, child2Record) {
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
        gradeNames: ["fluid.tests.fluid5024head", "autoInit"],
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
                            path: "fahrenheit",
                            func: "{fluid5361head}.recordPriority",
                            priority: 1,
                            args: ["{fluid5361head}", 1, "{that}"]
                        }, {
                            path: "fahrenheit",
                            func: "{fluid5361head}.recordPriority",
                            priority: 2,
                            namespace: "priority2",
                            args: ["{fluid5361head}", 2, "{that}"]
                        }, {
                            path: "fahrenheit",
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
        gradeNames: ["fluid.tests.fluid5361head", "autoInit"],
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

    /** Demonstrate resolving a set of model references which is cyclic in components (although not in values), as well as
     * double relay and longer "transform" form of relay specification */

    fluid.defaults("fluid.tests.fluid5024cycleHead", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            child1: {
                type: "fluid.standardRelayComponent",
                options : {
                    gradeNames: ["fluid.tests.allChangeRecorder", "autoInit"],
                    model: {
                        forwardValue: "{child2}.model.child2Area",
                        backwardValue: 97
                    }
                }
            },
            child2: {
                type: "fluid.standardRelayComponent",
                options : {
                    gradeNames: ["fluid.tests.allChangeRecorder", "autoInit"],
                    model: {
                    },
                    modelRelay: {
                        source: "{that}.model.child2Area",
                        target: "{child3}.model.lastArea",
                        transform: {
                            transform: {
                                type: "fluid.transforms.linearScale",
                                factor: 10
                            }
                        }
                    }
                }
            },
            child3: {
                type: "fluid.standardRelayComponent",
                options : {
                    gradeNames: ["fluid.tests.allChangeRecorder", "autoInit"],
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

        function expectChanges (message, child1Record, child2Record, child3Record) {
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

    jqUnit.test("FLUID-5151: One single listener function hooked up for multiple model paths only have the last call registered succesfully", function () {
        var holder = {
            model:  {
                path1: null,
                path2: null
            }
        };
        var applier = fluid.makeNewChangeApplier(holder);

        var currentPath = null;
        var listenerToFire = function (newModel, oldModel, path) {
            currentPath = path;
        };

        applier.modelChanged.addListener("path1", listenerToFire);
        applier.modelChanged.addListener("path2", listenerToFire);

        var triggerChangeRequest = function (fireOn) {
            applier.requestChange(fireOn, fireOn);
            jqUnit.assertEquals("The listener registered for model path " + fireOn + " has been fired", fireOn, currentPath);
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
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
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
        gradeNames: ["fluid.tests.fluid5045root", "autoInit"],
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

     // FLUID-3674: Old-fashioned model sharing between components is still possible (remove this test when old grades are removed)
    var fluid3674Model = {
        key: "value"
    };

    fluid.defaults("fluid.tests.fluid3674root", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        model: fluid3674Model,
        components: {
            sub: {
                type: "fluid.modelComponent",
                options: {
                    model: "{fluid3674root}.model",
                    members: {
                        applier: "{fluid3674root}.applier"
                    }
                }
            }
        }
    });

    jqUnit.asyncTest("FLUID-3674: The direct model sharing btw components is maintained", function () {
        var newModelValue = "another value",
            that = fluid.tests.fluid3674root();

        jqUnit.assertDeepEq("The subcomponent shares the same model", fluid3674Model, that.sub.model);
        that.applier.modelChanged.addListener("key", function (newModel) {
            jqUnit.assertEquals("The change request from the subcomponent triggers the model listener registered in the parent component", newModelValue, fluid.get(newModel, "key"));
            jqUnit.start();
        });
        that.sub.applier.requestChange("key", newModelValue);
    });


    // FLUID-5270: The model is not transformed when the "modelRelay" option is defined in the target component
    fluid.defaults("fluid.tests.fluid5270OnSource", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
        model: {
            celsius: 22
        },
        modelRelay: {
            source: "{that}.model.celsius",
            target: "{sub}.model.fahrenheit",
            singleTransform: {
                type: "fluid.transforms.linearScale",
                factor: 9/5,
                offset: 32
            }
        },
        components: {
            sub: {
                type: "fluid.standardRelayComponent"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid5270OnTarget", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
        model: {
            celsius: 22
        },
        components: {
            sub: {
                type: "fluid.standardRelayComponent",
                options: {
                    modelRelay: {
                        source: "{fluid5270OnTarget}.model.celsius",
                        target: "{that}.model.fahrenheit",
                        singleTransform: {
                            type: "fluid.transforms.linearScale",
                            factor: 9/5,
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
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
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
                type: "fluid.standardRelayComponent",
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

        that.applier.requestChange("modelInTransit.flashing", true);
        that.applier.requestChange("modelInTransit.noflashing", true);
        jqUnit.assertDeepEq("The backward transformation to add array values is performed properly", expectedModelAfterChangeRequest, that.model);

        that.applier.requestChange("modelInTransit.flashing", false);
        that.applier.requestChange("modelInTransit.noflashing", false);
        jqUnit.assertDeepEq("The backward transformation to remove array values is performed properly", expectedModel, that.model);

        var expectedSubcomponentModel = {
            accessibilityHazard: ["flashing", "noflashing"],
            highContrast: true,
            signLanguage: true
        };
        that.applier.requestChange("accessibilityHazard", ["flashing", "noflashing"]);
        jqUnit.assertDeepEq("The transformation from array elements to the intermediary object is performed properly", expectedModelAfterChangeRequest, that.model);
        jqUnit.assertDeepEq("The change request on the model array element is properly relayed and transformed to the subcomponent", expectedSubcomponentModel, that.sub.model);
    });

    /** FLUID-5358 - Use of arbitrary functions and fluid.transforms.identity **/
    
    fluid.tests.fluid5358Multiply = function (a) {
        return a * 2;
    };
    
    fluid.defaults("fluid.tests.fluid5358root", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
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
                type: "fluid.standardRelayComponent"
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
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
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
    
    // FLUID-5371: Model relay directive "forward" and "backward"
    
    fluid.defaults("fluid.tests.fluid5371root", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
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
        
        that.applier.change("forwardOnlyTarget", 4.5);
        jqUnit.assert("No backward live relay with backward never", 4, that.model.forwardOnly);

        jqUnit.assertEquals("Backward init relay with forward never", 5, that.model.backwardOnlySource);
        that.applier.change("backwardOnly", 6);
        jqUnit.assert("Backward live relay with forward never", 6, that.model.backwardOnlySource);
        
        that.applier.change("backwardOnlySource", 6.5);
        jqUnit.assert("No forward live relay with forward never", 6, that.model.backwardOnly);
        
        jqUnit.assertEquals("No init relay with liveOnly forward", undefined, that.model.liveOnlyTarget);
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
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
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
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
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
                type: "fluid.standardRelayComponent",
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
    
    // FLUID-5479: Compound values for valueMapper transform - example from metadata editor
    
    fluid.defaults("fluid.tests.fluid5479root", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
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
                inputPath: "",
                options: [{ // slightly modified from version in ModelTransformationTests.js to test a variant expression of the same rules (all are compound here)
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
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
        listeners: {
            onCreate: "{sub}.subInvoker"
        },
        components: {
            sub: {
                type: "fluid.standardRelayComponent",
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
    
    // FLUID-5592: Error received using model relay to destroyed component
    
    fluid.tests.fluid5592destruct = function (that, value) {
        if (value === 2) { // do not destroy on init relay, but only on manual change
            that.child.destroy();
        }
    };
    
    fluid.defaults("fluid.tests.fluid5592root", {
        gradeNames: ["fluid.modelRelayComponent", "autoInit"],
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
        gradeNames: ["fluid.modelRelayComponent", "autoInit"],
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
    
    // FLUID-5659: Saturating relay counts through back-to-back transactions
    
    fluid.defaults("fluid.tests.fluid5659relay", {
        gradeNames: ["fluid.modelRelayComponent", "autoInit"],
        model: {
            lang: "none"
        },
        lang: ["en", "fr", "es", "de", "ne", "sv"],
        modelRelay: [{
            target: "langIndex",
            singleTransform: {
                type: "fluid.transforms.indexOf",
                array: "{that}.options.lang",
                value: "{that}.model.lang",
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
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            relayComponent: {
                type: "fluid.tests.fluid5659relay"
            },
            testCaseHolder: {
                type: "fluid.test.testCaseHolder",
                options: {
                    moduleSource: {
                        funcName: "fluid.tests.fluid5659source",
                        args: "{fluid5659relay}.options.lang"
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
