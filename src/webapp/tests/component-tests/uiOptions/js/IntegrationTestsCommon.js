/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

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
    
    fluid.staticEnvironment.uiOptionsTest = fluid.typeTag("fluid.tests.uiOptions");
    
    // Use temp store rather than the cookie store for setting save
    fluid.demands("fluid.uiOptions.store", ["fluid.uiEnhancer", "fluid.tests.uiOptions"], {
        funcName: "fluid.tempStore"
    });
    
    // Supply the table of contents' template URL
    fluid.demands("fluid.tableOfContents", ["fluid.uiEnhancer"], {
        options: {
            templateUrl: "../../../../components/tableOfContents/html/TableOfContents.html"
        }
    });
      
    fluid.registerNamespace("fluid.tests.uiOptions");
    
    fluid.tests.uiOptions.bwSkin = {
        textSize: "1.8",
        textFont: "verdana",
        theme: "bw",
        lineSpacing: 2
    };
        
    fluid.tests.uiOptions.ybSkin = {
        textSize: "2",
        textFont: "comic sans",
        theme: "yb",
        lineSpacing: 1.5
    };  
    
    fluid.tests.uiOptions.expectedComponents = {
        "fluid.uiOptions.fatPanel": [
            "textSizer",
            "lineSpacer",
            "textFont",
            "contrast",
            "layoutControls",
            "linksControls",
            "settingsStore",
            "eventBinder"
        ],
        "fluid.uiOptions.fullNoPreview": [
            "textSizer",
            "lineSpacer",
            "textFont",
            "contrast",
            "layoutControls",
            "linksControls",
            "settingsStore",
            "eventBinder"
        ],
        "fluid.uiOptions.fullPreview": [
            "textSizer",
            "lineSpacer",
            "textFont",
            "contrast",
            "layoutControls",
            "linksControls",
            "preview",
            "settingsStore",
            "eventBinder"
        ]
    };
         
    
    fluid.tests.uiOptions.assertPresent = function (uiOptions, expecteds) {
        jqUnit.expect(expecteds.length);
        fluid.each(expecteds, function (expected) {
            var value = fluid.get(uiOptions, expected);
            jqUnit.assertTrue("Expected component at path " + expected, value);
        });
    };
    
    fluid.tests.uiOptions.checkModelSelections = function (message, expectedSelections, actualSelections) {
        jqUnit.assertLeftHand("Model correctly updated: " + message, expectedSelections, actualSelections);
    };
            
    fluid.tests.uiOptions.applierRequestChanges = function (uiOptions, selectionOptions) {
        fluid.each(selectionOptions, function (value, key) {
            uiOptions.applier.requestChange("selections." + key, value);
        });
    };
    
    fluid.tests.uiOptions.integrationTest = function (componentName, resetShouldSave) {
        jqUnit.asyncTest(componentName + " Integration tests", function () {
            fluid.pageEnhancer({
                gradeNames: ["fluid.uiEnhancer.defaultActions"],
                tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
            });
            var savedSelections;
            function testSave(selections) {
                savedSelections = selections;
            }
            var savedSelections2;
            function testSave2(selections) {
                savedSelections2 = selections;
            }
            
            function testComponent(uiOptionsLoader, uiOptions) {
                var defaultSiteSettings = uiOptions.settingsStore.options.defaultSiteSettings;
                
                fluid.tests.uiOptions.assertPresent(uiOptions, fluid.tests.uiOptions.expectedComponents[componentName]);
                fluid.tests.uiOptions.applierRequestChanges(uiOptions, fluid.tests.uiOptions.bwSkin);
    
                var saveButton = uiOptions.locate("save");
                saveButton.click();
                fluid.tests.uiOptions.checkModelSelections("model from bwSkin", fluid.tests.uiOptions.bwSkin, uiOptions.model.selections);
                jqUnit.assertEquals("Save event fired with selections", uiOptions.model.selections, savedSelections);
                jqUnit.assertEquals("Direct save event fired with selections", uiOptions.model.selections, savedSelections2);
                fluid.tests.uiOptions.applierRequestChanges(uiOptions, fluid.tests.uiOptions.ybSkin);
    
                var cancelButton = uiOptions.locate("cancel");
                cancelButton.click();
                fluid.tests.uiOptions.checkModelSelections("model from bwSkin (unchanged after cancel", fluid.tests.uiOptions.bwSkin, uiOptions.model.selections);
                
                var resetButton = uiOptions.locate("reset");
                resetButton.click();
                fluid.tests.uiOptions.checkModelSelections("model from original", defaultSiteSettings, uiOptions.model.selections);
                fluid.tests.uiOptions.applierRequestChanges(uiOptions, fluid.tests.uiOptions.bwSkin);
                
                cancelButton.click();
                fluid.tests.uiOptions.checkModelSelections("model from original (correct state after reset and cancel)", 
                    (resetShouldSave ? defaultSiteSettings : fluid.tests.uiOptions.bwSkin), uiOptions.model.selections);
                
                jqUnit.start();
            }
            
            jqUnit.expect(6);
                       
            var that = fluid.invokeGlobalFunction(componentName, ["#myUIOptions", {
                prefix: "../../../../components/uiOptions/html/",
                uiOptionsLoader: {
                    options: {
                        listeners: {
                            onReady: testComponent
                        }
                    }
                },
                uiOptions: {
                    options: {
                        gradeNames: ["fluid.uiOptions.defaultSettingsPanels"],
                        listeners: {
                            "onSave.munged": testSave
                        }
                    }
                },
                components: {
                    uiOptionsLoader: {
                        options: {
                            components: {
                                uiOptions: {
                                    options: {
                                        listeners: {
                                            "onSave.direct": testSave2
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }]);
            
        });     
    };
    
    fluid.tests.uiOptions.enhancerOptions = {
        gradeNames: ["fluid.uiEnhancer.defaultActions"],
        tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html",
        classnameMap: {
            "textFont": {
                "default": "fl-font-times"
            },
            "theme": {
                "yb": "fl-test"
            }
        },
        defaultSiteSettings: {
            theme: "yb"
        }
    };
    
    fluid.tests.uiOptions.mungingIntegrationTest = function (componentName, container, extraOpts, extraListener) {
        extraListener = extraListener || function () { jqUnit.start(); };
      
        jqUnit.asyncTest(componentName + " Munging Integration tests", function () {
            fluid.pageEnhancer(fluid.tests.uiOptions.enhancerOptions);

            var testStrings = ["Test1", "Test2", "Test3", "Test4", "Test5"];
            var testControlValues = ["a", "b", "c", "d", "e"];
            
            jqUnit.expect(8);

            function testComponent(uiOptionsLoader, uiOptions) {
                var body = $("body");
                
                jqUnit.assertTrue("Times font is set", body.hasClass("fl-font-times"));
                jqUnit.assertTrue("The default test theme is set", body.hasClass("fl-test"));
                
                var actualTextFontStrings = uiOptions.textFont.options.strings.textFont;
                var actualTextFontControlValues = uiOptions.textFont.options.controlValues.textFont;
                
                jqUnit.assertEquals("There are 5 elements in the text font string list", 5, actualTextFontStrings.length);
                jqUnit.assertEquals("The first text font string value matches", testStrings[0], actualTextFontStrings[0]);
                jqUnit.assertEquals("The fifth text font string value matches", testStrings[4], actualTextFontStrings[4]);

                jqUnit.assertEquals("There are 5 elements in the text font control value list", 5, actualTextFontControlValues.length);
                jqUnit.assertEquals("The first text font control value matches", testControlValues[0], actualTextFontControlValues[0]);
                jqUnit.assertEquals("The fifth text font control value matches", testControlValues[4], actualTextFontControlValues[4]);
            }

            var that;
            // TODO: This awful sleaze relies on the fact that the Fat Panel is *definitely* asynchronous, and therefore
            // "that" will be visible by the time this relay fires. A better solution would be to boil the "onReady" event
            // but this is currently impossible since the "other world" uses a different instantiator and has no visibility
            // of the component tree on this side of the iframe boundary
            function listenerRelay(uiOptionsLoader, uiOptions) {
                extraListener(that, uiOptionsLoader, uiOptions);
            }
            
            var baseOptions = {
                prefix: "../../../../components/uiOptions/html/",
                textFont: {
                    options: {
                        strings: {
                            textFont: testStrings
                        },
                        controlValues: { 
                            textFont: testControlValues
                        }
                    }
                },
                uiOptionsLoader: {
                    options: {
                        listeners: {
                            onReady: [
                                {listener: testComponent},
                                {listener: listenerRelay}
                            ]
                        }
                    }
                },
                uiOptions: {
                    options: {
                        gradeNames: ["fluid.uiOptions.defaultSettingsPanels"]
                    }
                }
            };
            
            var options = fluid.merge(null, baseOptions, extraOpts);

            that = fluid.invokeGlobalFunction(componentName, [container, options]);
        });
    };

})(jQuery);
  