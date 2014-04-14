/*
Copyright 2011 OCAD University

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

    $(document).ready(function () {

        jqUnit.module("Tabs Tests");

        jqUnit.test("Initialisation", function () {
            jqUnit.expect(2);
            var myTabs = fluid.tabs(".flc-tabs");
            jqUnit.assertTrue("The tabs are initialised", myTabs);
            jqUnit.assertTrue("jQuery applied to tabs", myTabs.container.hasClass("ui-tabs"));
        });

        jqUnit.test("Aria added", function () {
            jqUnit.expect(3);
            fluid.tabs(".flc-tabs");
            jqUnit.assertEquals("Aria applied to list items", "presentation", $(".flc-tabs ul li a").attr("role"));
            jqUnit.assertEquals("Aria applied to tab links", "tab", $(".flc-tabs li").attr("role"));
            jqUnit.assertEquals("Aria applied to tab panels", "tabpanel", $(".flc-tabs #one").attr("role"));
        });

    });
})(jQuery);
