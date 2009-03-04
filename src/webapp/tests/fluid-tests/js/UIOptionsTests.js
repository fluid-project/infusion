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
/*global jqUnit, expect*/


(function ($) {
    $(document).ready(function () {
        var tests = new jqUnit.TestCase("UIOptions Tests");
        
        var hcSkin = {
            textSize: "8",
            textFont: "Verdana",
            textSpacing: "Wider",
            contrast: "High Contrast"
        };
            
        var saveCalled = false;

        var options = {
            listeners: {
                onSave: function () {
                    saveCalled = true;
                }
            }
        };

        var runTheTests = function () {
            var htmlcopy = $('.uiOptions').clone();

            tests.test("Init Model", function () {
                expect(6);
                
                var uiOptions = fluid.uiOptions(".uiOptions", options);
                var model = uiOptions.model;
                jqUnit.assertNotNull("Model is not null", model);
                jqUnit.assertNotUndefined("Model is not undefined", model);
                jqUnit.assertFalse("Min text size is not set", !!model.textSize);
                jqUnit.assertEquals("Text font is set", "Default", model.textFont);
                jqUnit.assertEquals("Text spacing is set", "Default", model.textSpacing);
                jqUnit.assertEquals("Colour scheme is set", "Default", model.contrast);
                
            // extend this test to test originalModel and savedModel
            });            

            tests.test("Save", function () {
                expect(4);
                
                $("#main").append(htmlcopy.clone());
                var uiOptions = fluid.uiOptions(".uiOptions", options);
                
                uiOptions.updateModel(hcSkin);
                
                jqUnit.assertFalse("Save hasn't been called", saveCalled);
                uiOptions.save();
                var container = $("body");
                jqUnit.assertTrue("Save has been called", saveCalled);
                jqUnit.assertEquals("hc setting was saved", hcSkin.contrast, uiOptions.savedModel.contrast);
                jqUnit.assertTrue("Body has the high contrast colour scheme", container.hasClass("fl-theme-hc"));
                
            });

            tests.test("Refresh View", function () {
                expect(6);
                
                $("#main").append(htmlcopy.clone());
                var uiOptions = fluid.uiOptions(".uiOptions", options);
                
                uiOptions.updateModel(hcSkin);
                
                jqUnit.assertEquals("hc setting was set in the model", hcSkin.contrast, uiOptions.model.contrast);
                jqUnit.assertEquals("hc setting was not saved", "Default", uiOptions.savedModel.contrast);
                
                uiOptions.refreshView();
                var fontSizeSetting = $("#font-min-size").val();
                jqUnit.assertEquals("Small font size selected", "8", fontSizeSetting);
                var fontStyleSelection = $(":selected", $("#font-style-selection"));
                jqUnit.assertEquals("Verdana selected", "Verdana", fontStyleSelection[0].value);
                var textSpacingSelection = $(":selected", $("#text-spacing-selection"));
                jqUnit.assertEquals("Wider spacing is selected", "Wider", textSpacingSelection[0].value);
                var contrastSelection = $(":selected", $("#contrast-selection"));
                jqUnit.assertEquals("High Contrast is selected", "High Contrast", contrastSelection[0].value);
            });            
        };
        
        $('#ui-options').load('../../fluid-components/html/templates/UIOptions.html .uiOptions', runTheTests);
        
    });
})(jQuery);
