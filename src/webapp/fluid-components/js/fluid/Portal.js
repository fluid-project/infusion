/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var fluid = fluid || {};

(function (fluid) {
    fluid.initPortalReorderer = function (layout, perms, grabHandle, orderChangedCallbackUrl) {
        var portletReordererRoot = fluid.utils.jById (fluid.portletLayout.containerId (layout));
    
        var items = fluid.portletLayout.createFindItems (layout, perms, grabHandle);
    
        var lhOptions;
        if (orderChangedCallbackUrl) {
            lhOptions = {
                orderChangedCallbackUrl: orderChangedCallbackUrl
            };
        }
    
        var layoutHandler = new fluid.PortletLayoutHandler (layout, perms, lhOptions);
        var rOptions = {
            role : fluid.roles.GRID,
            avatarCreator : function (item) {
                return document.createElement ("div");
            }
        };
        
        return new fluid.Reorderer (portletReordererRoot, items, layoutHandler, rOptions);
    };
}) (fluid);
