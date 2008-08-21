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

// The ids of the reorderable items in Lightbox.html
var firstReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:0:";
var secondReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:1:";
var thirdReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:2:";
var fourthReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:3:";
var fifthReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:4:";
var sixthReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:5:";
var seventhReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:6:";
var tenthReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:9:";
var fourthLastReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:10:";
var thirdLastReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:11:";
var secondLastReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:12:";
var lastReorderableId = "gallery:::gallery-thumbs:::lightbox-cell:13:";

var orderableBaseId = "gallery:::gallery-thumbs:::lightbox-cell:";
var selectByDivAndId = "div[id^=" + orderableBaseId + "]";

// The ids of the images we test with in Lightbox.html
var firstImageId = "fluid.img.first";
var secondImageId = "fluid.img.second";
var thirdImageId = "fluid.img.3";
var fourthImageId = "fluid.img.4";
var fifthImageId = "fluid.img.5";
var sixthImageId = "fluid.img.6";
var seventhImageId = "fluid.img.7";
var eighthImageId = "fluid.img.8";
var ninthImageId = "fluid.img.9";
var tenthImageId = "fluid.img.10";
var eleventhImageId = "fluid.img.11";
var twelvethImageId = "fluid.img.12";
var secondLastImageId = "fluid.img.secondLast";
var lastImageId = "fluid.img.last";

// CSS class names
var defaultClass = "orderable-default";
var selectedClass = "orderable-selected";
var draggingClass = "orderable-dragging";

var imgListClone;

function fetchLightboxRoot() {
    return fluid.utils.jById(lightboxRootId);
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

function findImgsInLightbox() {
    return jQuery("img", fetchLightboxRoot());
}

function createLightbox() {
    var lightboxRoot = fetchLightboxRoot();
    return fluid.reorderer(lightboxRoot, {
        layoutHandlerName: "fluid.gridLayoutHandler",
        selectors: {
            movables: findOrderableByDivAndId
        },
        containerRole: fluid.roles.GRID
    });
}

function createLightboxWithNoOrderables() {
    var lightboxRoot = fetchLightboxRoot();
    return fluid.reorderer(lightboxRoot, {
        layoutHandlerName: "fluid.gridLayoutHandler",
        selectors: {
            movables: findNoOrderables
        },
        containerRole: fluid.roles.GRID
    });
}

function createGridLayoutHandler() {
    var selectors = {
        movables: findOrderableByDivAndId,
        selectables: findOrderableByDivAndId
    };
    return fluid.gridLayoutHandler(fluid.utils.jById(lightboxRootId), {
        selectors: selectors
    });
}

var altKeys = { 
    modifier: function (evt) {
        return (evt.ctrlKey && evt.shiftKey);
    }, 
    up: fluid.keys.i, 
    down: fluid.keys.m,
    right: fluid.keys.k,
    left: fluid.keys.j
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
        up: fluid.keys.UP, 
        down: fluid.keys.DOWN,
        right: fluid.keys.RIGHT,
        left: fluid.keys.LEFT
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
        up: fluid.keys.UP, 
        down: fluid.keys.DOWN,
        right: fluid.keys.RIGHT,
        left: fluid.keys.LEFT
    };
    
    return fluid.lightbox("[id=" + lightboxRootId + "]", {
        keysets: [altKeys, altKeys2],
        selectors: {
            movables: findOrderableByDivAndId
        }
    });
}
