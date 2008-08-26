/*
Copyright 2007 - 2008 University of Toronto
Copyright 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function (jQuery, fluid) {
    var createLayoutCustomizer = function (layout, perms, orderChangedCallbackUrl, userOptions) {
        var selectors, assembleOptions, options, reordererRoot;
        
        // Configure options
        userOptions = userOptions || {};
        selectors = fluid.moduleLayout.inferSelectors(layout, perms, userOptions.grabHandle);
        assembleOptions = {
            containerRole: fluid.roles.REGIONS,
            orderChangedCallbackUrl: orderChangedCallbackUrl,
            layoutHandlerName: "fluid.moduleLayoutHandler",
            moduleLayout: {
                permissions: perms,
                layout: layout
            },
            selectors: selectors
        };
        options = jQuery.extend({}, assembleOptions, userOptions);
        
        reordererRoot = fluid.utils.jById(fluid.moduleLayout.containerId(layout));

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
     * @param {Object} container a selector, jquery, or a dom element representing the component's container
     * @param {Object} options a collection of options settings.  
     */
    fluid.reorderLayout = function (container, options) {
        var selectors, columns, modules, lockedModules, layout, perms;
        
        options = options || {};
        selectors = fluid.utils.merge({}, {}, fluid.defaults("reorderLayout").selectors, options.selectors);
        
        container = fluid.container(container);
        columns = jQuery(selectors.columns, container);
        modules = jQuery(selectors.modules, container);
        lockedModules = jQuery(selectors.lockedModules, container);
        layout = fluid.moduleLayout.buildLayout(container, columns, modules);
        perms = fluid.moduleLayout.buildPermsForLockedModules(lockedModules, layout);
        
        // clear the selectors because they aren't needed by the reorderer and in fact confuse matters 
        options.selectors = undefined;
        return fluid.initLayoutCustomizer(layout, perms, null, options);
    };
    
    fluid.defaults("reorderLayout", {  
        selectors: {
            columns: ".columns",
            modules: ".modules",
            lockedModules: ".lockedModules"
        }
    });
        
})(jQuery, fluid);
