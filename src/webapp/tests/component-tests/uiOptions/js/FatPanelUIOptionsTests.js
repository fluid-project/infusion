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
    fluid.staticEnvironment.fatPanelUIOptionsTests = fluid.typeTag("fluid.fatPanelUIOptionsTests");
    fluid.demands("fluid.uiOptionsTemplateLoader", "fluid.fatPanelUIOptionsTests", {
        options: {
            prefix: "../../../../components/uiOptions/html/"
        }
    });
    
    fluid.demands("fluid.renderIframe", ["fluid.fatPanelUIOptionsTests"], {
        options: {
            markupProps: {
                src: "../../../../components/uiOptions/html/uiOptionsIframe.html"
            }
        }
    });

    // Supply the table of contents' template URL
    fluid.demands("fluid.tableOfContents", ["fluid.uiEnhancer"], {
        options: {
            templateUrl: "../../../../components/tableOfContents/html/TableOfContents.html"
        }
    });
    
    /******************
     * Test functions *
     ******************/
     
    moveOptionsTest = function (expected, map, defaultLocation, testOptions) {
        var actual = {};
        var testOptions = testOptions || {
            opt1: "option1",
            opt2: "option2"
        };

        fluid.fatPanelUIOptions.moveOptions(testOptions, actual, defaultLocation, map);
        jqUnit.assertDeepEq("The options were move correctly", expected, actual);
    };
    
    $(document).ready(function () {
        fluid.setLogging(true);

        var tests = jqUnit.testCase("FatPanelUIOptions Tests");
        
        // tests.test("", function () {
        //            var 
        //        });
        
        /*********************************
         * fluid.fatPanelUIOptions tests *
         *********************************/
         
        tests.test("moveOptions: map all options", function () {
            var expected = {
                new1: {
                    opt1: "option1"
                },
                new2: {
                    opt2: "option2"
                }
            };
            
            var map = {
                opt1: "new1",
                opt2: "new2"
            };
            
            moveOptionsTest(expected, map);
        });
        
        tests.test("moveOptions: map some options w/ default location", function () {
            var expected = {
                new1: {
                    opt1: "option1"
                },
                other: {
                    opt2: "option2"
                }
            };
            
            var map = {
                opt1: "new1"
            };
            
            moveOptionsTest(expected, map, "other");
        });
        
        tests.test("moveOptions: map some options, no default location", function () {
            var expected = {
                new1: {
                    opt1: "option1"
                },
                opt2: "option2"
            };
            
            var map = {
                opt1: "new1"
            };
            
            moveOptionsTest(expected, map);
        });
        
        tests.test("moveOptions: no map w/ default location", function () {
            var expected = {
                "new": {
                    opt1: "option1",
                    opt2: "option2"
                }
            };
            
            var map = {
                opt1: "new1"
            };
            
            moveOptionsTest(expected, null, "new");
        });
        
        tests.test("moveOptions: no map, no default location", function () {
            var expected = {
                opt1: "option1",
                opt2: "option2"
            };
            
            moveOptionsTest(expected);
        });
        
        
//        fluid.uiOptionsEventBinder.finalInit
//        fluid.renderIframe.finalInit
//        fluid.uiOptionsBridge.finalInit
//        fluid.fatPanelUIOptions.moveOptions
//        fluid.fatPanelUIOptions.mapOptions
        
        /***************************************
         * FatPanelUIOptions integration tests *
         ***************************************/
        
        // integration tests here

    });
})(jQuery);        