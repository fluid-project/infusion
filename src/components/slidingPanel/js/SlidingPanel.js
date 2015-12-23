/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_1_9 = fluid_1_9 || {};

(function ($, fluid) {
    "use strict";
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
            "onCreate.bindModelChange": {
                listener: "{that}.applier.modelChanged.addListener",
                args: ["isShowing", "{that}.refreshView"]
            },
            "onCreate.setInitialState": {
                listener: "{that}.refreshView"
            },
            "onPanelHide.setText": {
                "this": "{that}.dom.toggleButtonLabel",
                "method": "text",
                "args": ["{that}.options.strings.showText"],
                "priority": "first"
            },
            "onPanelShow.setText": {
                "this": "{that}.dom.toggleButtonLabel",
                "method": "text",
                "args": ["{that}.options.strings.hideText"],
                "priority": "first"
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
                "args": ["{that}.options.animationDurations.hide", "{that}.events.afterPanelHide.fire"]
            },
            operateShow: {
                "this": "{that}.dom.panel",
                "method": "slideDown",
                "args": ["{that}.options.animationDurations.show", "{that}.events.afterPanelShow.fire"]
            },
            hidePanel: {
                func: "{that}.applier.requestChange",
                args: ["isShowing", false]
            },
            showPanel: {
                func: "{that}.applier.requestChange",
                args: ["isShowing", true]
            },
            togglePanel: {
                funcName: "fluid.slidingPanel.togglePanel",
                args: ["{that}"]
            },
            refreshView: {
                funcName: "fluid.slidingPanel.refreshView",
                args: ["{that}"]
            }
        },
        model: {
            isShowing: false
        },
        animationDurations: {
            hide: 400,
            show: 400
        }
    });

    fluid.slidingPanel.togglePanel = function (that) {
        that.applier.requestChange("isShowing", !that.model.isShowing);
    };

    fluid.slidingPanel.refreshView = function (that) {
        that.events[that.model.isShowing ? "onPanelShow" : "onPanelHide"].fire();
    };

})(jQuery, fluid_1_9);
