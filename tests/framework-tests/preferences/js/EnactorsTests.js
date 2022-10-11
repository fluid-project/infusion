/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global jqUnit */

"use strict";

fluid.registerNamespace("fluid.tests.enactor");

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

fluid.tests.getElements = function (container) {
    return $(container).children();
};

fluid.defaults("fluid.tests.enactor.styleElements", {
    gradeNames: ["fluid.prefs.enactor.styleElements"],
    cssClass: "fl-style-test",
    elementsToStyle: {
        expander: {
            funcName: "fluid.tests.getElements",
            args: ".flc-styleElements"
        }
    },
    model: {
        value: false
    }
});

jqUnit.test("Test styleElements enactor", function () {
    jqUnit.expect(5);
    const that = fluid.tests.enactor.styleElements();
    const expected = {
        cssClass: "fl-style-test",
        defaultFlag: false
    };

    fluid.tests.testStyle(that, expected.defaultFlag, expected.cssClass);
});

/*******************************************************************************
 * Unit tests for fluid.prefs.enactor.enhanceInputs
 *******************************************************************************/

fluid.defaults("fluid.tests.enactor.enhanceInputs", {
    gradeNames: ["fluid.prefs.enactor.enhanceInputs"],
    cssClass: "fl-enhanceInputs-test",
    model: {
        value: false
    }
});

jqUnit.test("Test enhanceInputs enactor", function () {
    jqUnit.expect(5);
    const that = fluid.tests.enactor.enhanceInputs(".flc-enhanceInputs");
    const expected = {
        enhanceInputsClass: "fl-enhanceInputs-test",
        defaultFlag: false
    };

    fluid.tests.testStyle(that, expected.defaultFlag, expected.enhanceInputsClass);
});

/*******************************************************************************
 * Unit tests for fluid.prefs.enactor.classSwapper
 *******************************************************************************/

fluid.defaults("fluid.tests.enactor.classSwapper", {
    gradeNames: ["fluid.prefs.enactor.classSwapper"],
    classes: {
        "default": "",
        "test": "fl-test"
    },
    model: {
        value: "default"
    }
});

jqUnit.test("Test class swapper enactor", function () {
    jqUnit.expect(3);
    const that = fluid.tests.enactor.classSwapper(".flc-classSwapper");
    const defaultStyle = that.container.attr("class");
    const expectedClass = "fl-test";

    jqUnit.assertEquals("The style class is not applied by default", defaultStyle, that.container.attr("class"));

    that.applier.change("value", "test");
    jqUnit.assertEquals("The style class has been applied", defaultStyle + " " + expectedClass, that.container.attr("class"));

    that.applier.change("value", "");
    jqUnit.assertEquals("The style class has been removed", defaultStyle, that.container.attr("class"));
});

/*******************************************************************************
 * Unit tests for fluid.prefs.enactor.textSize
 *******************************************************************************/

fluid.defaults("fluid.tests.enactor.textSize", {
    gradeNames: ["fluid.prefs.enactor.textSize"],
    fontSizeMap: fluid.tests.enactor.utils.fontSizeMap,
    model: {
        value: 1
    }
});

fluid.tests.verifyTextSizeApplication = function (expected) {
    fluid.each(expected, function (expectedSize, selector) {
        jqUnit.assertEquals(`The font size of the ${selector} element should be updated`, expectedSize, fluid.prefs.enactor.getTextSizeInPx($(selector), fluid.tests.enactor.utils.fontSizeMap));
    });
};

fluid.tests.textSizeTestCases = {
    "bodyContainer": {
        container: "body",
        expected: {
            TagOfRootContainer: "HTML",
            initialSize: 16,
            increased: {
                size: "32px",
                factor: "2"
            },
            updatedElms: {
                "#flc-textSize-remTest": 64,
                "#flc-textSize-customPropTest": 32,
                "#flc-textSize-factorTest": 128
            }
        }
    },
    "nonBodyContainer": {
        container: ".flc-textSize",
        expected: {
            selectorOfRootContainer: "flc-textSize",
            initialSize: 24,
            increased: {
                size: "48px",
                factor: "2"
            },
            updatedElms: {
                "#flc-textSize-remTest": 32,
                "#flc-textSize-customPropTest": 48,
                "#flc-textSize-factorTest": 64
            }
        }
    }
};

