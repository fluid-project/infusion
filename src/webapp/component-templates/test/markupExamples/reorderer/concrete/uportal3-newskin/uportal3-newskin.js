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

    var portletReordererRoot = jQuery("[id=portalPage]");
    
    var findPortlets = function () {
        return jQuery ("[id^=portlet_]", portletReordererRoot);
    };
    
    var findMovables = function () {
        return jQuery ("#portlet_u14l1n49,#portlet_u14l1n52,#portlet_u14l1n51,#portlet_n101");
    };

    var items = {
        movables: findMovables,
        selectables: findPortlets,
        dropTargets: findPortlets
    };
    
    var layout = { 
        id:"portalPageBodyLayout",
        columns:[
            { id:"column_u14l1s48", children:["portlet_u14l1n50", "portlet_u14l1n49"]},
            { id:"column_u14l1s47", children:["portlet_u14l1n52","portlet_u14l1n51","portlet_n101"]}
        ]
    };

    var dropTargetPerms = [
        [[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,1],[1,1],[1,1],[1,1],[1,1]],
        [[0,1],[1,1],[1,1],[1,1],[1,1]],
        [[0,1],[1,1],[1,1],[1,1],[1,1]],
        [[0,1],[1,1],[1,1],[1,1],[1,1]]
    ];

    var layoutHandler = new fluid.PortletLayoutHandler ({
        portletLayout: layout,
        dropTargetPermissions: dropTargetPerms
    });
    
    return new fluid.Reorderer (portletReordererRoot, items, layoutHandler);
};
