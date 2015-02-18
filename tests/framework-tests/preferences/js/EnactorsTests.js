/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
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
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
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
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
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
     * Unit tests for fluid.prefs.enactor.emphasizeLinks
     *******************************************************************************/

    fluid.defaults("fluid.tests.emphasizeLinksTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        container: ".flc-emphasizeLinks",
        expectedEmphasizeLinksClass: "fl-emphasizeLinks-test",
        expectedDefaultFlag: false,
        components: {
            emphasizeLinks: {
                type: "fluid.prefs.enactor.emphasizeLinks",
                container: ".flc-emphasizeLinks",
                options: {
                    cssClass: "fl-emphasizeLinks-test",
                    model: {
                        value: false
                    }
                }
            },
            emphasizeLinksTester: {
                type: "fluid.tests.emphasizeLinksTester"
            }
        }
    });

    fluid.defaults("fluid.tests.emphasizeLinksTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test emphasize links enactor",
            tests: [{
                expect: 5,
                name: "Apply and reset emphasized links",
                type: "test",
                func: "fluid.tests.testStyle",
                args: ["{emphasizeLinks}", "{fluid.tests.emphasizeLinksTests}.options.expectedDefaultFlag", "{fluid.tests.emphasizeLinksTests}.options.expectedEmphasizeLinksClass"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.inputsLarger
     *******************************************************************************/

    fluid.defaults("fluid.tests.inputsLargerTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        container: ".flc-inputsLarger",
        expectedDefaultFlag: false,
        expectedInputsLargerClass: "fl-text-larger",
        components: {
            inputsLarger: {
                type: "fluid.prefs.enactor.inputsLarger",
                container: ".flc-inputsLarger",
                options: {
                    cssClass: "fl-text-larger",
                    model: {
                        value: false
                    }
                }
            },
            inputsLargerTester: {
                type: "fluid.tests.inputsLargerTester"
            }
        }
    });

    fluid.defaults("fluid.tests.inputsLargerTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test inputs larger enactor",
            tests: [{
                expect: 5,
                name: "Apply and reset larger inputs",
                type: "test",
                func: "fluid.tests.testStyle",
                args: ["{inputsLarger}", "{fluid.tests.inputsLargerTests}.options.expectedDefaultFlag", "{fluid.tests.inputsLargerTests}.options.expectedInputsLargerClass"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.inputsLarger
     *******************************************************************************/

    fluid.defaults("fluid.tests.classSwapperTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
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

        that.applier.requestChange("value", "test");
        jqUnit.assertEquals("The style class has been applied", defaultStyle + " " + expectedClass, that.container.attr("class"));

        that.applier.requestChange("value", "");
        jqUnit.assertEquals("The style class has been removed", defaultStyle, that.container.attr("class"));
    };

    fluid.defaults("fluid.tests.classSwapperTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
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
     * fontSizeMap used for the various size related enactor tests
     *******************************************************************************/

    var fontSizeMap = {
        "xx-small": "9px",
        "x-small":  "11px",
        "small":    "13px",
        "medium":   "15px",
        "large":    "18px",
        "x-large":  "23px",
        "xx-large": "30px"
    };

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.textSize
     *******************************************************************************/

    fluid.defaults("fluid.tests.textSizeTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            textSize: {
                type: "fluid.prefs.enactor.textSize",
                container: ".flc-textSize",
                options: {
                    fontSizeMap: fontSizeMap,
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
        var initialREMSize = fluid.prefs.enactor.getTextSizeInPx(remTestElm, fontSizeMap);

        jqUnit.assertEquals("Check that the size is pulled from the container correctly", expectedInitialSize, that.initialSize);
        that.applier.requestChange("value", muliplier);
        jqUnit.assertEquals("The size should be doubled", (expectedInitialSize * muliplier) + "px", that.root.css("fontSize"));
        jqUnit.assertEquals("The font size specified in rem units should be doubled", initialREMSize * muliplier, fluid.prefs.enactor.getTextSizeInPx(remTestElm, fontSizeMap));

        // reset font size of root
        $("html").css("font-size", that.initialSize + "px");
    };

    fluid.defaults("fluid.tests.textSizeTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
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
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        container: ".flc-lineSpace",
        fontSizeMap: fontSizeMap,
        expectedTestSize: 8,
        expectedSizeAtUndetected: 1,
        components: {
            getLineHeightTester: {
                type: "fluid.tests.getLineHeightTester"
            }
        }
    });

    fluid.tests.testGetLineHeight = function () {
        var container = $(".flc-lineSpace");
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
        var container = $(".flc-lineSpace");
        var fontSize = fluid.prefs.enactor.getTextSizeInPx(container, fontSizeMap);

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
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
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

    fluid.defaults("fluid.tests.lineSpaceTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            lineSpace: {
                type: "fluid.prefs.enactor.lineSpace",
                container: ".flc-lineSpace",
                options: {
                    fontSizeMap: fontSizeMap,
                    model: {
                        value: 1
                    }
                }
            },
            lineSpaceTester: {
                type: "fluid.tests.lineSpaceTester"
            }
        }
    });

    // This is necessary to work around IE differences in handling line-height unitless factors
    var convertLineHeightFactor = function (lineHeight, fontSize) {
        // Continuing the work-around of jQuery + IE bug - http://bugs.jquery.com/ticket/2671
        if (lineHeight.match(/[0-9]$/)) {
            return Math.round(lineHeight * parseFloat(fontSize)) + "px";
        } else {
            return lineHeight;
        }
    };

    fluid.tests.testLineSpace = function (that) {
        jqUnit.assertEquals("Check that the size is pulled from the container correctly", 2, Math.round(that.initialSize));
        jqUnit.assertEquals("Check the line spacing size in pixels", "12px", convertLineHeightFactor(that.container.css("lineHeight"), that.container.css("fontSize")));
        that.applier.requestChange("value", 2);
        jqUnit.assertEquals("The size should be doubled", "24px", convertLineHeightFactor(that.container.css("lineHeight"), that.container.css("fontSize")));
    };

    fluid.defaults("fluid.tests.lineSpaceTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test line space enactor",
            tests: [{
                expect: 3,
                name: "Apply line space in times",
                type: "test",
                func: "fluid.tests.testLineSpace",
                args: ["{lineSpace}"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.tableOfContents
     *******************************************************************************/

    fluid.defaults("fluid.tests.tableOfContentsTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            toc: {
                type: "fluid.prefs.enactor.tableOfContents",
                container: ".flc-tableOfContents",
                options: {
                    tocTemplate: "../../../../src/components/tableOfContents/html/TableOfContents.html",
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

    fluid.tests.checkTocLevels = function (that, expectedTocLevels) {
        jqUnit.assertEquals("Table of contents has " + expectedTocLevels + " levels", expectedTocLevels, $(".flc-toc-tocContainer").children("ul").length);
    };

    fluid.tests.makeTocVisibilityChecker = function (that, expectedTocLevels, tocContainer, isShown) {
        jqUnit.assertEquals("Table of contents has " + expectedTocLevels + " levels", expectedTocLevels, $(".flc-toc-tocContainer").children("ul").length);
        jqUnit.assertEquals("The visibility of the table of contents is " + isShown, isShown, $(tocContainer).is(":visible"));
    };

    fluid.defaults("fluid.tests.tableOfContentsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            tocContainer: ".flc-toc-tocContainer",
            expectedNoTocLevels: 0,
            expectedTocLevelsAtTrue: 1
        },
        modules: [{
            name: "Test table of contents enactor",
            tests: [{
                expect: 5,
                name: "Test in order: default, toc is on, toc is off",
                sequence: [{
                    func: "fluid.tests.checkTocLevels",
                    args: ["{toc}", "{that}.options.testOptions.expectedNoTocLevels"]
                }, {
                    func: "{toc}.applier.change",
                    args: ["toc", true]
                }, {
                    listener: "fluid.tests.makeTocVisibilityChecker",
                    args: ["{toc}", "{that}.options.testOptions.expectedTocLevelsAtTrue", "{that}.options.testOptions.tocContainer", true],
                    event: "{toc}.events.afterTocRender"
                }, {
                    func: "{toc}.applier.change",
                    args: ["toc", false]
                }, {
                    func: "fluid.tests.makeTocVisibilityChecker",
                    args: ["{toc}", "{that}.options.testOptions.expectedTocLevelsAtTrue", "{that}.options.testOptions.tocContainer", false]
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.styleElementsTests",
            "fluid.tests.emphasizeLinksTests",
            "fluid.tests.inputsLargerTests",
            "fluid.tests.classSwapperTests",
            "fluid.tests.textSizeTests",
            "fluid.tests.getLineHeightTests",
            "fluid.tests.lineSpaceTests",
            "fluid.tests.tableOfContentsTests"
        ]);
    });

})(jQuery);
