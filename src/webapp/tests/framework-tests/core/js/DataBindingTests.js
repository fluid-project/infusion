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
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        fluid.setLogging(true);
        
        fluid.registerNamespace("fluid.tests");
        
        jqUnit.module("Data Binding Tests");
        
        jqUnit.test("PathUtil", function () {
            var path = "path1.path2.path3";
            jqUnit.assertEquals("getHeadPath", "path1", fluid.pathUtil.getHeadPath(path));
            jqUnit.assertEquals("getTailPath", "path3", fluid.pathUtil.getTailPath(path));
            jqUnit.assertEquals("getToTailPath", "path1.path2", fluid.pathUtil.getToTailPath(path));
            jqUnit.assertEquals("getFromHeadPath", "path2.path3", fluid.pathUtil.getFromHeadPath(path));
            
            jqUnit.assertEquals("Match empty", "", fluid.pathUtil.matchPath("", "thing"));
            jqUnit.assertEquals("Match *", "thing", fluid.pathUtil.matchPath("*", "thing"));
            jqUnit.assertEquals("Match thing", "thing", fluid.pathUtil.matchPath("thing", "thing"));
            jqUnit.assertEquals("Match thing", "thing", fluid.pathUtil.matchPath("thing", "thing.otherThing"));
            jqUnit.assertEquals("Match thing *", "thing.otherThing", fluid.pathUtil.matchPath("thing.*", "thing.otherThing"));
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
            var compName = "fluid.tests.testMergeComponent." + name;
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
            
            jqUnit.assertDeepEq("Merged model contents" + presString, mergedModel, comp.options.model);                     
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
            
            fluid.model.applyChangeRequest(model, {type: "ADD", path: "path1.nonexistent", value: "value"});
            jqUnit.assertEquals("Application 2 levels into nothing", "value", model.path1.nonexistent);
            
            fluid.model.applyChangeRequest(model, {type: "ADD", path: "path1.nonexistent2", value: "value2"});
            jqUnit.assertEquals("Application 1 level into nothing", "value2", model.path1.nonexistent2);
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

        jqUnit.test("Transactional ChangeApplier - external transactions", function () {
            var model = {a: 1, b: 2};
            var applier = fluid.makeChangeApplier(model);
            var initModel = fluid.copy(model);
            
            var transApp = applier.initiate();
            transApp.requestChange("c", 3);
            jqUnit.assertDeepEq("Observable model unchanged", initModel, model);
            transApp.requestChange("d", 4);
            jqUnit.assertDeepEq("Observable model unchanged", initModel, model);
            transApp.commit();
            jqUnit.assertDeepEq("All changes applied", {a: 1, b: 2, c: 3, d: 4}, model);
        });

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
                    var guard1check = 0;
                    
                    function modelChanged(newModel, oldModel, changes) {
                        if (trans) {
                            jqUnit.assertEquals("Changes after guard", 1, guard1check);
                        } else {
                            jqUnit.assertEquals("Changes wrt guard", modelChangedCheck.length, guard1check);
                        }
                        modelChangedCheck = modelChangedCheck.concat(changes);
                    }
                                
                    function transGuard1(innerModel, changeRequest, applier) {
                        applier.requestChange("transWorld.innerPath2", 5);
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
                }
                );
        }
        makeTransTest(true, false);
        makeTransTest(false, false);
        makeTransTest(true, true);
        makeTransTest(false, true);
        
        jqUnit.test("Culling Applier", function () {
            var model = {
                    outerProperty: false,
                    transWorld: {
                        innerPath1: 3,
                        innerPath2: 4
                    }
                };
            function nullingGuard(newModel, changeRequest, applier) {
                if (changeRequest.path === "transWorld.innerPath2") {
                    changeRequest.value = 4;
                }
            }
            var lowExecuted = false;
            function lowPriorityGuard(newModel, changeRequest, applier) {
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
                applier.requestChange("transWorld.innerPath1", 4);
            }
            var postGuardCheck = 0;
            function postGuard(newModel, changes, applier) {
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
            
            jqUnit.assertDeepEq("Guard triggered", {
                path: "outerProperty",
                value: true,
                type: "ADD"
            }, outerDAR);
            jqUnit.assertEquals("Value applied", true, model.outerProperty);
            
            jqUnit.assertEquals("Outer listener old", false, outerOldModel.outerProperty);
            jqUnit.assertEquals("Outer listener new", true, outerNewModel.outerProperty);
            
            function preventingGuard(model, dar) {
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
            jqUnit.assertDeepEq("Guard2 triggered", {
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
            var newArray = [{a: "a", b: "b", c: "c"}, {a: "A", b: "B", c: "C"}]
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
                    lineSpacing: 1.0
                }  
            };
            var applier = fluid.makeChangeApplier(model);
            var notified = false;
            applier.modelChanged.addListener("selections.linespacing", function() {
                notified = true;
            });
            applier.requestChange("selections", {lineSpacing: 1.5});
            jqUnit.assertTrue("Over-broad change triggers listener", notified);
        });
    });
})(jQuery);
