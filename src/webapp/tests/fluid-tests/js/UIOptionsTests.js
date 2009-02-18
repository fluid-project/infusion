/* 
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
        var tests = new jqUnit.TestCase("UIOptions Tests");
        
        var hcSkin = {
            textSize: "-1",
            textFont: "Verdana",
            textSpacing: "Wider",
            contrast: "High Contrast"
        };
            
        tests.test("Init Model", function () {
            expect(6);
            
            var uiOptions = fluid.uiOptions(".ui_options_container");
            var model = uiOptions.model;
            jqUnit.assertNotNull("Model is not null", model);
            jqUnit.assertNotUndefined("Model is not undefined", model);
            jqUnit.assertEquals("Text size is set", "Default", model.textSize);
            jqUnit.assertEquals("Text font is set", "Default", model.textFont);
            jqUnit.assertEquals("Text spacing is set", "Default", model.textSpacing);
            jqUnit.assertEquals("Colour scheme is set", "Default", model.contrast);
        });

        tests.test("Save", function () {
            expect(3);

            var saveCalled = false;
            var options = {
                listeners: {
                    onSave: function () {
                        saveCalled = true;
                    }
                }
            };
            var uiOptions = fluid.uiOptions(".ui_options_container", options);
            uiOptions.updateModel(hcSkin);

            jqUnit.assertFalse("Save hasn't been called", saveCalled);
            uiOptions.save();
            var container = $("html");
            jqUnit.assertTrue("Save has been called", saveCalled);
            jqUnit.assertTrue("Body has the high contrast colour scheme", container.hasClass("fl-theme-hc"));

        });

/*
 * Commenting out this test for the 0.8 release.
 
        tests.test("Refresh View", function () {
            expect(8);

            var uiOptions = fluid.uiOptions(".ui_options_container");
            uiOptions.updateModel(hcSkin);
            
            uiOptions.refreshView();
            jqUnit.assertTrue("Default size not checked", !$("#sdefault").attr("checked"));
            jqUnit.assertTrue("-1 size checked", $("#s-1").attr("checked"));
            jqUnit.assertTrue("Default font not checked", !$("#fdefault").attr("checked"));
            jqUnit.assertTrue("Verdana checked", $("#verdana").attr("checked"));
            jqUnit.assertTrue("Default spacing not checked", !$("#spdefault").attr("checked"));
            jqUnit.assertTrue("Wider spacing checked", $("#wider").attr("checked"));
            jqUnit.assertTrue("Mist not checked", !$("#mist").attr("checked"));
            jqUnit.assertTrue("High contrast checked", $("#hc").attr("checked"));

        });
 */
    });
})(jQuery);
