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

demo.initJqueryTabs = function () {
    var addTabActivateHandler = function (container) {
        var enterKeyHandler = function (evt) {
            if (evt.which === fluid.keys.ENTER) {
                var tabAnchors = jQuery ("a", evt.target);
                fragmentUrl = tabAnchors.attr ('href');
                jQuery("#tabList").tabs("select", fragmentUrl);
            }
        };
        jQuery (container).keypress (enterKeyHandler);
    };

    var tabList = fluid.utils.jById ("tabList");
    addTabActivateHandler (tabList);

    var cssClassNames = {
        defaultStyle: "default-tab",
        selected: "selected-tab",
        dragging: "dragging-tab",
        hover: "hover-tab",
        dropMarker: "drop-marker-tab",
        avatar: "avatar-tab"
    };
    // Identifies the orderable elements by their unique id prefix.
    var findOrderableTabs = function  () {
        return jQuery ("[id^=tab_]", tabList);
    };
    
    var layoutHandler = new fluid.ListLayoutHandler (findOrderableTabs, {
        orientation: fluid.orientation.HORIZONTAL
    });
    
    return new fluid.Reorderer (tabList, findOrderableTabs, layoutHandler, {cssClassNames: cssClassNames});
};
