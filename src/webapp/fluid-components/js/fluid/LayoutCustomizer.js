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
    fluid.initLayoutCustomizer = function (layout, perms, grabHandle, orderChangedCallbackUrl) {
        var reordererRoot = fluid.utils.jById (fluid.moduleLayout.containerId (layout));
    
        var items = fluid.moduleLayout.createFindItems (layout, perms, grabHandle);
    
        var lhOptions;
        if (orderChangedCallbackUrl) {
            lhOptions = {
                orderChangedCallbackUrl: orderChangedCallbackUrl
            };
        }
    
        var layoutHandler = new fluid.ModuleLayoutHandler (layout, perms, lhOptions);
        var rOptions = {
            role : fluid.roles.GRID,
            avatarCreator : function (item) {
                return document.createElement ("div");
            }
        };
        
        return new fluid.Reorderer (reordererRoot, items, layoutHandler, rOptions);
    };
}) (fluid);
