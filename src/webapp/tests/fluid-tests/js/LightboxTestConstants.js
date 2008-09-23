/*
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

/**
 * This file contains test constants and setup and teardown functions that are used when testing with the data in the Lightbox.html file.
 */
 
var numOfImages = 14;

// The id of the form for submitting changes to the server.
var REORDER_FORM_ID = "reorder-form";

// The id of the root node of the lightbox
var lightboxRootId = "gallery:::gallery-thumbs:::";

// The id of the parent of the lightbox
var lightboxParentId = "lightbox-parent";

var orderableIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

var makeOrderableIds = function(indices) {
    return fluid.transform(indices, 
        function(index) {return "gallery:::gallery-thumbs:::lightbox-cell:" + index + ":";});
}

var makeImageIds = function(indices) {
    return fluid.transform(indices, 
        function(index) {return "fluid.img." + index;});
}

var orderableIds = makeOrderableIds(orderableIndices);

var imageIds = makeImageIds(orderableIndices);

var orderableBaseId = "gallery:::gallery-thumbs:::lightbox-cell:";
var selectByDivAndId = "div[id^=" + orderableBaseId + "]";

// CSS class names
var defaultClass = "orderable-default";
var selectedClass = "orderable-selected";
var draggingClass = "orderable-dragging";

var imgListClone;

function fetchLightboxRoot() {
    return fluid.jById(lightboxRootId);
}

function focusLightbox() {
    fetchLightboxRoot().focus();
}

// This setUp will be called before each of the tests that are included in Lightbox.html 
function setUp() {
    imgListClone = document.getElementById(lightboxRootId).cloneNode(true);
    
    // Force the grid size to three thumbnails wide
    fetchLightboxRoot().addClass("width-3-thumb");
}

// This tearDown will be called after each of the tests that are included in Lightbox.html 
function tearDown() {
    var fluidLightboxDOMNode, lightboxParent;
    
    fluidLightboxDOMNode = document.getElementById(lightboxRootId);
    lightboxParent = document.getElementById(lightboxParentId);
    lightboxParent.removeChild(fluidLightboxDOMNode);
    lightboxParent.appendChild(imgListClone);
}

function findOrderableByDivAndId(containerEl) {
    return jQuery(selectByDivAndId, containerEl);
}


function findNoOrderables() {
    return [];
}

function createLightbox() {
    var lightboxRoot = fetchLightboxRoot();
    return fluid.reorderer(lightboxRoot, {
        layoutHandler: "fluid.gridLayoutHandler",
        selectors: {
            movables: findOrderableByDivAndId
        },
        containerRole: fluid.reorderer.roles.GRID
    });
}

function createLightboxWithNoOrderables() {
    var lightboxRoot = fetchLightboxRoot();
    return fluid.reorderer(lightboxRoot, {
        layoutHandler: "fluid.gridLayoutHandler",
        selectors: {
            movables: findNoOrderables
        },
        containerRole: fluid.reorderer.roles.GRID
    });
}

function createGridLayoutHandler() {
    var selectors = {
        movables: findOrderableByDivAndId,
        selectables: findOrderableByDivAndId
    };
    return fluid.gridLayoutHandler(fluid.jById(lightboxRootId), {
        selectors: selectors
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
    return fluid.lightbox(fetchLightboxRoot(), {
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
    
    return fluid.lightbox(fetchLightboxRoot(), {
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
    
    return fluid.lightbox("[id=" + lightboxRootId + "]", {
        keysets: [altKeys, altKeys2],
        selectors: {
            movables: findOrderableByDivAndId
        }
    });
}
