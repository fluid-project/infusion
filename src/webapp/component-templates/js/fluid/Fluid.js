/*
Copyright 2007 University of Cambridge
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

if (typeof(fluid) == "undefined") {
    fluid = {};
}

fluid.deriveLightboxCellBase = function (namebase, index) {
    return namebase + "lightbox-cell:" + index + ":";
};
    
// Client-level initialisation for the lightbox, allowing parameterisation for
// different templates.
fluid.initLightbox = function (namebase, messageNamebase) {
    var reorderform = fluid.Utilities.findForm (document.getElementById (namebase));
        
    // Remove the anchors from the taborder - camel case 'tabIndex' needed for IE7 support
    jQuery ("a", reorderform).attr ("tabIndex", "-1");
    
    // An <input> tag nested within our root namebase tag, which has an id which 
    // begins with the  namebase:lightbox-cell:: prefix, and ends with "reorder-index" trail.
    // Very hard to imagine any perversity which may lead to this picking any stray stuff :P
    
    // An approach based on the "sourceIndex" DOM property would be much more efficient,
    // but this is only supported in IE. 
    var orderChangedCallback = function() {
        var inputs = fluid.Utilities.seekNodesById(
            reorderform, 
            "input", 
            "^" + fluid.deriveLightboxCellBase (namebase, "[^:]*") + "reorder-index$");
        
        for (var i = 0; i < inputs.length; ++ i) {
            inputs[i].value = i;
        }

        if (reorderform && reorderform.action) {
            dojo.xhrPost({
                url: reorderform.action,
                form: reorderform,
                load: function (type, data, evt) { /* No-op response */ }
            });
        }
    };
    
    // This orderable finder knows that the lightbox thumbnails are 'div' elements
    var lightboxCellNamePattern = "^" + fluid.deriveLightboxCellBase (namebase, "[0-9]+") +"$";
    var lightboxOrderableFinder = function (containerEl) {
        return fluid.Utilities.seekNodesById (containerEl, "div", lightboxCellNamePattern);
    };
    
    var lightbox = new fluid.Reorderer (namebase, {
            messageNamebase : messageNamebase,
            orderChangedCallback: orderChangedCallback,
            layoutHandler: new fluid.GridLayoutHandler (lightboxOrderableFinder),
            orderableFinder: lightboxOrderableFinder
        }
    );
};
  


/*
 * Utilities object for providing various general convenience functions
 */
fluid.Utilities = {};

// Custom query method seeks all tags descended from a given root with a 
// particular tag name, whose id matches a regex. The Dojo query parser
// is broken http://trac.dojotoolkit.org/ticket/3520#preview, this is all
// it might do anyway, and this will be plenty fast.
fluid.Utilities.seekNodesById = function (rootnode, tagname, idmatch) {
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
      
fluid.Utilities.escapeSelector = function(id) {
    return id.replace (/\:/g,"\\:");
};
  
fluid.Utilities.findForm = function (element) {
    while(element) {
        if (element.nodeName.toLowerCase() == "form") {
            return element;
        }
        element = element.parentNode;
    }
}
    
    



