/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, start, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        fluid.setLogging(true);
        
        var tests = jqUnit.testCase("UIOptions FullNoPreview Tests");
        
        var bwSkin = {
            textSize: "1.8",
            textFont: "verdana",
            theme: "bw",
            lineSpacing: 2
        };
        
        var ybSkin = {
            textSize: "2",
            textFont: "comic sans",
            theme: "yb",
            lineSpacing: 1.5
        };        
        
        /***************************************************
         * fluid.uiOptions.fullNoPreview Integration Tests *
         ***************************************************/

        var checkUIOComponents = function (uiOptions) {
            jqUnit.assertTrue("Check that textControls sub-component is present", uiOptions.textControls);
            jqUnit.assertTrue("Check that layoutControls sub-component is present", uiOptions.layoutControls);
            jqUnit.assertTrue("Check that linkControls sub-component is present", uiOptions.linksControls);
            jqUnit.assertTrue("Check that preview sub-component is present", uiOptions.options.components.preview);
            jqUnit.assertTrue("Check that store sub-component is present", uiOptions.options.components.settingsStore);
            jqUnit.assertTrue("Check that eventBinder sub-component is present", uiOptions.options.components.eventBinder);
        };
        
        var checkModelSelections = function (expectedSelections, actualSelections) {
            jqUnit.assertEquals("Text font correctly updated", expectedSelections.textFont, actualSelections.textFont);
            jqUnit.assertEquals("Theme correctly updated", expectedSelections.theme, actualSelections.theme);
            jqUnit.assertEquals("Text size correctly updated", expectedSelections.textSize, actualSelections.textSize);
            jqUnit.assertEquals("Line spacing correctly updated", expectedSelections.lineSpacing, actualSelections.lineSpacing);            
        };
        
        var applierRequestChanges = function (uiOptions, selectionOptions) {
            uiOptions.applier.requestChange("selections.textFont", selectionOptions.textFont);
            uiOptions.applier.requestChange("selections.theme", selectionOptions.theme);
            uiOptions.applier.requestChange("selections.textSize", selectionOptions.textSize);
            uiOptions.applier.requestChange("selections.lineSpacing", selectionOptions.lineSpacing);            
        };                
        
        tests.asyncTest("FullNoPreview UIOptions Integration tests", function () {
            fluid.pageEnhancer({
                tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
            });
            
            var that = fluid.uiOptions.fullNoPreview("#myUIOptions", {
                prefix: "../../../../components/uiOptions/html/"
            });
            
            /*
             * TODO: There have been talks about implementing a Framework event that fires 
             *       once a component and all of it's subcomponents have finished resolving.
             *       Once that is in, we can remove the hacky timeout call and listen for
             *       the framework event to tell us that the component is fully resolved.
             */
            setTimeout(function () {
                var uiOptions = that.uiOptionsLoader.uiOptions;
                var defaultSiteSettings = uiOptions.settingsStore.options.defaultSiteSettings;
                
                checkUIOComponents(uiOptions);
                applierRequestChanges(uiOptions, bwSkin);

                var saveButton = uiOptions.locate("save");
                saveButton.click();
                checkModelSelections(uiOptions.model.selections, bwSkin);
                applierRequestChanges(uiOptions, ybSkin);

                var cancelButton = uiOptions.locate("cancel");
                cancelButton.click();
                checkModelSelections(uiOptions.model.selections, bwSkin);
                
                var resetButton = uiOptions.locate("reset");
                resetButton.click();
                checkModelSelections(uiOptions.model.selections, defaultSiteSettings);                    
                applierRequestChanges(uiOptions, bwSkin);
                
                cancelButton.click();
                checkModelSelections(uiOptions.model.selections, defaultSiteSettings);
                
                start();
            }, 1500);
        });        
    });
})(jQuery);        