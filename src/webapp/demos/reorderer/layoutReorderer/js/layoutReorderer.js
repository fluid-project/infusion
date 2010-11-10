/*
Copyright 2008-2009 University of Toronto
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global demo*/

var demo = demo || {};
(function ($, fluid) {
	demo.initLayoutReorderer = function () {
        /**
         * Default focus on "The Making of a Need" portlet
         */
        $(".demo-sub-title").click(function (event) {
            $(".demo-making-of-a-need-portlet").focus();
            return false;
        });

        fluid.reorderLayout("#fluid-LayoutReorderer-sample2", {
            selectors: {
                columns: ".demo-myColumn",
                modules: ".demo-module",
                lockedModules: ".locked",
                grabHandle: ".demo-module-dragbar",
                dropWarning: ".demo-LayoutReorderer-dropWarning"
            },
            styles: {
                defaultStyle: "demo-LayoutReorderer-movable-default",
                selected: "demo-LayoutReorderer-movable-selected",
                dragging: "demo-LayoutReorderer-movable-dragging",
                mouseDrag: "demo-LayoutReorderer-movable-mousedrag",
                dropMarker: "demo-LayoutReorderer-dropMarker",
                avatar: "demo-LayoutReorderer-avatar"
            },
            disableWrap: true
        });
    };
})(jQuery, fluid);