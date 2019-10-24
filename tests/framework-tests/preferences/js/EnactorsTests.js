/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

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

    fluid.tests.testStyle = function (that, expectedDefaultFlag, expectedCssClass) {
        var elements = that.options.elementsToStyle;

        jqUnit.assertEquals("Default value: " + expectedDefaultFlag, expectedDefaultFlag, that.model.value);
        jqUnit.assertEquals("Css class to be applied or removed: " + expectedCssClass, expectedCssClass, that.options.cssClass);

        jqUnit.assertFalse("Default - css class is not applied", elements.hasClass(expectedCssClass));

        that.applier.change("value", true);
        jqUnit.assertTrue("True value - Css class has been applied", elements.hasClass(expectedCssClass));

        that.applier.change("value", false);
        jqUnit.assertFalse("False value - Css class has been removed", elements.hasClass(expectedCssClass));
    };

    /*******************************************************************************
     * Unit tests for fluid.prefs.styleElements
     *******************************************************************************/

    fluid.defaults("fluid.tests.styleElementsTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        expectedCssClass: "fl-style-test",
        expectedDefaultFlag: false,
        container: ".flc-styleElements",
        components: {
            styleElements: {
                type: "fluid.prefs.enactor.styleElements",
                options: {
                    cssClass: "fl-style-test",
                    elementsToStyle: {
                        expander: {
                            funcName: "fluid.tests.getElements",
                            args: "{styleElementsTests}.options.container"
                        }
                    },
                    model: {
                        value: false
                    }
                }
            },
            styleElementsTester: {
                type: "fluid.tests.styleElementsTester"
            }
        }
    });

    fluid.tests.getElements = function (container) {
        return $(container).children();
    };

    fluid.defaults("fluid.tests.styleElementsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Test style element component",
            tests: [{
                expect: 5,
                name: "Apply and reset the style",
                type: "test",
                func: "fluid.tests.testStyle",
                args: ["{styleElements}", "{fluid.tests.styleElementsTests}.options.expectedDefaultFlag", "{fluid.tests.styleElementsTests}.options.expectedCssClass"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.enhanceInputs
     *******************************************************************************/

    fluid.defaults("fluid.tests.enhanceInputsTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        expectedEnhanceInputsClass: "fl-enhanceInputs-test",
        expectedDefaultFlag: false,
        components: {
            enhanceInputs: {
                type: "fluid.prefs.enactor.enhanceInputs",
                container: ".flc-enhanceInputs",
                options: {
                    cssClass: "fl-enhanceInputs-test",
                    model: {
                        value: false
                    }
                }
            },
            enhanceInputsTester: {
                type: "fluid.tests.enhanceInputsTester"
            }
        }
    });

    fluid.defaults("fluid.tests.enhanceInputsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Test enhance inputs enactor",
            tests: [{
                expect: 5,
                name: "Apply and reset enhance inputs",
                type: "test",
                func: "fluid.tests.testStyle",
                args: ["{enhanceInputs}", "{fluid.tests.enhanceInputsTests}.options.expectedDefaultFlag", "{fluid.tests.enhanceInputsTests}.options.expectedEnhanceInputsClass"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.classSwapper
     *******************************************************************************/

    fluid.defaults("fluid.tests.classSwapperTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        expectedClass: "fl-test",
        components: {
            classSwapper: {
                type: "fluid.prefs.enactor.classSwapper",
                container: ".flc-classSwapper",
                options: {
                    classes: {
                        "default": "",
                        "test": "fl-test"
                    },
                    model: {
                        value: "default"
                    }
                }
            },
            classSwapperTester: {
                type: "fluid.tests.classSwapperTester"
            }
        }
    });

    fluid.tests.testClassSwapper = function (that, expectedClass) {
        var defaultStyle = that.container.attr("class");

        jqUnit.assertEquals("The style class is not applied by default", defaultStyle, that.container.attr("class"));

        that.applier.change("value", "test");
        jqUnit.assertEquals("The style class has been applied", defaultStyle + " " + expectedClass, that.container.attr("class"));

        that.applier.change("value", "");
        jqUnit.assertEquals("The style class has been removed", defaultStyle, that.container.attr("class"));
    };

    fluid.defaults("fluid.tests.classSwapperTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Test class swapper enactor",
            tests: [{
                expect: 3,
                name: "Swap css class",
                type: "test",
                func: "fluid.tests.testClassSwapper",
                args: ["{classSwapper}", "{fluid.tests.classSwapperTests}.options.expectedClass"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.textSize
     *******************************************************************************/

    fluid.defaults("fluid.tests.textSizeTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            textSize: {
                type: "fluid.prefs.enactor.textSize",
                container: ".flc-textSize",
                options: {
                    fontSizeMap: fluid.tests.enactor.utils.fontSizeMap,
                    model: {
                        value: 1
                    }
                }
            },
            textSizeTester: {
                type: "fluid.tests.textSizeTester"
            }
        }
    });

    fluid.tests.testTextSize = function (that) {
        var expectedInitialSize = 16;
        var muliplier = 2;
        var remTestElm = $("#flc-textSize-remTest");
        var initialREMSize = fluid.prefs.enactor.getTextSizeInPx(remTestElm, fluid.tests.enactor.utils.fontSizeMap);

        jqUnit.assertEquals("Check that the size is pulled from the container correctly", expectedInitialSize, that.initialSize);
        that.applier.change("value", muliplier);
        jqUnit.assertEquals("The size should be doubled", (expectedInitialSize * muliplier) + "px", that.root.css("fontSize"));
        jqUnit.assertEquals("The font size specified in rem units should be doubled", initialREMSize * muliplier, fluid.prefs.enactor.getTextSizeInPx(remTestElm, fluid.tests.enactor.utils.fontSizeMap));

        // reset font size of root
        $("html").css("font-size", that.initialSize + "px");
    };

    fluid.defaults("fluid.tests.textSizeTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Test text size enactor",
            tests: [{
                expect: 3,
                name: "Apply text size in times",
                type: "test",
                func: "fluid.tests.testTextSize",
                args: ["{textSize}"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for getLineHeight & getLineHeightMultiplier
     *******************************************************************************/

    fluid.defaults("fluid.tests.getLineHeightTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        container: ".flc-lineSpace",
        fontSizeMap: fluid.tests.enactor.utils.fontSizeMap,
        expectedTestSize: 8,
        expectedSizeAtUndetected: 1,
        components: {
            getLineHeightTester: {
                type: "fluid.tests.getLineHeightTester"
            }
        }
    });

    fluid.tests.testGetLineHeight = function () {
        var container = $(".flc-lineSpace-getTests");
        var lineHeight = fluid.prefs.enactor.lineSpace.getLineHeight(container);

        // In IE8 and IE9 the lineHeight is returned as a mutliplier
        // Newer versions of IE and other browsers return the calculated pixel value
        if ($.browser.msie && $.browser.version < 10) {
            jqUnit.assertEquals("getLineHeight multiplier in IE8 and IE9", 2, lineHeight);
        } else {
            jqUnit.assertEquals("getLineHeight in px", "12px", lineHeight);
        }
    };

    var testGetLineHeightMultiplier = function (lineHeight, expected) {
        var container = $(".flc-lineSpace-getTests");
        var fontSize = fluid.prefs.enactor.getTextSizeInPx(container, fluid.tests.enactor.utils.fontSizeMap);

        var numerizedLineHeight = fluid.prefs.enactor.lineSpace.getLineHeightMultiplier(lineHeight, Math.round(fontSize));

        jqUnit.assertEquals("line-height value '" + lineHeight + "' has been converted correctly", expected, numerizedLineHeight);
    };

    fluid.tests.testGetLineHeightMultiplier = function () {
        var undefinedLineHeight;
        testGetLineHeightMultiplier(undefinedLineHeight, 0);
        testGetLineHeightMultiplier("normal", 1.2);
        testGetLineHeightMultiplier("6px", 1);
        testGetLineHeightMultiplier("1.5", 1.5);
    };

    fluid.defaults("fluid.tests.getLineHeightTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Test getLineHeight",
            tests: [{
                expect: 1,
                name: "Get line height",
                type: "test",
                func: "fluid.tests.testGetLineHeight"
            }]
        }, {
            name: "Test getLineHeightMultiplier",
            tests: [{
                expect: 4,
                name: "Get line height multiplier",
                type: "test",
                func: "fluid.tests.testGetLineHeightMultiplier"
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.lineSpace
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.lineSpace", {
        gradeNames: ["fluid.prefs.enactor.lineSpace"],
        fontSizeMap: fluid.tests.enactor.utils.fontSizeMap,
        model: {
            value: 1
        }
    });

    fluid.defaults("fluid.tests.lineSpaceTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            lineSpace: {
                type: "fluid.tests.prefs.enactor.lineSpace",
                container: ".flc-lineSpace",
                // Forcing getLineHeight to return "normal" and getLineHeightMultiplier to return 28.8px
                // because of the various ways that browsers treat the default/"normal" line-height style.
                options: {
                    invokers: {
                        getLineHeight: {
                            funcName: "fluid.identity",
                            args: ["normal"]
                        },
                        getLineHeightMultiplier: {
                            funcName: "fluid.identity",
                            args: [1.2]
                        }
                    }
                }
            },
            lineSpaceLength: {
                type: "fluid.tests.prefs.enactor.lineSpace",
                container: ".flc-lineSpace-length"
            },
            lineSpaceNumber: {
                type: "fluid.tests.prefs.enactor.lineSpace",
                container: ".flc-lineSpace-number"
            },
            lineSpacePercentage: {
                type: "fluid.tests.prefs.enactor.lineSpace",
                container: ".flc-lineSpace-percentage"
            },
            lineSpaceTester: {
                type: "fluid.tests.lineSpaceTester"
            }
        }
    });

    fluid.tests.verifyInitValues = function (that, initialSize, multiplier) {

        jqUnit.assertEquals("The initial size is retrieved correctly", initialSize, that.initialSize);
        jqUnit.assertEquals("The line height multiplier is calculated correctly", multiplier, that.lineHeightMultiplier);
    };

    fluid.tests.verifyLineSpaceSet = function (that, value, lineHeight) {
        jqUnit.assertEquals("The new model value should be set correctly.", value, that.model.value);
        jqUnit.assertEquals("The new line height should be set correctly.", lineHeight, that.container.css("line-height"));
    };

    fluid.defaults("fluid.tests.lineSpaceTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Line Space - normal line-height",
            tests: [{
                expect: 2,
                name: "Set Line-height",
                // Not running the model changed tests due to the variances across browsers in what the
                // default line-height is.
                sequence: [{
                    func: "fluid.tests.verifyInitValues",
                    args: ["{lineSpace}", "normal", 1.2]
                }]
            }]
        }, {
            name: "Line Space - line-height in length",
            tests: [{
                expect: 4,
                name: "Set Line-height",
                sequence: [{
                    func: "fluid.tests.verifyInitValues",
                    args: ["{lineSpaceLength}", "12px", 0.5]
                }, {
                    func: "{lineSpaceLength}.applier.change",
                    args: ["value", 2]
                }, {
                    listener: "fluid.tests.verifyLineSpaceSet",
                    args: ["{lineSpaceLength}", 2, "24px"],
                    spec: {path: "value", priority: "last:testing"},
                    changeEvent: "{lineSpaceLength}.applier.modelChanged"
                }]
            }]
        }, {
            name: "Line Space - line-height in unitless number",
            tests: [{
                expect: 4,
                name: "Set Line-height",
                sequence: [{
                    func: "fluid.tests.verifyInitValues",
                    args: ["{lineSpaceNumber}", "36px", 1.5]
                }, {
                    func: "{lineSpaceNumber}.applier.change",
                    args: ["value", 2]
                }, {
                    listener: "fluid.tests.verifyLineSpaceSet",
                    args: ["{lineSpaceNumber}", 2, "72px"],
                    spec: {path: "value", priority: "last:testing"},
                    changeEvent: "{lineSpaceNumber}.applier.modelChanged"
                }]
            }]
        }, {
            name: "Line Space - line-height in percentage",
            tests: [{
                expect: 4,
                name: "Set Line-height",
                sequence: [{
                    func: "fluid.tests.verifyInitValues",
                    args: ["{lineSpacePercentage}", "12px", 0.5]
                }, {
                    func: "{lineSpacePercentage}.applier.change",
                    args: ["value", 2]
                }, {
                    listener: "fluid.tests.verifyLineSpaceSet",
                    args: ["{lineSpacePercentage}", 2, "24px"],
                    spec: {path: "value", priority: "last:testing"},
                    changeEvent: "{lineSpacePercentage}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.tableOfContents
     *******************************************************************************/

    fluid.defaults("fluid.tests.tableOfContentsTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            toc: {
                type: "fluid.prefs.enactor.tableOfContents",
                container: ".flc-tableOfContents",
                options: {
                    tocTemplate: "../../../../src/components/tableOfContents/html/TableOfContents.html",
                    tocMessage: "../data/tableOfContents-enactor.json",
                    model: {
                        toc: false
                    }
                }
            },
            tableOfContentsTester: {
                type: "fluid.tests.tableOfContentsTester"
            }
        }
    });

    fluid.tests.checkTocHeader = function (expectedTocHeader) {
        jqUnit.assertEquals("Table of contents has the correct header set", expectedTocHeader, $(".flc-toc-header").text());
    };

    fluid.tests.checkTocLevels = function (expectedTocLevels) {
        jqUnit.assertEquals("Table of contents has " + expectedTocLevels + " levels", expectedTocLevels, $(".flc-toc-tocContainer").children("ul").length);
    };

    fluid.tests.tocVisibilityChecker = function (expectedTocLevels, tocContainer, isShown) {
        jqUnit.assertEquals("Table of contents has " + expectedTocLevels + " levels", expectedTocLevels, $(".flc-toc-tocContainer").children("ul").length);
        jqUnit.assertEquals("The visibility of the table of contents is " + isShown, isShown, $(tocContainer).is(":visible"));
    };

    fluid.defaults("fluid.tests.tableOfContentsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            tocContainer: ".flc-toc-tocContainer",
            expectedNoTocLevels: 0,
            expectedTocLevelsAtTrue: 1,
            expectedTocHeader: "ToC"
        },
        modules: [{
            name: "Test table of contents enactor",
            tests: [{
                expect: 6,
                name: "Test in order: default, toc is on, toc is off",
                sequence: [{
                    func: "fluid.tests.checkTocLevels",
                    args: ["{that}.options.testOptions.expectedNoTocLevels"]
                }, {
                    func: "{toc}.applier.change",
                    args: ["toc", true]
                }, {
                    listener: "fluid.tests.tocVisibilityChecker",
                    args: ["{that}.options.testOptions.expectedTocLevelsAtTrue", "{that}.options.testOptions.tocContainer", true],
                    event: "{toc}.events.afterTocRender"
                }, {
                    func: "fluid.tests.checkTocHeader",
                    args: ["{that}.options.testOptions.expectedTocHeader"]
                }, {
                    func: "{toc}.applier.change",
                    args: ["toc", false]
                }, {
                    func: "fluid.tests.tocVisibilityChecker",
                    args: ["{that}.options.testOptions.expectedTocLevelsAtTrue", "{that}.options.testOptions.tocContainer", false]
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.styleElementsTests",
            "fluid.tests.enhanceInputsTests",
            "fluid.tests.classSwapperTests",
            "fluid.tests.textSizeTests",
            "fluid.tests.getLineHeightTests",
            "fluid.tests.lineSpaceTests",
            "fluid.tests.tableOfContentsTests"
        ]);
    });

})(jQuery);
