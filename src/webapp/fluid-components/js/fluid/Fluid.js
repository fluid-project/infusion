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

(function (jQuery, fluid) {
    fluid.keys = {
        TAB: 9,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        META: 19,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        i: 73,
        j: 74,
        k: 75,
        m: 77
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
    	HORIZONTAL: "horiz",
    	VERTICAL: "vert"
    };
    
    fluid.position = {
    	BEFORE: 0,
    	AFTER: 1,
    	INSIDE: 2,
    	NO_TARGET: -1
    };
    
    /**
     * For incrementing/decrementing a count or index.
     */
    fluid.direction = {
        NEXT: 1,
        PREVIOUS: -1
    };
    
    fluid.defaultKeysets = [{
        modifier : function (evt) {
	        return evt.ctrlKey;
        },
        up : fluid.keys.UP,
        down : fluid.keys.DOWN,
        right : fluid.keys.RIGHT,
        left : fluid.keys.LEFT
    },
    {
        modifier : function (evt) {
	        return evt.ctrlKey;
        },
        up : fluid.keys.i,
        down : fluid.keys.m,
        right : fluid.keys.k,
        left : fluid.keys.j
    }];
    
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
}) (jQuery, fluid);
