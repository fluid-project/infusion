/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/


(function ($) {
    $(document).ready(function () {
        fluid.setLogging(true);
        
        fluid.registerNamespace("fluid.tests");
        
        var DataBindingTests = new jqUnit.TestCase("Data Binding Tests");
        
        DataBindingTests.test("PathUtil", function () {
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
                
        fluid.tests.testMergeComponent = function (options) {
            return fluid.initLittleComponent("fluid.tests.testMergeComponent", options);
        };
        
        function testPreservingMerge(preserve, defaultModel) {
            var defaults = { lala: "blalalha"};
            if (preserve) {
                defaults.mergePolicy = {model: "preserve"};
            }
            if (defaultModel !== undefined) {
                defaults.model = defaultModel;
            }
            fluid.defaults("fluid.tests.testMergeComponent", defaults);
            var model = { foo: "foo" };

            var comp = fluid.tests.testMergeComponent({model: model});
            
            var presString = preserve ? " - preserve" : ""; 
            
            jqUnit.assertEquals("Identical model reference" + presString, 
                preserve, comp.options.model === model);
            var mergedModel = $.extend(true, {}, model, defaultModel);
            
            jqUnit.assertDeepEq("Merged model contents" + presString, mergedModel, comp.options.model);                     
        }
     
        
        DataBindingTests.test("Merge model semantics - preserve", function () {
            testPreservingMerge(true);
            testPreservingMerge(false);
             // defaultModel of "null" tests FLUID-3768
            testPreservingMerge(true, null);
            testPreservingMerge(false, null);
            // populated defaultModel tests FLUID-3824
            var defaultModel = { roo: "roo"};
            testPreservingMerge(true, defaultModel);
            testPreservingMerge(false, defaultModel);
        });
        
        DataBindingTests.test("FLUID-3729 test: application into nothing", function () {
            var model = {};
            
            fluid.model.applyChangeRequest(model, {type: "ADD", path: "path1.nonexistent", value: "value"});
            jqUnit.assertEquals("Application 2 levels into nothing", "value", model.path1.nonexistent);
            
            fluid.model.applyChangeRequest(model, {type: "ADD", path: "path1.nonexistent2", value: "value2"});
            jqUnit.assertEquals("Application 1 level into nothing", "value2", model.path1.nonexistent2);
        });
            
        
        DataBindingTests.test("ApplyChangeRequest - ADD, DELETE and MERGE", function () {
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
            var testModel4 = fluid.copy(testModel3);
            fluid.model.applyChangeRequest(testModel3, {type: "MERGE", path: "c", value: fluid.copy(model2)});
            jqUnit.assertDeepEq("Merge at trunk", {a: 1, b: 2, c: {a: 1, b: 2, c: 3}}, testModel3);
            
            fluid.model.applyChangeRequest(testModel4, {type: "ADD", path: "c", value: fluid.copy(model2)});
            jqUnit.assertDeepEq("Add at trunk", {a: 1, b: 2, c: {c: 3}}, testModel4);
        });

        DataBindingTests.test("Transactional ChangeApplier - external transactions", function () {
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
            DataBindingTests.test("Transactional ChangeApplier - Transactional: " + 
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
                    }
                    else {
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
        
        DataBindingTests.test("Culling Applier", function () {
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
        
        DataBindingTests.test("PostGuards", function () {
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
        
        DataBindingTests.test("ChangeApplier", function () {
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
                }
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
        });
    });
})(jQuery);
