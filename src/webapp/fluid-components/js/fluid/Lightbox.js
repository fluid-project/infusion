/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 - 2008 University of Cambridge

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
    var deriveLightboxCellBase, addThumbnailActivateHandler, createItemFinder, defaultOrderChangedCallback;
    
    deriveLightboxCellBase = function (namebase, index) {
        return namebase + "lightbox-cell:" + index + ":";
    };
            
    addThumbnailActivateHandler = function (lightboxContainer) {
        var enterKeyHandler = function (evt) {
            if (evt.which === fluid.keys.ENTER) {
                var thumbnailAnchors = jQuery("a", evt.target);
                document.location = thumbnailAnchors.attr('href');
            }
        };
        
        jQuery(lightboxContainer).keypress(enterKeyHandler);
    };
    
    createItemFinder = function (parentNode, containerId) {
        // This orderable finder knows that the lightbox thumbnails are 'div' elements
        var lightboxCellNamePattern = "^" + deriveLightboxCellBase(containerId, "[0-9]+") + "$";
        
        return function () {
            return fluid.utils.seekNodesById(parentNode, "div", lightboxCellNamePattern);
        };
    };
    
    /**
     * Returns the default Lightbox order change callback. This callback is used by the Lightbox
     * to send any changes in image order back to the server. It is implemented by nesting
     * a form and set of hidden fields within the Lightbox container which contain the order value
     * for each image displayed in the Lightbox. The default callback submits the form's default 
     * action via AJAX.
     * 
     * @param {Element} lightboxContainer The DOM element containing the form that is POSTed back to the server upon order change 
     */
    defaultOrderChangedCallback = function (lightboxContainer) {
        var reorderform = fluid.utils.findForm(lightboxContainer);
        
        return function () {
            var inputs, i;
            inputs = fluid.utils.seekNodesById(
                reorderform, 
                "input", 
                "^" + deriveLightboxCellBase(lightboxContainer.id, "[^:]*") + "reorder-index$");
            
            for (i = 0; i < inputs.length; i += 1) {
                inputs[i].value = i;
            }
        
            if (reorderform && reorderform.action) {
                jQuery.post(reorderform.action, 
                jQuery(reorderform).serialize(),
                function (type, data, evt) { /* No-op response */ });
            }
        };
    };

    // Public Lightbox API
    /**
     * Creates a new Lightbox instance from the specified parameters, providing full control over how
     * the Lightbox is configured.
     * 
     * @param {Object} container 
     * @param {Object} options 
     */
    fluid.lightbox = function (container, options) {
        var containerEl, orderChangedFn, itemFinderFn, reordererOptions;
        options = options || {};
        container = fluid.container(container);

        // Remove the anchors from the taborder.
        jQuery("a", container).tabindex(-1);
        addThumbnailActivateHandler(container);
        
        containerEl = fluid.unwrap(container);
        orderChangedFn = options.orderChangedCallback || defaultOrderChangedCallback(containerEl);
        itemFinderFn = (options.selectors && options.selectors.movables) || createItemFinder(containerEl, containerEl.id);

        reordererOptions = {
            layoutHandlerName: "fluid.gridLayoutHandler",
            containerRole: fluid.roles.GRID,
            orderChangedCallback: orderChangedFn,
            selectors: {
                movables: itemFinderFn
            }
        };
        
        jQuery.extend(true, reordererOptions, options);
        
        return fluid.reorderer(container, reordererOptions);
    };
        
})(jQuery, fluid);
