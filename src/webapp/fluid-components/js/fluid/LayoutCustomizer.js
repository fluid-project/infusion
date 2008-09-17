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
    var createLayoutCustomizer = function (container, layout, perms, afterMoveCallbackUrl, userOptions) {
        var assembleOptions = {
            afterMoveCallbackUrl: afterMoveCallbackUrl,
            layoutHandler: "fluid.moduleLayoutHandler",
            moduleLayout: {
                permissions: perms,
                layout: layout
          }
        };
        var options = jQuery.extend(true, assembleOptions, userOptions);
        return fluid.reorderer(container, options);
    };

    /**
     * Creates a layout customizer from a combination of a layout and permissions object.
     * @param {Object} layout a layout object. See http://wiki.fluidproject.org/x/FYsk for more details
     * @param {Object} perms a permissions data structure. See the above documentation
     */
    fluid.initLayoutCustomizer = function (layout, perms, afterMoveCallbackUrl, options) {
        return createLayoutCustomizer("#" + layout.id, layout, perms, afterMoveCallbackUrl, options);
    };

    /**
     * Simple way to create a layout customizer.
     * @param {selector} a selector for the layout container
     * @param {Object} a map of selectors for columns and modules within the layout
     * @param {Function} a function to be called when the order changes 
     * @param {Object} additional configuration options
     */
    fluid.reorderLayout = function (container, userOptions) {
        var assembleOptions = {
            layoutHandler: "fluid.moduleLayoutHandler"
        };
        var options = jQuery.extend(true, assembleOptions, userOptions);
        return fluid.reorderer(container, options);
    };    
})(fluid);
