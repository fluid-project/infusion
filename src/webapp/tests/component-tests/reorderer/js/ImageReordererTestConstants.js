/*
Copyright 2007-2009 University of Cambridge
Copyright 2007-2009 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2011 John Kremer

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

/**
 * This file contains test constants and setup and teardown functions that are used when testing with the data in the Lightbox.html file.
 * TODO: Rework this file and testing strategy so it is properly namespaced and uses composition of options for configuration rather than
 * multiple drivers and bare functions.
 */
var numOfImages = 14;

// The id of the root node of the lightbox
var lightboxRootId = "gallery:::gallery-thumbs:::";

var orderableIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

var makeOrderableIds = function (indices) {
    return fluid.transform(indices, 
        function (index) {
            return "gallery:::gallery-thumbs:::lightbox-cell:" + index + ":";
        });
};

var makeImageIds = function (indices) {
    return fluid.transform(indices, 
        function (index) {
            return "fluid.img." + index;
        });
};

var orderableIds = makeOrderableIds(orderableIndices);

var imageIds = makeImageIds(orderableIndices);

var orderableBaseId = "gallery:::gallery-thumbs:::lightbox-cell:";
var selectByDivAndId = "div[id=^" + orderableBaseId + "]";

// CSS class names
var defaultClass = "fl-reorderer-movable-default";
var selectedClass = "fl-reorderer-movable-selected";
var draggingClass = "fl-reorderer-movable-dragging";

function fetchLightboxRoot() {
    return fluid.jById(lightboxRootId);
}

function focusLightbox() {
    fetchLightboxRoot().focus();
}

function findOrderableByDivAndId(containerEl) {
    //return jQuery(selectByDivAndId, containerEl);
    return fluid.jById(lightboxRootId).children();
}


function findNoOrderables() {
    return [];
}

function createLightbox(options) {
    var reorderer;
    var listenerConfig = { // afterMove listener to test FLUID-4391
        listeners: {
            afterMove: function () {
                reorderer.moveCount++;
            }
        }  
    };
    // TODO: produce a mergePolicy that can do this non-destructively
    var mergedOptions = fluid.merge(null, {}, listenerConfig, options);
    reorderer = fluid.reorderImages(fetchLightboxRoot(), mergedOptions);
    reorderer.moveCount = 0;
    return reorderer;
}

function createLightboxWithNoOrderables() {
    return createLightbox({
        selectors: {
            movables: findNoOrderables
        }
    });
}

var altKeys = { 
    modifier: function (evt) {
        return (evt.ctrlKey && evt.shiftKey);
    }, 
    up: fluid.reorderer.keys.i, 
    down: fluid.reorderer.keys.m,
    right: fluid.reorderer.keys.k,
    left: fluid.reorderer.keys.j
};
    
function createAltKeystrokeLightbox() {
    return createLightbox({
        keysets: [altKeys],
        selectors: {
            movables: findOrderableByDivAndId
        }
    });
}

function createMultiKeystrokeLightbox() {
    var altKeys2 = { 
        modifier: function (evt) {
            return evt.altKey;
        }, 
        up: fluid.reorderer.keys.UP, 
        down: fluid.reorderer.keys.DOWN,
        right: fluid.reorderer.keys.RIGHT,
        left: fluid.reorderer.keys.LEFT
    };
    
    return createLightbox({
        keysets: [altKeys, altKeys2],
        selectors: {
            movables: findOrderableByDivAndId
        }
    });
}

function createMultiOverlappingKeystrokeLightbox() {
    var altKeys2 = { 
        modifier: function (evt) {
            return evt.ctrlKey;
        }, 
        up: fluid.reorderer.keys.UP, 
        down: fluid.reorderer.keys.DOWN,
        right: fluid.reorderer.keys.RIGHT,
        left: fluid.reorderer.keys.LEFT
    };
    
    return createLightbox({
        keysets: [altKeys, altKeys2],
        selectors: {
            movables: findOrderableByDivAndId
        }
    });
}
