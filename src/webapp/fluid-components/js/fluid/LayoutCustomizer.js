/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
fluid = fluid || {};

(function (fluid) {
    var createLayoutCustomizer = function (layout, perms, orderChangedCallbackUrl, userOptions) {
        // Configure options
        userOptions = userOptions || {};
        var selectors = fluid.moduleLayout.inferSelectors(layout, perms, userOptions.grabHandle);
        var assembleOptions = {
          containerRole: fluid.roles.REGIONS,
          orderChangedCallbackUrl: orderChangedCallbackUrl,
          layoutHandlerName: "fluid.moduleLayoutHandler",
          moduleLayout: {
            permissions: perms,
            layout: layout
          },
          selectors: selectors
        };
        
        var options = jQuery.extend({}, assembleOptions, userOptions);
        
        var reordererRoot = fluid.utils.jById(fluid.moduleLayout.containerId(layout));

        return fluid.reorderer(reordererRoot, options);
    };
    

    /**
     * Creates a layout customizer from a combination of a layout and permissions object.
     * @param {Object} layout a layout object. See http://wiki.fluidproject.org/x/FYsk for more details
     * @param {Object} perms a permissions data structure. See the above documentation
     */
    fluid.initLayoutCustomizer = function (layout, perms, orderChangedCallbackUrl, options) {        
        return createLayoutCustomizer(layout, perms, orderChangedCallbackUrl, options);
    };

    /**
     * Simple way to create a layout customizer.
     * @param {selector} a selector for the layout container
     * @param {Object} a map of selectors for columns and modules within the layout
     * @param {Function} a function to be called when the order changes 
     * @param {Object} additional configuration options
     */
    fluid.reorderLayout = function (containerSelector, layoutSelectors, orderChangedCallback, options) {
        options = options || {};
        options.orderChangedCallback = orderChangedCallback;
        
        var container = jQuery(containerSelector);
        var columns = jQuery(layoutSelectors.columns, container);
        var modules = jQuery(layoutSelectors.modules, container);
        var lockedModules = jQuery(layoutSelectors.lockedModules, container);
        var layout = fluid.moduleLayout.buildLayout(container, columns, modules);
        var perms = fluid.moduleLayout.buildPermsForLockedModules(lockedModules, layout);
        
        return fluid.initLayoutCustomizer(layout, perms, null, options);
    };    
})(fluid);