fluid.each(fluid.tests.textSizeTestCases, function (currentCase, message) {
    jqUnit.test("Test textSize enactor - " + message, function () {
        jqUnit.expect(14);
        const that = fluid.tests.enactor.textSize(currentCase.container);

        // Verify the initial state
        jqUnit.assertEquals("Verify the size is pulled from the container correctly", currentCase.expected.initialSize, that.initialSize);
        if (currentCase.expected.TagOfRootContainer) {
            jqUnit.assertEquals("Verify the root container is set properly", currentCase.expected.TagOfRootContainer, that.root[0].tagName);
        }
        if (currentCase.expected.selectorOfRootContainer) {
            jqUnit.assertTrue("Verify the root container is set properly", that.root[0].classList.contains(currentCase.expected.selectorOfRootContainer));
        }

        fluid.tests.enactor.verifySpacingSettings(that, "Intial", null, that.root);

        // Verify model change
        that.applier.change("value", 2);
        fluid.tests.enactor.verifySpacingSettings(that, "Model Changed", currentCase.expected.increased, that.root);
        fluid.tests.verifyTextSizeApplication(currentCase.expected.updatedElms);

        // Test reset to default
        that.applier.change("value", 1);
        fluid.tests.enactor.verifySpacingSettings(that, "Reset", null, that.root);
    });
});

jqUnit.test("Test textSize enactor - when applyInitValue === true", function () {
    jqUnit.expect(4);
    const that = fluid.tests.enactor.textSize(".flc-textSize", {
        applyInitValue: true
    });

    fluid.tests.enactor.verifySpacingComputedCSS(that, "With applyInitValue set to true", "font-size", {
        computed: "24px",
        size: "24px",
        factor: "1"
    });
});

/*******************************************************************************
 * Unit tests for getLineHeight & getLineHeightMultiplier
 *******************************************************************************/

jqUnit.test("Test getLineHeight()", function () {
    jqUnit.expect(1);
    var container = $(".flc-lineSpace-getTests");
    var lineHeight = fluid.prefs.enactor.lineSpace.getLineHeight(container);

    jqUnit.assertEquals("getLineHeight in px", "12px", lineHeight);
});

var testGetLineHeightMultiplier = function (lineHeight, expected) {
    var container = $(".flc-lineSpace-getTests");
    var fontSize = fluid.prefs.enactor.getTextSizeInPx(container, fluid.tests.enactor.utils.fontSizeMap);

    var numerizedLineHeight = fluid.prefs.enactor.lineSpace.getLineHeightMultiplier(lineHeight, Math.round(fontSize));

    jqUnit.assertEquals("line-height value '" + lineHeight + "' has been converted correctly", expected, numerizedLineHeight);
};

jqUnit.test("Test getLineHeightMultiplier()", function () {
    jqUnit.expect(2);
    testGetLineHeightMultiplier("normal", 1.2);
    testGetLineHeightMultiplier("6px", 1);
});

/*******************************************************************************
 * Unit tests for fluid.prefs.enactor.lineSpace
 *******************************************************************************/

fluid.defaults("fluid.tests.enactor.lineSpace", {
    gradeNames: ["fluid.prefs.enactor.lineSpace"],
    fontSizeMap: fluid.tests.enactor.utils.fontSizeMap,
    model: {
        value: 1
    }
});

fluid.tests.verifyInitValues = function (that, multiplier) {
    jqUnit.assertEquals("The line height multiplier is calculated correctly", multiplier, that.lineHeightMultiplier);

    fluid.tests.enactor.verifySpacingSettings(that, "Initial");
};

jqUnit.test("Test lineSpace enactor", function () {
    jqUnit.expect(41);

    // Test cases when applyInitValue === false
    let that = fluid.tests.enactor.lineSpace(".flc-lineSpace");
    fluid.tests.verifyInitValues(that, 1.2);

    const testCases = {
        inLength: {
            message: "line height in length",
            container: ".flc-lineSpace-length",
            expected: {
                initialValue: 0.5,
                computed: "24px",
                size: "1",
                factor: "2"
            }
        },
        inUnitlessNumber: {
            message: "line height in unitless number",
            container: ".flc-lineSpace-number",
            expected: {
                initialValue: 1.5,
                computed: "72px",
                size: "3",
                factor: "2"
            }
        },
        inPercentage: {
            message: "line height in percentage",
            container: ".flc-lineSpace-percentage",
            expected: {
                initialValue: 0.5,
                computed: "24px",
                size: "1",
                factor: "2"
            }
        }
    };

    fluid.each(testCases, function (currentCase) {
        let that = fluid.tests.enactor.lineSpace(currentCase.container);
        fluid.tests.verifyInitValues(that, currentCase.expected.initialValue);

        that.applier.change("value", 2);
        fluid.tests.enactor.verifySpacingComputedCSS(that, "Model Changed", "line-height", currentCase.expected);
        that.applier.change("value", 1);
        fluid.tests.enactor.verifySpacingSettings(that, "Reset");
    });

    // Test the initial case when applyInitValue === true
    that = fluid.tests.enactor.lineSpace(".flc-lineSpace", {
        applyInitValue: true
    });

    fluid.tests.enactor.verifySpacingComputedCSS(that, "Test lineSpace enactor - when applyInitValue === true", "line-height", {
        computed: "28.8px",
        size: "1.2",
        factor: "1"
    });
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

$(function () {
    fluid.test.runTests([
        "fluid.tests.tableOfContentsTests"
    ]);
});
