/*
Copyright 2008-2009 University of Toronto
Copyright 2011-2015 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Empty uiEnhancer works with customized enactors grades
     *******************************************************************************/

    var enhanceInputsClass = "fl-input-enhanced";

    fluid.defaults("fluid.uiEnhancer.customizedEnactors", {
        gradeNames: ["fluid.viewComponent"],
        components: {
            enhanceInputs: {
                type: "fluid.prefs.enactor.enhanceInputs",
                container: "{uiEnhancer}.container",
                options: {
                    cssClass: enhanceInputsClass,
                    model: {
                        value: "{uiEnhancer}.model.enhanceInputs"
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.customizedEnactors", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                container: ".flt-customizedEnactors",
                options: {
                    gradeNames: ["fluid.uiEnhancer.customizedEnactors"]
                }
            },
            styleElementsTester: {
                type: "fluid.tests.customizedEnactorsTester"
            }
        }
    });

    fluid.tests.testCustomizedEnactors = function (container, cssClass, expectedValue) {
        var index = $(container).prop("class").indexOf(cssClass);
        var assertFunc = expectedValue ? jqUnit.assertNotEquals : jqUnit.assertEquals;
        assertFunc("The enhance inputs css selector has " + expectedValue ? "" : "not " + "been applied - " + expectedValue, -1, index);
    };

    fluid.defaults("fluid.tests.customizedEnactorsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            cssClass: enhanceInputsClass
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
                    func: "{uiEnhancer}.applier.change",
                    args: ["enhanceInputs", true]
                }, {
                    func: "fluid.tests.testCustomizedEnactors",
                    args: ["{uiEnhancer}.container", "{that}.options.testOpts.cssClass", true]
                }, {
                    func: "{uiEnhancer}.applier.change",
                    args: ["enhanceInputs", false]
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
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            prefsEditor: {
                type: "fluid.prefs.initialModel.starter"
            },
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                container: "body",
                options: {
                    gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                    tocTemplate: "../../../../src/components/tableOfContents/html/TableOfContents.html",
                    tocMessage: "../data/tableOfContents-enactor.json"
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

    fluid.tests.testToc = function () {
        var tocLinks = $(".flc-toc-tocContainer a");
        jqUnit.assertNotEquals("Toc links have been rendered", 0, tocLinks.length);
        jqUnit.assertNotEquals("Some toc links generated on 2nd pass", 0, tocLinks.length);
    };

    fluid.tests.testSettings = function (uiEnhancer, testSettings, initialFontSize) {
        var expectedTextSize = initialFontSize * testSettings.textSize;

        jqUnit.assertEquals("Large text size is set", expectedTextSize.toFixed(0) + "px", uiEnhancer.container.css("fontSize"));
        jqUnit.assertTrue("Verdana font is set", uiEnhancer.container.hasClass("fl-font-verdana"));
        jqUnit.assertTrue("High contrast is set", uiEnhancer.container.hasClass("fl-theme-bw"));
    };

    fluid.defaults("fluid.tests.settingsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            testSettings: {
                textSize: "1.5",
                textFont: "verdana",
                theme: "bw",
                layout: false,
                toc: true
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
                    listener: "fluid.tests.testToc",
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
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            prefsEditor: {
                type: "fluid.prefs.initialModel.starter",
                options: {
                    members: {
                        initialModel: {
                            preferences: {
                                theme: "yb"
                            }
                        }
                    }
                }
            },
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                container: "body",
                options: {
                    gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                    tocTemplate: "../../../../src/components/tableOfContents/html/TableOfContents.html",
                    tocMessage: "../data/tableOfContents-enactor.json",
                    classnameMap: {
                        "textFont": {
                            "default": "fl-font-default"
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
        jqUnit.assertTrue("The initial times font is set correctly", uiEnhancer.container.hasClass("fl-font-default"));
        jqUnit.assertTrue("The initial test theme is set correctly", uiEnhancer.container.hasClass("fl-test"));
    };

    fluid.defaults("fluid.tests.optionsMungingTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
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
        gradeNames: ["fluid.test.testEnvironment"],
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
        gradeNames: ["fluid.test.testCaseHolder"],
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
