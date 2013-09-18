/*
Copyright 2008-2009 University of Toronto
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
    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Empty uiEnhancer works with customized enactors grades
     *******************************************************************************/

    var emphasizeLinksClass = "fl-emphasize-links";

    fluid.defaults("fluid.uiEnhancer.customizedEnactors", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            emphasizeLinks: {
                type: "fluid.uiOptions.enactors.emphasizeLinks",
                container: "{uiEnhancer}.container",
                options: {
                    cssClass: emphasizeLinksClass,
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "emphasizeLinks": "value"
                    },
                    model: {
                        links: false
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.customizedEnactors", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                container: ".flt-customizedEnactors",
                options: {
                    gradeNames: ["fluid.uiEnhancer.customizedEnactors"],
                    tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
                }
            },
            styleElementsTester: {
                type: "fluid.tests.customizedEnactorsTester"
            }
        }
    });

    fluid.tests.testCustomizedEnactors = function (container, cssClass, expectedValue) {
        jqUnit.assertEquals("The emphasized links are applied - " + expectedValue, expectedValue, $(container).children("a").hasClass(cssClass));
    };

    fluid.defaults("fluid.tests.customizedEnactorsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOpts: {
            cssClass: emphasizeLinksClass
        },
        modules: [{
            name: "Customized enactors grade with empty UIEnhancer",
            tests: [{
                expect: 3,
                name: "Apply customized enactors grade",
                sequence: [{
                    func: "fluid.tests.testCustomizedEnactors",
                    args: ["{uiEnhancer}.container", "{that}.options.testOpts.cssClass", false]
                }, {
                    func: "{uiEnhancer}.applier.requestChange",
                    args: ["emphasizeLinks", true]
                }, {
                    func: "fluid.tests.testCustomizedEnactors",
                    args: ["{uiEnhancer}.container", "{that}.options.testOpts.cssClass", true]
                }, {
                    func: "{uiEnhancer}.applier.requestChange",
                    args: ["emphasizeLinks", false]
                }, {
                    func: "fluid.tests.testCustomizedEnactors",
                    args: ["{uiEnhancer}.container", "{that}.options.testOpts.cssClass", false]
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Apply default settings
     *******************************************************************************/

    fluid.defaults("fluid.tests.settings", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            uiOptions: {
                type: "fluid.uiOptions.rootModel.starter"
            },
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                container: "body",
                options: {
                    gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                    tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
                }
            },
            settingsTester: {
                type: "fluid.tests.settingsTester"
            }
        }
    });
    
    fluid.tests.getInitialFontSize = function (container, tester) {
        tester.options.testOpts.initialFontSize = parseFloat(container.css("fontSize"));
    };

    fluid.tests.testTocStyling = function () {
        var tocLinks = $(".flc-toc-tocContainer a");
        var filtered = tocLinks.filter(".fl-link-enhanced");
        jqUnit.assertEquals("All toc links have been styled", tocLinks.length, filtered.length);
        jqUnit.assertNotEquals("Some toc links generated on 2nd pass", 0, tocLinks.length);
    };

    fluid.tests.testSettings = function (uiEnhancer, testSettings, initialFontSize) {
        var expectedTextSize = initialFontSize * testSettings.textSize;

        jqUnit.assertEquals("Large text size is set", expectedTextSize.toFixed(0) + "px", uiEnhancer.container.css("fontSize"));
        jqUnit.assertTrue("Verdana font is set", uiEnhancer.container.hasClass("fl-font-uio-verdana"));
        jqUnit.assertTrue("High contrast is set", uiEnhancer.container.hasClass("fl-theme-bw"));
    };

    fluid.defaults("fluid.tests.settingsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOpts: {
            testSettings: {
                textSize: "1.5",
                textFont: "verdana",
                theme: "bw",
                layout: false,
                toc: true,
                links: true
            }
        },
        modules: [{
            name: "Test apply settings",
            tests: [{
                expect: 5,
                name: "Apply settings",
                sequence: [{
                    func: "fluid.tests.getInitialFontSize",
                    args: ["{uiEnhancer}.container", "{that}"]
                }, {
                    func: "{uiEnhancer}.updateModel",
                    args: ["{that}.options.testOpts.testSettings"]
                }, {
                    listener: "fluid.tests.testTocStyling",
                    spec: {priority: "last"},
                    event: "{uiEnhancer}.tableOfContents.events.afterTocRender"
                }, {
                    func: "fluid.tests.testSettings",
                    args: ["{uiEnhancer}", "{that}.options.testOpts.testSettings", "{that}.options.testOpts.initialFontSize"]
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Options munging
     *******************************************************************************/

    fluid.defaults("fluid.tests.optionsMunging", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            uiOptions: {
                type: "fluid.uiOptions.rootModel.starter",
                options: {
                    members: {
                        rootModel: {
                            theme: "yb"
                        }
                    }
                }
            },
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                container: "body",
                options: {
                    gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                    tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html",
                    classnameMap: {
                        "textFont": {
                            "default": "fl-font-times"
                        },
                        "theme": {
                            "yb": "fl-test"
                        }
                    }
                }
            },
            styleElementsTester: {
                type: "fluid.tests.optionsMungingTester"
            }
        }
    });

    fluid.tests.testOptionsMunging = function (uiEnhancer) {
        jqUnit.assertTrue("The initial times font is set correctly", uiEnhancer.container.hasClass("fl-font-times"));
        jqUnit.assertTrue("The initial test theme is set correctly", uiEnhancer.container.hasClass("fl-test"));
    };

    fluid.defaults("fluid.tests.optionsMungingTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test options munging",
            tests: [{
                expect: 2,
                name: "Options munging",
                type: "test",
                func: "fluid.tests.testOptionsMunging",
                args: ["{uiEnhancer}"]
            }]
        }]
    });

    /*******************************************************************************
     * FLUID-4703: Line height unit
     *******************************************************************************/

    fluid.defaults("fluid.tests.lineHeightUnit", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            lineHeightUnitTester: {
                type: "fluid.tests.lineHeightUnitTester"
            }
        }
    });

    fluid.tests.testLineHeightUnit = function () {
        var child1El = $(".flt-lineHeight-child-1em");
        var child2El = $(".flt-lineHeight-child-2em");

        var child1emHeight = child1El.height() - 1; // adjusted to account for rounding by jQuery
        var child2emHeight = child2El.height();
        jqUnit.assertTrue("The line height of the 2em child should be close to twice the size of the 1em child", 2 * child1emHeight < child2emHeight);
    };

    fluid.defaults("fluid.tests.lineHeightUnitTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test line height unit",
            tests: [{
                expect: 1,
                name: "Line Height Unit",
                type: "test",
                func: "fluid.tests.testLineHeightUnit"
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.customizedEnactors",
            "fluid.tests.settings",
            "fluid.tests.optionsMunging",
            "fluid.tests.lineHeightUnit"
        ]);
    });

})(jQuery);
