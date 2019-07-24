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

(function () {
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

})();
