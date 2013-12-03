/*
Copyright 2008-2009 University of Toronto
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};
(function ($, fluid) {
    demo.initlayoutReorderer = function () {
        fluid.reorderLayout("#demo-layoutReorderer", {
            selectors: {
                lockedModules: ".demoSelector-layoutReorderer-locked",
                grabHandle: ".demoSelector-layoutReorderer"
            },
            styles: {
                defaultStyle: "demo-layoutReorderer-movable-default",
                selected: "demo-layoutReorderer-movable-selected",
                dragging: "demo-layoutReorderer-movable-dragging",
                mouseDrag: "demo-layoutReorderer-movable-mousedrag",
                dropMarker: "demo-layoutReorderer-dropMarker",
                avatar: "demo-layoutReorderer-avatar"
            },
            disableWrap: true
        });
    };
})(jQuery, fluid);