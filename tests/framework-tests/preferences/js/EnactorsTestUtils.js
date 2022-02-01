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

fluid.registerNamespace("fluid.tests.enactor.utils");

/*******************************************************************************
 * fontSizeMap used for the various size related enactor tests
 *******************************************************************************/

fluid.tests.enactor.utils.fontSizeMap = {
    "xx-small": "9px",
    "x-small":  "11px",
    "small":    "13px",
    "medium":   "15px",
    "large":    "18px",
    "x-large":  "23px",
    "xx-large": "30px"
};

fluid.registerNamespace("fluid.tests.enactor.spacingSetter");

fluid.tests.enactor.spacingSetter.getActualSpace = function (elm, cssProp) {
    elm = $(elm);
    var spacing = fluid.roundToDecimal(parseFloat(elm.css(cssProp)), 2);

    return spacing;
};

fluid.tests.enactor.spacingSetter.assertSpacing = function (that, baseFontSize, cssProp, expectedModel, expectedStyleValue) {
    var pxVal = expectedStyleValue || expectedModel.unit * baseFontSize; // convert from em to px
    var expectedSpace = pxVal;
    var actualSpace = fluid.tests.enactor.spacingSetter.getActualSpace(that.container, cssProp);
    jqUnit.assertDeepEq("The model should be set correctly", expectedModel, that.model);
    jqUnit.assertEquals("The " + cssProp + " css style should be set to " + expectedSpace + "px", expectedSpace, actualSpace);
};

fluid.tests.enactor.verifySpacingSettings = function (that, prefix, expected, elm) {
    elm = elm ? $(elm) : that.container;
    if (expected) {
        jqUnit.assertTrue(`${prefix}: The ${that.options.styles.enabled} class should be applied`, elm.hasClass(that.options.styles.enabled));
        jqUnit.assertEquals(`${prefix}: The ${that.options.cssCustomProp.size} custom property should be set`, expected.size, elm.css(that.options.cssCustomProp.size));
        jqUnit.assertEquals(`${prefix}: The ${that.options.cssCustomProp.factor} custom property should be set`, expected.factor, elm.css(that.options.cssCustomProp.factor));
    } else {
        jqUnit.assertFalse(`${prefix}: The ${that.options.styles.enabled} class should not be applied`, elm.hasClass(that.options.styles.enabled));
        jqUnit.assertUndefined(`${prefix}: The ${that.options.cssCustomProp.size} custom property should not be set`, elm.css(that.options.cssCustomProp.size));
        jqUnit.assertUndefined(`${prefix}: The ${that.options.cssCustomProp.factor} custom property should not be set`, elm.css(that.options.cssCustomProp.factor));
    }
};

fluid.tests.enactor.verifySpacingComputedCSS = function (that, prefix, prop, expected) {
    var roundedActual = `${fluid.roundToDecimal(parseFloat(that.container.css(prop)), 1)}px`;
    jqUnit.assertEquals(`The new ${prop} should be set correctly.`, expected.computed, roundedActual);
    fluid.tests.enactor.verifySpacingSettings(that, prefix, expected);
};
