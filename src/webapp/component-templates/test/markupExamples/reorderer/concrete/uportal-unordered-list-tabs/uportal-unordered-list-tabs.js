/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Ensure the demo namespace exists
var demo = demo || {};

demo.initUportalUnorderedListTabs = function () {

    var tabListContainer = jQuery ("#tabList");

    var findOrderableTabs = function () {
        return jQuery ("[id^=tab_]", tabListContainer);
    };

    var layoutHandler = new fluid.ListLayoutHandler (findOrderableTabs, {
        orientation: fluid.orientation.HORIZONTAL
    });

    return new fluid.Reorderer (tabListContainer, findOrderableTabs, layoutHandler);
};