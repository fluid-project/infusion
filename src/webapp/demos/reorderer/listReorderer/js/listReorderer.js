/*
Copyright 2007-2009 University of Cambridge
Copyright 2007-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley
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
    
    demo.initListReorderer = function () {
        return fluid.reorderList("#demo-selector-listReorderer", {
            styles: {
                defaultStyle: "demo-listReorderer-movable-default",
                selected: "demo-listReorderer-movable-selected",
                dragging: "demo-listReorderer-movable-dragging",
                mouseDrag: "demo-listReorderer-movable-mousedrag",
                hover: "demo-listReorderer-movable-hover",
                dropMarker: "demo-listReorderer-dropMarker",
                avatar: "demo-listReorderer-avatar"
            }
        });
    };
})(jQuery, fluid);