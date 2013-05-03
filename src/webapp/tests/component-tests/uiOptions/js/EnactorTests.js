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

    fluid.tests.testStyle = function (that, container, expectedDefaultFlag, expectedCssClass) {
        var elements = that.getElements();
        
        jqUnit.assertEquals("Default value: " + expectedDefaultFlag, expectedDefaultFlag, that.model.value);
        jqUnit.assertEquals("Default css class: " + expectedCssClass, expectedCssClass, that.options.cssClass);
        jqUnit.assertEquals("Default - css class is not applied", undefined, elements.attr("class"));
        
        that.applier.requestChange("value", true);
        jqUnit.assertEquals("True value - Css class has been applied", expectedCssClass, elements.attr("class"));

        that.applier.requestChange("value", false);
        jqUnit.assertEquals("False value - Css class has been removed", "", elements.attr("class"));
    }; 

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.styleElements
     *******************************************************************************/

    fluid.defaults("fluid.tests.styleElementsTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        expectedCssClass: "fl-style-test",
        expectedDefaultFlag: false,
        container: ".flc-styleElements",
        components: {
            styleElements: {
                type: "fluid.uiOptions.enactor.styleElements",
                options: {
                    cssClass: "fl-style-test",
                    invokers: {
                        getElements: {
                            funcName: "fluid.tests.getElements",
                            args: ".flc-styleElements"
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
                args: ["{styleElements}", "{fluid.tests.styleElementsTests}.options.container", "{fluid.tests.styleElementsTests}.options.expectedDefaultFlag", "{fluid.tests.styleElementsTests}.options.expectedCssClass"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.enactor.emphasizeLinks
     *******************************************************************************/

    fluid.defaults("fluid.tests.emphasizeLinksTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        container: ".flc-emphasizeLinks",
        expectedEmphasizeLinksClass: "fl-emphasizeLinks-test",
        expectedDefaultFlag: false,
        components: {
            emphasizeLinks: {
                type: "fluid.uiOptions.enactor.emphasizeLinks",
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
                args: ["{emphasizeLinks}", "{fluid.tests.emphasizeLinksTests}.options.container", "{fluid.tests.emphasizeLinksTests}.options.expectedDefaultFlag", "{fluid.tests.emphasizeLinksTests}.options.expectedEmphasizeLinksClass"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.enactor.inputsLarger
     *******************************************************************************/

    fluid.defaults("fluid.tests.inputsLargerTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        container: ".flc-inputsLarger",
        expectedDefaultFlag: false,
        expectedInputsLargerClass: "fl-text-larger",
        components: {
            inputsLarger: {
                type: "fluid.uiOptions.enactor.inputsLarger",
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
                args: ["{inputsLarger}", "{fluid.tests.inputsLargerTests}.options.container", "{fluid.tests.inputsLargerTests}.options.expectedDefaultFlag", "{fluid.tests.inputsLargerTests}.options.expectedInputsLargerClass"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.enactor.inputsLarger
     *******************************************************************************/

    fluid.defaults("fluid.tests.classSwapperTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        expectedClass: "fl-test",
        components: {
            classSwapper: {
                type: "fluid.uiOptions.enactor.classSwapper",
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
     * Unit tests for getPx2EmFactor & getTextSizeInEm
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
    
    fluid.defaults("fluid.tests.getSizeTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        container: ".flc-getSize",
        fontSizeMap: fontSizeMap,
        expectedTestSize: 8,
        expectedSizeAtUndetected: 1,
        components: {
            getSizeTester: {
                type: "fluid.tests.getSizeTester"
            }
        }
    });

    fluid.tests.testGetSize = function (container, fontSizeMap, expectedTestSize, expectedSizeAtUndetected) {
        container = $(container);
        
        var px2emFactor = fluid.uiOptions.enactor.textSizer.getPx2EmFactor(container, fontSizeMap);
        jqUnit.assertEquals("Check that the factor is pulled from the container correctly", expectedTestSize, px2emFactor);

        container = $("html");
        var textSizeInPx = fluid.uiOptions.enactor.getTextSizeInPx(container, fontSizeMap);
        px2emFactor = fluid.uiOptions.enactor.textSizer.getPx2EmFactor(container, fontSizeMap);
        var fontSizeInEm = fluid.uiOptions.enactor.textSizer.getTextSizeInEm(textSizeInPx, px2emFactor);

        jqUnit.assertEquals("Unable to detect the text size in em for the DOM root element <html>. Always return 1em.", expectedSizeAtUndetected, fontSizeInEm);
    }; 

    fluid.defaults("fluid.tests.getSizeTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test getPx2EmFactor & getTextSizeInEm",
            tests: [{
                expect: 2,
                name: "Get text size in em",
                type: "test",
                func: "fluid.tests.testGetSize",
                args: ["{fluid.tests.getSizeTests}.options.container", "{fluid.tests.getSizeTests}.options.fontSizeMap", "{fluid.tests.getSizeTests}.options.expectedTestSize", "{fluid.tests.getSizeTests}.options.expectedSizeAtUndetected"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.enactor.textSizer
     *******************************************************************************/

    fluid.defaults("fluid.tests.textSizerTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            textSizer: {
                type: "fluid.uiOptions.enactor.textSizer",
                container: ".flc-textSizer",
                options: {
                    fontSizeMap: fontSizeMap,
                    model: {
                        value: 1
                    }
                }
            },
            textSizerTester: {
                type: "fluid.tests.textSizerTester"
            }
        }
    });

    fluid.tests.testTextSizer = function (that) {
        var px2emFactor = fluid.uiOptions.enactor.textSizer.getPx2EmFactor(that.container, that.options.fontSizeMap);
        var expectedInitialSize = Math.round(8 / px2emFactor * 10000) / 10000;
        
        jqUnit.assertEquals("Check that the size is pulled from the container correctly", expectedInitialSize, that.initialSize);
        that.applier.requestChange("value", 2);
        jqUnit.assertEquals("The size should be doubled", "16px", that.container.css("fontSize"));
    }; 

    fluid.defaults("fluid.tests.textSizerTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test text sizer enactor",
            tests: [{
                expect: 2,
                name: "Apply text size in times",
                type: "test",
                func: "fluid.tests.testTextSizer",
                args: ["{textSizer}"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for getLineHeight & numerizeLineHeight
     *******************************************************************************/

    fluid.defaults("fluid.tests.getLineHeightTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        container: ".flc-lineSpacer",
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
        // Mimic IE with its DOM lineHeight structure
        var container = [{currentStyle: {lineHeight: "10"}}];
        var lineHeight = fluid.uiOptions.enactor.lineSpacer.getLineHeight(container);
        jqUnit.assertEquals("getLineHeight with IE simulation", "10", lineHeight);

        container = [{currentStyle: {lineHeight: "14pt"}}];
        lineHeight = fluid.uiOptions.enactor.lineSpacer.getLineHeight(container);
        jqUnit.assertEquals("getLineHeight with IE simulation", "14pt", lineHeight);

        container = $(".flc-lineSpacer");
        lineHeight = fluid.uiOptions.enactor.lineSpacer.getLineHeight(container);
        jqUnit.assertEquals("getLineHeight without IE simulation", "12px", lineHeight);
    }; 

    var testNumerizeLineHeight = function (lineHeight, expected) {
        var container = $(".flc-lineSpacer");
        var fontSize = fluid.uiOptions.enactor.getTextSizeInPx(container, fontSizeMap);
        
        var numerizedLineHeight = fluid.uiOptions.enactor.lineSpacer.numerizeLineHeight(lineHeight, Math.round(fontSize));

        jqUnit.assertEquals("line-height value '" + lineHeight + "' has been converted correctly", expected, numerizedLineHeight);
    };
    
    fluid.tests.testNumerizeLineHeight = function () {
        var undefinedLineHeight;
        testNumerizeLineHeight(undefinedLineHeight, 0);
        testNumerizeLineHeight("normal", 1.2);
        testNumerizeLineHeight("6px", 1);
        testNumerizeLineHeight("1.5", 1.5);
    };
    
    fluid.defaults("fluid.tests.getLineHeightTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test getLineHeight",
            tests: [{
                expect: 3,
                name: "Get line height",
                type: "test",
                func: "fluid.tests.testGetLineHeight"
            }]
        }, {
            name: "Test getLineHeight",
            tests: [{
                expect: 4,
                name: "Get numerized line height",
                type: "test",
                func: "fluid.tests.testNumerizeLineHeight"
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.enactor.lineSpacer
     *******************************************************************************/

    fluid.defaults("fluid.tests.lineSpacerTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            lineSpacer: {
                type: "fluid.uiOptions.enactor.lineSpacer",
                container: ".flc-lineSpacer",
                options: {
                    fontSizeMap: fontSizeMap,
                    model: {
                        value: 1
                    }
                }
            },
            lineSpacerTester: {
                type: "fluid.tests.lineSpacerTester"
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

    fluid.tests.testLineSpacer = function (that) {
        jqUnit.assertEquals("Check that the size is pulled from the container correctly", 2, Math.round(that.initialSize));
        jqUnit.assertEquals("Check the line spacing size in pixels", "12px", convertLineHeightFactor(that.container.css("lineHeight"), that.container.css("fontSize")));
        that.applier.requestChange("value", 2);
        jqUnit.assertEquals("The size should be doubled", "24px", convertLineHeightFactor(that.container.css("lineHeight"), that.container.css("fontSize")));
    }; 

    fluid.defaults("fluid.tests.lineSpacerTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Test line spacer enactor",
            tests: [{
                expect: 3,
                name: "Apply line spacing in times",
                type: "test",
                func: "fluid.tests.testLineSpacer",
                args: ["{lineSpacer}"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.enactor.tableOfContents
     *******************************************************************************/

    fluid.defaults("fluid.tests.tableOfContentsTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            toc: {
                type: "fluid.uiOptions.enactor.tableOfContentsEnactor",
                container: ".flc-tableOfContents",
                options: {
                    tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html",
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
        return function () {
            jqUnit.assertEquals("Table of contents has " + expectedTocLevels + " levels", expectedTocLevels, $(".flc-toc-tocContainer").children("ul").length);
            jqUnit.assertEquals("The visibility of the table of contents is " + isShown, isShown, $(tocContainer).is(":visible"));
        };
    };
    
    fluid.defaults("fluid.tests.tableOfContentsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            trueValue: true,
            falseValue: false,
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
                    func: "{toc}.applier.requestChange",
                    args: ["value", "{that}.options.testOptions.trueValue"]
                }, {
                    listenerMaker: "fluid.tests.makeTocVisibilityChecker",
                    makerArgs: ["{toc}", "{that}.options.testOptions.expectedTocLevelsAtTrue", "{that}.options.testOptions.tocContainer", true],
                    event: "{toc}.events.afterTocRender"
                }, {
                    func: "{toc}.applier.requestChange",
                    args: ["value", "{that}.options.testOptions.falseValue"]
                }, {
                    listenerMaker: "fluid.tests.makeTocVisibilityChecker",
                    makerArgs: ["{toc}", "{that}.options.testOptions.expectedTocLevelsAtTrue", "{that}.options.testOptions.tocContainer", false],
                    event: "{toc}.events.onLateRefreshRelay"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.IE6ColorInversion
     *******************************************************************************/

    fluid.defaults("fluid.tests.IE6ColorInversionTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            setIE6ColorInversion: {
                type: "fluid.uiOptions.enactor.IE6ColorInversion",
                container: ".flc-IE6ColorInversion",
                options: {
                    model: {
                        value: "default"
                    }
                }
            },
            IE6ColorInversionTester: {
                type: "fluid.tests.IE6ColorInversionTester"
            }
        }
    });

    function cleanStaticEnvironment() {
        delete fluid.staticEnvironment.browserIE;
        delete fluid.staticEnvironment.browserMajorVersion;
    }

    function withIE6Environment(withIt, testFunc) {
        try {
            cleanStaticEnvironment();
            if (withIt) {
                fluid.staticEnvironment.browserIE = fluid.typeTag("fluid.browser.msie");
                fluid.staticEnvironment.browserMajorVersion = fluid.typeTag("fluid.browser.majorVersion.6");
            }
            testFunc();
        } finally {
            cleanStaticEnvironment();
        }
    }
    
    function testIE6ColorInversion(withIt, testFunc) {
        withIE6Environment(withIt, function () {
            testFunc();
        });
    }
    
    fluid.tests.testIE6ColorInversion = function (that, container) {
        testIE6ColorInversion(false, function () {
            that.applier.requestChange("value", "default");
            jqUnit.assertEquals("fl-inverted-color is not touched", 1, $(container).has("." + that.options.styles.colorInversionClass).length);
        });
        testIE6ColorInversion(true, function () {  
            that.applier.requestChange("value", "default");
            jqUnit.assertEquals("fl-inverted-color has been removed", 0, $(container).has("." + that.options.styles.colorInversionClass).length);
        });
    };

    fluid.defaults("fluid.tests.IE6ColorInversionTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            container: ".flc-IE6ColorInversion"
        },
        modules: [{
            name: "Test style element component",
            tests: [{
                expect: 2,
                name: "IE6 style is handled properly",
                type: "test",
                func: "fluid.tests.testIE6ColorInversion",
                args: ["{setIE6ColorInversion}", "{that}.options.testOptions.container"]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.styleElementsTests",
            "fluid.tests.emphasizeLinksTests",
            "fluid.tests.inputsLargerTests",
            "fluid.tests.classSwapperTests",
            "fluid.tests.getSizeTests",
            "fluid.tests.textSizerTests",
            "fluid.tests.getLineHeightTests",
            "fluid.tests.lineSpacerTests",
            "fluid.tests.tableOfContentsTests",
            "fluid.tests.IE6ColorInversionTests"
        ]);
    });

})(jQuery);
