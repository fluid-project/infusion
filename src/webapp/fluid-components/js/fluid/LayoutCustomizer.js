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
    var createLayoutCustomizer = function (layout, perms, grabHandle, orderChangedCallbackUrl, options) {
        var reordererRoot = fluid.utils.jById (fluid.moduleLayout.containerId (layout));
    
        var items = fluid.moduleLayout.createFindItems (layout, perms, grabHandle);
    
        var lhOptions;
        if (orderChangedCallbackUrl) {
            lhOptions = {
                orderChangedCallbackUrl: orderChangedCallbackUrl
            };
        }
    
        var layoutHandler = new fluid.ModuleLayoutHandler (layout, perms, lhOptions);

        var rOptions = options || {};
        rOptions.role = fluid.roles.GRID;

        return new fluid.Reorderer (reordererRoot, items, layoutHandler, rOptions);
    };
    
    /*
     * 
     */
    fluid.initLayoutCustomizer = function (layout, perms, grabHandle, orderChangedCallbackUrl, options) {
        var avatarFn = function (item, className) {
            var avatar = jQuery (document.createElement ("div"));
            avatar.addClass(className);
            return avatar;
        };
        var opts = options || {};
        opts.avatarCreator = avatarFn;
                
        return createLayoutCustomizer (layout, perms, grabHandle, orderChangedCallbackUrl, opts);
    };
    
    /*
     * 
     */
    fluid.initLayoutCustomizerDefaultAvatar = function (layout, perms, grabHandle, orderChangedCallbackUrl, options) {        
        return createLayoutCustomizer (layout, perms, grabHandle, orderChangedCallbackUrl, options);
    };
}) (fluid);
