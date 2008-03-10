/*
Copyright 2007 University of Cambridge
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var fluid = fluid || {};

fluid.keys = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,
    ENTER: 13,
    TAB: 9,
    CTRL: 17
};

/**
 * These roles are used to add ARIA roles to orderable items. This list can be extended as needed,
 * but the values of the container and item roles must match ARIA-specified roles.
 */  
fluid.roles = {
    GRID: { container: "grid", item: "gridcell" },
    LIST: { container: "list", item: "listitem" }
};

fluid.orientation = {
	HORIZONTAL: 0,
	VERTICAL: 1
};

fluid.position = {
	BEFORE: 0,
	AFTER: 1,
	NO_TARGET: -1
};

/**
 * For incrementing/decrementing a count or index.
 */
fluid.direction = {
    NEXT: 1,
    PREVIOUS: -1
};

fluid.mixin = function (target, args) {
    for (var arg in args) {
        if (args.hasOwnProperty (arg)) {
            target[arg] = args[arg];
        }
    }
};

fluid.wrap = function (obj) {
    return ((!obj || obj.jquery) ? obj : jQuery (obj)); 
};

fluid.deriveLightboxCellBase = function (namebase, index) {
    return namebase + "lightbox-cell:" + index + ":";
};
    
// Client-level initialisation for the lightbox, allowing parameterisation for
// different templates.
fluid.initLightbox = function (namebase, messageNamebase) {
    var parentNode = document.getElementById (namebase);
    var reorderform = fluid.utils.findForm (parentNode);
        
    // Remove the anchors from the taborder - camel case 'tabIndex' needed for IE7 support
    jQuery ("a", reorderform).attr ("tabIndex", "-1");
    
    // An <input> tag nested within our root namebase tag, which has an id which 
    // begins with the  namebase:lightbox-cell:: prefix, and ends with "reorder-index" trail.
    // Very hard to imagine any perversity which may lead to this picking any stray stuff :P
    
    // An approach based on the "sourceIndex" DOM property would be much more efficient,
    // but this is only supported in IE. 
    var orderChangedCallback = function() {
        var inputs = fluid.utils.seekNodesById(
            reorderform, 
            "input", 
            "^" + fluid.deriveLightboxCellBase (namebase, "[^:]*") + "reorder-index$");
        
        for (var i = 0; i < inputs.length; ++ i) {
            inputs[i].value = i;
        }

        if (reorderform && reorderform.action) {
            jQuery.post(reorderform.action, 
            jQuery(reorderform).serialize(),
            function (type, data, evt) { /* No-op response */ });
        }
    };
    
    // This orderable finder knows that the lightbox thumbnails are 'div' elements
    var lightboxCellNamePattern = "^" + fluid.deriveLightboxCellBase (namebase, "[0-9]+") +"$";
    var itemFinder = function () {
        return fluid.utils.seekNodesById (parentNode, "div", lightboxCellNamePattern);
    };
        
    var layoutHandler = new fluid.GridLayoutHandler (itemFinder, {
        orderChangedCallback: orderChangedCallback
    });

    var lightbox = new fluid.Reorderer (parentNode, itemFinder, layoutHandler, {
            messageNamebase : messageNamebase,
            role : fluid.roles.GRID
        }
    );
    
    fluid.Lightbox.addThumbnailActivateHandler (parentNode);
    
};
  


/*
 * Utilities object for providing various general convenience functions
 */
fluid.utils = {};

// Custom query method seeks all tags descended from a given root with a 
// particular tag name, whose id matches a regex. The Dojo query parser
// is broken http://trac.dojotoolkit.org/ticket/3520#preview, this is all
// it might do anyway, and this will be plenty fast.
fluid.utils.seekNodesById = function (rootnode, tagname, idmatch) {
    var inputs = rootnode.getElementsByTagName (tagname);
    var togo = [];
    for (var i = 0; i < inputs.length; ++ i) {
        var input = inputs[i];
        var id = input.id;
        if (id && id.match (idmatch)) {
            togo.push (input);
        }
    }
    return togo;
};
      
fluid.utils.escapeSelector = function(id) {
    return id.replace (/\:/g,"\\:");
};
  
fluid.utils.findForm = function (element) {
    while(element) {
        if (element.nodeName.toLowerCase() === "form") {
            return element;
        }
        element = element.parentNode;
    }
};

/**
 * Adapt 'findItems' object given either a 'findItems' object or a 'findMovables' function 
 **/
fluid.utils.adaptFindItems = function (finder) {
    var finderFn = function () {};
    var findItems = {};
    
    if (typeof finder === 'function') {
        finderFn = finder;
    } else {
        findItems = finder;
    }

    findItems.movables = findItems.movables || finderFn;
    findItems.selectables = findItems.selectables || findItems.movables;
    findItems.dropTargets = findItems.dropTargets || findItems.movables;
    findItems.grabHandle = findItems.grabHandle || function (item) { return item; };
        
    return findItems;
};

/**
 * Returns a jQuery object given the id of a DOM node
 */
fluid.utils.jById = function (id) {
    return jQuery ("[id=" + id + "]");
};
