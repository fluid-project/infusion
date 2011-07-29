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
    
    /***********
     * Demands *
     ***********/
    
    // Supply the templates
    fluid.staticEnvironment.fatPanelUIOptionsTests = fluid.typeTag("fluid.uiOptions.fatPanelUIOptionsTests");

    fluid.demands("fluid.cookieStore", ["fluid.uiOptions.fatPanelUIOptionsTests"], {
        options: {
            cookieName: "fluid-ui-settings-test"
        }
    });    
    
    $(document).ready(function () {
        fluid.setLogging(true);

        var tests = jqUnit.testCase("FatPanelUIOptions Tests");
        
        /***************************************
         * FatPanelUIOptions integration tests *
         ***************************************/
        
        var applierRequestChanges = function (uiOptions, selectionOptions) {
            uiOptions.applier.requestChange("selections.textFont", selectionOptions.textFont);
            uiOptions.applier.requestChange("selections.theme", selectionOptions.theme);
            uiOptions.applier.requestChange("selections.textSize", selectionOptions.textSize);
            uiOptions.applier.requestChange("selections.lineSpacing", selectionOptions.lineSpacing);            
        };
        
        var checkUIOComponents = function (uio) {
            var components = uio.options.components;
            var eventBinderComponents = components.eventBinder.options.components; 
            jqUnit.assertTrue("slidingPanel is present", components.slidingPanel);
            jqUnit.assertTrue("markupRenderer is present", components.markupRenderer);
            jqUnit.assertTrue("uiEnhancer is preset", components.uiEnhancer);
            jqUnit.assertTrue("eventBinder is present", components.eventBinder);
            jqUnit.assertTrue("uiOptionsBridge is present", components.uiOptionsBridge);
            jqUnit.assertTrue("uiEnhancer is present as an eventBinder sub-component", eventBinderComponents.uiEnhancer);
            jqUnit.assertTrue("uiOptionsLoader is present as an eventBinder sub-component", eventBinderComponents.uiOptionsLoader);
            jqUnit.assertTrue("slidingPanel is present as an eventBinder sub-component", eventBinderComponents.slidingPanel);
            jqUnit.assertTrue("markupRenderer is present as an uiOptionsBridge sub-component", components.uiOptionsBridge.options.components.markupRenderer);
        };        
        
        var checkModelSelections = function (expectedSelections, actualSelections) {
            jqUnit.assertEquals("Text font correctly updated", expectedSelections.textFont, actualSelections.textFont);
            jqUnit.assertEquals("Theme correctly updated", expectedSelections.theme, actualSelections.theme);
            jqUnit.assertEquals("Text size correctly updated", expectedSelections.textSize, actualSelections.textSize);
            jqUnit.assertEquals("Line spacing correctly updated", expectedSelections.lineSpacing, actualSelections.lineSpacing);            
        };
        
        var bwSkin = {
            textSize: "1.8",
            textFont: "verdana",
            theme: "bw",
            lineSpacing: 2
        };
        
        tests.asyncTest("Fat Panel UIOptions Integration tests", function () {
            fluid.pageEnhancer({
                tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
            });
            
            var that = fluid.uiOptions.fatPanelUIOptions(".flc-uiOptions-fatPanel", {
                prefix: "../../../components/uiOptions/html/",
                markupRenderer: {
                    options: {
                        markupProps: {
                            src: "../../../../components/uiOptions/html/FatPanelUIOptionsFrame.html"
                        }
                    }
                }
            });
            
            checkUIOComponents(that);

            /*
             * TODO: There have been talks about implementing a Framework event that fires 
             *       once a component and all of it's subcomponents have finished resolving.
             *       Once that is in, we can remove the hacky timeout call and listen for
             *       the framework event to tell us that the component is fully resolved.
             */
            setTimeout(function () {
                var defaultSiteSettings = that.uiEnhancer.settingsStore.options.defaultSiteSettings;
                var pageModel = that.uiEnhancer.model;
                var panelModel = that.uiOptionsBridge.uiOptionsLoader.uiOptions.uiEnhancer.model;
                
                var settingsStoreOptions = that.uiEnhancer.settingsStore.options;
                
                // Open the Fat Panel, apply changes, and close the panel
                that.slidingPanel.events.afterPanelShown.fire();
                applierRequestChanges(that.uiOptionsBridge.uiOptionsLoader.uiOptions, bwSkin);
                checkModelSelections(bwSkin, pageModel);
                that.slidingPanel.events.afterPanelHidden.fire();
                checkModelSelections(bwSkin, panelModel);
                checkModelSelections(pageModel, panelModel);
                
                // Open the Fat Panel, click "Reset All", and close the panel
                that.slidingPanel.events.afterPanelShown.fire();
                that.uiOptionsBridge.uiOptionsLoader.uiOptions.locate("reset").click();
                checkModelSelections(pageModel, defaultSiteSettings);
                that.slidingPanel.events.afterPanelHidden.fire();
                checkModelSelections(panelModel, defaultSiteSettings);
                checkModelSelections(pageModel, panelModel);
                start();
            }, 1500);
        });
    });
})(jQuery);