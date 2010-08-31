/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

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
            if (evt.which === fluid.reorderer.keys.ENTER) {
                var tabAnchors = jQuery("a", evt.target);
                fragmentUrl = tabAnchors.attr('href');
                jQuery("#tabList").tabs("select", fragmentUrl);
            }
        };
        jQuery(container).keypress(enterKeyHandler);
    };

    var tabList = fluid.jById("tabList");
    addTabActivateHandler(tabList);

    var options = {
        layoutHandler: "fluid.listLayoutHandler",
        orientation: fluid.orientation.HORIZONTAL,
        styles: {
            defaultStyle: "default-tab",
            selected: "selected-tab",
            dragging: "dragging-tab",
            hover: "hover-tab",
            dropMarker: "drop-marker-tab",
            avatar: "avatar-tab"
            },
        selectors: {
            movables: "[id^=tab_]"
        }
    };

    
    return fluid.reorderer(tabList, options);
};
