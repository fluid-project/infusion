/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.textFont
     *******************************************************************************/
    var classnameMap = {
            "textFont": {
                "default": "",
                "times": "fl-font-uio-times",
                "comic": "fl-font-uio-comic-sans",
                "arial": "fl-font-uio-arial",
                "verdana": "fl-font-uio-verdana"
            }
        };

    fluid.defaults("fluid.tests.textFontPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            textFont: {
                type: "fluid.uiOptions.textFont",
                container: ".flc-textFont",
                options: {
                    classnameMap: classnameMap,
                    resources: {
                        template: {
                            url: "../../../components/uiOptions/html/UIOptionsTemplate-textFont.html"
                        }
                    },
                    events: {
                        onRefreshViewReady: null
                    },
                    finalInit: "fluid.uiOptions.textFont.finalInit"
                }
            },
            textFontTester: {
                type: "fluid.tests.textFontTester"
            }
        }
    });

    fluid.uiOptions.textFont.finalInit = function (that) {
        fluid.fetchResources(that.options.resources, function () {
            that.container.append(that.options.resources.template.resourceText);
            that.refreshView();
            console.log("refreshed view");
            that.events.onRefreshViewReady.fire();
        });
    };

    fluid.tests.testTextFont = function (textFont) {
        console.log("calling onRefreshViewReady");
        var a=1;
//        jqUnit.assertEquals("There are 5 text fonts in the control", 5, textFont);
//        jqUnit.assertEquals("The first text font is default", "default", textFont);
    };
    
    fluid.defaults("fluid.tests.textFontTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test the text font settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the text font panel",
                sequence: [{
                    func: "{textFont}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.testTextFont",
                    makerArgs: ["{textFont}"],
                    event: "{textFont}.events.onRefreshViewReady"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.textFontPanel"
        ]);
    });

})(jQuery);
