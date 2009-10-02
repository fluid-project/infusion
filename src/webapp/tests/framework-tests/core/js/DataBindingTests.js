/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

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
        fluid.logEnabled = true;
        
        var DataBindingTests = new jqUnit.TestCase("Data Binding Tests");
        
        DataBindingTests.test("PathUtil", function() {
            var path = "path1.path2.path3";
            jqUnit.assertEquals("getHeadPath", "path1", fluid.pathUtil.getHeadPath(path));
            jqUnit.assertEquals("getTailPath", "path3", fluid.pathUtil.getTailPath(path));
            jqUnit.assertEquals("getToTailPath", "path1.path2", fluid.pathUtil.getToTailPath(path));
            jqUnit.assertEquals("getFromHeadPath", "path2.path3", fluid.pathUtil.getFromHeadPath(path));
        });

        DataBindingTests.test("ChangeApplier", function() {
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
              type: "ADD"}, outerDAR);
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
              type: "ADD"}, outerDAR2);
            
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
