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

demo.initPortletReorderer = function() {
    var layout = { 
        id:"portalPage",
        columns:[
            { id:"column_u14l1s48", children:["portlet_u14l1n50", "portlet_u14l1n49"]},
            { id:"column_u14l1s47", children:["portlet_u14l1n52","portlet_u14l1n51","portlet_n101"]}
        ]
    };

    var dropTargetPerms = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1]
    ];

    var grabHandle = function (item) {        
        // the handle is the toolbar. The toolbar id is the same as the portlet id, with the
        // "portlet_" prefix replaced by "toolbar_".
        return jQuery ("[id=toolbar_" + item.id.split ("_")[1] + "]");
    };

    return fluid.initPortalReorderer (layout, dropTargetPerms, grabHandle);
};
