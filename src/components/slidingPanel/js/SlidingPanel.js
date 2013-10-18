/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    /**********************
     * Sliding Panel *
     *********************/

    fluid.defaults("fluid.slidingPanel", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        selectors: {
            panel: ".flc-slidingPanel-panel",
            toggleButton: ".flc-slidingPanel-toggleButton",
            toggleButtonLabel: ".flc-slidingPanel-toggleButton"
        },
        strings: {
            showText: "show",
            hideText: "hide"
        },
        events: {
            onPanelHide: null,
            onPanelShow: null,
            afterPanelHide: null,
            afterPanelShow: null
        },
        listeners: {
            "onCreate.bindClick": {
                "this": "{that}.dom.toggleButton",
                "method": "click",
                "args": ["{that}.togglePanel"]
            },
            "onCreate.setInitialState": {
                listener: "{that}.refreshView"
            },
            "onPanelHide.setText": {
                "this": "{that}.dom.toggleButtonLabel",
                "method": "text",
                "args": ["{that}.options.strings.showText"]
            },
            "onPanelShow.setText": {
                "this": "{that}.dom.toggleButtonLabel",
                "method": "text",
                "args": ["{that}.options.strings.hideText"]
            },
            "onPanelHide.updateModel": {
                listener: "{that}.applier.requestChange",
                args: ["isShowing", false]
            },
            "onPanelShow.updateModel": {
                listener: "{that}.applier.requestChange",
                args: ["isShowing", true]
            },
            "onPanelHide.operate": {
                listener: "{that}.operateHide"
            },
            "onPanelShow.operate": {
                listener: "{that}.operateShow"
            }
        },
        invokers: {
            operateHide: {
                "this": "{that}.dom.panel",
                "method": "slideUp",
                "args": [400, "{that}.events.afterPanelHide.fire"]
            },
            operateShow: {
                "this": "{that}.dom.panel",
                "method": "slideDown",
                "args": [400, "{that}.events.afterPanelShow.fire"]
            },
            hidePanel: {
                func: "{that}.events.onPanelHide.fire"
            },
            showPanel: {
                func: "{that}.events.onPanelShow.fire"
            },
            togglePanel: {
                funcName: "fluid.slidingPanel.refreshView",
                args: ["{that}", true]
            },
            refreshView: {
                funcName: "fluid.slidingPanel.refreshView",
                args: ["{that}", false]
            }
        },
        model: {
            isShowing: false
        }
    });

    fluid.slidingPanel.refreshView = function (that, toggle) {
        // if the toggle flag is on, it will flip the state, otherwise just refreshes.
        that[that.model.isShowing !== toggle  ? "showPanel" : "hidePanel"]();
    };

})(jQuery, fluid_1_5);
