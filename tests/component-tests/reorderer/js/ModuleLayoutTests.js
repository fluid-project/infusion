/*
Copyright 2007-2019 The Infusion Copyright holders
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

    $(document).ready(function () {

        jqUnit.module("ModuleLayout Tests");

        function isOriginalOrderTest(testStr, layoutObj) {
            var portlet = fluid.transform(fluid.testUtils.moduleLayout.portletIds, fluid.byId);
            jqUnit.assertEquals(testStr + ", Portlet1 should be 1st in column 1", portlet[1], layoutObj.columns[0].elements[0]);
            jqUnit.assertEquals(testStr + ", Portlet2 should be 2nd in column 1", portlet[2], layoutObj.columns[0].elements[1]);
            jqUnit.assertEquals(testStr + ", Portlet3 should be 3rd in column 1", portlet[3], layoutObj.columns[0].elements[2]);
            jqUnit.assertEquals(testStr + ", Portlet4 should be 4th in column 1", portlet[4], layoutObj.columns[0].elements[3]);
            jqUnit.assertEquals(testStr + ", Portlet5 should be 1st in column 2", portlet[5], layoutObj.columns[1].elements[0]);
            jqUnit.assertEquals(testStr + ", Portlet6 should be 2nd in column 2", portlet[6], layoutObj.columns[1].elements[1]);
            jqUnit.assertEquals(testStr + ", Portlet7 should be 1st in column 3", portlet[7], layoutObj.columns[2].elements[0]);
            jqUnit.assertEquals(testStr + ", Portlet8 should be 2nd in column 3", portlet[8], layoutObj.columns[2].elements[1]);
            jqUnit.assertEquals(testStr + ", Portlet9 should be 3rd in column 3", portlet[9], layoutObj.columns[2].elements[2]);

        }

        jqUnit.test("UpdateLayout", function () {
            var portlet = fluid.transform(fluid.testUtils.moduleLayout.portletIds, fluid.byId);

            var item = portlet[3];
            var relatedItem = portlet[6];
            var layout = fluid.moduleLayout.layoutFromIds(fluid.testUtils.moduleLayout.fullLayout);
            var layoutClone = jQuery.extend(true, {}, layout);

            isOriginalOrderTest("Before doing anything", layoutClone);

            // Move before
            fluid.moduleLayout.updateLayout(item, relatedItem, fluid.position.BEFORE, layoutClone);
            jqUnit.assertEquals("After move, Portlet 3 should be before Portlet 6", portlet[3], layoutClone.columns[1].elements[1]);
            jqUnit.assertEquals("After move, Portlet 6 should be third in the column", portlet[6], layoutClone.columns[1].elements[2]);
            jqUnit.assertEquals("After move, Portlet 3 should not be in column 1", -1, jQuery.inArray(portlet[3], layoutClone.columns[0]));

            // Move after
            relatedItem = portlet[8];
            fluid.moduleLayout.updateLayout(item, relatedItem, fluid.position.AFTER, layoutClone);
            jqUnit.assertEquals("After move, Portlet 3 should be after Portlet 8", portlet[3], layoutClone.columns[2].elements[2]);
            jqUnit.assertEquals("After move, Portlet 8 should be second in the column", portlet[8], layoutClone.columns[2].elements[1]);
            jqUnit.assertEquals("After move, Portlet 3 should not be in column 2", -1, jQuery.inArray(portlet[3], layoutClone.columns[1]));

            // Move within same column
            relatedItem = portlet[7];
            fluid.moduleLayout.updateLayout(item, relatedItem, fluid.position.BEFORE, layoutClone);
            jqUnit.assertEquals("After move, Portlet 3 should be before Portlet 7", portlet[3], layoutClone.columns[2].elements[0]);
            jqUnit.assertEquals("After move, Portlet 7 should be second in the column", portlet[7], layoutClone.columns[2].elements[1]);

        });


    });
})(jQuery);
