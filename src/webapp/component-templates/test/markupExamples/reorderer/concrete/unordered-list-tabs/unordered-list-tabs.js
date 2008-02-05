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

demo.initUnorderedListTabs = function () {
    var tabList = jQuery ("#tabList");
    
    // Identifies the orderable elements by their unique id prefix.
    var findOrderableTabs = function  () {
        return jQuery ("[id^=tab_]", tabList);
    };
    
    var layoutHandler = new fluid.ListLayoutHandler ({
        findMovables: findOrderableTabs,
        orientation: fluid.orientation.HORIZONTAL
    });
    
    return new fluid.Reorderer (tabList, {
        layoutHandler: layoutHandler,
        findMovables: findOrderableTabs
    });
};
