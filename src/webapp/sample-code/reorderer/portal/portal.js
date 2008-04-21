/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/   

var demo = demo || {};
    
demo.initPortletReorderer = function() {
    var layout = { 
        id:"portalPageBody",
        columns:[
            { id:"column_u15l1s9", children:["portlet_u15l1n10", "portlet_u15l1n11"]},
            { id:"column_u15l1s12", children:["portlet_u15l1n13","portlet_u15l1n14","portlet_u15l1n15"]}
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

    return fluid.initLayoutCustomizer (layout, dropTargetPerms, grabHandle);
};

demo.initLightboxReorderer = function () {
    var cssClassNames = {
        defaultStyle: "lb-orderable-default",
        selected: "lb-orderable-selected",
        dragging: "lb-orderable-dragging",
        hover: "lb-orderable-hover",
        dropMarker: "lb-orderable-drop-marker",
        avatar: "lb-orderable-avatar"
    };  
    
    var orderableFinderFunction = function () {
        return jQuery("#gallery > [id^=thumb-]");
    };
    
    return fluid.lightbox.createLightbox (fluid.utils.jById("gallery"),
                                            orderableFinderFunction,
                                            function () {},
                                            "gallery-instructions",
                                            {cssClassNames: cssClassNames});
};
