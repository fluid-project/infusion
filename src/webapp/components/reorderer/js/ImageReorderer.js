/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_0*/

fluid_1_0 = fluid_1_0 || {};

(function ($, fluid) {
    
    var deriveLightboxCellBase = function (namebase, index) {
        return namebase + "lightbox-cell:" + index + ":";
    };
            
    var addThumbnailActivateHandler = function (lightboxContainer) {
        var enterKeyHandler = function (evt) {
            if (evt.which === fluid.reorderer.keys.ENTER) {
                var thumbnailAnchors = $("a", evt.target);
                document.location = thumbnailAnchors.attr('href');
            }
        };
        
        $(lightboxContainer).keypress(enterKeyHandler);
    };
    
    // Custom query method seeks all tags descended from a given root with a 
    // particular tag name, whose id matches a regex.
    var seekNodesById = function (rootnode, tagname, idmatch) {
        var inputs = rootnode.getElementsByTagName(tagname);
        var togo = [];
        for (var i = 0; i < inputs.length; i += 1) {
            var input = inputs[i];
            var id = input.id;
            if (id && id.match(idmatch)) {
                togo.push(input);
            }
        }
        return togo;
    };
    
    var createItemFinder = function (parentNode, containerId) {
        // This orderable finder knows that the lightbox thumbnails are 'div' elements
        var lightboxCellNamePattern = "^" + deriveLightboxCellBase(containerId, "[0-9]+") + "$";
        
        return function () {
            return seekNodesById(parentNode, "div", lightboxCellNamePattern);
        };
    };
    
    var findForm = function (element) {
        while (element) {
            if (element.nodeName.toLowerCase() === "form") {
                return element;
            }
            element = element.parentNode;
        }
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
    var defaultAfterMoveCallback = function (lightboxContainer) {
        var reorderform = findForm(lightboxContainer);
        
        return function () {
            var inputs, i;
            inputs = seekNodesById(
                reorderform, 
                "input", 
                "^" + deriveLightboxCellBase(lightboxContainer.id, "[^:]*") + "reorder-index$");
            
            for (i = 0; i < inputs.length; i += 1) {
                inputs[i].value = i;
            }
        
            if (reorderform && reorderform.action) {
                $.post(reorderform.action, 
                $(reorderform).serialize(),
                function (type, data, evt) { /* No-op response */ });
            }
        };
    };

    fluid.defaults("fluid.reorderImages", {
        layoutHandler: "fluid.gridLayoutHandler",

        selectors: {
            imageTitle: ".fl-reorderer-imageTitle"
        }
    });

    // Public Lightbox API
    /**
     * Creates a new Lightbox instance from the specified parameters, providing full control over how
     * the Lightbox is configured.
     * 
     * @param {Object} container 
     * @param {Object} options 
     */
    fluid.reorderImages = function (container, options) {
        var that = fluid.initView("fluid.reorderImages", container, options);
        
        var containerEl = fluid.unwrap(that.container);

        if (!that.options.afterMoveCallback) {
            that.options.afterMoveCallback = defaultAfterMoveCallback(containerEl);
        }
        if (!that.options.selectors.movables) {
            that.options.selectors.movables = createItemFinder(containerEl, containerEl.id);
        }
        
        var reorderer = fluid.reorderer(container, that.options);
        var movables = reorderer.locate("movables");
        fluid.transform(movables, function (cell) { 
            fluid.reorderImages.addAriaRoles(that.options.selectors.imageTitle, cell);
        });
                // Remove the anchors from the taborder.
        fluid.tabindex($("a", container), -1);
        addThumbnailActivateHandler(container);
        return reorderer;
    };
   
    
    fluid.reorderImages.addAriaRoles = function (imageTitle, cell) {
        cell = $(cell);
        cell.attr("role", "img");
        var title = $(imageTitle, cell);
        if (title[0] === cell[0] || title[0] === document) {
            fluid.fail("Could not locate cell title using selector " + imageTitle + " in context " + fluid.dumpEl(cell));
        }
        var titleId = fluid.allocateSimpleId(title);
        cell.attr("aria-labelledby", titleId);
        var image = $("img", cell);
        image.attr("role", "presentation");
        image.attr("alt", "");
    };
    
    // This function now deprecated. Please use fluid.reorderImages() instead.
    fluid.lightbox = fluid.reorderImages;
    
        
})(jQuery, fluid_1_0);
